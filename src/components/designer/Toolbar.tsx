import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateElement } from "@/lib/ai.functions";
import { useScene, type ObjectKind, type PresetKey, defaults } from "@/lib/scene-store";

const CATEGORIES: { name: string; items: { k: ObjectKind; icon: string }[] }[] = [
  { name: "Structure", items: [
    { k: "wall", icon: "▭" }, { k: "floor", icon: "▤" }, { k: "roof", icon: "🏠" },
    { k: "column", icon: "▮" }, { k: "stair", icon: "📶" }, { k: "railing", icon: "═" },
    { k: "door", icon: "🚪" }, { k: "window", icon: "🪟" }, { k: "gate", icon: "🚧" },
    { k: "fence", icon: "🪵" }, { k: "dome", icon: "◓" },
  ]},
  { name: "Interior", items: [
    { k: "sofa", icon: "🛋" }, { k: "bed", icon: "🛏" }, { k: "table", icon: "🪑" },
    { k: "chair", icon: "💺" }, { k: "kitchen", icon: "🍳" }, { k: "tv", icon: "📺" },
    { k: "sink", icon: "🚰" }, { k: "toilet", icon: "🚽" }, { k: "bathtub", icon: "🛁" },
    { k: "furniture", icon: "📦" },
  ]},
  { name: "Exterior", items: [
    { k: "tree", icon: "🌳" }, { k: "plant", icon: "🪴" }, { k: "pool", icon: "🏊" },
    { k: "fountain", icon: "⛲" }, { k: "statue", icon: "🗿" }, { k: "streetlamp", icon: "💡" },
    { k: "solar", icon: "☀" }, { k: "sign", icon: "🪧" }, { k: "car", icon: "🚗" },
    { k: "person", icon: "🧍" },
  ]},
];

const PRESETS: { k: PresetKey; label: string; icon: string }[] = [
  { k: "home", label: "Home", icon: "🏡" },
  { k: "villa", label: "Villa", icon: "🏛" },
  { k: "apartment", label: "Apartment", icon: "🏢" },
  { k: "office", label: "Office", icon: "🏬" },
  { k: "restaurant", label: "Restaurant", icon: "🍽" },
  { k: "cafe", label: "Cafe", icon: "☕" },
  { k: "hotel", label: "Hotel", icon: "🏨" },
  { k: "mall", label: "Mall", icon: "🛍" },
  { k: "school", label: "School", icon: "🏫" },
  { k: "hospital", label: "Hospital", icon: "🏥" },
  { k: "gym", label: "Gym", icon: "🏋" },
  { k: "temple", label: "Temple", icon: "🛕" },
  { k: "mosque", label: "Mosque", icon: "🕌" },
  { k: "empty", label: "Empty", icon: "▢" },
];

export function Toolbar() {
  const add = useScene((s) => s.add);
  const addCustom = useScene((s) => s.addCustom);
  const loadPreset = useScene((s) => s.loadPreset);
  const preset = useScene((s) => s.preset);
  const [q, setQ] = useState("");

  // Custom element form
  const [cName, setCName] = useState("My Block");
  const [cW, setCW] = useState(2);
  const [cH, setCH] = useState(2);
  const [cD, setCD] = useState(2);
  const [cColor, setCColor] = useState("#7a8fbf");
  const [cMat, setCMat] = useState<"matte" | "glossy" | "metal" | "glass" | "wood" | "stone" | "concrete">("matte");
  const [cOpen, setCOpen] = useState(false);

  // AI generator
  const genEl = useServerFn(generateElement);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiErr, setAiErr] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(true);

  async function aiGen() {
    const p = aiPrompt.trim();
    if (!p || aiLoading) return;
    setAiLoading(true); setAiErr(null);
    try {
      const r = await genEl({ data: { prompt: p } });
      if (r.error || !r.element) { setAiErr(r.error || "Failed"); }
      else {
        const e = r.element;
        addCustom({
          label: e.label, kind: (e.kind as ObjectKind),
          size: [Math.max(0.1, e.size[0]), Math.max(0.1, e.size[1]), Math.max(0.1, e.size[2])],
          color: e.color || "#7a8fbf",
          material: (e.material as any) || "matte",
        });
        setAiPrompt("");
      }
    } catch (e: any) { setAiErr(e?.message || "failed"); }
    finally { setAiLoading(false); }
  }

  const ql = q.trim().toLowerCase();

  return (
    <div className="panel p-3 flex flex-col gap-4 w-60 overflow-y-auto">
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Building Presets</div>
        <div className="grid grid-cols-2 gap-1.5">
          {PRESETS.map((p) => (
            <button key={p.k} onClick={() => loadPreset(p.k)}
              className={`text-[11px] py-1.5 px-1 rounded-md border transition-colors flex items-center gap-1 ${
                preset === p.k ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
              <span>{p.icon}</span><span className="truncate">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <button onClick={() => setCOpen((v) => !v)}
          className="w-full flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground mb-2 hover:text-foreground">
          <span>✨ Custom Element</span><span>{cOpen ? "▾" : "▸"}</span>
        </button>
        {cOpen && (
          <div className="flex flex-col gap-1.5 p-2 rounded-md border border-border bg-background/40">
            <input value={cName} onChange={(e) => setCName(e.target.value)} placeholder="Name"
              className="bg-input rounded px-2 py-1 text-xs outline-none" />
            <div className="grid grid-cols-3 gap-1">
              {([["W", cW, setCW], ["H", cH, setCH], ["D", cD, setCD]] as const).map(([l, v, set]) => (
                <label key={l} className="flex items-center gap-1 text-[10px]">
                  <span className="text-muted-foreground">{l}</span>
                  <input type="number" step={0.1} value={v} onChange={(e) => set(parseFloat(e.target.value) || 0.1)}
                    className="w-full bg-input rounded px-1 py-0.5 text-[11px] outline-none" />
                </label>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <input type="color" value={cColor} onChange={(e) => setCColor(e.target.value)}
                className="w-8 h-7 rounded bg-transparent border border-border" />
              <select value={cMat} onChange={(e) => setCMat(e.target.value as any)}
                className="flex-1 bg-input rounded px-1 py-1 text-[11px] outline-none">
                {["matte","glossy","metal","glass","wood","stone","concrete"].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <button onClick={() => addCustom({ label: cName, size: [Math.max(0.1,cW), Math.max(0.1,cH), Math.max(0.1,cD)], color: cColor, material: cMat })}
              className="text-xs py-1.5 rounded bg-primary text-primary-foreground font-semibold hover:opacity-90">+ Create Element</button>
          </div>
        )}
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Elements</div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
          className="w-full bg-input rounded-md px-2 py-1.5 text-xs mb-2 outline-none focus:ring-1 focus:ring-ring" />
        {CATEGORIES.map((cat) => {
          const items = cat.items.filter((it) => !ql || defaults[it.k].label.toLowerCase().includes(ql) || it.k.includes(ql));
          if (!items.length) return null;
          return (
            <div key={cat.name} className="mb-3">
              <div className="text-[10px] uppercase text-muted-foreground mb-1">{cat.name}</div>
              <div className="grid grid-cols-2 gap-1.5">
                {items.map((it) => (
                  <button key={it.k} onClick={() => add(it.k)}
                    className="btn-ghost text-[11px] flex items-center gap-1 justify-start px-2 py-1.5">
                    <span>{it.icon}</span><span className="truncate">{defaults[it.k].label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
