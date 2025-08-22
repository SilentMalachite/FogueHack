# Done Checklist

- Type-check passes: `npm run check`
- App builds: `npm run build` produces `dist/public` and `dist/index.js`
- Dev experience: `npm run dev` serves client at `http://localhost:5000`
- Manual tests: test console flows at `/test-console.html` run without errors
- Server robustness: avoid crashes on error paths (no throwing inside Express error middleware)
- Dependencies: all runtime imports present (e.g., add `nanoid`) and unused deps trimmed
- Repo hygiene: build artifacts not committed; `.gitignore` includes `node_modules`, `dist`, etc.
- Docs: README scripts match `package.json`; ESLint/Prettier status clarified
