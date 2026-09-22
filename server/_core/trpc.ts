import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "@shared/const";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({ transformer: superjson });
export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  if (!opts.ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  return opts.next({ ctx: { ...opts.ctx, user: opts.ctx.user } });
});
export const protectedProcedure = t.procedure.use(requireUser);

const requireRole = (allowed: string[], message: string) => t.middleware(async opts => {
  if (!opts.ctx.user || !allowed.includes(opts.ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message });
  return opts.next({ ctx: { ...opts.ctx, user: opts.ctx.user } });
});
export const teacherProcedure = t.procedure.use(requireRole(["teacher", "admin", "superadmin"], "Acesso restrito a professores."));
export const adminProcedure = t.procedure.use(requireRole(["admin", "superadmin"], NOT_ADMIN_ERR_MSG));
export const generalAdminProcedure = t.procedure.use(t.middleware(async opts => {
  if (!opts.ctx.user || !opts.ctx.user.isGeneralAdmin) throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao Administrador Geral." });
  return opts.next({ ctx: { ...opts.ctx, user: opts.ctx.user } });
}));
