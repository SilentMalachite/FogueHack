// server/index.ts
import express2 from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  currentId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.currentId = 1;
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }
  async createUser(insertUser) {
    const id = this.currentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });
  app2.post("/api/users", async (req, res) => {
    const parse = insertUserSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ message: "Invalid payload" });
    }
    const { username } = parse.data;
    const existing = await storage.getUserByUsername(username);
    if (existing) {
      return res.status(409).json({ message: "Username already exists" });
    }
    const created = await storage.createUser(parse.data);
    const { password: _pw, ...publicUser } = created;
    return res.status(201).json(publicUser);
  });
  app2.get("/api/users/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const user = await storage.getUser(id);
    if (!user) return res.status(404).json({ message: "Not found" });
    const { password: _pw, ...publicUser } = user;
    return res.json(publicUser);
  });
  app2.get("/api/users/by-username/:username", async (req, res) => {
    const user = await storage.getUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ message: "Not found" });
    const { password: _pw, ...publicUser } = user;
    return res.json(publicUser);
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  // Add support for large models and audio files
  assetsInclude: ["**/*.gltf", "**/*.glb", "**/*.mp3", "**/*.ogg", "**/*.wav"]
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(__dirname2, "..", "client", "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  const assetsPath = path2.resolve(distPath, "assets");
  if (fs.existsSync(assetsPath)) {
    app2.use(
      "/assets",
      express.static(assetsPath, {
        etag: false,
        lastModified: false,
        setHeaders: (res) => {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      })
    );
  }
  const soundsPath = path2.resolve(distPath, "sounds");
  if (fs.existsSync(soundsPath)) {
    app2.use(
      "/sounds",
      express.static(soundsPath, {
        setHeaders: (res) => {
          res.setHeader("Cache-Control", "public, max-age=604800");
        }
      })
    );
  }
  app2.use(
    express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (path2.basename(filePath) === "index.html") {
          res.setHeader("Cache-Control", "no-store");
          res.removeHeader("ETag");
          res.removeHeader("Last-Modified");
        } else {
          res.setHeader("Cache-Control", "public, max-age=3600");
        }
      }
    })
  );
  app2.use("*", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.set("etag", "strong");
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(
  rateLimit({
    windowMs: 60 * 1e3,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
  })
);
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
function maskSensitive(value) {
  const SENSITIVE_KEYS = /* @__PURE__ */ new Set([
    "password",
    "pass",
    "token",
    "authorization",
    "auth",
    "secret"
  ]);
  const mask = (v) => {
    if (v == null) return v;
    if (Array.isArray(v)) return v.map(mask);
    if (typeof v === "object") {
      const out = {};
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
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          const masked = maskSensitive(capturedJsonResponse);
          logLine += ` :: ${JSON.stringify(masked)}`;
        } catch (_) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    try {
      log(`error ${status}: ${message}`);
    } catch (_) {
    }
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = Number(process.env.PORT) || 5e3;
  const listenOptions = {
    port,
    host: "0.0.0.0"
  };
  if (process.platform !== "win32") {
    listenOptions.reusePort = true;
  }
  server.listen(listenOptions, () => {
    log(`serving on port ${port}`);
  });
})();
