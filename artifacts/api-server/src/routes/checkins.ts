import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { checkinsTable } from "@workspace/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { CreateCheckinBody, GetCheckinsQueryParams, GetGardenQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/checkins", async (req, res) => {
  try {
    const body = CreateCheckinBody.parse(req.body);
    const hour = new Date().getHours();
    const isLateNight = hour >= 22 || hour < 5;

    const [checkin] = await db.insert(checkinsTable).values({
      sessionId: body.sessionId,
      attendedClass: body.attendedClass,
      ateWell: body.ateWell,
      maskingLevel: body.maskingLevel,
      holdDurationMs: body.holdDurationMs,
      interactionLatencyMs: body.interactionLatencyMs,
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

    res.status(201).json(checkin);
  } catch (err) {
    req.log.error({ err }, "Failed to create check-in");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.get("/checkins", async (req, res) => {
  try {
    const query = GetCheckinsQueryParams.parse(req.query);
    const checkins = await db
      .select()
      .from(checkinsTable)
      .where(eq(checkinsTable.sessionId, query.sessionId))
      .orderBy(desc(checkinsTable.createdAt))
      .limit(query.limit ?? 30);

    res.json(checkins);
  } catch (err) {
    req.log.error({ err }, "Failed to get check-ins");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.get("/checkins/garden", async (req, res) => {
  try {
    const query = GetGardenQueryParams.parse(req.query);

    const checkins = await db
      .select()
      .from(checkinsTable)
      .where(eq(checkinsTable.sessionId, query.sessionId))
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

    res.json({
      totalPetals,
      recentCheckins: checkins.slice(0, 30),
      currentStreak,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get garden data");
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
