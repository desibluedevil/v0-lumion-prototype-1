"use client"

import { ArrowRight, Clock, DollarSign, TrendingUp } from "lucide-react"

const programs = [
  {
    level: "01",
    name: "Foundational Pipe Welder",
    duration: "12 weeks",
    tuition: "$17,050",
    salary: "$40K–$60K",
    description:
      "Master SMAW and basic pipe welding. Build the foundation for a career in the trades. Ideal for career changers and beginners.",
    tag: "Best for Beginners",
    featured: false,
  },
  {
    level: "02",
    name: "Professional Pipe Welder",
    duration: "19 weeks",
    tuition: "$27,600",
    salary: "$50K–$90K",
    description:
      "Advanced pipe welding processes including TIG and structural welding certifications. Ready for pipeline and industrial work.",
    tag: "Most Popular",
    featured: true,
  },
  {
    level: "03",
    name: "Expert Pipe Welder",
    duration: "24 weeks",
    tuition: "$35,800",
    salary: "$60K–$125K",
    description:
      "Full certification suite. Pipeline shutdown work, 6G certification, and career placement in high-demand markets.",
    tag: "Highest Earning Potential",
    featured: false,
  },
]

export default function Programs() {
  return (
    <section className="py-24 bg-background">
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
            className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            View All Programs
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Program cards */}
        <div className="grid grid-cols-3 gap-0 border border-border">
          {programs.map((program, i) => (
            <div
              key={program.level}
              className={`relative flex flex-col p-8 border-r border-border last:border-r-0 transition-colors group hover:bg-secondary/50 ${
                program.featured ? "bg-secondary/30" : ""
              }`}
            >
              {/* Featured tag */}
              {program.featured && (
                <div
                  className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold tracking-widest uppercase px-3 py-1"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  {program.tag}
                </div>
              )}
              {!program.featured && (
                <div
                  className="absolute top-0 right-0 border border-border text-muted-foreground text-xs font-bold tracking-widest uppercase px-3 py-1"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  {program.tag}
                </div>
              )}

              {/* Photo placeholder */}
              <div className="w-full h-40 bg-muted border border-border mb-6 flex items-center justify-center">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 mx-auto bg-secondary border border-border flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-muted-foreground" />
                  </div>
                  <p
                    className="text-muted-foreground text-[10px] tracking-widest uppercase"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    Photo Placeholder
                  </p>
                </div>
              </div>

              {/* Level */}
              <span
                className="text-muted-foreground/40 text-6xl font-black leading-none mb-2 select-none"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                {program.level}
              </span>

              {/* Program name */}
              <h3
                className="text-foreground font-black uppercase leading-tight mb-4"
                style={{
                  fontFamily: "var(--font-barlow-condensed)",
                  fontSize: "1.4rem",
                }}
              >
                {program.name}
              </h3>

              {/* Meta */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock size={11} />
                    <span
                      className="text-[10px] font-bold tracking-widest uppercase"
                      style={{ fontFamily: "var(--font-barlow-condensed)" }}
                    >
                      Duration
                    </span>
                  </div>
                  <div
                    className="text-foreground font-bold text-sm"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    {program.duration}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign size={11} />
                    <span
                      className="text-[10px] font-bold tracking-widest uppercase"
                      style={{ fontFamily: "var(--font-barlow-condensed)" }}
                    >
                      Tuition
                    </span>
                  </div>
                  <div
                    className="text-foreground font-bold text-sm"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    {program.tuition}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <TrendingUp size={11} />
                    <span
                      className="text-[10px] font-bold tracking-widest uppercase"
                      style={{ fontFamily: "var(--font-barlow-condensed)" }}
                    >
                      Salary
                    </span>
                  </div>
                  <div
                    className="text-primary font-bold text-sm"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    {program.salary}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                {program.description}
              </p>

              {/* Actions */}
              <div className="space-y-2 mt-auto">
                <button
                  className={`w-full py-3 font-bold tracking-widest uppercase text-sm transition-colors ${
                    program.featured
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border text-foreground hover:bg-secondary"
                  }`}
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  Apply Now
                </button>
                <button
                  className="w-full py-2.5 border border-border text-xs font-bold tracking-widest uppercase text-muted-foreground hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  <span className="w-4 h-4 bg-primary/10 flex items-center justify-center text-primary text-[9px] font-black">M</span>
                  Ask Mia if this fits me
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-6 flex items-center justify-center gap-3 text-muted-foreground text-sm">
          <span>Housing, tools, and materials included in all programs.</span>
          <span className="w-1 h-1 bg-muted-foreground rounded-full" />
          <span>Financial aid available for qualified applicants.</span>
          <span className="w-1 h-1 bg-muted-foreground rounded-full" />
          <button className="text-primary hover:underline font-semibold">
            See financing options →
          </button>
        </div>
      </div>
    </section>
  )
}
