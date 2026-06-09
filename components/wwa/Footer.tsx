export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="grid grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary flex items-center justify-center shrink-0">
                <span
                  className="text-primary-foreground text-xs font-bold"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  WWA
                </span>
              </div>
              <div className="leading-tight">
                <div
                  className="text-foreground font-bold text-sm tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  Western
                </div>
                <div
                  className="text-foreground font-bold text-sm tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  Welding Academy
                </div>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Wyoming&apos;s premier pipeline welding school. Hands-on training, career placement, and housing — all in one place.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary" />
              <span
                className="text-foreground text-sm font-bold tracking-widest uppercase"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Gillette, WY
              </span>
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Programs",
              links: ["Foundational Pipe Welder", "Professional Pipe Welder", "Expert Pipe Welder", "Program Comparison"],
            },
            {
              title: "Admissions",
              links: ["Apply Now", "Program Quiz", "Financial Aid", "Housing Info"],
            },
            {
              title: "Academy",
              links: ["About WWA", "Faculty & Staff", "Campus Tour", "Alumni"],
            },
          ].map((col) => (
            <div key={col.title} className="space-y-4">
              <h4
                className="text-foreground font-bold text-xs tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <button className="text-muted-foreground text-sm hover:text-foreground transition-colors text-left">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 flex items-center justify-between">
          <p className="text-muted-foreground text-xs">
            © 2026 Western Welding Academy. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Use", "Accreditation"].map((item) => (
              <button key={item} className="text-muted-foreground text-xs hover:text-foreground transition-colors">
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
