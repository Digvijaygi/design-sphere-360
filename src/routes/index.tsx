import { createFileRoute, Link } from "@tanstack/react-router";
import heroVilla from "@/assets/hero-villa.jpg";
import presetHome from "@/assets/preset-home.jpg";
import presetOffice from "@/assets/preset-office.jpg";
import presetRestaurant from "@/assets/preset-restaurant.jpg";
import presetTemple from "@/assets/preset-temple.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Architect AI — Professional 3D Design Studio for Architects & Engineers" },
      { name: "description", content: "A studio-grade 3D building designer. Sketch villas, offices, restaurants and temples in real-time 3D with cinematic lighting, walk-through mode, and an AI architect copilot." },
      { property: "og:title", content: "Architect AI — Professional 3D Design Studio" },
      { property: "og:description", content: "Studio-grade 3D building designer with walk-through, cinematic lighting and an AI architect copilot." },
      { property: "og:image", content: heroVilla },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroVilla },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="w-7 h-7 rounded-md bg-primary/15 border border-primary/40 grid place-items-center text-primary text-sm">◆</span>
            <span className="text-base">Architect<span className="text-primary">AI</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#capabilities" className="hover:text-foreground transition">Capabilities</a>
            <a href="#workflow" className="hover:text-foreground transition">Workflow</a>
            <a href="#presets" className="hover:text-foreground transition">Templates</a>
            <a href="#stats" className="hover:text-foreground transition">Why us</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/designer" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
            <Link to="/designer" className="btn-primary text-sm">Launch Studio</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <img src={heroVilla} alt="" className="w-full h-full object-cover opacity-30" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-28 lg:pt-32 lg:pb-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-[11px] font-mono uppercase tracking-[0.18em] mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Real-time 3D · AI Copilot · Studio Grade
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight">
              Architecture,<br />
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                rendered in real time.
              </span>
            </h1>
            <p className="mt-7 text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Move from concept to construction-ready visual in minutes. A precision 3D studio with cinematic
              lighting, walk-through camera, weather, and an AI copilot trained for civil engineering.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/designer" className="btn-primary text-base px-7 py-3.5 inline-flex items-center gap-2 shadow-lg shadow-primary/20">
                Open the Studio
                <span aria-hidden>→</span>
              </Link>
              <a href="#workflow" className="btn-ghost text-base px-7 py-3.5">See it in action</a>
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-primary" /> No install · runs in your browser</span>
              <span className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-primary" /> Export-ready geometry</span>
              <span className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-primary" /> Powered by Gemini AI</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="border-y border-border/60 bg-card/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { v: "60 fps", l: "Real-time render" },
            { v: "30+", l: "Element categories" },
            { v: "AI", l: "Architect copilot" },
            { v: "1-click", l: "Walk-through mode" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">{s.v}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.18em] text-primary mb-3">Capabilities</div>
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight max-w-2xl">A full design suite, engineered for clarity.</h2>
          </div>
          <p className="text-muted-foreground max-w-md text-sm">
            Everything you'd expect from desktop CAD — orbit, transform gizmos, materials, snapping —
            re-imagined for the browser and paired with an AI that understands buildings.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/60 rounded-xl overflow-hidden border border-border/60">
          {[
            { t: "Cinematic Render", d: "ACES tone-mapping, soft shadows and contact shadows for portfolio-grade visuals.", i: "✦" },
            { t: "Walk-through Camera", d: "First-person WASD + pointer-lock. Step inside any room and feel the scale.", i: "◐" },
            { t: "Transform Gizmos", d: "Move · Rotate · Scale with shortcuts (W / E / R) — exactly like the desktop tools.", i: "◇" },
            { t: "AI Scene Generator", d: "Describe a building in plain English. Gemini composes a complete 3D layout.", i: "✺" },
            { t: "Weather & Time", d: "Rain, snow, sunrise to night. See your design across every lighting condition.", i: "❄" },
            { t: "Smart Material Library", d: "Glass, concrete, wood, stone, metal — physically plausible, instantly swappable.", i: "▣" },
            { t: "Cost Estimation", d: "Per-element pricing rolls up to a live project total as you design.", i: "₹" },
            { t: "Custom Element Builder", d: "Generate any object from a text prompt or define dimensions manually.", i: "✱" },
            { t: "Project History", d: "Unlimited undo/redo, local save, and one-click screenshots for client review.", i: "↺" },
          ].map((f) => (
            <div key={f.t} className="bg-card p-7 hover:bg-card/80 transition group">
              <div className="w-10 h-10 rounded-lg border border-primary/30 bg-primary/5 grid place-items-center text-primary text-lg mb-5 group-hover:scale-105 transition-transform">{f.i}</div>
              <div className="font-semibold mb-2 text-base">{f.t}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="bg-card/40 border-y border-border/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32 grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="relative panel p-2 overflow-hidden">
              <img src={heroVilla} alt="Architect AI studio render" loading="lazy" width={1600} height={1024} className="w-full h-auto rounded-md" />
            </div>
            <div className="hidden md:block absolute -bottom-6 -right-6 panel p-4 max-w-xs shadow-xl shadow-background/40">
              <div className="text-[10px] font-mono uppercase tracking-widest text-primary mb-1">▸ AI Copilot</div>
              <p className="text-xs leading-relaxed">Add a 3m cantilever roof on the east facade to soften the morning glare from the pool deck.</p>
            </div>
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.18em] text-primary mb-3">Workflow</div>
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">From sketch to render, without leaving the tab.</h2>
            <ol className="mt-10 space-y-6">
              {[
                { n: "01", t: "Start from a template", d: "Villa, office, restaurant or temple — each comes with a structured baseline floor plan." },
                { n: "02", t: "Compose in 3D", d: "Drag elements, snap walls, drop furniture. Gizmos and shortcuts feel exactly like Blender." },
                { n: "03", t: "Direct the AI", d: "Type changes in natural language. The AI patches geometry, materials and dimensions for you." },
                { n: "04", t: "Walk through & present", d: "Enter first-person mode, adjust weather, capture screenshots — ready for the client." },
              ].map((s) => (
                <li key={s.n} className="flex gap-5">
                  <div className="font-mono text-xs text-primary pt-1">{s.n}</div>
                  <div>
                    <div className="font-semibold">{s.t}</div>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Presets */}
      <section id="presets" className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-xs font-mono uppercase tracking-[0.18em] text-primary mb-3">Templates</div>
        <h2 className="text-3xl lg:text-5xl font-bold tracking-tight max-w-2xl">Begin from a curated baseline.</h2>
        <p className="mt-4 text-muted-foreground max-w-xl">Each template ships with structural defaults, materials and lighting tuned by hand. Customize anything.</p>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { n: "Residential Villa", i: presetHome, d: "Family homes & luxury residences." },
            { n: "Open Office", i: presetOffice, d: "Modern workspaces & studios." },
            { n: "Restaurant", i: presetRestaurant, d: "Dining halls, cafés & bars." },
            { n: "Temple", i: presetTemple, d: "Traditional with columns & dome." },
          ].map((p) => (
            <Link to="/designer" key={p.n} className="group block panel overflow-hidden hover:border-primary transition-colors">
              <div className="aspect-[4/5] relative overflow-hidden bg-secondary">
                <img src={p.i} alt={p.n} loading="lazy" width={800} height={1000} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
              </div>
              <div className="p-5">
                <div className="font-semibold">{p.n}</div>
                <p className="text-xs text-muted-foreground mt-1">{p.d}</p>
                <div className="mt-4 text-xs text-primary inline-flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open template <span aria-hidden>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonial / quote */}
      <section className="bg-card/40 border-y border-border/60">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-24 text-center">
          <div className="text-primary text-5xl font-serif leading-none">"</div>
          <p className="mt-4 text-2xl lg:text-3xl font-medium tracking-tight leading-snug">
            It collapsed our concept-to-client cycle from a week to a single afternoon.
            The AI doesn't just decorate — it actually understands structure.
          </p>
          <div className="mt-8 text-sm text-muted-foreground">— Principal architect, independent design studio</div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 lg:px-8 py-24 lg:py-32 text-center">
        <h2 className="text-4xl lg:text-6xl font-bold tracking-tight">
          Your next building<br />starts in the browser.
        </h2>
        <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
          No download, no license. Open the studio and start placing your first wall in under ten seconds.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Link to="/designer" className="btn-primary text-base px-8 py-3.5 shadow-lg shadow-primary/20">Launch the Studio →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 flex flex-wrap justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-primary/15 border border-primary/40 grid place-items-center text-primary text-xs">◆</span>
            <span>© {new Date().getFullYear()} ArchitectAI · Crafted for designers.</span>
          </div>
          <div className="flex gap-6">
            <a href="#capabilities" className="hover:text-foreground">Capabilities</a>
            <a href="#workflow" className="hover:text-foreground">Workflow</a>
            <Link to="/designer" className="hover:text-foreground">Studio</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
