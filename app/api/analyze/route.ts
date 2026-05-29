import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DIMENSIONS = [
  "Startup",
  "Career",
  "Health",
  "Finance",
  "Relationships",
  "Creativity",
  "Learning",
  "Content",
  "Personal",
  "Home",
  "Networking",
  "Admin"
] as const;

const SYSTEM_PROMPT = `You are Signal, an elite chief-of-staff AI strategic life-dimension prioritizer.
Your sole job is to help users find absolute clarity in their daily chaos by separating true SIGNAL from surrounding NOISE, categorizing all tasks into distinct life dimensions, and grouping them by priority.

Strict Priority Categories:
- Must Do: Time-sensitive relationship keys, commercial deliverables, client crises, or direct opportunities that MUST be resolved today. (MAX 3 items).
- Should Do: Important secondary objectives that advance core long-term projects but have slight flexibility.
- Can Wait: Maintenance chores, administrative logistics, or passive distractions that should be deferred to protect focus.

Allowed Dimensions (You MUST classify every single task into exactly one of these):
- Startup: Core venture activities, product builds, launch logistics.
- Career: Job searches, portfolio work, professional development.
- Health: Physical movement, sleep, nutrition, recovery.
- Finance: Bill payments, tax logistics, capital allocation.
- Relationships: Crucial family, partner, or close friend connections.
- Creativity: Non-commercial deep creative progress (writing stories, designing).
- Learning: Active education, reading technical materials, developing skills.
- Content: Marketing campaigns, tweets, blogging, public videos.
- Personal: Personal errands, introspective time, basic rest.
- Home: Household physical maintenance (folding clothes, buying food, tidying).
- Networking: Strategic relationship building, calling founders/investors.
- Admin: Transactional tasks, file organization, answering basic emails.

Core Rules for Decision-Making:
1. Do NOT classify tasks solely by task type (e.g. never assume creative tasks are automatically more important than business communication or logistics).
2. Weight heavily based on urgency and stakeholder value. Elevated priority keywords (*important, urgent, today, critical, ASAP, founder, investor, customer, client, interview, application, deadline*) MUST force tasks into "Must Do" or "Should Do".
3. For EVERY task, provide a bespoke, specific reason (under 15 words) explaining its urgency or why it represents low-leverage noise today. Never use boilerplate language.
4. "summary": Compose a one-sentence direction statement that explicitly references the strongest dimensions detected in today's tasks and contrasts them with lower-priority dimensions (e.g. "Today's strongest dimensions are Creativity, Startup, and Relationships. Focus on advancing these before handling Home and Admin tasks.").

Return a JSON-only response matching this exact schema:
{
  "must": [
    {
      "task": "Task description",
      "dimension": "Exactly one allowed dimension",
      "priority": "Must Do",
      "reason": "Bespoke, specific strategic explanation"
    }
  ],
  "should": [
    {
      "task": "Task description",
      "dimension": "Exactly one allowed dimension",
      "priority": "Should Do",
      "reason": "Bespoke, specific strategic explanation"
    }
  ],
  "wait": [
    {
      "task": "Task description",
      "dimension": "Exactly one allowed dimension",
      "priority": "Can Wait",
      "reason": "Tailored explanation of why this represents low-leverage busywork today"
    }
  ],
  "summary": "Today's strongest dimensions are [D1], [D2]. Focus on advancing these before handling [D3] and [D4] tasks."
}`;

// Dynamic Demo Mode Heuristic priority, dimension, and reason scorer
interface ScoredTask {
  task: string;
  score: number;
  isHighUrgency: boolean;
  dimension: typeof DIMENSIONS[number];
}

function calculateDemoTaskDetails(task: string): ScoredTask {
  const lower = task.toLowerCase();
  let score = 0;
  let isHighUrgency = false;
  let dimension: typeof DIMENSIONS[number] = "Personal";

  // 1. Determine Life Dimension based on keywords
  if (lower.includes("cheeko") || lower.includes("startup") || lower.includes("product") || lower.includes("launch") || lower.includes("script")) {
    dimension = "Startup";
  } else if (lower.includes("portfolio") || lower.includes("apply") || lower.includes("career") || lower.includes("job")) {
    dimension = "Career";
  } else if (lower.includes("workout") || lower.includes("gym") || lower.includes("exercise") || lower.includes("run") || lower.includes("health")) {
    dimension = "Health";
  } else if (lower.includes("finance") || lower.includes("bill") || lower.includes("tax") || lower.includes("pay")) {
    dimension = "Finance";
  } else if (lower.includes("mom") || lower.includes("family") || lower.includes("call amma") || lower.includes("call mother") || lower.includes("relationship")) {
    dimension = "Relationships";
  } else if (lower.includes("story") || lower.includes("write") || lower.includes("book") || lower.includes("design") || lower.includes("redesign") || lower.includes("creativity")) {
    dimension = "Creativity";
  } else if (lower.includes("learn") || lower.includes("study") || lower.includes("read")) {
    dimension = "Learning";
  } else if (lower.includes("tweet") || lower.includes("post") || lower.includes("marketing") || lower.includes("content")) {
    dimension = "Content";
  } else if (lower.includes("founder") || lower.includes("investor") || lower.includes("networking") || lower.includes("meet")) {
    dimension = "Networking";
  } else if (lower.includes("folder") || lower.includes("email") || lower.includes("admin") || lower.includes("organize")) {
    dimension = "Admin";
  } else if (
    lower.includes("clothes") || lower.includes("fold") || lower.includes("laundry") ||
    lower.includes("books") || lower.includes("arrange") || lower.includes("groceries") ||
    lower.includes("buy") || lower.includes("shop") || lower.includes("clean") || lower.includes("home")
  ) {
    dimension = "Home";
  }

  // 2. Score Task based on urgency/strategic markers
  const priorityKeywords = [
    "important", "urgent", "critical", "asap", "today", "now", "must",
    "founder", "investor", "customer", "client", "buyer", "user",
    "interview", "application", "deadline", "pitch", "deal", "meeting"
  ];
  
  priorityKeywords.forEach(keyword => {
    if (lower.includes(keyword)) {
      score += 20;
      isHighUrgency = true;
    }
  });

  // Action boosts
  const actionKeywords = ["write", "code", "design", "build", "finish", "complete", "call", "send", "unblock"];
  actionKeywords.forEach(keyword => {
    if (lower.includes(keyword)) {
      score += 5;
    }
  });

  // Chores penalties
  const maintenanceKeywords = ["fold", "clothes", "laundry", "arrange", "books", "groceries", "buy", "clean", "organize", "video", "watch", "youtube"];
  maintenanceKeywords.forEach(keyword => {
    if (lower.includes(keyword)) {
      score -= 15;
    }
  });

  return { task, score, isHighUrgency, dimension };
}

function getDemoStrategicReason(task: string, priority: "Must Do" | "Should Do" | "Can Wait", dimension: typeof DIMENSIONS[number]): string {
  const lower = task.toLowerCase();
  
  if (priority === "Must Do" || priority === "Should Do") {
    if (dimension === "Relationships") {
      return "Completing this early brings immediate peace of mind and emotional anchoring.";
    }
    if (dimension === "Health") {
      return "Compounds physical stamina and provides the foundation for high creative focus.";
    }
    if (dimension === "Networking" || dimension === "Startup") {
      return "Direct strategic lever that unblocks commercial velocity and potential funding loops.";
    }
    if (dimension === "Creativity") {
      return "Advances essential personal creative portfolio work before administrative drag sets in.";
    }
    if (dimension === "Career") {
      return "Direct opportunity check with immediate external feedback and career impact.";
    }
    return `Critical high-leverage objective in your ${dimension} dimension. Resolve early.`;
  } else {
    if (lower.includes("clothes") || lower.includes("fold") || lower.includes("laundry")) {
      return "Necessary maintenance activity but yields zero creative or business leverage.";
    }
    if (lower.includes("books") || lower.includes("arrange") || lower.includes("shelf")) {
      return "Creates the illusion of productivity without moving core goals forward.";
    }
    if (lower.includes("groceries") || lower.includes("buy")) {
      return "Maintenance errand. Defer to low-energy slots to protect deep work.";
    }
    if (lower.includes("video") || lower.includes("watch")) {
      return "Passive consumption masquerading as momentum. Defer until primary shipping is done.";
    }
    return `Administrative detail in your ${dimension} dimension. Postpone to protect core creative momentum.`;
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required to analyze your mind." },
        { status: 400 }
      );
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    // High-fidelity Demo Mode simulation if keys are empty
    if (!groqApiKey) {
      console.warn("No API Keys configured. Falling back to dynamic Demo Mode.");

      // Split raw inputs
      const rawTasks = content
        .split(/[,.;\n]/)
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0);

      if (rawTasks.length === 0) {
        rawTasks.push("Explore the Signal clarity interface");
      }

      // Analyze details
      const scoredTasks = rawTasks.map(task => calculateDemoTaskDetails(task));

      // Sort by score
      scoredTasks.sort((a, b) => b.score - a.score);

      const mustList: any[] = [];
      const shouldList: any[] = [];
      const waitList: any[] = [];

      scoredTasks.forEach((scored, index) => {
        // Must Do: Top 2-3 items and must be high leverage/urgency
        if (index < 3 && (scored.score > 15 || scored.isHighUrgency || index === 0)) {
          mustList.push({
            task: scored.task,
            dimension: scored.dimension,
            priority: "Must Do",
            reason: getDemoStrategicReason(scored.task, "Must Do", scored.dimension)
          });
        }
        // Should Do: Secondary items (score >= 0)
        else if (index < 5 && scored.score >= 0) {
          shouldList.push({
            task: scored.task,
            dimension: scored.dimension,
            priority: "Should Do",
            reason: getDemoStrategicReason(scored.task, "Should Do", scored.dimension)
          });
        }
        // Can Wait: All other items
        else {
          waitList.push({
            task: scored.task,
            dimension: scored.dimension,
            priority: "Can Wait",
            reason: getDemoStrategicReason(scored.task, "Can Wait", scored.dimension)
          });
        }
      });

      // Compute strongest focus dimensions vs postponed ones dynamically!
      const focusDims = Array.from(new Set([...mustList, ...shouldList].map(t => t.dimension)));
      const ignoreDims = Array.from(new Set(waitList.map(t => t.dimension)));

      const focusStr = focusDims.length > 0 ? focusDims.slice(0, 3).join(", ") : "Execution";
      const ignoreStr = ignoreDims.length > 0 ? ignoreDims.slice(0, 2).join(" and ") : "Home";

      const mockSummary = `Today's strongest dimensions are ${focusStr}. Focus on advancing these before handling ${ignoreStr} tasks.`;

      // Small simulation latency (1.5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return NextResponse.json({
        must: mustList,
        should: shouldList,
        wait: waitList,
        summary: mockSummary
      });
    }

    const provider = "Groq";
    const model = "llama-3.3-70b-versatile";
    const url = "https://api.groq.com/openai/v1/chat/completions";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${groqApiKey}`,
    };
    const bodyPayload = {
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Here is my mind dump:\n\n"${content}"` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    };

    // Temporary logs for Vercel debugging (does not log raw keys)
    console.log("Groq exists:", !!process.env.GROQ_API_KEY);
    console.log("Groq length:", process.env.GROQ_API_KEY?.length);
    console.log("Using provider:", provider);
    console.log("Using model:", model);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(bodyPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`LLM Provider API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `The AI provider returned an error: ${response.statusText}. Please verify your API keys.` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content?.trim();

    if (!resultText) {
      throw new Error("Empty response from AI completions service.");
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(resultText);
    } catch (parseError) {
      console.error("Failed to parse LLM JSON output:", resultText);
      return NextResponse.json(
        { error: "AI returned an invalid JSON response structure. Please try again." },
        { status: 500 }
      );
    }

    if (
      typeof parsedResult.must === "undefined" ||
      typeof parsedResult.should === "undefined" ||
      typeof parsedResult.wait === "undefined" ||
      typeof parsedResult.summary === "undefined"
    ) {
      console.error("AI response missing core fields:", parsedResult);
      return NextResponse.json(
        { error: "AI response structure did not match the expected format. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedResult);
  } catch (error: any) {
    console.error("Error in /api/analyze API endpoint:", error);
    const message = error.name === "AbortError" ? "The AI analysis timed out. Please try again." : error.message || "An unknown error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
