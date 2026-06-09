"use client"

import { useState } from "react"
import { TrendingUp, X, ChevronDown } from "lucide-react"

const metrics = [
  {
    id: "v2ql",
    label: "Visitor → Qualified Lead",
    before: "1.2%",
    after: "8.4%",
    lift: "7×",
    description:
      "Before: visitors who clicked 'Apply Now' on the legacy contact form. After: visitors who complete Mia's 4-step fit check and submit contact info. The difference is answering objections at the moment of hesitation instead of asking for commitment cold.",
  },
  {
    id: "hl2ec",
    label: "Hot Lead → Enrollment Convo",
    before: "18%",
    after: "71%",
    lift: "3.9×",
    description:
      "Before: unqualified form submissions that enrollment had to cold-call with no context. After: Mia-qualified leads with intent score, concern addressed, program matched, and a suggested opener — advisors spend less time qualifying and more time closing.",
  },
]

export default function MetricsBanner() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="bg-card border-b border-border sticky top-16 z-40">
      <div className="max-w-[1440px] mx-auto px-8 py-3">
        <div className="flex items-center gap-5 flex-wrap">

          {/* Label */}
          <div className="flex items-center gap-2 shrink-0">
            <TrendingUp size={13} className="text-primary" />
            <span
              className="text-[10px] font-black tracking-[0.18em] uppercase text-muted-foreground"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Lumion · What moves
            </span>
          </div>

          <div className="h-4 w-px bg-border shrink-0" />

          {/* Metric pills */}
          <div className="flex items-center gap-3 flex-wrap">
            {metrics.map((m) => (
              <button
                key={m.id}
                onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                className={`flex items-center gap-3 px-3.5 py-2 border transition-colors text-left ${
                  expanded === m.id
                    ? "border-primary/50 bg-primary/8"
                    : "border-border hover:border-muted-foreground/40"
                }`}
              >
                <div>
                  <div
                    className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground leading-none mb-1"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    {m.label}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-muted-foreground/50 text-xs line-through font-mono">{m.before}</span>
                    <span className="text-foreground text-base font-black leading-none" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                      {m.after}
                    </span>
                    <span className="text-primary text-xs font-black" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                      +{m.lift}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  size={11}
                  className={`text-muted-foreground/50 shrink-0 transition-transform ${expanded === m.id ? "rotate-180" : ""}`}
                />
              </button>
            ))}
          </div>

          {/* Prototype badge */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span
              className="text-[9px] font-black tracking-[0.2em] uppercase text-primary"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Founder Demo
            </span>
          </div>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="mt-2.5 pt-2.5 border-t border-border flex items-start justify-between gap-6">
            {metrics.filter((m) => m.id === expanded).map((m) => (
              <p key={m.id} className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                {m.description}
              </p>
            ))}
            <button
              onClick={() => setExpanded(null)}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
              aria-label="Close"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
