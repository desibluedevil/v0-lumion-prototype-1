"use client"

import Image from "next/image"
import { ArrowDown, ArrowRight, Clock, DollarSign, TrendingUp } from "lucide-react"
import { openApplyModal } from "./ApplyModal"
import { focusMia } from "./MiaPanel"

const programs = [
  {
    level: "01",
    name: "Foundational Pipe Welder",
    duration: "12 weeks",
    tuition: "$17,050",
    salary: "$40K–$60K",
    description:
      "Start from zero. Learn SMAW and basic pipe welding. Built for career changers who have never picked up a torch.",
    tag: "Best for Beginners",
    featured: false,
    image: "/images/program-foundational.png",
  },
  {
    level: "02",
    name: "Professional Pipe Welder",
    duration: "19 weeks",
    tuition: "$27,600",
    salary: "$50K–$90K",
    description:
      "TIG, SMAW, and structural certifications. The path most career-switchers with some trade background take.",
    tag: "Most Popular",
    featured: true,
    image: "/images/program-professional.png",
  },
  {
    level: "03",
    name: "Expert Pipe Welder",
    duration: "24 weeks",
    tuition: "$35,800",
    salary: "$60K–$125K",
    description:
      "Full cert suite including 6G. Built for experienced welders targeting pipeline shutdown and high-end industrial work.",
    tag: "Highest Earning Potential",
    featured: false,
    image: "/images/program-expert.png",
  },
]

export default function Programs() {
  return (
    <section id="programs" className="py-24 bg-background">
      <div className="max-w-[1440px] mx-auto px-8">
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
        <div className="grid grid-cols-3 gap-0 border border-border">
          {programs.map((prog) => (
            <div
              key={prog.level}
              className={`relative flex flex-col p-8 border-r border-border last:border-r-0 transition-colors group hover:bg-secondary/50 ${
                prog.featured ? "bg-secondary/30" : ""
              }`}
            >
              {/* Tag */}
              <div
                className={`absolute top-0 right-0 text-xs font-bold tracking-widest uppercase px-3 py-1 ${
                  prog.featured
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground"
                }`}
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                {prog.tag}
              </div>

              {/* Program photo */}
              <div className="w-full h-40 relative overflow-hidden mb-6">
                <Image
                  src={prog.image}
                  alt={prog.name}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
              </div>

              {/* Level */}
              <span
                className="text-muted-foreground/30 text-6xl font-black leading-none mb-2 select-none"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                {prog.level}
              </span>

              {/* Program name */}
              <h3
                className="text-foreground font-black uppercase leading-tight mb-4"
                style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "1.4rem" }}
              >
                {prog.name}
              </h3>

              {/* Meta */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { Icon: Clock, label: "Duration", value: prog.duration, className: "text-foreground" },
                  { Icon: DollarSign, label: "Tuition", value: prog.tuition, className: "text-foreground" },
                  { Icon: TrendingUp, label: "Salary", value: prog.salary, className: "text-primary" },
                ].map(({ Icon, label, value, className }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Icon size={11} />
                      <span className="text-[10px] font-bold tracking-widest uppercase" style={{ fontFamily: "var(--font-barlow-condensed)" }}>{label}</span>
                    </div>
                    <div className={`font-bold text-sm ${className}`} style={{ fontFamily: "var(--font-barlow-condensed)" }}>{value}</div>
                    {label === "Salary" && (
                      <p className="text-[9px] text-muted-foreground/60 leading-tight">Varies by employer, location &amp; role</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                {prog.description}
              </p>

              {/* Actions */}
              <div className="space-y-2 mt-auto">
                <button
                  onClick={openApplyModal}
                  className={`w-full py-3 font-bold tracking-widest uppercase text-sm transition-colors ${
                    prog.featured
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border text-foreground hover:bg-secondary"
                  }`}
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  Apply Now
                </button>
                <button
                  onClick={() => focusMia(prog.name)}
                  className="w-full py-2.5 border border-border text-xs font-bold tracking-widest uppercase text-muted-foreground hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  <span className="w-4 h-4 bg-primary/10 flex items-center justify-center text-primary text-[9px] font-black tracking-widest">M</span>
                  See If WWA Is a Fit
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div id="financial-aid" className="mt-6 flex items-center justify-center gap-3 text-muted-foreground text-sm">
          <span>Housing, tools, and materials included in all programs.</span>
          <span className="w-1 h-1 bg-muted-foreground rounded-full" />
          <span>Financial aid available for qualified applicants.</span>
          <span className="w-1 h-1 bg-muted-foreground rounded-full" />
          <button
            onClick={() => focusMia()}
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
