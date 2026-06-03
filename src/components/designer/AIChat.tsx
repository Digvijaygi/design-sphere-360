import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askGemini } from "@/lib/ai.functions";
import { useScene } from "@/lib/scene-store";

interface Msg { role: "user" | "ai"; text: string }

export function AIChat() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "Hi! I'm your AI architect (Gemini). Ask me about layouts, room sizes, materials, or describe a building and I'll suggest a plan." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const ask = useServerFn(askGemini);
  const objects = useScene((s) => s.objects);
  const preset = useScene((s) => s.preset);

  async function send() {
    const prompt = input.trim();
    if (!prompt || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: prompt }]);
    setLoading(true);
    const context = `Preset: ${preset}. Objects (${objects.length}): ` +
      objects.slice(0, 30).map((o) => `${o.label}[${o.kind}] at (${o.position.map((n) => n.toFixed(1)).join(",")}) size ${o.size.map((n) => n.toFixed(1)).join("x")}`).join("; ");
    try {
      const res = await ask({ data: { prompt, context } });
      setMessages((m) => [...m, { role: "ai", text: res.text }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: "ai", text: `Error: ${e?.message || "request failed"}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel flex flex-col w-80 h-full">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-semibold">AI Architect</span>
        </div>
        <span className="text-[10px] text-muted-foreground">Gemini 2.5</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[90%] px-3 py-2 rounded-lg whitespace-pre-wrap leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-muted-foreground">Thinking…</div>}
      </div>
      <div className="p-2 border-t border-border flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask: design a 2BHK 30x40 ft home…"
          className="flex-1 bg-input rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
        <button onClick={send} disabled={loading} className="btn-primary text-sm disabled:opacity-50">
          Send
        </button>
      </div>
    </div>
  );
}
