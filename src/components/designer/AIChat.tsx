import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askGemini, generateScene } from "@/lib/ai.functions";
import { useScene } from "@/lib/scene-store";

interface Msg { role: "user" | "ai"; text: string }

export function AIChat() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "Hi! I'm your AI architect (Gemini).\n\n• Ask design questions, OR\n• Click '🪄 Generate Scene' to describe a building and I'll BUILD it for you in 3D." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"chat" | "build">("chat");
  const ask = useServerFn(askGemini);
  const gen = useServerFn(generateScene);
  const objects = useScene((s) => s.objects);
  const preset = useScene((s) => s.preset);
  const applyAIScene = useScene((s) => s.applyAIScene);

  async function send() {
    const prompt = input.trim();
    if (!prompt || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: prompt }]);
    setLoading(true);
    try {
      if (mode === "build") {
        setMessages((m) => [...m, { role: "ai", text: "🛠 Generating scene…" }]);
        const res = await gen({ data: { prompt } });
        if (res.error || !res.objects.length) {
          setMessages((m) => [...m, { role: "ai", text: `❌ ${res.error || "No objects returned."}` }]);
        } else {
          applyAIScene(res.objects as any, false);
          setMessages((m) => [...m, { role: "ai", text: `✅ Built ${res.objects.length} objects. Rotate the scene to explore!` }]);
        }
      } else {
        const context = `Preset: ${preset}. Objects (${objects.length}): ` +
          objects.slice(0, 30).map((o) => `${o.label}[${o.kind}] @(${o.position.map((n) => n.toFixed(1)).join(",")}) ${o.size.map((n) => n.toFixed(1)).join("x")}`).join("; ");
        const res = await ask({ data: { prompt, context } });
        setMessages((m) => [...m, { role: "ai", text: res.text }]);
      }
    } catch (e: any) {
      setMessages((m) => [...m, { role: "ai", text: `Error: ${e?.message || "failed"}` }]);
    } finally { setLoading(false); }
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
      <div className="px-2 py-2 border-b border-border flex gap-1">
        <button onClick={() => setMode("chat")} className={`flex-1 text-xs py-1.5 rounded ${mode === "chat" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>💬 Chat</button>
        <button onClick={() => setMode("build")} className={`flex-1 text-xs py-1.5 rounded ${mode === "build" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>🪄 Generate Scene</button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={`max-w-[90%] px-3 py-2 rounded-lg whitespace-pre-wrap leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-muted-foreground">Thinking…</div>}
      </div>
      <div className="p-2 border-t border-border flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={mode === "build" ? "e.g. 3BHK villa with pool & garden" : "Ask about layout, materials…"}
          className="flex-1 bg-input rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" />
        <button onClick={send} disabled={loading} className="btn-primary text-sm disabled:opacity-50">{mode === "build" ? "Build" : "Send"}</button>
      </div>
    </div>
  );
}
