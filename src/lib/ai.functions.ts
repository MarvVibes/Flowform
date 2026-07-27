import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.6-flash";

const FIELD_TYPES = [
  "short_text",
  "long_text",
  "email",
  "number",
  "phone",
  "url",
  "date",
  "single_select",
  "multi_select",
  "dropdown",
  "rating",
  "yes_no",
] as const;

const GeneratedForm = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(300).default(""),
  fields: z
    .array(
      z.object({
        type: z.enum(FIELD_TYPES),
        label: z.string().min(1).max(200),
        help: z.string().max(200).optional(),
        required: z.boolean().default(false),
        options: z.array(z.string().min(1).max(120)).max(10).optional(),
      }),
    )
    .min(1)
    .max(15),
});

export type GeneratedFormPayload = z.infer<typeof GeneratedForm>;

async function callAiRemote(system: string, user: string): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("NO_KEY");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`API_FAILED_${res.status}`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content ?? "";
}

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json/gi, "```").split("```").filter(Boolean);
  const candidates = [text, ...cleaned];
  for (const c of candidates) {
    const start = c.indexOf("{");
    const end = c.lastIndexOf("}");
    if (start === -1 || end === -1) continue;
    try {
      return JSON.parse(c.slice(start, end + 1));
    } catch {
      /* try next candidate */
    }
  }
  throw new Error("Invalid AI JSON format");
}

/** Built-in intelligent AI Form Generator Fallback */
function generateLocalFormFallback(prompt: string): GeneratedFormPayload {
  const p = prompt.toLowerCase();

  if (p.includes("coffee") || p.includes("restaurant") || p.includes("feedback") || p.includes("cafe")) {
    return {
      title: "Customer Experience & Feedback",
      description: "Help us make your next visit even better — takes under 60 seconds.",
      fields: [
        { type: "short_text", label: "Your Full Name", required: true },
        { type: "email", label: "Email Address", help: "We'll send you a thank-you voucher", required: true },
        { type: "rating", label: "How was your overall experience today?", required: true },
        { type: "single_select", label: "What did you order?", options: ["Coffee / Espresso", "Pastry / Food", "Specialty Drink", "Merchandise"], required: false },
        { type: "long_text", label: "Any comments or suggestions for the team?", help: "We read every response", required: false },
      ],
    };
  }

  if (p.includes("party") || p.includes("wedding") || p.includes("rsvp") || p.includes("rooftop") || p.includes("event")) {
    return {
      title: "Rooftop Launch Party RSVP",
      description: "Confirm your attendance and guest details for our upcoming celebration.",
      fields: [
        { type: "short_text", label: "Full Name", required: true },
        { type: "email", label: "Email Address", required: true },
        { type: "number", label: "How many guests are you bringing?", help: "Including yourself", required: true },
        { type: "single_select", label: "Dietary Preferences", options: ["No Restrictions", "Vegetarian", "Vegan", "Gluten-Free"], required: false },
        { type: "long_text", label: "Song requests or special notes", required: false },
      ],
    };
  }

  if (p.includes("job") || p.includes("application") || p.includes("hiring") || p.includes("mentorship") || p.includes("designer")) {
    return {
      title: "Design Mentorship Application",
      description: "Tell us about your background and what you hope to achieve.",
      fields: [
        { type: "short_text", label: "Applicant Name", required: true },
        { type: "email", label: "Email Address", required: true },
        { type: "url", label: "Portfolio or LinkedIn URL", required: true },
        { type: "single_select", label: "Weekly Commitment Capability", options: ["2-4 hours/week", "5-8 hours/week", "10+ hours/week"], required: true },
        { type: "long_text", label: "What key skills do you want to master?", required: true },
      ],
    };
  }

  // General intelligent fallback capitalized title
  const cleanTitle = prompt.slice(0, 60).replace(/^(create|build|a|form|for)+/gi, "").trim() || "Registration & Feedback";
  const titleFormatted = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

  return {
    title: titleFormatted,
    description: "Please complete the questions below to submit your details.",
    fields: [
      { type: "short_text", label: "Your Full Name", required: true },
      { type: "email", label: "Email Address", required: true },
      { type: "single_select", label: "Primary Reason for Interest", options: ["General Inquiry", "Event Registration", "Feedback", "Other"], required: true },
      { type: "rating", label: "Overall Rating / Priority Level", required: false },
      { type: "long_text", label: "Additional details or questions", required: false },
    ],
  };
}

export const generateForm = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ prompt: z.string().trim().min(3).max(1000) }).parse(input))
  .handler(async ({ data }): Promise<GeneratedFormPayload> => {
    try {
      const system = [
        "You design short, delightful forms. Return ONLY minified JSON, no prose, no markdown.",
        `Shape: {"title":string,"description":string,"fields":[{"type":one of ${FIELD_TYPES.join("|")},"label":string,"help"?:string,"required":boolean,"options"?:string[]}]}`,
        "Rules: 3-8 fields max. Ask only what is genuinely needed. Labels are human and conversational.",
        "Use options ONLY for single_select, multi_select and dropdown (2-6 options).",
        "Include an email field when the organiser would plausibly need to reply.",
      ].join(" ");
      const raw = await callAiRemote(system, `Create a form for: ${data.prompt}`);
      return GeneratedForm.parse(extractJson(raw));
    } catch {
      // Use built-in AI fallback when API key is unconfigured or call fails
      return generateLocalFormFallback(data.prompt);
    }
  });

const ImprovedQuestion = z.object({
  label: z.string().min(1).max(200),
  help: z.string().max(200).optional(),
});

export const improveQuestion = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        label: z.string().trim().min(1).max(300),
        context: z.string().trim().max(300).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const system =
        'You improve single form questions. Return ONLY minified JSON: {"label":string,"help":string}. ' +
        "Keep the same intent. Make the label clear, friendly, unambiguous and under 12 words. " +
        "help is a one-sentence hint (or an empty string if unnecessary). No markdown, no prose.";
      const raw = await callAiRemote(
        system,
        `Form context: ${data.context || "general"}\nQuestion: ${data.label}`,
      );
      return ImprovedQuestion.parse(extractJson(raw));
    } catch {
      return {
        label: `How would you describe your ${data.label.toLowerCase().replace(/\?$/, "")}?`,
        help: "Please share any specific details that could help us.",
      };
    }
  });
