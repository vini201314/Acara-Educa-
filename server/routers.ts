import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { SUBJECTS } from "../drizzle/schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import {
  adminProcedure,
  generalAdminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "./_core/trpc";
import * as db from "./db";
import { verifyPassword } from "./password";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,

  // ----------------- AUTENTICAÇÃO REAL (NOME + SENHA HASH) -----------------
  auth: router({
    me: publicProcedure.query(async ({ ctx }) => {
      // Garante que o administrador geral exista no primeiro acesso
      await db.ensureGeneralAdmin();

      if (!ctx.user) return null;

      // Busca dados mais recentes do usuário
      const freshUser = await db.getUserById(ctx.user.id);
      if (!freshUser) return null;

      const watchedCount = await db.countWatchedVideosByUser(freshUser.id);

      return {
        id: freshUser.id,
        studentCode: freshUser.studentCode,
        name: freshUser.name,
        email: freshUser.email ?? null,
        role: freshUser.role,
        isGeneralAdmin: freshUser.isGeneralAdmin,
        createdAt: freshUser.createdAt,
        watchedCount,
      };
    }),

    register: publicProcedure
      .input(
        z.object({
          name: z
            .string()
            .min(3, "O nome completo deve ter pelo menos 3 caracteres")
            .max(190, "Nome muito longo"),
          password: z
            .string()
            .min(4, "A senha deve ter pelo menos 4 caracteres")
            .max(100, "Senha muito longa"),
          confirmPassword: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (input.password !== input.confirmPassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "As senhas não coincidem.",
          });
        }

        const trimmedName = input.name.trim();
        const existing = await db.getUserByName(trimmedName);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Já existe um usuário cadastrado com este nome.",
          });
        }

        const user = await db.createUser({
          name: trimmedName,
          password: input.password,
        });

        // Cria o token de sessão JWT assinado
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        return {
          success: true,
          user: {
            id: user.id,
            studentCode: user.studentCode,
            name: user.name,
            role: user.role,
            isGeneralAdmin: user.isGeneralAdmin,
            createdAt: user.createdAt,
          },
        };
      }),

    login: publicProcedure
      .input(
        z.object({
          name: z.string().min(1, "Informe seu nome completo"),
          password: z.string().min(1, "Informe sua senha"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Garante que o administrador geral exista
        await db.ensureGeneralAdmin();

        const user = await db.getUserByName(input.name.trim());
        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Nome ou senha incorretos.",
          });
        }

        const valid = verifyPassword(input.password, user.passwordHash);
        if (!valid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Nome ou senha incorretos.",
          });
        }

        await db.updateLastSignedIn(user.id);

        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        const watchedCount = await db.countWatchedVideosByUser(user.id);

        return {
          success: true,
          user: {
            id: user.id,
            studentCode: user.studentCode,
            name: user.name,
            role: user.role,
            isGeneralAdmin: user.isGeneralAdmin,
            createdAt: user.createdAt,
            watchedCount,
          },
        };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
  }),

  // ----------------- VÍDEOS (ALUNOS E PÚBLICO) -----------------
  videos: router({
    list: publicProcedure
      .input(
        z
          .object({
            subject: z.string().optional(),
            search: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ input, ctx }) => {
        const videosList = await db.listVideos({
          subject: input?.subject,
          search: input?.search,
        });

        let watchedIds: number[] = [];
        if (ctx.user) {
          watchedIds = await db.getUserWatchedVideoIds(ctx.user.id);
        }

        const watchedSet = new Set(watchedIds);

        return videosList.map(v => ({
          ...v,
          isWatched: watchedSet.has(v.id),
        }));
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const video = await db.getVideoById(input.id);
        if (!video) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Vídeo não encontrado",
          });
        }

        let isWatched = false;
        if (ctx.user) {
          const watchedIds = await db.getUserWatchedVideoIds(ctx.user.id);
          isWatched = watchedIds.includes(video.id);
        }

        return {
          ...video,
          isWatched,
        };
      }),

    markWatched: protectedProcedure
      .input(z.object({ videoId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.recordWatchedVideo(ctx.user.id, input.videoId);
        const watchedCount = await db.countWatchedVideosByUser(ctx.user.id);
        return {
          success: true,
          watchedCount,
        };
      }),
  }),

  // ----------------- SUGESTÕES DOS ALUNOS -----------------
  suggestions: router({
    create: protectedProcedure
      .input(
        z.object({
          title: z
            .string()
            .min(3, "O título deve ter pelo menos 3 caracteres")
            .max(250),
          description: z
            .string()
            .min(10, "A descrição deve conter pelo menos 10 caracteres"),
          subject: z.string().min(1, "Selecione a matéria"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const suggestion = await db.createSuggestion({
          userId: ctx.user.id,
          studentCode: ctx.user.studentCode,
          studentName: ctx.user.name,
          title: input.title.trim(),
          description: input.description.trim(),
          subject: input.subject,
        });

        return {
          success: true,
          suggestion,
        };
      }),
  }),

  // ----------------- PAINEL ADMINISTRATIVO (/admin) -----------------
  admin: router({
    // Estatísticas gerais
    stats: adminProcedure.query(async () => {
      const [videosList, suggestionsList, adminsList, allUsers] =
        await Promise.all([
          db.listVideos(),
          db.listSuggestions(),
          db.listAdmins(),
          db.listAllUsers(),
        ]);

      return {
        videosCount: videosList.length,
        suggestionsCount: suggestionsList.length,
        pendingSuggestionsCount: suggestionsList.filter(
          s => s.status === "pending"
        ).length,
        adminsCount: adminsList.length,
        studentsCount: allUsers.filter(u => u.role === "user").length,
      };
    }),

    // Gestão de Vídeos
    createVideo: adminProcedure
      .input(
        z.object({
          title: z.string().min(3, "Título obrigatório"),
          description: z.string().min(5, "Descrição obrigatória"),
          subject: z.string().min(1, "Selecione a matéria"),
          sourceType: z.enum(["url", "file"]),
          videoUrl: z.string().min(1, "URL ou arquivo do vídeo é obrigatório"),
          fileKey: z.string().optional(),
          thumbnailUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const video = await db.createVideo({
          title: input.title.trim(),
          description: input.description.trim(),
          subject: input.subject,
          sourceType: input.sourceType,
          videoUrl: input.videoUrl.trim(),
          fileKey: input.fileKey ?? null,
          thumbnailUrl: input.thumbnailUrl?.trim() || null,
          createdById: ctx.user.id,
          createdByName: ctx.user.name,
        });

        return { success: true, video };
      }),

    updateVideo: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(3),
          description: z.string().min(5),
          subject: z.string().min(1),
          sourceType: z.enum(["url", "file"]),
          videoUrl: z.string().min(1),
          thumbnailUrl: z.string().optional().nullable(),
        })
      )
      .mutation(async ({ input }) => {
        const updated = await db.updateVideo(input.id, {
          title: input.title.trim(),
          description: input.description.trim(),
          subject: input.subject,
          sourceType: input.sourceType,
          videoUrl: input.videoUrl.trim(),
          thumbnailUrl: input.thumbnailUrl?.trim() || null,
        });

        return { success: true, video: updated };
      }),

    deleteVideo: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteVideo(input.id);
        return { success: true };
      }),

    // Upload direto de arquivo de vídeo para o storage S3
    uploadVideoFile: adminProcedure
      .input(
        z.object({
          fileName: z.string(),
          contentType: z.string(),
          base64Data: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const buffer = Buffer.from(input.base64Data, "base64");
        const keyPrefix = `video-uploads/admin_${ctx.user.id}/${Date.now()}_${input.fileName}`;

        const uploadResult = await storagePut(
          keyPrefix,
          buffer,
          input.contentType || "video/mp4"
        );

        return {
          success: true,
          url: uploadResult.url,
          key: uploadResult.key,
        };
      }),

    // Gestão de Sugestões
    listSuggestions: adminProcedure.query(async () => {
      return db.listSuggestions();
    }),

    markSuggestionReviewed: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const updated = await db.markSuggestionReviewed(input.id, ctx.user.id);
        return { success: true, suggestion: updated };
      }),

    deleteSuggestion: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSuggestion(input.id);
        return { success: true };
      }),

    // Gestão de Administradores (Exclusivo Administrador Geral)
    listAdmins: adminProcedure.query(async () => {
      const admins = await db.listAdmins();
      return admins.map(a => ({
        id: a.id,
        studentCode: a.studentCode,
        name: a.name,
        role: a.role,
        isGeneralAdmin: a.isGeneralAdmin,
        createdAt: a.createdAt,
      }));
    }),

    addAdminByStudentCode: generalAdminProcedure
      .input(
        z.object({
          studentCode: z.string().min(1, "Informe o ID do aluno (ex: #002)"),
        })
      )
      .mutation(async ({ input }) => {
        let code = input.studentCode.trim();
        if (!code.startsWith("#")) {
          code = `#${code}`;
        }

        const targetUser = await db.getUserByStudentCode(code);
        if (!targetUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Nenhum usuário encontrado com o ID ${code}`,
          });
        }

        if (targetUser.isGeneralAdmin) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Este usuário já é o Administrador Geral.",
          });
        }

        const updated = await db.setUserRole({
          targetUserId: targetUser.id,
          newRole: "admin",
        });

        return {
          success: true,
          user: {
            id: updated.id,
            studentCode: updated.studentCode,
            name: updated.name,
            role: updated.role,
          },
        };
      }),

    removeAdmin: generalAdminProcedure
      .input(z.object({ targetUserId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (input.targetUserId === ctx.user.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "O Administrador Geral não pode remover a própria permissão.",
          });
        }

        const target = await db.getUserById(input.targetUserId);
        if (!target) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuário não encontrado.",
          });
        }

        if (target.isGeneralAdmin) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Não é permitido alterar o Administrador Geral.",
          });
        }

        const updated = await db.setUserRole({
          targetUserId: input.targetUserId,
          newRole: "user",
        });

        return {
          success: true,
          user: {
            id: updated.id,
            studentCode: updated.studentCode,
            name: updated.name,
            role: updated.role,
          },
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
