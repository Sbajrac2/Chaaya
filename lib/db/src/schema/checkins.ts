import { pgTable, serial, text, boolean, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const checkinsTable = pgTable("checkins", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  attendedClass: boolean("attended_class").notNull(),
  ateWell: boolean("ate_well").notNull(),
  maskingLevel: integer("masking_level").notNull(),
  holdDurationMs: integer("hold_duration_ms").notNull(),
  interactionLatencyMs: real("interaction_latency_ms").notNull(),
  isLateNight: boolean("is_late_night").notNull().default(false),
  lat: real("lat"),
  lon: real("lon"),
  wakeTime: text("wake_time"),
  leftRoom: boolean("left_room"),
  hadPhysicalContact: boolean("had_physical_contact"),
  hadCognitiveFriction: boolean("had_cognitive_friction"),
  hadSunlightExposure: boolean("had_sunlight_exposure"),
  usedSubstanceCoping: boolean("used_substance_coping"),
  completedTask: boolean("completed_task"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCheckinSchema = createInsertSchema(checkinsTable).omit({ id: true, createdAt: true });
export type InsertCheckin = z.infer<typeof insertCheckinSchema>;
export type Checkin = typeof checkinsTable.$inferSelect;
