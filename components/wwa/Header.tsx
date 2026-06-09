"use client"

import { Phone, ChevronDown } from "lucide-react"

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center justify-between gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)" }}>WWA</span>
          </div>
          <div className="leading-tight">
            <div className="text-foreground font-bold text-sm tracking-widest uppercase" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Western</div>
            <div className="text-foreground font-bold text-sm tracking-widest uppercase" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Welding Academy</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-8">
          {["Programs", "Financial Aid", "Housing", "About Us"].map((item) => (
            <button
              key={item}
              className="flex items-center gap-1 text-sm font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              {item}
              <ChevronDown size={14} strokeWidth={2.5} />
            </button>
          ))}
        </nav>

        {/* Right CTAs */}
        <div className="flex items-center gap-4 shrink-0">
          <a
            href="tel:18005551234"
            className="flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            <Phone size={14} />
            1-800-555-1234
          </a>
          <button className="px-5 py-2 border border-border text-sm font-bold tracking-widest uppercase text-foreground hover:bg-secondary transition-colors" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            Program Quiz
          </button>
          <button className="px-5 py-2 bg-primary text-primary-foreground text-sm font-bold tracking-widest uppercase hover:bg-primary/90 transition-colors" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            Apply Now
          </button>
        </div>
      </div>
    </header>
  )
}
