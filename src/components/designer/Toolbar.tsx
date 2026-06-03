import { useState } from "react";
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
  const loadPreset = useScene((s) => s.loadPreset);
  const preset = useScene((s) => s.preset);
  const [q, setQ] = useState("");

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
