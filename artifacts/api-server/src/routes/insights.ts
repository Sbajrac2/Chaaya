import { Router, type IRouter } from "express";
import { GenerateInsightBody, GenerateExtensionEmailBody, FocusFunnelBody, GenerateBioValidationBody } from "@workspace/api-zod";

const router: IRouter = Router();

// Safe Anthropic import with fallback
let anthropic: any = null;
const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;

if (hasAnthropicKey) {
  try {
    Promise.resolve()
      .then(() => import("@workspace/integrations-openai-ai-server"))
      .then(mod => {
        anthropic = mod.anthropic;
        console.log("[API] ✅ Anthropic Claude loaded");
      })
      .catch(err => console.warn("[API] Could not load Anthropic integration:", err));
  } catch (err) {
    console.warn("[API] Anthropic integration not available - using built-in fallbacks");
  }
}

// Helper: call Claude claude-haiku-4-5-20251001 with a prompt, returns string
async function askClaude(system: string, user: string): Promise<string | null> {
  if (!anthropic) return null;
  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 350,
      system,
      messages: [{ role: "user", content: user }],
    });
    return message.content[0]?.type === "text" ? message.content[0].text.trim() : null;
  } catch (err) {
    console.warn("[API] Claude call failed:", err);
    return null;
  }
}

router.post("/insights", async (req, res) => {
  try {
    const body = GenerateInsightBody.parse(req.body);
    const { recentCheckins, weatherData, academicWeek } = body;

    const checkinCount = recentCheckins.length;
    const avgMasking = checkinCount > 0
      ? recentCheckins.reduce((sum, c) => sum + c.maskingLevel, 0) / checkinCount
      : 3;
    const avgLatency = checkinCount > 0
      ? recentCheckins.reduce((sum, c) => sum + c.interactionLatencyMs, 0) / checkinCount
      : 500;
    const lateNightCount = recentCheckins.filter(c => c.isLateNight).length;
    const missedClassCount = recentCheckins.filter(c => !c.attendedClass).length;
    const skippedMealsCount = recentCheckins.filter(c => !c.ateWell).length;
    const isolationCount = recentCheckins.filter(c => c.leftRoom === false).length;
    const noContactCount = recentCheckins.filter(c => c.hadPhysicalContact === false).length;
    const cognitiveFrictionCount = recentCheckins.filter(c => c.hadCognitiveFriction === true).length;
    const noSunlightCount = recentCheckins.filter(c => c.hadSunlightExposure === false).length;
    const substanceCount = recentCheckins.filter(c => c.usedSubstanceCoping === true).length;
    const incompletionCount = recentCheckins.filter(c => c.completedTask === false).length;

    const cognitiveLoadScore = (avgLatency > 800 ? 2 : avgLatency > 500 ? 1 : 0)
      + (avgMasking > 3.5 ? 1 : 0)
      + (lateNightCount > 2 ? 1 : 0)
      + (isolationCount > 3 ? 1 : 0)
      + (cognitiveFrictionCount > 2 ? 1 : 0);

    const cognitiveLoad = cognitiveLoadScore >= 4 ? "high" : cognitiveLoadScore >= 2 ? "moderate" : "low";

    const patterns: string[] = [];
    if (lateNightCount > 1) patterns.push(`${lateNightCount} late-night sessions — your sleep rhythm may be shifting`);
    if (missedClassCount > 0) patterns.push(`Missed ${missedClassCount} day${missedClassCount > 1 ? "s" : ""} of showing up`);
    if (skippedMealsCount > 1) patterns.push(`Skipped meals ${skippedMealsCount} times recently`);
    if (isolationCount > 1) patterns.push(`${isolationCount} days without leaving your room`);
    if (cognitiveFrictionCount > 1) patterns.push(`Struggled to start tasks ${cognitiveFrictionCount} times`);
    if (substanceCount > 0) patterns.push(`Used caffeine/alcohol to cope ${substanceCount} time${substanceCount > 1 ? "s" : ""}`);
    if (avgMasking > 3.5) patterns.push(`High masking level (${avgMasking.toFixed(1)}/5) — a lot of emotional labor`);
    if (noSunlightCount > 1) patterns.push(`${noSunlightCount} days without sunlight exposure`);
    if (patterns.length === 0 && checkinCount > 0) patterns.push("Consistent check-ins — your awareness is itself a strength");

    const weatherContext = weatherData
      ? `Weather: ${weatherData.description}, ${weatherData.temperature}°C, ${weatherData.sunlightHours}h sunlight, UV ${weatherData.uvIndex}. ${weatherData.isLowSunlight ? "Very low sunlight today." : ""}`
      : "No weather data.";

    const weekContext = academicWeek
      ? `Academic week ${academicWeek}. ${academicWeek >= 7 && academicWeek <= 9 ? "Midterm season — statistically the hardest stretch." : academicWeek >= 13 ? "Finals approaching." : ""}`
      : "";

    const systemPrompt = `You are Asha — a warm, non-clinical digital companion for students.
You speak with quiet wisdom, like a trusted friend who understands burnout.
You validate feelings without diagnosing. Normalize difficulty. Never use clinical terms.
Write 2-4 sentences. No bullet points. No headers.
Reference specific behavioral patterns (late nights, meals, masking, isolation).
If weather has been gray or it's a hard week academically, name it.
End with one gentle permission or encouragement.`;

    const userPrompt = `Person's recent patterns (last 30 days):
- Check-ins: ${checkinCount}
- Avg masking (1=authentic, 5=heavily masked): ${avgMasking.toFixed(1)}/5
- Late nights: ${lateNightCount}, Missed class: ${missedClassCount}, Skipped meals: ${skippedMealsCount}
- Days isolated (didn't leave room): ${isolationCount}
- Days with cognitive friction: ${cognitiveFrictionCount}
- Days without sunlight: ${noSunlightCount}
- Days using substances to cope: ${substanceCount}
- Days without completing a task: ${incompletionCount}
- No physical contact: ${noContactCount} days
- Avg response latency: ${avgLatency.toFixed(0)}ms (baseline ~400ms; higher = more fatigue)
- ${weatherContext}
- ${weekContext}

Write a warm "Note from Asha" — specific and validating. 2-4 sentences.`;

    const claudeNote = await askClaude(systemPrompt, userPrompt);
    const note = claudeNote ?? (
      lateNightCount > 1
        ? "The late nights are showing — your nervous system is trying to tell you something. You don't have to push through everything right now."
        : avgMasking > 3.5
        ? "Carrying so much of yourself hidden is exhausting. You deserve spaces where you can just exist without performing."
        : "You showed up and checked in. That act of noticing yourself matters more than it might feel like right now."
    );

    let sanctuarySuggestion: string | null = null;
    if (weatherData && weatherData.sunlightHours > 4) {
      sanctuarySuggestion = `There are ${Math.round(weatherData.sunlightHours)}h of light today in ${weatherData.city}. Even 6 minutes outside can shift your nervous system.`;
    } else if (cognitiveLoad === "high") {
      sanctuarySuggestion = "Find a quiet corner — somewhere soft-lit and low-stimulation. Even 10 minutes of stillness counts as recovery.";
    }

    res.json({ note, cognitiveLoad, showLightenLoad: true, sanctuarySuggestion, patterns });
  } catch (err) {
    console.error("[API] Failed to generate insight:", err);
    res.json({
      note: "The stone feels heavy today. You showed up anyway, and that's enough.",
      cognitiveLoad: "moderate",
      showLightenLoad: false,
      sanctuarySuggestion: null,
      patterns: [],
    });
  }
});

router.post("/insights/bio-validation", async (req, res) => {
  try {
    const body = GenerateBioValidationBody.parse(req.body);
    const { checkin, weatherData } = body;

    const signals: string[] = [];
    let factType: "weather" | "circadian" | "isolation" | "nutrition" | "cognitive" | "general" = "general";

    if (weatherData) {
      if (weatherData.temperature < 5) {
        signals.push(`It's ${weatherData.temperature}°C outside. Your body is burning extra energy just to maintain core temperature. Your fatigue is biological, not a personal failure.`);
        factType = "weather";
      } else if (weatherData.isLowSunlight) {
        signals.push(`Only ${weatherData.sunlightHours}h of sunlight today. Reduced light means reduced serotonin synthesis. Your low energy has a physical cause.`);
        factType = "weather";
      } else if (weatherData.barometricPressure < 1000) {
        signals.push(`Barometric pressure is low today (${weatherData.barometricPressure} hPa). Research shows drops in pressure increase fatigue. Your body is responding to atmospheric changes.`);
        factType = "weather";
      }
    }

    if (signals.length === 0) {
      if (checkin.isLateNight) {
        signals.push("You're checking in late at night. Your prefrontal cortex runs on sleep. It's already working harder than it should be right now.");
        factType = "circadian";
      } else if (checkin.leftRoom === false) {
        signals.push("You didn't leave your room today. Your nervous system is wired for co-regulation — it literally calms down in the presence of safe others.");
        factType = "isolation";
      } else if (checkin.hadCognitiveFriction === true) {
        signals.push("You found it hard to start tasks today. That's elevated activation energy — a neurological cost, not laziness.");
        factType = "cognitive";
      } else if (!checkin.ateWell) {
        signals.push("You skipped a proper meal. 90% of serotonin is produced in your gut. Nutritional disruption directly affects how you feel.");
        factType = "nutrition";
      } else if (checkin.maskingLevel >= 4) {
        signals.push("Your masking level is high. Every hour spent performing a version of yourself costs measurable cognitive and emotional resources.");
        factType = "cognitive";
      } else {
        signals.push("You checked in today. That act of self-awareness is itself a form of self-regulation. Your nervous system registers it even when your mind doesn't.");
        factType = "general";
      }
    }

    const card = signals[0];
    const xpGained = 10 + (checkin.completedTask ? 5 : 0) + (checkin.hadSunlightExposure ? 5 : 0);

    res.json({ card, xpGained, factType });
  } catch (err) {
    console.error("[API] Failed to generate bio-validation:", err);
    res.json({
      card: "You showed up. That's your nervous system choosing awareness over autopilot. +10 Wisdom XP.",
      xpGained: 10,
      factType: "general",
    });
  }
});

router.post("/insights/email", async (req, res) => {
  try {
    const body = GenerateExtensionEmailBody.parse(req.body);
    const { professorName, courseName, assignmentName, studentName, emailType, extraContext } = body;

    const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const type = emailType ?? "extension";

    const typeDescriptions: Record<string, string> = {
      extension: "requesting a 24-48 hour assignment extension due to wellbeing challenges",
      absence: "notifying about a class absence and asking about missed material",
      "office-hours": "requesting an office hours meeting",
      accommodation: "requesting academic accommodation",
      "mental-health-day": "notifying about needing a mental health day",
    };

    const systemPrompt = `You are a professional writing assistant. Write a warm, honest, professional email.
Tone: respectful, brief, human — not groveling. 2-4 short paragraphs.
Return ONLY valid JSON: {"subject": "...", "body": "..."}`;

    const userPrompt = `Write an email ${typeDescriptions[type] ?? typeDescriptions.extension}.
Date: ${today}
Professor: ${professorName ?? "Professor"}
Course: ${courseName ?? "the course"}
${assignmentName ? `Assignment: ${assignmentName}` : ""}
Student: ${studentName ?? "Student"}
${extraContext ? `Additional context: ${extraContext}` : ""}
Return ONLY JSON with "subject" and "body" fields.`;

    const subjectDefaults: Record<string, string> = {
      extension: `Extension Request — ${assignmentName ?? "Assignment"}`,
      absence: `Absence Notification — ${courseName ?? "Class"}`,
      "office-hours": `Office Hours Request — ${courseName ?? "Course"}`,
      accommodation: `Accommodation Request — ${courseName ?? "Course"}`,
      "mental-health-day": `Wellness Day — ${courseName ?? "Class"}`,
    };

    let subject = subjectDefaults[type] ?? subjectDefaults.extension;
    let emailBody = `Dear ${professorName ?? "Professor"},\n\nI am writing regarding ${courseName ?? "your course"}. I have been managing some personal challenges and want to ensure I can continue performing my best.\n\nThank you for your understanding.\n\n${studentName ?? "Student"}`;

    const claudeResponse = await askClaude(systemPrompt, userPrompt);
    if (claudeResponse) {
      try {
        const clean = claudeResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(clean);
        subject = parsed.subject ?? subject;
        emailBody = parsed.body ?? emailBody;
      } catch {
        // keep defaults
      }
    }

    const to = professorName ? encodeURIComponent(professorName) : "";
    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

    res.json({ subject, body: emailBody, mailtoLink });
  } catch (err) {
    console.error("[API] Failed to generate extension email:", err);
    res.status(500).json({ error: "Failed to generate email" });
  }
});

router.post("/insights/focus", async (req, res) => {
  try {
    const body = FocusFunnelBody.parse(req.body);
    const { tasks, weatherDescription, uvIndex, sunlightHours } = body;

    if (!tasks || tasks.length === 0) {
      return res.status(400).json({ error: "No tasks provided" });
    }

    const weatherContext = weatherDescription
      ? `Weather: ${weatherDescription}. UV: ${uvIndex ?? "?"}. Sunlight today: ${sunlightHours ?? "?"}h.`
      : "";

    const systemPrompt = `You are Asha, a cognitive support companion. Pick ONE task that best matches the person's current energy and conditions.
Return ONLY valid JSON: {"task": "exact task string", "reason": "one warm sentence explaining why"}`;

    const userPrompt = `Tasks:
${tasks.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}
${weatherContext}
Low sunlight or fatigue → prefer simpler tasks. Pick what will actually get done.`;

    const claudeResponse = await askClaude(systemPrompt, userPrompt);

    if (claudeResponse) {
      try {
        const clean = claudeResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(clean);
        return res.json({
          task: parsed.task ?? tasks[0],
          reason: parsed.reason ?? "Start with the first one — one step at a time.",
        });
      } catch {
        // fall through to default
      }
    }

    // Fallback: pick smallest/first task
    const sorted = [...tasks].sort((a, b) => a.length - b.length);
    res.json({
      task: sorted[0],
      reason: "Start small — this one feels like the right size for right now.",
    });
  } catch (err) {
    console.error("[API] Focus funnel error:", err);
    res.json({
      task: req.body.tasks?.[0] ?? "First task",
      reason: "Start with the first one. Small steps forward.",
    });
  }
});

export default router;
