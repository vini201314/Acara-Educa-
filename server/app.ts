import "dotenv/config";
import express, { type Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./_core/oauth";
import { registerStorageProxy } from "./_core/storageProxy";
import { createContext } from "./_core/context";
import { appRouter } from "./routers";

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
