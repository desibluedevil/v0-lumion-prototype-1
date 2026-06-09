"use client"

import { useState } from "react"
import { TrendingUp, ArrowRight, X } from "lucide-react"

const metrics = [
  {
    id: "v2ql",
    label: "Visitor → Qualified Lead",
    before: "1.2%",
    after: "8.4%",
    lift: "+7x",
    liftLabel: "lift",
    description:
      "Visitors who complete Mia's fit check and submit contact info, vs. visitors who click the legacy 'Apply Now' button.",
    color: "text-green-400",
    borderColor: "border-green-500/30",
    bgColor: "bg-green-500/5",
  },
  {
    id: "hl2ec",
    label: "Hot Lead → Enrollment Convo",
    before: "18%",
    after: "71%",
    lift: "+3.9x",
    liftLabel: "lift",
    description:
      "Mia-routed hot leads that convert to a live enrollment conversation within 48 hours, vs. unqualified form submissions.",
    color: "text-primary",
    borderColor: "border-primary/30",
    bgColor: "bg-primary/5",
  },
]

export default function MetricsBanner() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="bg-card border-b border-border">
      <div className="max-w-[1440px] mx-auto px-8 py-4">
        <div className="flex items-center gap-6">
          {/* Label */}
          <div className="shrink-0 flex items-center gap-2">
            <TrendingUp size={14} className="text-primary" />
            <span
              className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Lumion Impact Metrics
            </span>
          </div>

          <div className="h-5 w-px bg-border" />

          {/* Metric cards */}
          <div className="flex items-center gap-4 flex-1">
            {metrics.map((m) => (
              <button
                key={m.id}
                onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                className={`flex items-center gap-3 px-4 py-2 border transition-colors text-left ${
                  expanded === m.id ? `${m.borderColor} ${m.bgColor}` : "border-border hover:border-muted-foreground/40"
                }`}
              >
                <div>
                  <div
                    className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    {m.label}
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-muted-foreground/50 text-sm line-through">{m.before}</span>
                    <ArrowRight size={10} className="text-muted-foreground/50" />
                    <span className={`text-lg font-black leading-none ${m.color}`} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                      {m.after}
                    </span>
                    <span className={`text-xs font-bold ${m.color}`} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                      {m.lift} {m.liftLabel}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Prototype badge */}
          <div className="shrink-0 flex items-center gap-2 pl-4 border-l border-border">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span
              className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Founder Demo
            </span>
          </div>
        </div>

        {/* Expanded metric detail */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border">
            {metrics.filter((m) => m.id === expanded).map((m) => (
              <div key={m.id} className="flex items-start justify-between gap-8">
                <div className="flex items-start gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                      {m.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setExpanded(null)}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
