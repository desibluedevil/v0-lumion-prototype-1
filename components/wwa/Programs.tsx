"use client"

import Image from "next/image"
import { ArrowDown, ArrowRight } from "lucide-react"
import { openApplyModal } from "./ApplyModal"
import { focusMia } from "./MiaPanel"

const programs = [
  {
    level: "01",
    name: "Foundational Pipe Welder",
    duration: "12 Weeks",
    payback: "5 Months",
    tuition: "$17,050",
    description:
      "Start from zero. Learn SMAW and basic pipe welding. Built for career changers who have never picked up a torch.",
    tag: "Best for Beginners",
    featured: false,
    image: "/images/program-foundational.png",
  },
  {
    level: "02",
    name: "Professional Pipe Welder",
    duration: "19 Weeks",
    payback: "6 Months",
    tuition: "$27,600",
    description:
      "TIG, SMAW, and structural certifications. The path most career-switchers with some trade background take.",
    tag: "Most Popular",
    featured: true,
    image: "/images/program-professional.png",
  },
  {
    level: "03",
    name: "Expert Pipe Welder",
    duration: "24 Weeks",
    payback: "7 Months",
    tuition: "$35,800",
    description:
      "Full cert suite including 6G. Built for experienced welders targeting pipeline shutdown and high-end industrial work.",
    tag: "Highest Earning Potential",
    featured: false,
    image: "/images/program-expert.png",
  },
]

export default function Programs() {
  return (
    <section id="programs" className="py-16 lg:py-24 bg-background">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 space-y-5">
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-primary" />
            <span
              className="text-primary text-xs font-black tracking-[0.25em] uppercase"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Our Programs
            </span>
            <div className="h-px w-16 bg-primary" />
          </div>

          {/* Primary title */}
          <h2
            className="text-foreground uppercase leading-none tracking-tight text-balance"
            style={{
              fontFamily: "var(--font-barlow-condensed)",
              fontSize: "clamp(3rem, 7vw, 5.5rem)",
              fontWeight: 900,
              letterSpacing: "-0.01em",
            }}
          >
            Your Future Starts Here.
          </h2>

          {/* Sub-headline */}
          <p
            className="text-muted-foreground uppercase font-bold tracking-[0.2em]"
            style={{
              fontFamily: "var(--font-barlow-condensed)",
              fontSize: "clamp(0.85rem, 1.5vw, 1.1rem)",
            }}
          >
            Choose Your Path. Forge Your Future.
          </p>

          {/* Scroll prompt */}
          <div className="flex flex-col items-center gap-2 pt-4">
            <span
              className="text-muted-foreground/60 text-xs tracking-widest uppercase"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Scroll to discover your welding program
            </span>
            <ArrowDown size={16} className="text-primary animate-bounce" />
          </div>
        </div>

        {/* Program cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map((prog) => (
            <div
              key={prog.level}
              className="relative flex flex-col bg-white text-black group overflow-hidden transition-colors duration-300"
            >
              {/* Tag ribbon */}
              <div
                className="bg-primary text-primary-foreground text-[10px] font-black tracking-[0.2em] uppercase px-4 py-2 text-center"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                {prog.tag}
              </div>

              {/* Program photo */}
              <div className="w-full h-48 relative overflow-hidden">
                <Image
                  src={prog.image}
                  alt={prog.name}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Card body */}
              <div className="flex flex-col flex-1 p-8">
                {/* Program name */}
                <h3
                  className="text-black group-hover:text-white font-black uppercase leading-tight mb-6 transition-colors duration-300"
                  style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "1.6rem", letterSpacing: "-0.01em" }}
                >
                  {prog.name}
                </h3>

                {/* Stats — Program Length + Payback stacked */}
                <div className="border-t border-b border-black/10 group-hover:border-white/20 divide-y divide-black/10 group-hover:divide-white/20 mb-6 transition-colors duration-300">
                  <div className="flex items-center justify-between py-3">
                    <span
                      className="text-[10px] font-black tracking-[0.18em] uppercase text-black/50 group-hover:text-white/50 transition-colors duration-300"
                      style={{ fontFamily: "var(--font-barlow-condensed)" }}
                    >
                      Program Length
                    </span>
                    <span
                      className="text-black group-hover:text-white font-black text-lg transition-colors duration-300"
                      style={{ fontFamily: "var(--font-barlow-condensed)" }}
                    >
                      {prog.duration}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span
                      className="text-[10px] font-black tracking-[0.18em] uppercase text-black/50 group-hover:text-white/50 transition-colors duration-300"
                      style={{ fontFamily: "var(--font-barlow-condensed)" }}
                    >
                      Avg. Time to Payback
                    </span>
                    <span
                      className="text-primary font-black text-lg"
                      style={{ fontFamily: "var(--font-barlow-condensed)" }}
                    >
                      {prog.payback}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span
                      className="text-[10px] font-black tracking-[0.18em] uppercase text-black/50 group-hover:text-white/50 transition-colors duration-300"
                      style={{ fontFamily: "var(--font-barlow-condensed)" }}
                    >
                      Tuition
                    </span>
                    <span
                      className="text-black group-hover:text-white font-black text-lg transition-colors duration-300"
                      style={{ fontFamily: "var(--font-barlow-condensed)" }}
                    >
                      {prog.tuition}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-black/60 group-hover:text-white/60 text-sm leading-relaxed mb-8 flex-1 transition-colors duration-300">
                  {prog.description}
                </p>

                {/* Actions */}
                <div className="space-y-2 mt-auto">
                  <button
                    onClick={openApplyModal}
                    className="w-full py-3.5 bg-primary text-primary-foreground font-black tracking-[0.18em] uppercase text-sm hover:bg-primary/90 transition-colors"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    Apply Now
                  </button>
                  <button
                    onClick={() => focusMia({ programName: prog.name })}
                    className="w-full py-3 border-2 border-black group-hover:border-white/40 text-black group-hover:text-white text-xs font-black tracking-[0.18em] uppercase hover:bg-primary hover:!text-primary-foreground hover:!border-primary transition-colors duration-300 flex items-center justify-center gap-2"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    <span aria-hidden="true" className="w-4 h-4 bg-primary/10 flex items-center justify-center text-primary text-[9px] font-black">M</span>
                    See If WWA Is a Fit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div id="financial-aid" className="mt-6 flex flex-wrap items-center justify-center gap-3 text-muted-foreground text-sm">
          <span>Housing, tools, and materials included in all programs.</span>
          <span className="w-1 h-1 bg-muted-foreground rounded-full" />
          <span>Financing options may be available.</span>
          <span className="w-1 h-1 bg-muted-foreground rounded-full" />
          <button
            onClick={() => focusMia({ jumpToConcern: true, prefillConcern: "Cost — can I afford it?" })}
            className="text-primary hover:underline font-semibold"
          >
            Ask Mia about financing →
          </button>
          <span className="w-1 h-1 bg-muted-foreground rounded-full" />
          <button
            onClick={() => focusMia()}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors font-semibold"
          >
            Not sure which program?
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </section>
  )
}
