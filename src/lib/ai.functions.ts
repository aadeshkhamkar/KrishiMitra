import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SYSTEM = (lang: string) => `You are KrishiMitra, an expert agronomist for Maharashtra farmers. Answer in ${lang === "mr" ? "Marathi (Devanagari)" : lang === "hi" ? "Hindi (Devanagari)" : "English"}. Be concise, practical, and culturally aware. Cover crop diseases, pests, irrigation, fertilizers, harvest timing, weather, and Indian government agriculture schemes when asked.`;

export const chatWithAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) })).min(1).max(40),
      language: z.enum(["en", "mr", "hi"]).default("en"),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("GROQ_API_KEY not configured");

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: SYSTEM(data.language) }, ...data.messages],
        temperature: 0.4,
        max_tokens: 1024,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Groq error ${res.status}: ${t.slice(0, 200)}`);
    }
    const json = await res.json();
    const reply = String(
      json.choices?.[0]?.message?.content ??
      json.choices?.[0]?.content ??
      json.choices?.[0]?.delta?.content ??
      json.choices?.[0]?.text ??
      ""
    ).trim();

    if (!reply) {
      console.error("AI reply missing from Groq response:", json);
      throw new Error("AI returned no reply. Please try again.");
    }

    // persist
    const { supabase, userId } = context;
    const last = data.messages[data.messages.length - 1];
    await supabase.from("chat_history").insert([
      { role: "user", content: last.content, user_id: userId },
      { role: "assistant", content: reply, user_id: userId },
    ]);

    return { reply };
  });

export const analyzeCropImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      imageUrl: z.string().url(),
      language: z.enum(["en", "mr", "hi"]).default("en"),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("GROQ_API_KEY not configured");

    const langName = data.language === "mr" ? "Marathi" : data.language === "hi" ? "Hindi" : "English";
    const prompt = `You are a plant pathologist. Analyze this crop photo and return STRICT JSON only (no markdown), with keys: disease, severity (low|moderate|high|unknown), causes, solutions, prevention, recommendations. Each value a short paragraph. Respond in ${langName}.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: data.imageUrl } },
          ],
        }],
        temperature: 0.2,
        max_tokens: 900,
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Groq vision error ${res.status}: ${t.slice(0, 200)}`);
    }
    const json = await res.json();
    const raw = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: Record<string, string>;
    try { parsed = JSON.parse(raw); } catch { parsed = { disease: "Unknown", severity: "unknown", causes: "", solutions: raw, prevention: "", recommendations: "" }; }

    const { supabase, userId } = context;
    const { data: row } = await supabase.from("disease_reports").insert({
      user_id: userId,
      image_url: data.imageUrl,
      disease_name: parsed.disease ?? null,
      severity: parsed.severity ?? null,
      causes: parsed.causes ?? null,
      solutions: parsed.solutions ?? null,
      prevention: parsed.prevention ?? null,
      recommendations: parsed.recommendations ?? null,
      raw_response: parsed,
    }).select().single();

    return { report: row, parsed };
  });
