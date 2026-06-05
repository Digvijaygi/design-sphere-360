import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ChatInput = z.object({
  prompt: z.string().min(1).max(4000),
  context: z.string().max(8000).optional(),
});

async function gemini(body: any) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: false as const, text: "GEMINI_API_KEY not configured." };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) return { ok: false as const, text: `Gemini error (${res.status}): ${(await res.text()).slice(0, 300)}` };
  const json: any = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).filter(Boolean).join("\n") || "";
  return { ok: true as const, text };
}

export const askGemini = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ChatInput.parse(d))
  .handler(async ({ data }) => {
    const r = await gemini({
      systemInstruction: { role: "system", parts: [{ text: "You are an expert civil engineer & architectural designer assisting inside a 3D building designer. Give concise, actionable advice in meters." }] },
      contents: [{ role: "user", parts: [{ text: data.context ? `Scene:\n${data.context}\n\nUser: ${data.prompt}` : data.prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    });
    return { text: r.text || "No response.", error: !r.ok };
  });

const KINDS = ["wall","floor","door","window","roof","column","furniture","tree","dome","stair","railing","pool","car","person","streetlamp","fence","bed","table","chair","sink","toilet","tv","plant","fountain","statue","gate","sign","solar","kitchen","bathtub","sofa"];

const SceneSchema = z.object({
  objects: z.array(z.object({
    kind: z.string(),
    label: z.string().optional(),
    position: z.array(z.number()).length(3),
    size: z.array(z.number()).length(3),
    rotationY: z.number().optional(),
    color: z.string().optional(),
    material: z.string().optional(),
  })).max(200),
});

export const generateScene = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ prompt: z.string().min(1).max(2000) }).parse(d))
  .handler(async ({ data }) => {
    const sys = `You generate 3D building scenes for an architectural designer.
Output STRICT JSON only matching: { "objects": [ { "kind": <one of: ${KINDS.join(", ")}>, "label": string, "position": [x,y,z], "size": [w,h,d], "rotationY": number, "color": "#hex", "material": "matte|glossy|metal|glass|wood|stone|concrete" } ] }.
Units = meters. Ground floor Y=0. Position is the object CENTER. Walls: thickness 0.2, height 3. Floors are thin (0.1). Build a complete, realistic building per the user's prompt (walls, floor, roof, doors, windows, furniture, exterior items). Use 15-80 objects.`;
    const r = await gemini({
      systemInstruction: { role: "system", parts: [{ text: sys }] },
      contents: [{ role: "user", parts: [{ text: data.prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 8192, responseMimeType: "application/json" },
    });
    if (!r.ok) return { objects: [], error: r.text };
    try {
      const cleaned = r.text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      const parsed = SceneSchema.parse(JSON.parse(cleaned));
      return { objects: parsed.objects, error: null as string | null };
    } catch (e: any) {
      return { objects: [], error: "Parse failed: " + (e?.message || "unknown") };
    }
  });

const ElementSchema = z.object({
  kind: z.string(),
  label: z.string(),
  size: z.array(z.number()).length(3),
  color: z.string(),
  material: z.string().optional(),
  rotationY: z.number().optional(),
});

export const generateElement = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ prompt: z.string().min(1).max(500) }).parse(d))
  .handler(async ({ data }) => {
    const sys = `You design ONE custom 3D architectural element. Output STRICT JSON only:
{ "kind": <one of: ${KINDS.join(", ")}>, "label": "short name", "size": [w,h,d], "color": "#hex", "material": "matte|glossy|metal|glass|wood|stone|concrete", "rotationY": 0 }
Units = meters. Realistic dimensions. Pick the closest "kind" to the idea (use "furniture" if nothing fits).`;
    const r = await gemini({
      systemInstruction: { role: "system", parts: [{ text: sys }] },
      contents: [{ role: "user", parts: [{ text: data.prompt }] }],
      generationConfig: { temperature: 0.9, maxOutputTokens: 512, responseMimeType: "application/json" },
    });
    if (!r.ok) return { element: null, error: r.text };
    try {
      const cleaned = r.text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      const parsed = ElementSchema.parse(JSON.parse(cleaned));
      return { element: parsed, error: null as string | null };
    } catch (e: any) {
      return { element: null, error: "Parse failed: " + (e?.message || "unknown") };
    }
  });

export const suggestEdit = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({
    prompt: z.string().min(1).max(500),
    object: z.object({
      label: z.string(), kind: z.string(),
      size: z.array(z.number()).length(3),
      color: z.string(), material: z.string().optional(),
    }),
  }).parse(d))
  .handler(async ({ data }) => {
    const sys = `You edit ONE 3D object. Apply the user's change. Output STRICT JSON only:
{ "size": [w,h,d], "color": "#hex", "material": "matte|glossy|metal|glass|wood|stone|concrete", "label": "name" }
Keep values realistic in meters. Only change what the user asks; keep others same as input.`;
    const r = await gemini({
      systemInstruction: { role: "system", parts: [{ text: sys }] },
      contents: [{ role: "user", parts: [{ text: `Object: ${JSON.stringify(data.object)}\n\nChange: ${data.prompt}` }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 400, responseMimeType: "application/json" },
    });
    if (!r.ok) return { patch: null, error: r.text };
    try {
      const cleaned = r.text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      return { patch: JSON.parse(cleaned), error: null as string | null };
    } catch (e: any) {
      return { patch: null, error: "Parse failed: " + (e?.message || "unknown") };
    }
  });
