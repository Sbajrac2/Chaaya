// /api/checkins.ts

import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json([
    {
      attendedClass: true,
      ateWell: true,
      leftRoom: true,
      isLateNight: false,
      maskingLevel: 2,
      hadSunlightExposure: true,
    },
    {
      attendedClass: false,
      ateWell: true,
      leftRoom: false,
      isLateNight: true,
      maskingLevel: 4,
      hadSunlightExposure: false,
    },
  ]);
}
