// Env vars are loaded via --env-file flag in Node 20+ (see package.json scripts)
// This avoids ESM import hoisting issues where dotenv would run after module init
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"] || "3000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, "0.0.0.0", (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "🚀 Server listening");
  console.log(`\n✅ API Server running at http://localhost:${port}`);
});
