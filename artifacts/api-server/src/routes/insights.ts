import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GenerateInsightBody, GenerateExtensionEmailBody } from "@workspace/api-zod";

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

    const cognitiveLoadScore = (avgLatency > 800 ? 2 : avgLatency > 500 ? 1 : 0)
      + (avgMasking > 3.5 ? 1 : 0)
      + (lateNightCount > 2 ? 1 : 0);

    const cognitiveLoad = cognitiveLoadScore >= 3 ? "high" : cognitiveLoadScore >= 1 ? "moderate" : "low";
    const showLightenLoad = cognitiveLoad === "high" || (cognitiveLoad === "moderate" && missedClassCount > 0);

    const weatherContext = weatherData
      ? `Weather: ${weatherData.description}, ${weatherData.temperature}°C, ${weatherData.sunlightHours}h of sunlight today, UV index ${weatherData.uvIndex}. ${weatherData.isLowSunlight ? "Very low sunlight — this affects mood and energy significantly." : ""}`
      : "No weather data available.";

    const weekContext = academicWeek ? `Academic week: ${academicWeek}. ${academicWeek >= 7 && academicWeek <= 9 ? "This is midterm season — statistically the hardest stretch of the semester." : academicWeek >= 13 ? "End-of-semester crunch — finals are close." : ""}` : "";

    const systemPrompt = `You are Asha — a warm, non-clinical digital companion for students and professionals facing burnout. 
You speak with quiet wisdom, like a trusted friend who deeply understands the pressures of academic and professional life.
You validate feelings without diagnosing. You normalize difficulty. You never use clinical terms.
You write short, warm, specific notes — 2-4 sentences max. No bullet points. No headers.
Reference specific patterns you've noticed (late nights, meals skipped, masking level).
If the weather has been gray, mention it. If it's a hard week academically, name it.
End with one simple, gentle permission or encouragement.`;

    const userPrompt = `Here's what I know about this person right now:
- Check-ins in the last 30 days: ${checkinCount}
- Average masking level (1=authentic, 5=heavily masking): ${avgMasking.toFixed(1)}/5
- Late-night usage: ${lateNightCount} times
- Missed classes/work: ${missedClassCount} times
- Skipped meals: ${skippedMealsCount} times
- Average response latency (cognitive load indicator): ${avgLatency.toFixed(0)}ms (baseline ~400ms; higher = more fatigue)
- ${weatherContext}
- ${weekContext}

Write a "Note from Asha" — warm, specific, validating. 2-4 sentences.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_completion_tokens: 200,
    });

    const note = completion.choices[0]?.message?.content ?? 
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

router.post("/insights/email", async (req, res) => {
  try {
    const body = GenerateExtensionEmailBody.parse(req.body);
    const { professorName, courseName, assignmentName, studentName } = body;

    const systemPrompt = `You are a professional writing assistant. Draft a warm, honest, and professional email requesting a 24-48 hour extension on an assignment. 
The tone should be respectful, brief, and human — not groveling. Reference that the student is managing their wellbeing.
Keep it to 3-4 short paragraphs.`;

    const userPrompt = `Write an extension request email with these details:
- Professor: ${professorName ?? "Professor"}
- Course: ${courseName ?? "my course"}
- Assignment: ${assignmentName ?? "the upcoming assignment"}
- Student: ${studentName ?? "a student"}

Return ONLY a JSON object with these exact fields:
{
  "subject": "email subject line",
  "body": "full email body text"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_completion_tokens: 400,
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    
    let subject = `Extension Request — ${assignmentName ?? "Assignment"}`;
    let emailBody = `Dear ${professorName ?? "Professor"},\n\nI am writing to respectfully request a brief extension on ${assignmentName ?? "the assignment"} for ${courseName ?? "your course"}.\n\nI have been managing some personal challenges this week and want to ensure I submit work that reflects my genuine effort.\n\nWould a 24-hour extension be possible? I am committed to completing this and appreciate your understanding.\n\nThank you,\n${studentName ?? "Student"}`;

    try {
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleanContent);
      subject = parsed.subject ?? subject;
      emailBody = parsed.body ?? emailBody;
    } catch {
      // Use defaults
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
    const { tasks, weatherDescription, uvIndex, sunlightHours } = req.body as {
      tasks: string[];
      weatherDescription?: string;
      uvIndex?: number;
      sunlightHours?: number;
      sessionId?: string;
    };

    if (!tasks || tasks.length === 0) {
      return res.status(400).json({ error: "No tasks provided" });
    }

    const weatherContext = weatherDescription
      ? `Current weather: ${weatherDescription}. UV index: ${uvIndex ?? "unknown"}. Sunlight hours today: ${sunlightHours ?? "unknown"}.`
      : "No weather data.";

    const prompt = `You are Asha, a cognitive support companion. A student has ${tasks.length} task(s) they need to complete:
${tasks.map((t, i) => `${i + 1}. ${t}`).join("\n")}

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
