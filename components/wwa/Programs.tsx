"use client"

import Image from "next/image"
import { ArrowRight, Clock, DollarSign, TrendingUp } from "lucide-react"
import { openApplyModal } from "./ApplyModal"

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
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-px w-12 bg-primary" />
              <span
                className="text-primary text-xs font-bold tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Programs
              </span>
            </div>
            <h2
              className="text-foreground leading-tight uppercase tracking-tight"
              style={{
                fontFamily: "var(--font-barlow-condensed)",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 900,
              }}
            >
              Choose Your Path
            </h2>
          </div>
          <button
            onClick={() => document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" })}
            className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            View All Programs
            <ArrowRight size={14} />
          </button>
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
                  onClick={() => {
                    const el = document.getElementById("hero-mia")
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "center" })
                      el.style.outline = "2px solid var(--color-primary)"
                      setTimeout(() => { el.style.outline = "" }, 1200)
                    }
                  }}
                  className="w-full py-2.5 border border-border text-xs font-bold tracking-widest uppercase text-muted-foreground hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  <span className="w-4 h-4 bg-primary/10 flex items-center justify-center text-primary text-[9px] font-black tracking-widest">M</span>
                  Ask Mia if this fits me
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
            onClick={() => document.getElementById("mia-section")?.scrollIntoView({ behavior: "smooth" })}
            className="text-primary hover:underline font-semibold"
          >
            See financing options →
          </button>
        </div>
      </div>
    </section>
  )
}
