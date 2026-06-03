import { createFileRoute, Link } from "@tanstack/react-router";
import { Scene3D } from "@/components/designer/Scene3D";
import { Toolbar } from "@/components/designer/Toolbar";
import { PropertyPanel } from "@/components/designer/PropertyPanel";
import { AIChat } from "@/components/designer/AIChat";

export const Route = createFileRoute("/designer")({
  head: () => ({
    meta: [
      { title: "3D Designer — ArchitectAI" },
      { name: "description", content: "Design homes, offices, restaurants, and temples in 3D with 360° view and an AI architect assistant." },
    ],
  }),
  component: DesignerPage,
});

function DesignerPage() {
  return (
    <div className="h-screen flex flex-col">
      <header className="h-12 border-b border-border flex items-center justify-between px-4 bg-card">
        <Link to="/" className="font-bold tracking-tight">
          <span className="text-primary">Architect</span>AI
        </Link>
        <div className="text-xs text-muted-foreground">
          Drag to rotate · Scroll to zoom · Right-click to pan · Click object to edit
        </div>
        <div className="text-xs text-muted-foreground">v1 · Gemini powered</div>
      </header>
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
