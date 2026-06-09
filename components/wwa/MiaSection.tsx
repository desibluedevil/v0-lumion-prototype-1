"use client"

import Image from "next/image"
import { ArrowRight, CheckCircle } from "lucide-react"

const bullets = [
  "Check if WWA fits your goals",
  "Understand cost, housing, and training options",
  "Get matched to a recommended next step",
  "Talk to enrollment only if you're ready",
]

function scrollToMia() {
  const el = document.getElementById("hero-mia")
  if (!el) return
  el.scrollIntoView({ behavior: "smooth", block: "center" })
  // Brief visual pulse to draw attention to the panel
  el.style.outline = "2px solid var(--color-primary)"
  setTimeout(() => { el.style.outline = "" }, 1200)
}

export default function MiaSection() {
  return (
    <section id="mia-section" className="py-24 bg-card border-t border-border">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="grid grid-cols-12 gap-16 items-center">

          {/* Left copy — 6 cols */}
          <div className="col-span-6 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px w-10 bg-primary" />
                <span
                  className="text-primary text-[10px] font-black tracking-[0.2em] uppercase"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  Not sure yet?
                </span>
              </div>
              <h2
                className="text-foreground uppercase tracking-tight text-balance"
                style={{
                  fontFamily: "var(--font-barlow-condensed)",
                  fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                  fontWeight: 900,
                  lineHeight: 1.05,
                }}
              >
                Not Ready To Apply Yet?<br />Start Here.
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                A lot of future welders have the same questions before they apply: Can I afford it? Do I need experience? Can I move to Wyoming? Which program fits me? Mia helps you get clear before you talk to enrollment.
              </p>
            </div>

            {/* Bullets */}
            <div className="space-y-2.5">
              {bullets.map((b) => (
                <div key={b} className="flex items-start gap-3">
                  <CheckCircle size={15} className="text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground text-sm leading-relaxed">{b}</span>
                </div>
              ))}
            </div>

            {/* Pull quote */}
            <div className="border-l-2 border-primary pl-5 py-1.5">
              <p className="text-foreground font-semibold text-sm leading-relaxed">
                No pressure. No hard sell. If WWA isn&apos;t the right fit, Mia will tell you that too.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={scrollToMia}
              className="flex items-center gap-3 px-10 py-4 bg-primary text-primary-foreground font-black tracking-widest uppercase hover:bg-primary/90 transition-colors"
              style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "1rem" }}
            >
              See If WWA Is a Fit
              <ArrowRight size={16} />
            </button>
            <p className="text-muted-foreground text-xs tracking-wide -mt-5">
              No account. No commitment. Just a straight answer.
            </p>
          </div>

          {/* Right — facility photo — 6 cols */}
          <div className="col-span-6">
            <div className="h-0.5 w-full bg-primary mb-0" />
            <div className="w-full aspect-[4/3] relative overflow-hidden border border-border border-t-0">
              <Image
                src="/images/wwa-facility.png"
                alt="Western Welding Academy training facility — Gillette, Wyoming"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 space-y-1">
                <p
                  className="text-foreground font-black uppercase tracking-widest text-sm"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  Pipeline Training Facility
                </p>
                <p
                  className="text-muted-foreground text-[10px] tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  Gillette, Wyoming
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
