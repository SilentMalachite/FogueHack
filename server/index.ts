import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
// Strong ETag globally (default is weak in some setups)
app.set("etag", "strong");
// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

function maskSensitive(value: any): any {
  const SENSITIVE_KEYS = new Set([
    "password",
    "pass",
    "token",
    "authorization",
    "auth",
    "secret",
  ]);

  const mask = (v: any): any => {
    if (v == null) return v;
    if (Array.isArray(v)) return v.map(mask);
    if (typeof v === "object") {
      const out: Record<string, any> = {};
      for (const [k, val] of Object.entries(v)) {
        out[k] = SENSITIVE_KEYS.has(k.toLowerCase()) ? "***" : mask(val);
      }
      return out;
    }
    return v;
  };

  return mask(value);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          const masked = maskSensitive(capturedJsonResponse);
          logLine += ` :: ${JSON.stringify(masked)}`;
        } catch (_) {
          // fallback to raw if masking fails for any reason
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Respond with error JSON and log the error. Avoid throwing after response to prevent process crashes.
    res.status(status).json({ message });
    try {
      log(`error ${status}: ${message}`);
    } catch (_) {
      // no-op if logger fails
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Serve API and client
  // Respect PORT env var if provided, fallback to 5000
  const port = Number(process.env.PORT) || 5000;
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
