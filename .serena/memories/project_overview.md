# FogueHack – Project Overview

- Purpose: Browser-based NetHack-style ASCII roguelike RPG with Japanese UI and rich systems (dungeon generation, quests, crafting, spells, audio).
- Tech Stack:
  - Frontend: React 18, TypeScript, Vite, Zustand, Tailwind CSS
  - Backend: Express (TypeScript), Node 18+, esbuild bundling
  - Shared: Drizzle ORM schema (PostgreSQL), zod
  - Tooling: Vite plugins (React, GLSL, Replit error overlay), Tailwind + PostCSS
- Structure:
  - client/: React app, components, game logic under src/lib, public/ assets (textures, sounds, models)
  - server/: Express server, Vite dev middleware, in-memory storage
  - shared/: Drizzle schema and types
  - dist/: Built server and client (currently committed to repo)
- Entry points:
  - Dev: `server/index.ts` (mounts Vite middlewares, serves client)
  - Prod: `dist/index.js` serving static files from `dist/public`
