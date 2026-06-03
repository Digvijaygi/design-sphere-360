import { useScene } from "@/lib/scene-store";

function NumField({
  label, value, step = 0.1, onChange,
}: { label: string; value: number; step?: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground w-8">{label}</span>
      <input
        type="number"
        step={step}
        value={Number(value.toFixed(2))}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="flex-1 bg-input rounded-md px-2 py-1 text-foreground text-xs outline-none focus:ring-1 focus:ring-ring"
      />
    </label>
  );
}

export function PropertyPanel() {
  const objects = useScene((s) => s.objects);
  const selectedId = useScene((s) => s.selectedId);
  const update = useScene((s) => s.update);
  const remove = useScene((s) => s.remove);
  const select = useScene((s) => s.select);

  const obj = objects.find((o) => o.id === selectedId);

  return (
    <div className="panel p-3 flex flex-col gap-3 w-64 overflow-y-auto">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">Properties</div>
      {!obj ? (
        <>
          <p className="text-xs text-muted-foreground">Select an object in the scene or from the list below.</p>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">Objects ({objects.length})</div>
          <div className="flex flex-col gap-1 max-h-[40vh] overflow-y-auto">
            {objects.map((o) => (
              <button
                key={o.id}
                onClick={() => select(o.id)}
                className="text-left text-xs px-2 py-1.5 rounded hover:bg-secondary border border-transparent hover:border-border"
              >
                <span className="inline-block w-2 h-2 rounded-sm mr-2" style={{ background: o.color }} />
                {o.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <input
            value={obj.label}
            onChange={(e) => update(obj.id, { label: e.target.value })}
            className="bg-input rounded-md px-2 py-1.5 text-sm font-semibold outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="text-[10px] uppercase text-muted-foreground">Position</div>
          <NumField label="X" value={obj.position[0]} onChange={(v) => update(obj.id, { position: [v, obj.position[1], obj.position[2]] })} />
          <NumField label="Y" value={obj.position[1]} onChange={(v) => update(obj.id, { position: [obj.position[0], v, obj.position[2]] })} />
          <NumField label="Z" value={obj.position[2]} onChange={(v) => update(obj.id, { position: [obj.position[0], obj.position[1], v] })} />
          <div className="text-[10px] uppercase text-muted-foreground">Size</div>
          <NumField label="W" value={obj.size[0]} onChange={(v) => update(obj.id, { size: [Math.max(0.05, v), obj.size[1], obj.size[2]] })} />
          <NumField label="H" value={obj.size[1]} onChange={(v) => update(obj.id, { size: [obj.size[0], Math.max(0.05, v), obj.size[2]] })} />
          <NumField label="D" value={obj.size[2]} onChange={(v) => update(obj.id, { size: [obj.size[0], obj.size[1], Math.max(0.05, v)] })} />
          <NumField label="Rot" value={(obj.rotationY * 180) / Math.PI} step={5} onChange={(v) => update(obj.id, { rotationY: (v * Math.PI) / 180 })} />
          <label className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Color</span>
            <input
              type="color"
              value={obj.color}
              onChange={(e) => update(obj.id, { color: e.target.value })}
              className="w-12 h-7 rounded bg-transparent border border-border"
            />
          </label>
          <div className="flex gap-2 mt-2">
            <button className="btn-ghost flex-1 text-xs" onClick={() => select(null)}>Deselect</button>
            <button
              className="text-xs flex-1 py-2 rounded-md bg-destructive text-destructive-foreground font-semibold hover:opacity-90"
              onClick={() => remove(obj.id)}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
