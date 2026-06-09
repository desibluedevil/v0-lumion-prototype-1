import MiaPanel from "./MiaPanel"
import { CheckCircle } from "lucide-react"

const bullets = [
  "Match your experience level to the right program",
  "Understand if the timeline works for your life",
  "Get honest answers about financing and cost",
  "Know what hiring looks like before you commit",
]

export default function MiaSection() {
  return (
    <section className="py-24 bg-secondary/20 border-t border-border">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="grid grid-cols-12 gap-12 items-start">
          {/* Left — content — 6 cols */}
          <div className="col-span-6 space-y-8 pt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-px w-12 bg-primary" />
                <span
                  className="text-primary text-xs font-bold tracking-[0.2em] uppercase"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  Meet Mia
                </span>
              </div>
              <h2
                className="text-foreground leading-tight uppercase tracking-tight text-balance"
                style={{
                  fontFamily: "var(--font-barlow-condensed)",
                  fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                  fontWeight: 900,
                }}
              >
                Not Sure If Welding School Is Right For You?
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Most people who visit our site are interested but uncertain. Mia is a guided enrollment decision assistant — not a chatbot. She&apos;ll ask you 4 questions and give you a clear, honest picture of whether WWA makes sense for your situation.
              </p>
            </div>

            {/* Bullets */}
            <div className="space-y-3">
              {bullets.map((b) => (
                <div key={b} className="flex items-start gap-3">
                  <CheckCircle size={16} className="text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground text-sm leading-relaxed">{b}</span>
                </div>
              ))}
            </div>

            {/* Differentiator callout */}
            <div className="border-l-2 border-primary pl-5 py-2">
              <p className="text-foreground font-semibold text-sm leading-relaxed">
                This is not a sales tool. It&apos;s designed to help you make a better decision — even if that decision is not enrolling right now.
              </p>
            </div>

            {/* Photo placeholder */}
            <div className="w-full h-48 bg-card border border-border flex items-center justify-center overflow-hidden">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 mx-auto bg-muted border border-border flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-muted-foreground" />
                </div>
                <p
                  className="text-muted-foreground text-[10px] tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  Students in Welding Booths — Gillette Campus
                </p>
              </div>
            </div>
          </div>

          {/* Right — Mia panel — 6 cols */}
          <div className="col-span-6 sticky top-24">
            <div className="mb-3 flex items-center gap-2">
              <span
                className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Live Preview
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <MiaPanel />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              No account needed. No commitment. Just clarity.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
