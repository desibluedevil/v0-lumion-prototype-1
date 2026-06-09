import Image from "next/image"
import MiaPanel from "./MiaPanel"
import { CheckCircle } from "lucide-react"

const bullets = [
  "Matches experience level to the right program automatically",
  "Surfaces financing and housing answers before they bounce",
  "Routes high-intent leads directly to enrollment — with context",
  "Gives the advisor a script, not a cold contact form",
]

export default function MiaSection() {
  return (
    <section className="py-24 bg-secondary/10 border-t border-border">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="grid grid-cols-12 gap-12 items-start">

          {/* Left — 6 cols */}
          <div className="col-span-6 space-y-8 pt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px w-10 bg-primary" />
                <span
                  className="text-primary text-[10px] font-black tracking-[0.2em] uppercase"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  Why Mia
                </span>
              </div>
              <h2
                className="text-foreground uppercase tracking-tight text-balance"
                style={{
                  fontFamily: "var(--font-barlow-condensed)",
                  fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                  fontWeight: 900,
                  lineHeight: 1.05,
                }}
              >
                Most Visitors Leave<br />Without Applying.
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                They&apos;re not uninterested. They have a question about cost, location, or whether they&apos;re experienced enough — and the current site doesn&apos;t answer it at the moment it needs to be answered.
              </p>
              <p className="text-foreground text-base leading-relaxed font-medium">
                Mia intercepts that hesitation, qualifies the lead, and hands it to enrollment with full context.
              </p>
            </div>

            {/* Bullets */}
            <div className="space-y-2.5">
              {bullets.map((b) => (
                <div key={b} className="flex items-start gap-3">
                  <CheckCircle size={15} className="text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground text-sm leading-relaxed">{b}</span>
                </div>
              ))}
            </div>

            {/* Pull quote */}
            <div className="border-l-2 border-primary pl-5 py-1.5">
              <p className="text-foreground font-semibold text-sm leading-relaxed">
                This is not a generic chatbot bolted onto a contact form. It&apos;s a guided qualification flow built for the specific objections a welding school prospect has.
              </p>
            </div>

            {/* Facility photo */}
            <div className="w-full h-52 relative overflow-hidden border border-border">
              <Image
                src="/images/wwa-facility.png"
                alt="Western Welding Academy training facility — Gillette, Wyoming"
                fill
                className="object-cover object-center"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-3">
                <p
                  className="text-muted-foreground text-[10px] tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  Pipeline Training Facility — Gillette, WY
                </p>
              </div>
            </div>
          </div>

          {/* Right — Mia panel — 6 cols */}
          <div className="col-span-6 sticky top-24">
            <div className="h-0.5 w-full bg-primary mb-0" />
            <MiaPanel />
            <p className="mt-3 text-center text-[11px] text-muted-foreground tracking-wide">
              No account. No commitment. Just a straight answer.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
