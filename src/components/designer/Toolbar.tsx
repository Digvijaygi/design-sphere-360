import { useScene, type ObjectKind, type PresetKey } from "@/lib/scene-store";

const KINDS: { k: ObjectKind; label: string; icon: string }[] = [
  { k: "wall", label: "Wall", icon: "▭" },
  { k: "floor", label: "Floor", icon: "▤" },
  { k: "door", label: "Door", icon: "🚪" },
  { k: "window", label: "Window", icon: "🪟" },
  { k: "roof", label: "Roof", icon: "🏠" },
  { k: "column", label: "Column", icon: "|" },
  { k: "furniture", label: "Furniture", icon: "🛋" },
  { k: "tree", label: "Tree", icon: "🌳" },
  { k: "dome", label: "Dome", icon: "◓" },
];

const PRESETS: { k: PresetKey; label: string }[] = [
  { k: "home", label: "Home" },
  { k: "office", label: "Office" },
  { k: "restaurant", label: "Restaurant" },
  { k: "temple", label: "Temple" },
  { k: "empty", label: "Empty" },
];

export function Toolbar() {
  const add = useScene((s) => s.add);
  const loadPreset = useScene((s) => s.loadPreset);
  const preset = useScene((s) => s.preset);

  return (
    <div className="panel p-3 flex flex-col gap-4 w-56 overflow-y-auto">
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Presets</div>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.k}
              onClick={() => loadPreset(p.k)}
              className={`text-xs py-2 rounded-md border transition-colors ${
                preset === p.k
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-secondary"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Add element</div>
        <div className="grid grid-cols-2 gap-2">
          {KINDS.map((it) => (
            <button
              key={it.k}
              onClick={() => add(it.k)}
              className="btn-ghost text-xs flex items-center gap-2 justify-start"
            >
              <span>{it.icon}</span>
              <span>{it.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
