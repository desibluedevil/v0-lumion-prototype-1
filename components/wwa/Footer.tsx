"use client"

import { MapPin, Phone } from "lucide-react"
import { openApplyModal } from "./ApplyModal"
import { focusMia } from "./MiaPanel"

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}

const COLUMNS = [
  {
    title: "Programs",
    links: [
      { label: "Foundational Pipe Welder", action: () => scrollTo("programs"), active: true },
      { label: "Professional Pipe Welder",  action: () => scrollTo("programs"), active: true },
      { label: "Expert Pipe Welder",         action: () => scrollTo("programs"), active: true },
      { label: "Program Comparison",         action: () => scrollTo("programs"), active: true },
    ],
  },
  {
    title: "Admissions",
    links: [
      { label: "Apply Now",      action: openApplyModal,              active: true },
      { label: "Is WWA a Fit?",  action: () => focusMia(),            active: true },
      { label: "Financial Aid",  action: () => scrollTo("financial-aid"), active: true },
      { label: "Housing Info",   action: () => scrollTo("mia-section"),   active: true },
    ],
  },
  {
    title: "Academy",
    links: [
      { label: "About WWA",       action: () => scrollTo("mission"),     active: true },
      { label: "Faculty & Staff", action: () => scrollTo("mission"),     active: true },
      { label: "Campus Tour",     action: () => scrollTo("mia-section"), active: true },
      { label: "Alumni",          action: () => scrollTo("proof"),       active: true },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Events",               action: null, active: false },
      { label: "Blog",                 action: null, active: false },
      { label: "Career Opportunities", action: null, active: false },
      { label: "Contact Us",           action: null, active: false },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-background">
      {/* Brand accent rule */}
      <div className="h-1 bg-primary w-full" />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-8 pt-12 lg:pt-16 pb-8 lg:pb-10">

        {/* Main grid: brand col + 4 link cols */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10 mb-10 lg:mb-14">

          {/* Brand column — full width on mobile, 1 col on desktop */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 space-y-6">
            {/* Logo mark */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-3 group"
              aria-label="Back to top"
            >
              <div className="w-12 h-12 bg-primary flex items-center justify-center shrink-0">
                <span
                  className="text-white text-sm font-black tracking-widest"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  WWA
                </span>
              </div>
              <div className="leading-snug">
                <div
                  className="text-white font-black text-sm tracking-[0.15em] uppercase group-hover:text-primary transition-colors"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  Western
                </div>
                <div
                  className="text-white font-black text-sm tracking-[0.15em] uppercase group-hover:text-primary transition-colors"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  Welding Academy
                </div>
              </div>
            </button>

            <p className="text-white/50 text-xs leading-relaxed">
              Wyoming&apos;s premier pipeline welding school. Hands-on training, career placement, and all-inclusive housing.
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-primary shrink-0" />
                <span
                  className="text-white/70 text-xs tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  Gillette, WY
                </span>
              </div>
              <a
                href="tel:18005551234"
                className="flex items-center gap-2 text-white/70 text-xs hover:text-primary transition-colors"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                <Phone size={12} className="shrink-0" />
                1-800-555-1234
              </a>
            </div>

            {/* Apply CTA */}
            <button
              onClick={openApplyModal}
              className="mt-2 w-full py-2.5 bg-primary text-white text-xs font-black tracking-[0.18em] uppercase hover:bg-primary/90 transition-colors"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Apply Now
            </button>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title} className="space-y-5">
              {/* Column heading with accent rule */}
              <div className="space-y-2">
                <div className="w-6 h-0.5 bg-primary" />
                <h4
                  className="text-white font-black text-xs tracking-[0.22em] uppercase"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  {col.title}
                </h4>
              </div>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.active ? (
                      <button
                        onClick={link.action!}
                        className="text-white/50 text-xs hover:text-primary transition-colors text-left leading-relaxed"
                        style={{ fontFamily: "var(--font-barlow-condensed)" }}
                      >
                        {link.label}
                      </button>
                    ) : (
                      <span
                        className="text-white/20 text-xs cursor-default text-left leading-relaxed select-none"
                        style={{ fontFamily: "var(--font-barlow-condensed)" }}
                        title="Coming soon"
                      >
                        {link.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            © 2026 Western Welding Academy. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Use", "Accreditation"].map((item) => (
              <button
                key={item}
                className="text-white/30 text-xs hover:text-white/60 transition-colors"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}
