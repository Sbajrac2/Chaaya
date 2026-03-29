import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// No setBaseUrl needed — both frontend and API live on the same Vercel domain.
// In dev, Vite proxy handles /api/* → localhost:3000.
// In production, Vercel rewrites /api/* → serverless function.

createRoot(document.getElementById("root")!).render(<App />);
