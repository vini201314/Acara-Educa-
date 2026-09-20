import type { ErrorRequestHandler, RequestHandler } from "express";
import { createApp } from "../server/app";

// Vercel invokes this Express-compatible handler for /api/*.
// The platform compiles this TypeScript file as the default Node.js function;
// no custom runtime or TCP listener is required.
const app = createApp();

// Keep every unmatched API response machine-readable. This prevents the
// frontend from trying to parse Vercel/Express HTML error pages as JSON.
const apiNotFound: RequestHandler = (req, res) => {
  res.status(404).type("application/json").json({
    error: {
      message: `API route not found: ${req.method} ${req.originalUrl}`,
      code: "NOT_FOUND",
    },
  });
};

const apiError: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error("[Vercel API] Unhandled request error:", error);
  if (res.headersSent) return;

  res.status(500).type("application/json").json({
    error: {
      message: "Não foi possível concluir a solicitação. Tente novamente.",
      code: "INTERNAL_SERVER_ERROR",
    },
  });
};

app.use(apiNotFound);
app.use(apiError);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

export default app;
