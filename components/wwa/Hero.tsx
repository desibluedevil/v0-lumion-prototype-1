"use client"

import Image from "next/image"
import { ArrowRight } from "lucide-react"
import MiaPanel from "./MiaPanel"

export default function Hero() {
  return (
    <section className="pt-16 min-h-screen flex items-center bg-background relative overflow-hidden">
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 47px,oklch(0.96 0 0/0.6) 47px,oklch(0.96 0 0/0.6) 48px),repeating-linear-gradient(90deg,transparent,transparent 47px,oklch(0.96 0 0/0.6) 47px,oklch(0.96 0 0/0.6) 48px)",
        }}
      />

      {/* Left image strip — full height */}
      <div className="absolute left-0 top-0 bottom-0 w-[42%] overflow-hidden">
        <Image
          src="/images/wwa-welder.png"
          alt="Welder training at Western Welding Academy"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Dark right-side fade so text reads cleanly */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/60 to-background" />
        {/* Bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>

      <div className="max-w-[1440px] mx-auto px-8 w-full py-20 relative">
        <div className="grid grid-cols-12 gap-8 items-center">

          {/* Left copy — offset to sit over image edge */}
          <div className="col-span-7 space-y-8">
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <div className="h-px w-10 bg-primary" />
              <span
                className="text-primary text-[10px] font-black tracking-[0.25em] uppercase"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Wyoming&apos;s #1 Pipeline Welding School
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-foreground uppercase text-balance"
              style={{
                fontFamily: "var(--font-barlow-condensed)",
                fontSize: "clamp(3.8rem, 6.5vw, 6rem)",
                fontWeight: 900,
                lineHeight: 0.9,
                letterSpacing: "-0.01em",
              }}
            >
              Only The Best<br />
              <span className="text-primary">Welders</span><br />
              Train Here.
            </h1>

            {/* Subhead */}
            <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
              Most people leave this page without applying — not because they&apos;re not interested, but because they have questions.{" "}
              <strong className="text-foreground">Mia answers them in 2 minutes.</strong>
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                className="px-8 py-3.5 bg-primary text-primary-foreground font-black tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Apply Now
                <ArrowRight size={15} />
              </button>
              <button
                className="px-8 py-3.5 border border-border text-sm font-black tracking-widest uppercase text-foreground hover:bg-secondary transition-colors"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                View Programs
              </button>
            </div>

            {/* Proof */}
            <div className="flex items-center gap-5 pt-1">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-secondary" />
                  ))}
                </div>
                <span className="text-muted-foreground text-sm">2,000+ graduates</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <span className="text-muted-foreground text-sm">
                Next cohort starts <strong className="text-foreground">Aug 18</strong>
              </span>
              <div className="h-4 w-px bg-border" />
              <span className="text-muted-foreground text-sm">
                <strong className="text-foreground">94%</strong> get hired
              </span>
            </div>
          </div>

          {/* Mia panel — 5 cols */}
          <div className="col-span-5">
            {/* Context label */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-1 rounded-full bg-primary" />
              <span
                className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                AI layer — lives on this page
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            {/* Red accent bar above panel */}
            <div className="h-0.5 w-full bg-primary mb-0" />
            <MiaPanel />
          </div>
        </div>
      </div>
    </section>
  )
}
