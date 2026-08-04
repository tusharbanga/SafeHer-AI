import http from "node:http";
import https from "node:https";
import type { Plugin } from "vite";



function resolveTarget(): URL {
  const raw = process.env.BACKEND_URL || process.env.VITE_BACKEND_URL || "http://localhost:5000";
  return new URL(raw);
}

export default function apiBackendProxyPlugin(): Plugin {
  const target = resolveTarget();
  const requestFn = target.protocol === "https:" ? https.request : http.request;

  return {
    name: "safeher:api-backend-proxy",
    apply: "serve",
    enforce: "pre",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith("/api")) {
          next();
          return;
        }

        const outgoingHeaders: Record<string, string | string[]> = {};
        for (const [key, value] of Object.entries(req.headers)) {
          if (value === undefined) continue;
          if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) continue;
          outgoingHeaders[key] = value;
        }
        outgoingHeaders.host = target.host;

        const proxyReq = requestFn(
          {
            protocol: target.protocol,
            hostname: target.hostname,
            port: target.port || (target.protocol === "https:" ? 443 : 80),
            method: req.method,
            path: req.url,
            headers: outgoingHeaders,
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
          },
        );

        proxyReq.on("error", (err) => {
          server.config.logger.error(
            `[api-backend-proxy] ${req.method} ${req.url} -> ${target.origin} failed: ${err.message}`,
          );
          if (!res.headersSent) {
            res.writeHead(502, { "content-type": "application/json" });
          }
          res.end(
            JSON.stringify({
              success: false,
              message: `Could not reach the backend at ${target.origin}. Is it running?`,
            }),
          );
        });

        req.pipe(proxyReq, { end: true });
      });
    },
  };
}
