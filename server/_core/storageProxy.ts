import { Readable } from "node:stream";
import type { Application, Request, Response } from "express";
import { ENV } from "./env";

export function registerStorageProxy(app: Application): void {
  app.get("/manus-storage/*", async (req: Request, res: Response): Promise<void> => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).json({ error: "Missing storage key" });
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).json({ error: "Storage proxy not configured" });
      return;
    }

    try {
      const forgeUrl = new URL("v1/storage/presign/get", ENV.forgeApiUrl.replace(/\/+$/, "") + "/");
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, { headers: { Authorization: `Bearer ${ENV.forgeApiKey}` } });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).json({ error: "Storage backend error" });
        return;
      }
      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).json({ error: "Empty signed URL from backend" });
        return;
      }

      // Forward Range so mobile browsers can seek and progressively play large videos.
      const range = req.headers.range;
      const mediaResp = await fetch(url, { headers: range ? { Range: range } : undefined });
      if (!mediaResp.ok && mediaResp.status !== 206) {
        res.status(mediaResp.status).json({ error: "Media file unavailable" });
        return;
      }
      const forwardedHeaders = ["content-type", "content-length", "content-range", "accept-ranges", "etag", "last-modified"];
      for (const header of forwardedHeaders) {
        const value = mediaResp.headers.get(header);
        if (value) res.setHeader(header, value);
      }
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.status(mediaResp.status);
      if (mediaResp.body) {
        Readable.fromWeb(mediaResp.body as import("node:stream/web").ReadableStream).pipe(res);
      } else {
        res.end();
      }
    } catch (error) {
      console.error("[StorageProxy] failed:", error);
      if (!res.headersSent) res.status(502).json({ error: "Storage proxy error" });
    }
  });
}
