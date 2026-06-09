"use client"

import { ArrowRight, ClipboardList } from "lucide-react"
import MiaPanel from "./MiaPanel"

export default function Hero() {
  return (
    <section className="pt-16 min-h-screen flex items-center bg-background relative overflow-hidden">
      {/* Background texture — welding sparks silhouette */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 39px, oklch(0.96 0 0 / 0.6) 39px, oklch(0.96 0 0 / 0.6) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, oklch(0.96 0 0 / 0.6) 39px, oklch(0.96 0 0 / 0.6) 40px)",
        }}
      />

      <div className="max-w-[1440px] mx-auto px-8 w-full py-20">
        <div className="grid grid-cols-12 gap-8 items-center">
          {/* Left content — 7 cols */}
          <div className="col-span-7 space-y-8">
            {/* Label */}
            <div className="flex items-center gap-3">
              <div className="h-px w-12 bg-primary" />
              <span
                className="text-primary text-xs font-bold tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Wyoming&apos;s #1 Pipeline Welding School
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-foreground leading-[0.92] tracking-[-0.02em] uppercase text-balance"
              style={{
                fontFamily: "var(--font-barlow-condensed)",
                fontSize: "clamp(3.5rem, 6vw, 5.5rem)",
                fontWeight: 900,
              }}
            >
              Only The Best<br />
              <span className="text-primary">Welders</span><br />
              Train Here.
            </h1>

            {/* Subhead */}
            <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
              Not sure if welding school is right for you?{" "}
              <strong className="text-foreground">Mia</strong> can help you figure it out — in under 2 minutes.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-4 flex-wrap">
              <button
                className="px-7 py-3.5 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Apply Now
                <ArrowRight size={16} />
              </button>
              <button
                className="px-7 py-3.5 border border-border text-sm font-bold tracking-widest uppercase text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                <ClipboardList size={16} />
                Program Quiz
              </button>
              <button
                className="px-7 py-3.5 border border-primary text-primary font-bold tracking-widest uppercase text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                See if WWA is a Fit →
              </button>
            </div>

            {/* Social proof footnote */}
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 border-background bg-secondary"
                    />
                  ))}
                </div>
                <span className="text-muted-foreground text-sm">
                  2,000+ graduates
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <span className="text-muted-foreground text-sm">
                Next cohort starts <strong className="text-foreground">Aug 18</strong>
              </span>
            </div>
          </div>

          {/* Right — Mia panel — 5 cols */}
          <div className="col-span-5">
            {/* Photo placeholder above panel */}
            <div className="relative">
              <div className="w-full h-40 bg-secondary border border-border flex items-center justify-center mb-0 overflow-hidden">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 mx-auto bg-muted flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-muted-foreground" />
                  </div>
                  <p
                    className="text-muted-foreground text-xs tracking-widest uppercase"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    Pipeline Training Facility — Gillette, WY
                  </p>
                </div>
              </div>
              {/* Red accent bar */}
              <div className="h-1 w-full bg-primary" />
              <MiaPanel />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
