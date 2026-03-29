// /api/weather.ts

import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { lat, lon } = req.query;

  // Mock for now
  res.status(200).json({
    temperature: 65,
    condition: "Sunny",
    lat,
    lon,
  });
}
