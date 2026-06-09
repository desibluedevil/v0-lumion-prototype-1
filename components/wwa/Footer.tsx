"use client"

import { Phone } from "lucide-react"
import { openApplyModal } from "./ApplyModal"

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}

function focusMia() {
  const el = document.getElementById("hero-mia")
  if (!el) return
  el.scrollIntoView({ behavior: "smooth", block: "center" })
  el.style.outline = "2px solid var(--color-primary)"
  setTimeout(() => { el.style.outline = "" }, 1200)
}

const LINKS = [
  {
    title: "Programs",
    links: [
      { label: "Foundational Pipe Welder", action: () => scrollTo("programs") },
      { label: "Professional Pipe Welder",  action: () => scrollTo("programs") },
      { label: "Expert Pipe Welder",         action: () => scrollTo("programs") },
      { label: "Program Comparison",         action: () => scrollTo("programs") },
    ],
  },
  {
    title: "Admissions",
    links: [
      { label: "Apply Now",      action: openApplyModal },
      { label: "Is WWA a Fit?",  action: focusMia },
      { label: "Financial Aid",  action: () => scrollTo("financial-aid") },
      { label: "Housing Info",   action: () => scrollTo("proof") },
    ],
  },
  {
    title: "Academy",
    links: [
      { label: "About WWA",    action: () => scrollTo("proof") },
      { label: "Faculty & Staff", action: () => scrollTo("proof") },
      { label: "Campus Tour",  action: () => scrollTo("mia-section") },
      { label: "Alumni",       action: () => scrollTo("proof") },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="grid grid-cols-5 gap-8 mb-12">

          {/* Brand */}
          <div className="col-span-2 space-y-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-primary flex items-center justify-center shrink-0">
                <span className="text-primary-foreground text-xs font-bold" style={{ fontFamily: "var(--font-barlow-condensed)" }}>WWA</span>
              </div>
              <div className="leading-tight">
                <div className="text-foreground font-bold text-sm tracking-widest uppercase" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Western</div>
                <div className="text-foreground font-bold text-sm tracking-widest uppercase" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Welding Academy</div>
              </div>
            </button>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Wyoming&apos;s premier pipeline welding school. Hands-on training, career placement, and housing — all in one place.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary" />
              <span className="text-foreground text-sm font-bold tracking-widest uppercase" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Gillette, WY</span>
            </div>
            <a
              href="tel:18005551234"
              className="flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              <Phone size={13} />
              1-800-555-1234
            </a>
          </div>

          {/* Link columns */}
          {LINKS.map((col) => (
            <div key={col.title} className="space-y-4">
              <h4
                className="text-foreground font-bold text-xs tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={link.action}
                      className="text-muted-foreground text-sm hover:text-foreground transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 flex items-center justify-between">
          <p className="text-muted-foreground text-xs">
            © 2026 Western Welding Academy. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Use", "Accreditation"].map((item) => (
              <span key={item} className="text-muted-foreground text-xs cursor-default select-none">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
