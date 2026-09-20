import { createApp } from "../server/app";

// Vercel invokes the exported Express-compatible handler for /api/* and
// rewrites for OAuth and storage routes. No TCP listener is started here.
const app = createApp();

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

export default app;
