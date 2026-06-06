import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Scene3D } from "@/components/designer/Scene3D";
import { Toolbar } from "@/components/designer/Toolbar";
import { PropertyPanel } from "@/components/designer/PropertyPanel";
import { AIChat } from "@/components/designer/AIChat";
import { TopBar } from "@/components/designer/TopBar";
import { useScene, type GizmoMode } from "@/lib/scene-store";

export const Route = createFileRoute("/designer")({
  head: () => ({
    meta: [
      { title: "3D Designer — ArchitectAI" },
      { name: "description", content: "Design homes, offices, restaurants & temples in 3D with 360° view, day/night, AI scene generation & cost estimator." },
    ],
  }),
  component: DesignerPage,
});

function useShortcuts(setGizmo: (m: GizmoMode) => void, toggleFs: () => void) {
  const undo = useScene((s) => s.undo);
  const redo = useScene((s) => s.redo);
  const remove = useScene((s) => s.remove);
  const duplicate = useScene((s) => s.duplicate);
  const saveLocal = useScene((s) => s.saveLocal);
  const selectedId = useScene((s) => s.selectedId);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key.toLowerCase() === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if (ctrl && e.key.toLowerCase() === "y") { e.preventDefault(); redo(); }
      else if (ctrl && e.key.toLowerCase() === "d" && selectedId) { e.preventDefault(); duplicate(selectedId); }
      else if (ctrl && e.key.toLowerCase() === "s") { e.preventDefault(); saveLocal(); }
      else if ((e.key === "Delete" || e.key === "Backspace") && selectedId) { e.preventDefault(); remove(selectedId); }
      else if (e.key.toLowerCase() === "w") setGizmo("translate");
      else if (e.key.toLowerCase() === "e") setGizmo("rotate");
      else if (e.key.toLowerCase() === "r") setGizmo("scale");
      else if (e.key.toLowerCase() === "f") toggleFs();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [undo, redo, remove, duplicate, saveLocal, selectedId, setGizmo, toggleFs]);
}

function GizmoOverlay() {
  const gizmoMode = useScene((s) => s.settings.gizmoMode);
  const setSetting = useScene((s) => s.setSetting);
  const selectedId = useScene((s) => s.selectedId);
  if (!selectedId) return null;
  const modes: { k: GizmoMode; icon: string; label: string }[] = [
    { k: "translate", icon: "✥", label: "Move (W)" },
    { k: "rotate", icon: "↻", label: "Rotate (E)" },
    { k: "scale", icon: "⤢", label: "Scale (R)" },
  ];
  return (
    <div className="absolute top-3 right-3 flex gap-1 bg-background/80 backdrop-blur p-1 rounded-md border border-border">
      {modes.map((m) => (
        <button key={m.k} title={m.label} onClick={() => setSetting("gizmoMode", m.k)}
          className={`w-9 h-8 text-base rounded ${gizmoMode === m.k ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
          {m.icon}
        </button>
      ))}
    </div>
  );
}

function ViewportTools() {
  const settings = useScene((s) => s.settings);
  const setSetting = useScene((s) => s.setSetting);
  const requestScreenshot = useScene((s) => s.requestScreenshot);
  const cycleWeather = () => {
    const next = settings.weather === "none" ? "rain" : settings.weather === "rain" ? "snow" : "none";
    setSetting("weather", next);
  };
  const weatherIcon = settings.weather === "rain" ? "🌧" : settings.weather === "snow" ? "❄" : "☀";
  return (
    <div className="absolute top-3 right-32 flex gap-1 bg-background/80 backdrop-blur p-1 rounded-md border border-border">
      <button title="Walk-through mode (FPS)" onClick={() => setSetting("walkMode", !settings.walkMode)}
        className={`w-9 h-8 text-base rounded ${settings.walkMode ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>🚶</button>
      <button title={`Weather: ${settings.weather}`} onClick={cycleWeather}
        className="w-9 h-8 text-base rounded hover:bg-secondary">{weatherIcon}</button>
      <button title="HQ shadows" onClick={() => setSetting("hq", !settings.hq)}
        className={`w-9 h-8 text-xs rounded ${settings.hq ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>HQ</button>
      <button title="Screenshot PNG" onClick={requestScreenshot}
        className="w-9 h-8 text-base rounded hover:bg-secondary">📸</button>
    </div>
  );
}

function DesignerPage() {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const setSetting = useScene((s) => s.setSetting);
  const walkMode = useScene((s) => s.settings.walkMode);
  const setGizmo = (m: GizmoMode) => setSetting("gizmoMode", m);
  const toggleFs = () => setFullscreen((v) => !v);

  useShortcuts(setGizmo, toggleFs);

  return (
    <div className="h-screen flex flex-col">
      {!fullscreen && (
        <>
          <header className="h-11 border-b border-border flex items-center justify-between px-4 bg-card">
            <Link to="/" className="font-bold tracking-tight"><span className="text-primary">Architect</span>AI</Link>
            <div className="text-[11px] text-muted-foreground hidden md:block">
              W move · E rotate · R scale · F fullscreen · Ctrl+Z/Y · Ctrl+D · Del
            </div>
            <div className="text-[11px] text-muted-foreground">v3 · Gemini powered</div>
          </header>
          <TopBar />
        </>
      )}
      <div className={`flex-1 flex gap-2 ${fullscreen ? "p-0" : "p-2"} overflow-hidden relative`}>
        {!fullscreen && leftOpen && <Toolbar />}
        {!fullscreen && !leftOpen && (
          <button onClick={() => setLeftOpen(true)} title="Show Elements"
            className="self-start mt-2 px-1.5 py-3 rounded-r-md bg-card border border-l-0 border-border hover:bg-secondary text-xs">▸</button>
        )}

        <div className={`flex-1 ${fullscreen ? "" : "panel"} overflow-hidden relative`}>
          <Scene3D />

          {/* Left-collapse handle inside viewport */}
          {!fullscreen && leftOpen && (
            <button onClick={() => setLeftOpen(false)} title="Hide Elements"
              className="absolute top-3 left-3 px-2 py-1 rounded-md bg-background/80 backdrop-blur border border-border hover:bg-secondary text-xs z-10">◂ Hide</button>
          )}

          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-background/70 backdrop-blur px-3 py-1.5 rounded-md text-xs border border-border pointer-events-none">
            {useScene.getState().settings.walkMode ? "🚶 Walk Mode · click to lock · WASD / Shift to sprint" : "360° Orbit View"}
          </div>


          <GizmoOverlay />
          <ViewportTools />


          {/* Right-side overlay buttons */}
          <div className="absolute bottom-3 right-3 flex gap-1">
            <button onClick={toggleFs} title="Fullscreen (F)"
              className="px-2.5 py-1.5 rounded-md bg-background/80 backdrop-blur border border-border hover:bg-secondary text-xs">
              {fullscreen ? "⤓ Exit Fullscreen" : "⛶ Fullscreen"}
            </button>
            {!fullscreen && !rightOpen && (
              <button onClick={() => setRightOpen(true)} title="Show Properties"
                className="px-2.5 py-1.5 rounded-md bg-background/80 backdrop-blur border border-border hover:bg-secondary text-xs">Properties ▸</button>
            )}
            {!fullscreen && !chatOpen && (
              <button onClick={() => setChatOpen(true)} title="Show AI Chat"
                className="px-2.5 py-1.5 rounded-md bg-background/80 backdrop-blur border border-border hover:bg-secondary text-xs">🤖 AI ▸</button>
            )}
          </div>
        </div>

        {!fullscreen && rightOpen && (
          <div className="relative">
            <button onClick={() => setRightOpen(false)} title="Hide Properties"
              className="absolute -left-3 top-2 z-10 w-6 h-6 rounded-full bg-card border border-border hover:bg-secondary text-xs">▸</button>
            <PropertyPanel />
          </div>
        )}
        {!fullscreen && chatOpen && (
          <div className="relative">
            <button onClick={() => setChatOpen(false)} title="Hide AI"
              className="absolute -left-3 top-2 z-10 w-6 h-6 rounded-full bg-card border border-border hover:bg-secondary text-xs">▸</button>
            <AIChat />
          </div>
        )}
      </div>
    </div>
  );
}
