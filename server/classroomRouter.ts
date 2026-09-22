import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { storagePut } from "./storage";
import * as cdb from "./classroomDb";
import { adminProcedure, protectedProcedure, teacherProcedure, router } from "./_core/trpc";

const contentType = z.enum(["announcement", "lesson", "task", "quiz", "material", "video"]);
const classInput = z.object({ name: z.string().min(2).max(191), subject: z.string().min(1), schoolYear: z.string().min(1), className: z.string().min(1), shift: z.string().min(1) });
const teacherOnly = (user: { id: number; role: string }, classId: number) => cdb.isTeacherOfClass(classId, user.id);

export const classroomRouter = router({
  mine: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role === "user") return cdb.listStudentClasses(ctx.user.id);
    return cdb.listTeacherClasses(ctx.user.id);
  }),
  create: teacherProcedure.input(classInput).mutation(({ input, ctx }) => cdb.createClassroom({ ...input, teacherId: ctx.user.id })),
  joinByCode: protectedProcedure.input(z.object({ joinCode: z.string().min(8) })).mutation(async ({ input, ctx }) => {
    if (ctx.user.role !== "user") throw new TRPCError({ code: "FORBIDDEN", message: "A entrada por link é destinada aos alunos." });
    const classroom = await cdb.joinClassByCode(input.joinCode, ctx.user.id);
    return { success: true, classroom };
  }),
  get: protectedProcedure.input(z.object({ classId: z.number().int().positive() })).query(async ({ input, ctx }) => {
    const classroom = await cdb.getClassroom(input.classId);
    if (!classroom) throw new TRPCError({ code: "NOT_FOUND", message: "Classe não encontrada." });
    const global = ctx.user.role === "admin" || ctx.user.role === "superadmin";
    if (!global && ctx.user.role !== "teacher" && !(await cdb.isMemberOfClass(input.classId, ctx.user.id))) throw new TRPCError({ code: "FORBIDDEN", message: "Você não participa desta classe." });
    if (!global && ctx.user.role === "teacher" && classroom.teacherId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Você não gerencia esta classe." });
    const members = await cdb.listClassMembers(input.classId);
    const contents = await cdb.listClassContents(input.classId);
    return { classroom, members, contents };
  }),
  searchStudents: teacherProcedure.input(z.object({ classId: z.number().int().positive(), search: z.string().optional(), schoolYear: z.string().optional(), className: z.string().optional(), shift: z.string().optional() })).query(async ({ input, ctx }) => {
    if (!(await teacherOnly(ctx.user, input.classId)) && ctx.user.role !== "admin" && ctx.user.role !== "superadmin") throw new TRPCError({ code: "FORBIDDEN", message: "Você não gerencia esta classe." });
    return cdb.searchStudents(input);
  }),
  inviteStudent: teacherProcedure.input(z.object({ classId: z.number(), studentId: z.number() })).mutation(async ({ input, ctx }) => {
    if (!(await teacherOnly(ctx.user, input.classId)) && ctx.user.role !== "admin" && ctx.user.role !== "superadmin") throw new TRPCError({ code: "FORBIDDEN", message: "Você não gerencia esta classe." });
    return { success: true, invite: await cdb.createInvite({ classId: input.classId, studentId: input.studentId, teacherId: ctx.user.id }) };
  }),
  invites: protectedProcedure.query(({ ctx }) => cdb.listStudentInvites(ctx.user.id)),
  respondInvite: protectedProcedure.input(z.object({ inviteId: z.number(), status: z.enum(["accepted", "rejected"]) })).mutation(async ({ input, ctx }) => ({ success: true, invite: await cdb.respondToInvite(input.inviteId, ctx.user.id, input.status) })),
  removeStudent: teacherProcedure.input(z.object({ classId: z.number(), studentId: z.number() })).mutation(async ({ input, ctx }) => {
    if (!(await teacherOnly(ctx.user, input.classId)) && ctx.user.role !== "admin" && ctx.user.role !== "superadmin") throw new TRPCError({ code: "FORBIDDEN", message: "Você não gerencia esta classe." });
    await cdb.removeClassMember(input.classId, input.studentId); return { success: true };
  }),
  createContent: teacherProcedure.input(z.object({ classId: z.number(), type: contentType, title: z.string().min(2).max(255), description: z.string().min(1), fileUrl: z.string().optional().nullable(), videoId: z.number().optional().nullable(), dueAt: z.string().optional().nullable(), payload: z.string().optional().nullable(), questions: z.array(z.object({ question: z.string().min(1), options: z.array(z.string().min(1)).min(2), correctOption: z.number().int().min(0), points: z.number().int().min(1).max(100) })).optional() })).mutation(async ({ input, ctx }) => {
    if (!(await teacherOnly(ctx.user, input.classId)) && ctx.user.role !== "admin" && ctx.user.role !== "superadmin") throw new TRPCError({ code: "FORBIDDEN", message: "Você não gerencia esta classe." });
    const content = await cdb.createClassContent({ classId: input.classId, authorId: ctx.user.id, type: input.type, title: input.title.trim(), description: input.description.trim(), fileUrl: input.fileUrl || null, videoId: input.videoId || null, dueAt: input.dueAt ? new Date(input.dueAt) : null, payload: input.payload || null });
    if (input.type === "quiz" && input.questions?.length) await cdb.createQuizQuestions(content.id, input.questions);
    return { success: true, content };
  }),
  uploadContentFile: teacherProcedure.input(z.object({ fileName: z.string(), contentType: z.string(), base64Data: z.string(), classId: z.number() })).mutation(async ({ input, ctx }) => {
    if (!(await teacherOnly(ctx.user, input.classId)) && ctx.user.role !== "admin" && ctx.user.role !== "superadmin") throw new TRPCError({ code: "FORBIDDEN", message: "Você não gerencia esta classe." });
    const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const result = await storagePut(`class-content/${input.classId}/${ctx.user.id}/${Date.now()}-${safeName}`, Buffer.from(input.base64Data, "base64"), input.contentType || "application/octet-stream");
    return { success: true, ...result };
  }),
  complete: protectedProcedure.input(z.object({ contentId: z.number(), score: z.number().int().min(0).optional() })).mutation(async ({ input, ctx }) => { await cdb.completeContent(input.contentId, ctx.user.id, input.score); return { success: true }; }),
  all: adminProcedure.query(async () => cdb.listTeacherClasses(0)),
});
