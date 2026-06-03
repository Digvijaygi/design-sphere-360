import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Scene3D } from "@/components/designer/Scene3D";
import { Toolbar } from "@/components/designer/Toolbar";
import { PropertyPanel } from "@/components/designer/PropertyPanel";
import { AIChat } from "@/components/designer/AIChat";
import { TopBar } from "@/components/designer/TopBar";
import { useScene } from "@/lib/scene-store";

export const Route = createFileRoute("/designer")({
  head: () => ({
    meta: [
      { title: "3D Designer — ArchitectAI" },
      { name: "description", content: "Design homes, offices, restaurants & temples in 3D with 360° view, day/night, AI scene generation & cost estimator." },
    ],
  }),
  component: DesignerPage,
});

function useShortcuts() {
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
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [undo, redo, remove, duplicate, saveLocal, selectedId]);
}

function DesignerPage() {
  useShortcuts();
  return (
    <div className="h-screen flex flex-col">
      <header className="h-11 border-b border-border flex items-center justify-between px-4 bg-card">
        <Link to="/" className="font-bold tracking-tight"><span className="text-primary">Architect</span>AI</Link>
        <div className="text-[11px] text-muted-foreground hidden md:block">
          Drag: rotate · Scroll: zoom · Right-click: pan · Click: select · Ctrl+Z/Y · Ctrl+D · Del
        </div>
        <div className="text-[11px] text-muted-foreground">v2 · Gemini powered</div>
      </header>
      <TopBar />
      <div className="flex-1 flex gap-2 p-2 overflow-hidden">
        <Toolbar />
        <div className="flex-1 panel overflow-hidden relative">
          <Scene3D />
          <div className="absolute top-3 left-3 bg-background/70 backdrop-blur px-3 py-1.5 rounded-md text-xs border border-border">
            360° Orbit View
          </div>
        </div>
        <PropertyPanel />
        <AIChat />
      </div>
    </div>
  );
}
