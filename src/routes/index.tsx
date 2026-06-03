import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ArchitectAI — 3D Design Studio for Civil Engineers & Designers" },
      { name: "description", content: "Design homes, offices, restaurants, and temples in 3D with 360° view, full customization, and a Gemini-powered AI architect assistant." },
      { property: "og:title", content: "ArchitectAI — 3D Design Studio" },
      { property: "og:description", content: "Browser-based 3D building designer with AI assistance for civil engineers and designers." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="font-bold text-xl tracking-tight">
          <span className="text-primary">Architect</span>AI
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <a href="#features" className="text-muted-foreground hover:text-foreground">Features</a>
          <a href="#presets" className="text-muted-foreground hover:text-foreground">Presets</a>
          <Link to="/designer" className="btn-primary">Open Designer</Link>
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-8 pt-20 pb-32 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-block px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-mono uppercase tracking-widest mb-6">
            Civil Engineering · AI Powered
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
            Design buildings in <span className="text-primary">3D</span>,
            <br />guided by AI.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-lg">
            Sketch homes, offices, restaurants, and temples in full 3D with a 360° view.
            Customize every wall, door, and column — and let a Gemini-powered architect
            assistant help you plan.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/designer" className="btn-primary text-base px-6 py-3">Start Designing →</Link>
            <a href="#features" className="btn-ghost text-base px-6 py-3">Learn more</a>
          </div>
        </div>
        <div className="panel aspect-square p-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
          <div className="relative h-full flex items-center justify-center text-9xl">🏛</div>
          <div className="absolute bottom-3 left-3 right-3 bg-background/80 backdrop-blur p-3 rounded-md border border-border text-xs">
            <span className="text-primary font-mono">▸ AI</span> Suggested a 4-column entrance with 3m clearance for the temple preset.
          </div>
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-8 py-20">
        <h2 className="text-3xl font-bold mb-12">Everything you need to design</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { t: "Full 3D Scene", d: "Real react-three-fiber engine with shadows, lighting, and sky.", i: "🧊" },
            { t: "360° Orbit View", d: "Rotate, zoom, and pan freely around your building.", i: "🔄" },
            { t: "Custom Everything", d: "Edit position, size, rotation, and color of every element.", i: "🎨" },
            { t: "AI Architect", d: "Ask Gemini for layout ideas, dimensions, and code advice.", i: "🤖" },
            { t: "Preset Templates", d: "Start from home, office, restaurant, or temple presets.", i: "🏗" },
            { t: "Blueprint Grid", d: "Snap your imagination to a clean architectural grid.", i: "📐" },
          ].map((f) => (
            <div key={f.t} className="panel p-6">
              <div className="text-3xl mb-3">{f.i}</div>
              <div className="font-semibold mb-1">{f.t}</div>
              <p className="text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="presets" className="max-w-7xl mx-auto px-8 py-20">
        <h2 className="text-3xl font-bold mb-12">Start from a preset</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { n: "Home", i: "🏠", d: "Family residence layout" },
            { n: "Office", i: "🏢", d: "Open-plan workspace" },
            { n: "Restaurant", i: "🍽", d: "Dining hall with tables" },
            { n: "Temple", i: "🛕", d: "Traditional with columns & dome" },
          ].map((p) => (
            <Link to="/designer" key={p.n} className="panel p-6 hover:border-primary transition-colors">
              <div className="text-5xl mb-3">{p.i}</div>
              <div className="font-semibold">{p.n}</div>
              <p className="text-sm text-muted-foreground">{p.d}</p>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-8 py-8 text-sm text-muted-foreground flex justify-between">
          <span>© ArchitectAI</span>
          <Link to="/designer" className="hover:text-foreground">Open the designer →</Link>
        </div>
      </footer>
    </div>
  );
}
