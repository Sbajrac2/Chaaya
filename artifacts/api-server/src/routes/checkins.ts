import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { checkinsTable } from "@workspace/db/schema";
import { desc, eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.post("/checkins", async (req, res) => {
  try {
    const body = req.body;
    const hour = new Date().getHours();
    const isLateNight = hour >= 22 || hour < 5;

    const [checkin] = await db.insert(checkinsTable).values({
      sessionId: body.sessionId,
      attendedClass: body.attendedClass ?? false,
      ateWell: body.ateWell ?? false,
      maskingLevel: body.maskingLevel ?? 3,
      holdDurationMs: body.holdDurationMs ?? 0,
      interactionLatencyMs: body.interactionLatencyMs ?? 400,
      isLateNight,
      lat: body.lat ?? null,
      lon: body.lon ?? null,
      wakeTime: body.wakeTime ?? null,
      leftRoom: body.leftRoom ?? null,
      hadPhysicalContact: body.hadPhysicalContact ?? null,
      hadCognitiveFriction: body.hadCognitiveFriction ?? null,
      hadSunlightExposure: body.hadSunlightExposure ?? null,
      usedSubstanceCoping: body.usedSubstanceCoping ?? null,
      completedTask: body.completedTask ?? null,
    }).returning();

    console.log(`[API] ✅ Check-in saved to database for session ${body.sessionId}`);
    console.log(`[API]   Duration: ${checkin.holdDurationMs}ms, Latency: ${checkin.interactionLatencyMs}ms`);
    res.status(201).json(checkin);
  } catch (err) {
    console.error("[API] ❌ Error saving check-in:", err);
    res.status(400).json({ error: "Failed to save check-in" });
  }
});

router.get("/checkins", async (req, res) => {
  try {
    const sessionId = req.query.sessionId as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 30;

    const checkins = await db
      .select()
      .from(checkinsTable)
      .where(eq(checkinsTable.sessionId, sessionId))
      .orderBy(desc(checkinsTable.createdAt))
      .limit(limit);

    console.log(`[API] 📊 Fetched ${checkins.length} check-ins from database for session ${sessionId}`);
    res.json(checkins);
  } catch (err) {
    console.error("[API] ❌ Error fetching check-ins:", err);
    res.status(400).json({ error: "Failed to fetch check-ins" });
  }
});

router.get("/checkins/garden", async (req, res) => {
  try {
    const sessionId = req.query.sessionId as string;
    const checkins = await db
      .select()
      .from(checkinsTable)
      .where(eq(checkinsTable.sessionId, sessionId))
      .orderBy(desc(checkinsTable.createdAt))
      .limit(100);

    const totalPetals = checkins.length;
    let currentStreak = 0;

    if (checkins.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let checkDate = new Date(today);

      for (const checkin of checkins) {
        const checkinDate = new Date(checkin.createdAt);
        checkinDate.setHours(0, 0, 0, 0);
        if (checkinDate.getTime() === checkDate.getTime()) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    console.log(`[API] 🌻 Garden - ${totalPetals} petals, streak: ${currentStreak}`);
    res.json({
      totalPetals,
      recentCheckins: checkins.slice(0, 30),
      currentStreak,
    });
  } catch (err) {
    console.error("[API] ❌ Error fetching garden data:", err);
    res.status(400).json({ error: "Failed to fetch garden data" });
  }
});

export default router;
