import { useRef } from "react";
import { useScene, totalArea, totalCost, type ViewMode } from "@/lib/scene-store";

const VIEWS: { k: ViewMode; label: string }[] = [
  { k: "3d", label: "3D" }, { k: "top", label: "Top 2D" }, { k: "front", label: "Front" }, { k: "side", label: "Side" },
];

export function TopBar() {
  const undo = useScene((s) => s.undo);
  const redo = useScene((s) => s.redo);
  const clear = useScene((s) => s.clear);
  const saveLocal = useScene((s) => s.saveLocal);
  const loadLocal = useScene((s) => s.loadLocal);
  const exportJSON = useScene((s) => s.exportJSON);
  const importJSON = useScene((s) => s.importJSON);
  const settings = useScene((s) => s.settings);
  const setSetting = useScene((s) => s.setSetting);
  const requestScreenshot = useScene((s) => s.requestScreenshot);
  const objects = useScene((s) => s.objects);
  const history = useScene((s) => s.history);
  const fileRef = useRef<HTMLInputElement>(null);

  const area = totalArea(objects);
  const cost = totalCost(objects);

  const doExport = () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `architectai-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const onImport = async (f: File) => {
    const text = await f.text();
    if (!importJSON(text)) alert("Invalid JSON");
  };

  const Btn = ({ onClick, title, children, disabled }: any) => (
    <button onClick={onClick} title={title} disabled={disabled}
      className="text-xs px-2.5 py-1 rounded border border-border hover:bg-secondary disabled:opacity-40">{children}</button>
  );

  return (
    <div className="border-b border-border bg-card flex flex-wrap items-center gap-2 px-3 py-1.5 text-xs">
      <div className="flex gap-1">
        <Btn onClick={undo} title="Undo (Ctrl+Z)" disabled={!history.past.length}>↶ Undo</Btn>
        <Btn onClick={redo} title="Redo (Ctrl+Y)" disabled={!history.future.length}>↷ Redo</Btn>
      </div>
      <div className="w-px h-5 bg-border" />
      <div className="flex gap-1">
        <Btn onClick={() => { saveLocal(); }} title="Save to browser">💾 Save</Btn>
        <Btn onClick={() => loadLocal() || alert("Nothing saved")} title="Load from browser">📂 Load</Btn>
        <Btn onClick={doExport}>⬇ Export JSON</Btn>
        <Btn onClick={() => fileRef.current?.click()}>⬆ Import</Btn>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
        <Btn onClick={requestScreenshot}>📸 Screenshot</Btn>
        <Btn onClick={() => confirm("Clear scene?") && clear()}>🗑 Clear</Btn>
      </div>
      <div className="w-px h-5 bg-border" />
      <div className="flex gap-1">
        {VIEWS.map((v) => (
          <button key={v.k} onClick={() => setSetting("viewMode", v.k)}
            className={`px-2 py-1 rounded text-[11px] border ${settings.viewMode === v.k ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>{v.label}</button>
        ))}
      </div>
      <div className="w-px h-5 bg-border" />
      <label className="flex items-center gap-1.5">
        <span className="text-muted-foreground">☀ Time</span>
        <input type="range" min={0} max={24} step={0.5} value={settings.timeOfDay}
          onChange={(e) => setSetting("timeOfDay", parseFloat(e.target.value))} className="w-24" />
        <span className="w-8 text-right tabular-nums">{settings.timeOfDay.toFixed(1)}h</span>
      </label>
      <label className="flex items-center gap-1.5">
        <span className="text-muted-foreground">🌫 Fog</span>
        <input type="range" min={0} max={1} step={0.05} value={settings.fog}
          onChange={(e) => setSetting("fog", parseFloat(e.target.value))} className="w-16" />
      </label>
      <label className="flex items-center gap-1 cursor-pointer">
        <input type="checkbox" checked={settings.snapEnabled} onChange={(e) => setSetting("snapEnabled", e.target.checked)} /> Snap
      </label>
      <label className="flex items-center gap-1 cursor-pointer">
        <input type="checkbox" checked={settings.showGrid} onChange={(e) => setSetting("showGrid", e.target.checked)} /> Grid
      </label>
      <label className="flex items-center gap-1 cursor-pointer">
        <input type="checkbox" checked={settings.showDimensions} onChange={(e) => setSetting("showDimensions", e.target.checked)} /> Dims
      </label>
      <div className="ml-auto flex items-center gap-3 text-[11px] text-muted-foreground">
        <span>📐 {area.toFixed(1)} m²</span>
        <span>💰 ≈ ${Math.round(cost).toLocaleString()}</span>
        <span>📦 {objects.length} objects</span>
      </div>
    </div>
  );
}
