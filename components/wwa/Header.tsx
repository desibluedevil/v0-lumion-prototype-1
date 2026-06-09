"use client"

import { Phone } from "lucide-react"
import { openApplyModal } from "./ApplyModal"
import { focusMia } from "./MiaPanel"

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">

      {/* Tagline strip */}
      <div className="bg-foreground text-background text-center py-1.5">
        <span
          className="text-[10px] font-black tracking-[0.3em] uppercase"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          Building a Stronger America
        </span>
      </div>

      {/* Main header bar */}
      <div className="bg-background border-b border-border">
        <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 shrink-0"
          >
            <div className="w-10 h-10 bg-primary flex items-center justify-center">
              <span
                className="text-primary-foreground font-black text-xs tracking-widest"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                WWA
              </span>
            </div>
            <div className="leading-tight">
              <div
                className="text-foreground font-black text-sm tracking-widest uppercase"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Western
              </div>
              <div
                className="text-foreground font-black text-sm tracking-widest uppercase"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Welding Academy
              </div>
            </div>
          </button>

          {/* Nav */}
          <nav className="flex items-center gap-7">
            {[
              { label: "Programs",     action: () => scrollTo("programs") },
              { label: "Financial Aid",action: () => scrollTo("financial-aid") },
              { label: "Housing",      action: () => scrollTo("mia-section") },
              { label: "About Us",     action: () => scrollTo("mission") },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="text-xs font-black tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right: phone + CTAs */}
          <div className="flex items-center gap-4 shrink-0">
            <a
              href="tel:18005551234"
              className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              <Phone size={13} />
              1-800-555-1234
            </a>

            <button
              onClick={() => focusMia()}
              className="px-4 py-2 border border-border text-xs font-black tracking-widest uppercase text-foreground hover:bg-secondary transition-colors"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Program Quiz
            </button>

            <button
              onClick={openApplyModal}
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-black tracking-widest uppercase hover:bg-primary/90 transition-colors"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Apply Now
            </button>
          </div>

        </div>
      </div>
    </header>
  )
}
