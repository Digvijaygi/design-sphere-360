import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  prompt: z.string().min(1).max(4000),
  context: z.string().max(8000).optional(),
});

export const askGemini = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return { text: "GEMINI_API_KEY is not configured. Please add it in project settings.", error: true };
    }

    const system =
      "You are an expert civil engineer and architectural designer assisting the user inside a 3D building designer app. " +
      "Give concise, actionable advice on layouts, materials, dimensions (in meters), code compliance, and aesthetics. " +
      "If the user describes a building they want, suggest a clear step-by-step plan they can build with walls, floors, doors, windows, roofs, columns, furniture, trees, and domes.";

    const body = {
      systemInstruction: { role: "system", parts: [{ text: system }] },
      contents: [
        {
          role: "user",
          parts: [
            { text: data.context ? `Current scene context:\n${data.context}\n\nUser: ${data.prompt}` : data.prompt },
          ],
        },
      ],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    };

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errText = await res.text();
        return { text: `Gemini API error (${res.status}): ${errText.slice(0, 300)}`, error: true };
      }
      const json: any = await res.json();
      const text =
        json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).filter(Boolean).join("\n") ||
        "No response from Gemini.";
      return { text, error: false };
    } catch (e: any) {
      return { text: `Request failed: ${e?.message || "unknown error"}`, error: true };
    }
  });
