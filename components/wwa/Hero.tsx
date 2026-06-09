"use client"

import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { focusMia } from "./MiaPanel"
import { openApplyModal } from "./ApplyModal"

export default function Hero() {
  return (
    <section className="pt-[calc(1.75rem+4rem)] min-h-screen flex items-stretch bg-background relative overflow-hidden">

      {/* Full-bleed background image + dark overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/wwa-hero-bg.png"
          alt="Welder training at Western Welding Academy"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Dark overlay — heavy enough to read white text cleanly */}
        <div className="absolute inset-0 bg-background/75" />
        {/* Right fade — leaves breathing room for the floating panel */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/10 to-background/60" />
      </div>

      {/*
        Content area.
        On desktop we pad the right side by ~clamp(360px,28vw,440px) + 1.5rem gap
        so the floating panel never obscures the headline.
      */}
      <div
        className="max-w-[1440px] mx-auto px-6 lg:px-8 w-full py-12 lg:py-20 relative flex items-center"
        style={{ paddingRight: "max(2rem, min(28vw, 440px) + 3.5rem)" }}
      >
        <div className="space-y-8 max-w-2xl">

          {/* Headline */}
          <h1
            className="text-foreground uppercase leading-none text-balance"
            style={{
              fontFamily: "var(--font-barlow-condensed)",
              fontSize: "clamp(4rem, 8vw, 8rem)",
              fontWeight: 900,
              letterSpacing: "-0.01em",
              lineHeight: 0.92,
            }}
          >
            Only The Best<br />
            <span className="text-primary">Welders</span><br />
            Train Here.
          </h1>

          {/* Sub-headline */}
          <p
            className="text-foreground/80 font-semibold tracking-wide"
            style={{
              fontFamily: "var(--font-barlow-condensed)",
              fontSize: "clamp(1.25rem, 2vw, 1.6rem)",
            }}
          >
            Do you have what it takes?
          </p>

          {/* Primary CTAs */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={openApplyModal}
              className="px-8 py-3.5 bg-primary text-primary-foreground font-black tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Apply Now
              <ArrowRight size={15} />
            </button>
            <button
              onClick={() => focusMia({ autoStart: true })}
              className="px-8 py-3.5 border border-foreground/40 text-sm font-black tracking-widest uppercase text-foreground hover:border-foreground hover:bg-foreground/10 transition-colors"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Program Quiz
            </button>
          </div>

          {/* AI CTA */}
          <div className="pt-1 flex items-center gap-3">
            <div className="h-px w-8 bg-primary/60" />
            <button
              onClick={() => focusMia()}
              className="text-xs font-black tracking-[0.2em] uppercase text-primary hover:text-primary/80 transition-colors"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              See If WWA Is a Fit
            </button>
          </div>

        </div>
      </div>

    </section>
  )
}
