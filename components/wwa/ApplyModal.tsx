"use client"

import { useEffect, useState } from "react"
import { X, ArrowRight, Phone } from "lucide-react"

// ── Simple event bus so any component can trigger the modal ──────────────────
type Listener = () => void
const listeners: Set<Listener> = new Set()

export function openApplyModal() {
  listeners.forEach((fn) => fn())
}

// ── Modal component ──────────────────────────────────────────────────────────
export default function ApplyModal() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [program, setProgram] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const canSubmit = name.trim().length > 0 && phone.trim().length > 0 && !submitted

  function handleClose() {
    setOpen(false)
    // Reset form on close so it's fresh next time
    setName("")
    setPhone("")
    setProgram("")
    setSubmitted(false)
  }

  useEffect(() => {
    const handler = () => setOpen(true)
    listeners.add(handler)
    return () => { listeners.delete(handler) }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose() }
    if (open) document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div className="relative w-full max-w-lg bg-card border border-border shadow-2xl">
        {/* Red top bar */}
        <div className="h-1 w-full bg-primary" />

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border">
          <div>
            <p
              className="text-[10px] font-black tracking-[0.25em] uppercase text-primary mb-0.5"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Western Welding Academy
            </p>
            <h2
              className="text-foreground font-black uppercase tracking-tight leading-none"
              style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "1.6rem" }}
            >
              Start Your Application
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-7 space-y-6">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Applications are reviewed on a rolling basis. Most students hear back within 2 business days.
          </p>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label
                className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Full Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jake Morrison"
                autoComplete="given-name"
                disabled={submitted}
                className="w-full bg-background border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Phone Number <span className="text-primary">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(307) 555-0100"
                autoComplete="tel"
                disabled={submitted}
                className="w-full bg-background border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Program Interest
              </label>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                disabled={submitted}
                className="w-full bg-background border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors appearance-none disabled:opacity-50"
              >
                <option value="">Select a program</option>
                <option value="foundational">Foundational Pipe Welder — 12 weeks</option>
                <option value="professional">Professional Pipe Welder — 19 weeks</option>
                <option value="expert">Expert Pipe Welder — 24 weeks</option>
              </select>
            </div>
          </div>

          {submitted ? (
            <div className="flex items-center justify-center gap-2.5 py-3.5 bg-secondary border border-border">
              <span className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 block" />
              </span>
              <p
                className="text-sm font-black tracking-widest uppercase text-foreground"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Application Received
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { if (canSubmit) setSubmitted(true) }}
              disabled={!canSubmit}
              className="w-full py-3.5 bg-primary text-primary-foreground font-black tracking-widest uppercase text-sm hover:enabled:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Submit Application
              <ArrowRight size={15} />
            </button>
          )}
          {!canSubmit && !submitted && (
            <p className="text-center text-[10px] text-muted-foreground/60 -mt-3">
              Enter your name and phone number to continue.
            </p>
          )}

          <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
            <Phone size={11} />
            <span>Prefer to call? </span>
            <a href="tel:18005551234" className="text-foreground font-semibold hover:text-primary transition-colors">
              1-800-555-1234
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
