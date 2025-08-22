# Suggested Commands

- Install: `npm install`
- Develop: `npm run dev` (starts Express + Vite in middleware mode on port 5000)
- Type-check: `npm run check` (tsc only)
- Build: `npm run build` (Vite client -> `dist/public`, esbuild server -> `dist/index.js`)
- Start (prod): `npm start` (serves from `dist/` at port 5000)
- DB push (Drizzle): `npm run db:push` (requires `DATABASE_URL`)

Notes:

- Port is hardcoded to 5000; `PORT` env var is not respected currently.
- Browser test console: open `http://localhost:5000/test-console.html` after `npm run dev`
