import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  // Users API
  // Create user
  app.post("/api/users", async (req: Request, res: Response) => {
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
    const { password: _pw, ...publicUser } = created as any;
    return res.status(201).json(publicUser);
  });

  // Get user by id
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const user = await storage.getUser(id);
    if (!user) return res.status(404).json({ message: "Not found" });
    const { password: _pw, ...publicUser } = user as any;
    return res.json(publicUser);
  });

  // Get user by username
  app.get("/api/users/by-username/:username", async (req: Request, res: Response) => {
    const user = await storage.getUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ message: "Not found" });
    const { password: _pw, ...publicUser } = user as any;
    return res.json(publicUser);
  });

  const httpServer = createServer(app);

  return httpServer;
}
