"use client"

import { useState, useEffect } from "react"
import Header from "@/components/wwa/Header"
import Hero from "@/components/wwa/Hero"
import ProofBand from "@/components/wwa/ProofBand"
import Mission from "@/components/wwa/Mission"
import Programs from "@/components/wwa/Programs"
import MiaSection from "@/components/wwa/MiaSection"
import Footer from "@/components/wwa/Footer"
import ApplyModal from "@/components/wwa/ApplyModal"
import MiaPanel from "@/components/wwa/MiaPanel"
import { MessageSquare, X } from "lucide-react"

// ─── Floating Mia wrapper ─────────────────────────────────────────────────────
// Desktop: always-visible fixed panel pinned to the top-right of the viewport.
// Mobile: collapsed by default; a FAB in the bottom-right toggles it open.
//
// Header height: tagline strip (28px / 1.75rem) + bar (64px / 4rem) = 92px total.
// We add a small 8px gap below that → top = 100px.

function FloatingMia() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopVisible, setDesktopVisible] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Avoid SSR mismatch — only render the fixed overlay after mount
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return (
    <>
      {/* ── Desktop: fixed panel, dismissible ───────────────────────── */}
      {desktopVisible && (
        <div
          className="hidden lg:flex flex-col fixed z-40"
          style={{
            top: "calc(1.75rem + 4rem + 8px)", // tagline + header + gap
            right: "1.5rem",
            width: "clamp(340px, 26vw, 420px)",
            height: "calc(100vh - 1.75rem - 4rem - 8px - 24px)",
          }}
        >
          <MiaPanel onClose={() => setDesktopVisible(false)} />
        </div>
      )}

      {/* Desktop re-open FAB — shown only after panel is closed */}
      {!desktopVisible && (
        <button
          type="button"
          onClick={() => setDesktopVisible(true)}
          className="hidden lg:flex fixed bottom-5 right-5 z-50 items-center gap-2 px-4 py-3 bg-primary text-primary-foreground text-xs font-black tracking-widest uppercase hover:bg-primary/90 transition-colors shadow-lg"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
          aria-label="Reopen Mia fit check"
        >
          <MessageSquare size={14} />
          Talk to Mia
        </button>
      )}

      {/* ── Mobile: FAB toggle ───────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        className="lg:hidden fixed bottom-5 right-5 z-50 w-14 h-14 bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
        aria-label={mobileOpen ? "Close Mia panel" : "Open Mia fit check"}
      >
        {mobileOpen ? <X size={22} /> : <MessageSquare size={22} />}
      </button>

      {/* ── Mobile: slide-up panel ───────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-x-0 bottom-0 z-40 flex flex-col"
          style={{ top: "calc(1.75rem + 4rem)" }}
        >
          <MiaPanel onClose={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main className="min-h-screen bg-background" id="top">
      <Header />
      <Hero />
      <ProofBand />
      <Mission />
      <Programs />
      <MiaSection />
      <Footer />
      <ApplyModal />
      <FloatingMia />
    </main>
  )
}
