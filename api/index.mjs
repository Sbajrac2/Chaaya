// Vercel serverless function — wraps the Express app (pre-built by esbuild)
import app from '../artifacts/api-server/dist/app.mjs';
export default app;
