import "dotenv/config";
import express, { type Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./_core/oauth";
import { registerStorageProxy } from "./_core/storageProxy";
import { createContext } from "./_core/context";
import { appRouter } from "./routers";
import { ENV } from "./_core/env";
import { getDb } from "./db";
import { sql } from "drizzle-orm";

/**
 * Creates the application without binding a TCP port.
 *
 * This is intentionally shared by the local Node server and the Vercel
 * serverless function so production never serves source files or starts a
 * long-lived listener inside a function invocation.
 */
export function createApp(): Express {
  const app = express();

  // Keep compatibility with the existing admin video upload flow. Vercel's
  // platform request-size limits still apply to the deployed function.
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.get("/api/health", async (_req, res) => {
    const required = {
      DATABASE_URL: Boolean(ENV.databaseUrl),
      JWT_SECRET: Boolean(ENV.cookieSecret),
    };

    if (!required.DATABASE_URL || !required.JWT_SECRET) {
      console.error("[Health] Missing production environment variables", required);
      res.status(503).type("application/json").json({
        ok: false,
        database: "not_configured",
        required,
      });
      return;
    }

    try {
      const db = await getDb();
      if (!db) throw new Error("Database client was not initialized");
      await db.execute(sql`SELECT 1`);
      await db.execute(
        sql`SELECT studentCode, passwordHash, role, isGeneralAdmin FROM users LIMIT 0`,
      );
      res.type("application/json").json({
        ok: true,
        database: "connected",
        required,
      });
    } catch (error) {
      console.error("[Health] Database connectivity check failed", error);
      const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
      const schemaIncomplete =
        message.includes("unknown column") ||
        message.includes("doesn't exist") ||
        message.includes("no such table");
      res.status(503).type("application/json").json({
        ok: false,
        database: schemaIncomplete ? "schema_incomplete" : "unreachable",
        required,
      });
    }
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  // Some Vercel rewrites strip the /api prefix before invoking the function.
  // Supporting both paths makes the handler robust in preview and production.
  app.use(
    "/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  return app;
}
