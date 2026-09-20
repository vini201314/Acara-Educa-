import { describe, expect, it } from "vitest";
import { formatStudentCode, hashPassword, verifyPassword } from "./password";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

describe("Segurança e Utilitários de Aluno", () => {
  it("deve formatar o ID do aluno no formato #001, #002, #003", () => {
    expect(formatStudentCode(1)).toBe("#001");
    expect(formatStudentCode(2)).toBe("#002");
    expect(formatStudentCode(42)).toBe("#042");
    expect(formatStudentCode(105)).toBe("#105");
  });

  it("deve gerar hash seguro e verificar senhas corretamente", () => {
    const raw = "vini2013.";
    const hashed = hashPassword(raw);
    expect(hashed).toContain(":");
    expect(hashed).not.toBe(raw);

    const valid = verifyPassword(raw, hashed);
    expect(valid).toBe(true);

    const invalid = verifyPassword("senhaErrada", hashed);
    expect(invalid).toBe(false);
  });
});

describe("Controle de Acesso ao Painel Administrativo", () => {
  function makeContext(user: User | null): TrpcContext {
    return {
      user,
      req: { protocol: "https", headers: {} } as any,
      res: {
        clearCookie: () => {},
        cookie: () => {},
      } as any,
    };
  }

  it("deve bloquear acesso de aluno comum ao painel de administração", async () => {
    const studentUser: User = {
      id: 2,
      studentCode: "#002",
      name: "Aluno Teste",
      passwordHash: "hash",
      role: "user",
      isGeneralAdmin: false,
      openId: "usr_student",
      email: null,
      loginMethod: "credentials",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const caller = appRouter.createCaller(makeContext(studentUser));

    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("deve bloquear usuário não autenticado no painel de administração", async () => {
    const caller = appRouter.createCaller(makeContext(null));
    await expect(caller.admin.stats()).rejects.toThrow();
  });
});
