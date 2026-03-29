# Post-Replit Cleanup ✅

**Frontend running at localhost:5173**

**Fixed:**
- ChhayaPanel crash → null-safe + placeholderData: []
- Rollup bypass: `ROLLUP_FORCE_PURE_JS=1 pnpm dev`

**Remaining:**
- Backend: `cd artifacts/api-server && tsx src/index.ts`
- DB: Docker Postgres or SQLite fallback
- "344" + skip button in CheckinFlow (already has skip)
