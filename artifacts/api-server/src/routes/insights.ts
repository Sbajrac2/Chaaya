import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GenerateInsightBody, GenerateExtensionEmailBody, FocusFunnelBody, GenerateBioValidationBody } from "@workspace/api-zod";

const router: IRouter = Router();

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

    const wakeTimes = recentCheckins
      .filter(c => c.wakeTime)
      .map(c => {
        const match = c.wakeTime!.match(/^(\d+):(\d+)\s*(AM|PM)?$/i);
        if (!match) return null;
        let hours = parseInt(match[1]);
        const mins = parseInt(match[2]);
        const ampm = match[3]?.toUpperCase();
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
        return hours + mins / 60;
      })
      .filter((t): t is number => t !== null);

    let wakeTimeDrift = 0;
    if (wakeTimes.length >= 3) {
      const baselineWake = wakeTimes.slice(-3).reduce((a, b) => a + b, 0) / 3;
      const recentWake = wakeTimes[0];
      wakeTimeDrift = Math.abs(recentWake - baselineWake);
    }

    const cognitiveLoadScore = (avgLatency > 800 ? 2 : avgLatency > 500 ? 1 : 0)
      + (avgMasking > 3.5 ? 1 : 0)
      + (lateNightCount > 2 ? 1 : 0)
      + (isolationCount > 3 ? 1 : 0)
      + (cognitiveFrictionCount > 2 ? 1 : 0)
      + (wakeTimeDrift > 1.5 ? 1 : 0);

    const cognitiveLoad = cognitiveLoadScore >= 4 ? "high" : cognitiveLoadScore >= 2 ? "moderate" : "low";
    const showLightenLoad = true;

    const patterns: string[] = [];
    if (lateNightCount > 1) patterns.push(`${lateNightCount} late-night sessions — your sleep rhythm may be shifting`);
    if (missedClassCount > 0) patterns.push(`Missed ${missedClassCount} day${missedClassCount > 1 ? "s" : ""} of showing up`);
    if (skippedMealsCount > 1) patterns.push(`Skipped meals ${skippedMealsCount} times recently`);
    if (isolationCount > 1) patterns.push(`${isolationCount} days without leaving your room`);
    if (cognitiveFrictionCount > 1) patterns.push(`Struggled to start tasks ${cognitiveFrictionCount} times`);
    if (wakeTimeDrift > 1.5) patterns.push(`Wake time drifting by ${wakeTimeDrift.toFixed(1)}h (social jet lag)`);
    if (substanceCount > 0) patterns.push(`Used caffeine/alcohol to cope ${substanceCount} time${substanceCount > 1 ? "s" : ""}`);
    if (avgMasking > 3.5) patterns.push(`High masking level (${avgMasking.toFixed(1)}/5) — a lot of emotional labor`);
    if (noSunlightCount > 1) patterns.push(`${noSunlightCount} days without sunlight exposure`);
    if (patterns.length === 0 && checkinCount > 0) patterns.push("Consistent check-ins — your awareness is itself a strength");

    const weatherContext = weatherData
      ? `Weather: ${weatherData.description}, ${weatherData.temperature}°C, ${weatherData.sunlightHours}h of sunlight today, UV index ${weatherData.uvIndex}. ${weatherData.isLowSunlight ? "Very low sunlight — this affects mood and energy significantly." : ""}`
      : "No weather data available.";

    const weekContext = academicWeek ? `Academic week: ${academicWeek}. ${academicWeek >= 7 && academicWeek <= 9 ? "This is midterm season — statistically the hardest stretch of the semester." : academicWeek >= 13 ? "End-of-semester crunch — finals are close." : ""}` : "";

    const systemPrompt = `You are Asha — a warm, non-clinical digital companion for students and professionals facing burnout.
You speak with quiet wisdom, like a trusted friend who deeply understands the pressures of academic and professional life.
You validate feelings without diagnosing. You normalize difficulty. You never use clinical terms.
You write short, warm, specific notes — 2-4 sentences max. No bullet points. No headers.
Reference specific behavioral patterns you've noticed (late nights, meals skipped, masking level, isolation, circadian drift, cognitive friction).
If the weather has been gray, mention it. If it's a hard week academically, name it.
End with one simple, gentle permission or encouragement.`;

    const userPrompt = `Here's what I know about this person right now:
- Check-ins in the last 30 days: ${checkinCount}
- Average masking level (1=authentic, 5=heavily masking): ${avgMasking.toFixed(1)}/5
- Late-night usage: ${lateNightCount} times
- Missed classes/work: ${missedClassCount} times
- Skipped meals: ${skippedMealsCount} times
- Days stayed in room (isolation): ${isolationCount} days
- Days without physical contact: ${noContactCount} days
- Days with cognitive friction (couldn't start tasks): ${cognitiveFrictionCount} days
- Days without sunlight exposure: ${noSunlightCount} days
- Days using caffeine/alcohol to cope: ${substanceCount} days
- Days without completing any intended task: ${incompletionCount} days
- Wake time drift from baseline: ${wakeTimeDrift.toFixed(1)} hours (>1.5h = social jet lag)
- Average response latency (cognitive load indicator): ${avgLatency.toFixed(0)}ms (baseline ~400ms; higher = more fatigue)
- ${weatherContext}
- ${weekContext}

Write a "Note from Asha" — warm, specific, validating. 2-4 sentences. Reference the most concerning behavioral patterns.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_completion_tokens: 250,
    });

    const note = completion.choices[0]?.message?.content?.trim() ||
      "The stone feels heavy today. That's okay — you showed up, and that counts.";

    let sanctuarySuggestion: string | null = null;
    if (showLightenLoad && weatherData) {
      if (weatherData.sunlightHours > 4) {
        sanctuarySuggestion = `There are ${Math.round(weatherData.sunlightHours)}h of light today in ${weatherData.city}. Even 6 minutes outside can shift your nervous system. You don't have to fix anything — just step out.`;
      } else {
        sanctuarySuggestion = "Find a quiet corner — somewhere soft-lit and low-stimulation. Even 10 minutes of stillness counts as recovery.";
      }
    }

    res.json({
      note,
      cognitiveLoad,
      showLightenLoad,
      sanctuarySuggestion,
      patterns,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate insight");
    res.json({
      note: "The stone feels heavy today. You showed up anyway, and that's enough.",
      cognitiveLoad: "moderate",
      showLightenLoad: false,
      sanctuarySuggestion: null,
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
        signals.push(`Only ${weatherData.sunlightHours}h of sunlight today. Reduced light means reduced serotonin synthesis via your retinal photoreceptors. Your low energy has a physical cause.`);
        factType = "weather";
      } else if (weatherData.barometricPressure < 1000) {
        signals.push(`Barometric pressure is low today (${weatherData.barometricPressure} hPa). Research shows drops in pressure increase fatigue and headache frequency. Your body is responding to atmospheric changes.`);
        factType = "weather";
      }
    }

    if (checkin.isLateNight) {
      signals.push("You're checking in late at night. Your prefrontal cortex — the part of your brain that regulates decisions and emotions — runs on sleep. It's already working harder than it should be right now.");
      factType = "circadian";
    }

    if (checkin.leftRoom === false) {
      signals.push("You didn't leave your room today. Your nervous system is wired for co-regulation — it literally calms down in the presence of safe others. Tomorrow, even standing in a doorway for 2 minutes counts.");
      factType = "isolation";
    }

    if (checkin.hadCognitiveFriction === true) {
      signals.push("You found it hard to start tasks today. That's elevated activation energy — a neurological cost, not laziness. Your prefrontal cortex is running on reduced capacity. Start with the smallest possible step.");
      factType = "cognitive";
    }

    if (!checkin.ateWell) {
      signals.push("You skipped a proper meal. 90% of serotonin — the molecule that regulates mood — is produced in your gut. Nutritional disruption directly affects how you feel through the gut-brain axis.");
      factType = "nutrition";
    }

    if (checkin.hadPhysicalContact === false) {
      signals.push("No physical contact today. Human touch releases oxytocin and activates the vagus nerve — both directly regulate your stress response. Even a handshake counts.");
      factType = "isolation";
    }

    if (checkin.usedSubstanceCoping === true) {
      signals.push("You leaned on caffeine or alcohol today. That's your body looking for a chemical lever when its own systems are depleted. Not a flaw — a signal.");
      factType = "cognitive";
    }

    if (signals.length === 0) {
      if (checkin.maskingLevel >= 4) {
        signals.push("Your masking level is high. Every hour spent performing a version of yourself that doesn't match your internal state costs measurable cognitive and emotional resources. You deserve spaces where you can just be.");
        factType = "cognitive";
      } else {
        signals.push("You checked in today. That act of self-awareness — pausing to notice how you are — is itself a form of self-regulation. Your nervous system registers it even if your mind doesn't.");
        factType = "general";
      }
    }

    const card = signals[0];
    const xpGained = 10 + (checkin.completedTask ? 5 : 0) + (checkin.hadSunlightExposure ? 5 : 0);

    res.json({ card, xpGained, factType });
  } catch (err) {
    req.log.error({ err }, "Failed to generate bio-validation");
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

    const emailPrompts: Record<string, { system: string; user: string }> = {
      extension: {
        system: `You are a professional writing assistant. Draft a warm, honest, and professional email requesting a 24-48 hour extension on an assignment. The tone should be respectful, brief, and human — not groveling. Reference that the student is managing their wellbeing. Keep it to 3-4 short paragraphs.`,
        user: `Write an extension request email:\n- Date: ${today}\n- Professor: ${professorName ?? "Professor"}\n- Course: ${courseName ?? "my course"}\n- Assignment: ${assignmentName ?? "the upcoming assignment"}\n- Student: ${studentName ?? "a student"}\n- Include today's date in the email${extraContext ? `\n- Additional context: ${extraContext}` : ""}`,
      },
      absence: {
        system: `You are a professional writing assistant. Draft a warm, honest email notifying a professor about a class absence. The tone should be respectful and brief. Do not over-explain or give medical details — just acknowledge the absence and ask about making up missed work. Keep it to 2-3 short paragraphs.`,
        user: `Write an absence notification email:\n- Date: ${today}\n- Professor: ${professorName ?? "Professor"}\n- Course: ${courseName ?? "my course"}\n- Student: ${studentName ?? "a student"}\n- The student needs to miss class and wants to follow up on missed material${extraContext ? `\n- Additional context: ${extraContext}` : ""}`,
      },
      "office-hours": {
        system: `You are a professional writing assistant. Draft a polite email requesting an office hours meeting with a professor. The tone should be warm and specific about what the student needs help with. Keep it to 2-3 short paragraphs.`,
        user: `Write an office hours request email:\n- Date: ${today}\n- Professor: ${professorName ?? "Professor"}\n- Course: ${courseName ?? "my course"}\n- Student: ${studentName ?? "a student"}\n- The student wants to schedule a meeting to discuss course material or get support${extraContext ? `\n- Specific topic: ${extraContext}` : ""}`,
      },
      accommodation: {
        system: `You are a professional writing assistant. Draft a respectful email requesting academic accommodation or support. The tone should be clear and professional without oversharing personal details. Reference that the student is working with support services if applicable. Keep it to 3-4 short paragraphs.`,
        user: `Write an accommodation request email:\n- Date: ${today}\n- Professor: ${professorName ?? "Professor"}\n- Course: ${courseName ?? "my course"}\n- Student: ${studentName ?? "a student"}\n- The student is requesting reasonable accommodation for their wellbeing${extraContext ? `\n- Additional context: ${extraContext}` : ""}`,
      },
      "mental-health-day": {
        system: `You are a professional writing assistant. Draft a brief, honest email letting a professor know the student needs a mental health day. The tone should be matter-of-fact and respectful — no excessive apology. Keep it to 2 short paragraphs.`,
        user: `Write a mental health day notification:\n- Date: ${today}\n- Professor: ${professorName ?? "Professor"}\n- Course: ${courseName ?? "my course"}\n- Student: ${studentName ?? "a student"}\n- The student is taking a necessary mental health day and wants to follow up on anything missed${extraContext ? `\n- Additional context: ${extraContext}` : ""}`,
      },
    };

    const type = emailType ?? "extension";
    const prompts = emailPrompts[type] ?? emailPrompts.extension;

    const userPrompt = `${prompts.user}\n\nReturn ONLY a JSON object with these exact fields:\n{\n  "subject": "email subject line",\n  "body": "full email body text"\n}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: prompts.system },
        { role: "user", content: userPrompt },
      ],
      max_completion_tokens: 400,
    });

    const content = completion.choices[0]?.message?.content ?? "{}";

    const subjectDefaults: Record<string, string> = {
      extension: `Extension Request — ${assignmentName ?? "Assignment"}`,
      absence: `Absence Notification — ${courseName ?? "Class"}`,
      "office-hours": `Office Hours Request — ${courseName ?? "Course"}`,
      accommodation: `Accommodation Request — ${courseName ?? "Course"}`,
      "mental-health-day": `Wellness Day — ${courseName ?? "Class"}`,
    };

    let subject = subjectDefaults[type] ?? subjectDefaults.extension;
    let emailBody = `Dear ${professorName ?? "Professor"},\n\nI am writing regarding ${courseName ?? "your course"}.\n\nI have been managing some personal challenges and want to ensure I can continue performing my best.\n\nThank you for your understanding.\n\n${studentName ?? "Student"}`;

    try {
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleanContent);
      subject = parsed.subject ?? subject;
      emailBody = parsed.body ?? emailBody;
    } catch {
    }

    const to = professorName ? encodeURIComponent(`${professorName}`) : "";
    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

    res.json({ subject, body: emailBody, mailtoLink });
  } catch (err) {
    req.log.error({ err }, "Failed to generate extension email");
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
      ? `Current weather: ${weatherDescription}. UV index: ${uvIndex ?? "unknown"}. Sunlight hours today: ${sunlightHours ?? "unknown"}.`
      : "No weather data.";

    const prompt = `You are Asha, a cognitive support companion. A student has ${tasks.length} task(s) they need to complete:
${tasks.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}

Environmental context: ${weatherContext}

Your job: Pick exactly ONE task that best matches their current cognitive capacity and environmental conditions. 
- Low sunlight or high UV fatigue → prefer simpler, familiar tasks
- Reasonable conditions → pick the most urgent
- Choose what will actually get done, not the "right" answer

Return ONLY a JSON object:
{
  "task": "the exact task string chosen",
  "reason": "one warm, specific sentence explaining why this task fits right now (mention weather or energy if relevant)"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 150,
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    try {
      const clean = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(clean);
      res.json({ task: parsed.task ?? tasks[0], reason: parsed.reason ?? "Start here — it's the right size for right now." });
    } catch {
      res.json({ task: tasks[0], reason: "Start with the first one — one step at a time." });
    }
  } catch (err) {
    req.log.error({ err }, "Focus funnel error");
    res.json({ task: req.body.tasks?.[0] ?? "First task", reason: "Start with the first one. Small steps." });
  }
});

export default router;
