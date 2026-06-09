"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronRight, Phone, MessageSquare, Mail, Check, User, Clipboard, AlertCircle } from "lucide-react"

// ─── Data ─────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: "goal",
    label: "Goal",
    question: "What are you hoping welding can do for you?",
    options: [
      "Start a higher-paying career",
      "Get into pipeline / travel welding",
      "Learn a skilled trade without college",
      "Upgrade my current welding skills",
      "Not sure yet — just exploring",
    ],
  },
  {
    id: "experience",
    label: "Experience",
    question: "How much welding experience do you have?",
    options: [
      "None — complete beginner",
      "Some shop class or hobby welding",
      "Welded on the job before",
      "Experienced welder — want advanced certs",
    ],
  },
  {
    id: "timeline",
    label: "Timeline",
    question: "When would you want to start, if the fit is right?",
    options: [
      "ASAP — ready now",
      "Next 30–90 days",
      "Later this year",
      "Just researching right now",
    ],
  },
  {
    id: "concern",
    label: "Concern",
    question: "What's the biggest thing holding you back?",
    options: [
      "Cost — can I afford it?",
      "Location — can I move to Wyoming?",
      "Experience — do I need prior skills?",
      "Outcome — will I actually get hired?",
      "Fit — which program is right for me?",
    ],
  },
]

const CONCERN_RESPONSES: Record<string, { headline: string; body: string }> = {
  "Cost — can I afford it?": {
    headline: "Programs range from $17,050 to $35,800. Everything included.",
    body: "Housing, tools, and materials are bundled in — no surprise costs. Financing and payment plans are available. Most students break even within 8 months of graduating.",
  },
  "Location — can I move to Wyoming?": {
    headline: "Housing is included. We handle the logistics.",
    body: "Every student gets a fully furnished home near campus. Most of our students relocate from out of state. We've done this 2,000+ times.",
  },
  "Experience — do I need prior skills?": {
    headline: "Zero experience required for our Foundational program.",
    body: "WWA trains from the ground up. You don't need to have touched a welder before. Our instructors have seen every level — including none.",
  },
  "Outcome — will I actually get hired?": {
    headline: "94% of WWA graduates get hired. The pipeline industry is short-staffed.",
    body: "We connect you with employers before you graduate. Pipeline welders earn $80K–$150K+. The demand isn't going away.",
  },
  "Fit — which program is right for me?": {
    headline: "Three paths. One fits your experience and goals.",
    body: "Foundational (12 wks) for beginners. Professional Pipe (19 wks) for career changers with some experience. Expert Pipe (24 wks) for experienced welders chasing the highest certifications.",
  },
}

function recommendProgram(experience: string): { name: string; duration: string; tuition: string } {
  if (experience.includes("Experienced")) return { name: "Expert Pipe Welder", duration: "24 weeks", tuition: "$35,800" }
  if (experience.includes("on the job")) return { name: "Professional Pipe Welder", duration: "19 weeks", tuition: "$27,600" }
  return { name: "Foundational Pipe Welder", duration: "12 weeks", tuition: "$17,050" }
}

function intentLevel(timeline: string): "High" | "Medium" | "Researching" {
  if (timeline.includes("ASAP") || timeline.includes("30–90")) return "High"
  if (timeline.includes("Later this year")) return "Medium"
  return "Researching"
}

function advisorOpener(answers: string[]): string {
  const [goal, , timeline, concern] = answers
  const goalShort = goal?.split("—")[0].trim().toLowerCase() ?? "a welding career"
  const concernShort = concern?.split("—")[0].replace(/^.+?—\s*/, "").toLowerCase() ?? "their main concern"
  return `"Hey [Name], Mia flagged your fit check — you're looking to ${goalShort}, and your main question was around ${concernShort}. Do you have 10 minutes to walk through your options?"`
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = { role: "mia" | "user"; text: string }
type Phase = "idle" | "flow" | "grounded" | "summary" | "capture" | "handoff"
type ContactPref = "Text" | "Call" | "Email"
type BestTime = "Morning" | "Afternoon" | "Evening"

interface LeadData {
  name: string
  phone: string
  email: string
  contact: ContactPref
  time: BestTime
}

// ─── Funnel state mapping ─────────────────────────────────────────────────────

const FUNNEL = ["Visitor", "Qualified Lead", "Hot Lead", "Enrollment Convo", "Application"]

function funnelIndexFor(phase: Phase, answersCount: number): number {
  if (phase === "handoff") return 3
  if (phase === "capture") return 2
  if (phase === "summary") return 2
  if (phase === "grounded") return 1
  if (phase === "flow" && answersCount >= 3) return 1
  return 0
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MiaPanel({ compact = false }: { compact?: boolean }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [optionsLocked, setOptionsLocked] = useState<Set<number>>(new Set())
  const [phase, setPhase] = useState<Phase>("idle")
  const [lead, setLead] = useState<LeadData>({ name: "", phone: "", email: "", contact: "Text", time: "Morning" })
  const [activeTab, setActiveTab] = useState<"student" | "enrollment">("student")
  const scrollRef = useRef<HTMLDivElement>(null)

  const [goal, experience, timeline, concern] = answers
  const program = recommendProgram(experience ?? "")
  const intent = intentLevel(timeline ?? "")
  const funnelIndex = funnelIndexFor(phase, answers.length)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, phase])

  const showOptions =
    phase === "flow" &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "mia" &&
    !optionsLocked.has(stepIndex)

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function pushMia(text: string, delay = 0) {
    const push = () => setMessages((prev) => [...prev, { role: "mia", text }])
    delay > 0 ? setTimeout(push, delay) : push()
  }

  // ── Flow actions ──────────────────────────────────────────────────────────────

  function startFlow() {
    setPhase("flow")
    setMessages([
      { role: "mia", text: "I'll ask 4 questions to see if WWA is a realistic fit for you. Honest answers — no pressure either way." },
    ])
    setTimeout(() => pushMia(STEPS[0].question), 500)
  }

  function handleOption(option: string) {
    const newAnswers = [...answers, option]
    setAnswers(newAnswers)
    setOptionsLocked((prev) => new Set(prev).add(stepIndex))
    setMessages((prev) => [...prev, { role: "user", text: option }])

    const next = stepIndex + 1

    if (next < STEPS.length) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "mia", text: STEPS[next].question }])
        setStepIndex(next)
      }, 350)
    } else {
      // Concern answered — move to grounded response
      const resp = CONCERN_RESPONSES[option]
      setPhase("grounded")
      if (resp) {
        setTimeout(() => pushMia(`${resp.headline}\n\n${resp.body}`), 350)
      } else {
        setTimeout(() => pushMia("That's a fair concern. Our admissions team can give you a straight answer based on your specific situation."), 350)
      }
      setTimeout(() => pushMia("Based on your answers, I can show you exactly which program fits, what it costs, and what to expect. Want to see your fit summary?"), 900)
    }
  }

  function showFitSummary() {
    setPhase("summary")
    setMessages((prev) => [...prev, { role: "user", text: "Yes — show me the summary" }])
  }

  function goToCapture() {
    setPhase("capture")
  }

  function submitLead() {
    if (!lead.name || !lead.phone) return
    setPhase("handoff")
    setActiveTab("student")
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: Handoff
  // ─────────────────────────────────────────────────────────────────────────────

  if (phase === "handoff") {
    return (
      <PanelShell compact={compact}>
        <PanelHeader />
        <FunnelStrip funnelIndex={funnelIndex} />
        <div className="flex border-b border-border shrink-0">
          {(["student", "enrollment"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === tab ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              {tab === "student" ? <User size={11} /> : <Clipboard size={11} />}
              {tab === "student" ? "Student Confirmation" : "Enrollment View"}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {activeTab === "student" ? (
            <StudentConfirmation lead={lead} answers={answers} program={program} intent={intent} />
          ) : (
            <EnrollmentView lead={lead} answers={answers} program={program} intent={intent} advisorScript={advisorOpener(answers)} />
          )}
        </div>
      </PanelShell>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: Lead Capture
  // ─────────────────────────────────────────────────────────────────────────────

  if (phase === "capture") {
    return (
      <PanelShell compact={compact}>
        <PanelHeader />
        <FunnelStrip funnelIndex={funnelIndex} />
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <MiaBubble text="Last step. I'll route your fit summary to the right enrollment advisor — they'll reach out within one business day." />
          <div className="space-y-3">
            <Field label="First name" required>
              <input
                type="text"
                value={lead.name}
                onChange={(e) => setLead({ ...lead, name: e.target.value })}
                placeholder="Your name"
                className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </Field>
            <Field label="Phone" required>
              <input
                type="tel"
                value={lead.phone}
                onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                placeholder="(555) 000-0000"
                className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={lead.email}
                onChange={(e) => setLead({ ...lead, email: e.target.value })}
                placeholder="you@email.com"
                className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </Field>
            <Field label="How should we reach you?">
              <div className="flex gap-2">
                {(["Text", "Call", "Email"] as ContactPref[]).map((opt) => {
                  const Icon = opt === "Text" ? MessageSquare : opt === "Call" ? Phone : Mail
                  return (
                    <button
                      key={opt}
                      onClick={() => setLead({ ...lead, contact: opt })}
                      className={`flex-1 py-2 border text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors ${
                        lead.contact === opt
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                      }`}
                      style={{ fontFamily: "var(--font-barlow-condensed)" }}
                    >
                      <Icon size={12} /> {opt}
                    </button>
                  )
                })}
              </div>
            </Field>
            <Field label="Best time to reach you">
              <div className="flex gap-2">
                {(["Morning", "Afternoon", "Evening"] as BestTime[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setLead({ ...lead, time: opt })}
                    className={`flex-1 py-2 border text-xs font-bold tracking-wider uppercase transition-colors ${
                      lead.time === opt
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <button
            onClick={submitLead}
            disabled={!lead.name || !lead.phone}
            className="w-full py-3 bg-primary text-primary-foreground font-black tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Send to Enrollment Team
            <ChevronRight size={15} />
          </button>
        </div>
      </PanelShell>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: Main chat
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <PanelShell compact={compact}>
      <PanelHeader />

      {/* Step progress — only visible during flow */}
      {phase !== "idle" && <StepProgress stepIndex={stepIndex} phase={phase} />}

      {/* Funnel strip */}
      {phase !== "idle" && <FunnelStrip funnelIndex={funnelIndex} />}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">

        {phase === "idle" ? (
          <IdleState onStart={startFlow} />
        ) : (
          <>
            {messages.map((msg, i) =>
              msg.role === "mia" ? (
                <MiaBubble key={i} text={msg.text} />
              ) : (
                <UserBubble key={i} text={msg.text} />
              )
            )}

            {/* Option chips */}
            {showOptions && (
              <div className="ml-10 space-y-1.5 pt-1">
                {STEPS[stepIndex].options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOption(opt)}
                    className="w-full text-left px-4 py-2.5 border border-border text-sm text-muted-foreground hover:border-primary hover:text-foreground hover:bg-secondary/40 transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Grounded → CTA */}
            {phase === "grounded" && (
              <div className="ml-10 pt-1">
                <button
                  onClick={showFitSummary}
                  className="w-full py-3 bg-primary text-primary-foreground font-black tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  See My Fit Summary
                  <ChevronRight size={15} />
                </button>
              </div>
            )}

            {/* Fit Summary */}
            {phase === "summary" && (
              <FitSummaryCard answers={answers} program={program} intent={intent} onCapture={goToCapture} />
            )}
          </>
        )}
      </div>
    </PanelShell>
  )
}

// ─── Idle State ───────────────────────────────────────────────────────────────

function IdleState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col h-full justify-between py-1">
      <div className="space-y-3">
        <MiaBubble text="Most people who visit WWA's site are interested but unsure. I'm here to help you figure out if this is actually a fit — not to pitch you." />
        <MiaBubble text="4 questions. 2 minutes. Honest answer at the end." />
        <div className="ml-10 flex items-start gap-2 bg-secondary/50 border border-border px-3 py-2.5">
          <AlertCircle size={13} className="text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            If WWA isn&apos;t the right fit, I&apos;ll tell you that too. No pressure, no spam.
          </p>
        </div>
      </div>
      <button
        onClick={onStart}
        className="w-full mt-5 py-3.5 bg-primary text-primary-foreground font-black tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        style={{ fontFamily: "var(--font-barlow-condensed)" }}
      >
        Start Fit Check — 2 Min
        <ChevronRight size={15} />
      </button>
    </div>
  )
}

// ─── Fit Summary Card ─────────────────────────────────────────────────────────

function FitSummaryCard({
  answers,
  program,
  intent,
  onCapture,
}: {
  answers: string[]
  program: { name: string; duration: string; tuition: string }
  intent: "High" | "Medium" | "Researching"
  onCapture: () => void
}) {
  const [, , timeline, concern] = answers
  const intentColor = intent === "High" ? "text-green-400" : intent === "Medium" ? "text-yellow-400" : "text-muted-foreground"
  const intentBg = intent === "High" ? "bg-green-500/10 border-green-500/30" : intent === "Medium" ? "bg-yellow-500/10 border-yellow-500/30" : "bg-border/30 border-border"

  return (
    <div className="ml-2 space-y-3 pt-1">
      {/* Summary card */}
      <div className="border border-border bg-secondary">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <span
            className="text-xs font-black tracking-widest uppercase text-foreground"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Your Fit Summary
          </span>
          <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 border ${intentBg} ${intentColor}`} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            {intent} Intent
          </span>
        </div>
        <div className="px-4 py-3 space-y-2">
          {[
            ["Program match", program.name],
            ["Duration", program.duration],
            ["Tuition (all-in)", program.tuition],
            ["Timeline", timeline ?? "—"],
            ["Main concern", concern?.split("—")[0].trim() ?? "—"],
            ["Recommended step", "Talk to enrollment today"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-start gap-4 text-xs">
              <span className="text-muted-foreground shrink-0">{label}</span>
              <span className="font-semibold text-foreground text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <MiaBubble text="Want me to send this to an enrollment advisor? They can answer specifics on financing, housing, and next start dates — usually within one business day." />

      <div className="ml-10 space-y-2">
        <button
          onClick={onCapture}
          className="w-full py-3 bg-primary text-primary-foreground font-black tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          Yes — Connect Me With Enrollment
          <ChevronRight size={15} />
        </button>
        <button
          className="w-full py-2.5 border border-border text-xs font-bold tracking-widest uppercase text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          Download Program Guide
        </button>
      </div>
    </div>
  )
}

// ─── Student Confirmation ─────────────────────────────────────────────────────

function StudentConfirmation({
  lead,
  answers,
  program,
  intent,
}: {
  lead: LeadData
  answers: string[]
  program: { name: string }
  intent: "High" | "Medium" | "Researching"
}) {
  const [, , timeline] = answers
  const intentColor = intent === "High" ? "text-green-400" : intent === "Medium" ? "text-yellow-400" : "text-muted-foreground"

  return (
    <>
      <div className="flex items-center gap-3 py-3 border-b border-border">
        <div className="w-8 h-8 bg-green-500/15 border border-green-500/40 flex items-center justify-center shrink-0">
          <Check size={15} className="text-green-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{"You're all set."}</p>
          <p className="text-xs text-muted-foreground mt-0.5">An advisor will reach out via {lead.contact.toLowerCase()} — {lead.time.toLowerCase()}.</p>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          What we sent to enrollment
        </p>
        <div className="border border-border bg-secondary p-3 space-y-2">
          {[
            ["Name", lead.name || "—"],
            ["Intent", intent],
            ["Timeline", timeline ?? "—"],
            ["Program interest", program.name],
            ["Main concern", answers[3]?.split("—")[0].trim() ?? "—"],
            ["Contact", `${lead.contact} · ${lead.time}`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-start gap-4 text-xs">
              <span className="text-muted-foreground shrink-0">{label}</span>
              <span className={`font-semibold text-right ${label === "Intent" ? intentColor : "text-foreground"}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-border p-3 space-y-1">
        <p className="text-xs text-muted-foreground">Questions before they reach out?</p>
        <p className="text-sm font-bold text-foreground">1-800-580-4173</p>
        <p className="text-xs text-muted-foreground">admissions@westernweldingacademy.com</p>
      </div>
    </>
  )
}

// ─── Enrollment View ──────────────────────────────────────────────────────────

function EnrollmentView({
  lead,
  answers,
  program,
  intent,
  advisorScript,
}: {
  lead: LeadData
  answers: string[]
  program: { name: string; duration: string }
  intent: "High" | "Medium" | "Researching"
  advisorScript: string
}) {
  const [goal, , timeline] = answers
  const intentColor = intent === "High" ? "text-green-400" : intent === "Medium" ? "text-yellow-400" : "text-muted-foreground"
  const intentBg = intent === "High" ? "bg-green-500/10 border-green-500/30" : intent === "Medium" ? "bg-yellow-500/10 border-yellow-500/30" : "bg-secondary border-border"

  return (
    <>
      {/* Lead header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <p className="text-sm font-bold text-foreground">{lead.name || "Anonymous Lead"}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Mia-qualified · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
        </div>
        <span
          className={`text-[10px] font-black tracking-widest uppercase px-2.5 py-1 border ${intentBg} ${intentColor}`}
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          {intent} Intent
        </span>
      </div>

      {/* Why Mia routed */}
      <InfoSection title="Why Mia Routed This Lead">
        <div className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
          <p>Goal: <span className="text-foreground">{goal ?? "—"}</span></p>
          <p>Intent: <span className={`font-semibold ${intentColor}`}>{intent}</span> — {intent === "High" ? "ready ASAP or within 30–90 days" : intent === "Medium" ? "later this year" : "still researching"}</p>
          <p>Concern is addressable: <span className="text-foreground">{answers[3]?.split("—")[0].trim() ?? "—"}</span></p>
          <p>Program fit clear: <span className="text-foreground font-semibold">{program.name}</span></p>
        </div>
      </InfoSection>

      {/* Student snapshot */}
      <InfoSection title="Student Snapshot">
        {[
          ["Phone", lead.phone || "—"],
          ["Email", lead.email || "—"],
          ["Preferred contact", `${lead.contact} · ${lead.time}`],
          ["Timeline", timeline ?? "—"],
          ["Program", program.name],
          ["Duration", program.duration],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between items-start gap-4 text-xs">
            <span className="text-muted-foreground shrink-0">{l}</span>
            <span className="font-semibold text-foreground text-right">{v}</span>
          </div>
        ))}
      </InfoSection>

      {/* Opener */}
      <InfoSection title="Suggested Opener">
        <p className="text-xs text-foreground italic leading-relaxed">{advisorScript}</p>
      </InfoSection>

      {/* Advisor actions */}
      <div className="space-y-2 pb-2">
        <p
          className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          Advisor Actions
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { Icon: MessageSquare, label: "Text Lead" },
            { Icon: Phone, label: "Call Lead" },
            { Icon: Mail, label: "Nurture" },
          ].map(({ Icon, label }) => (
            <button
              key={label}
              className="py-2.5 border border-border text-[10px] font-bold tracking-widest uppercase text-muted-foreground hover:border-primary hover:text-foreground transition-colors flex flex-col items-center gap-1.5"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function PanelShell({ compact, children }: { compact: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col bg-card border border-border ${compact ? "h-[540px]" : "h-[600px]"} overflow-hidden`}>
      {children}
    </div>
  )
}

function PanelHeader() {
  return (
    <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0 bg-card">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground text-[9px] font-black tracking-wider" style={{ fontFamily: "var(--font-barlow-condensed)" }}>MIA</span>
        </div>
        <div className="leading-tight">
          <div className="text-foreground font-black text-xs tracking-widest uppercase" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            Mia — Enrollment Assistant
          </div>
          <div className="text-muted-foreground text-[10px]">Western Welding Academy</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] text-muted-foreground">Online now</span>
      </div>
    </div>
  )
}

function StepProgress({ stepIndex, phase }: { stepIndex: number; phase: Phase }) {
  const done = phase === "grounded" || phase === "summary"
  return (
    <div className="px-4 py-2 border-b border-border shrink-0 flex items-center gap-1">
      {STEPS.map((s, i) => {
        const isDone = done || i < stepIndex
        const isActive = !done && i === stepIndex
        return (
          <div key={s.id} className="flex items-center gap-1 flex-1 min-w-0">
            <div className="w-full flex flex-col gap-0.5">
              <div className={`h-0.5 transition-colors ${isDone ? "bg-primary" : isActive ? "bg-primary/50" : "bg-border"}`} />
              <span
                className={`text-[8px] font-bold tracking-widest uppercase truncate ${isDone || isActive ? "text-primary" : "text-muted-foreground/40"}`}
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                {s.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FunnelStrip({ funnelIndex }: { funnelIndex: number }) {
  return (
    <div className="px-4 py-2 border-b border-border shrink-0 flex items-center gap-0.5 overflow-hidden bg-background/30">
      <span className="text-[8px] font-bold tracking-widest uppercase text-muted-foreground/40 mr-1.5 shrink-0" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
        Stage:
      </span>
      {FUNNEL.map((label, i) => (
        <div key={label} className="flex items-center gap-0.5 shrink-0">
          <span
            className={`text-[9px] font-bold tracking-wide uppercase whitespace-nowrap transition-colors ${
              i === funnelIndex
                ? "text-primary"
                : i < funnelIndex
                ? "text-primary/40"
                : "text-muted-foreground/25"
            }`}
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            {label}
          </span>
          {i < FUNNEL.length - 1 && (
            <ChevronRight size={7} className={i < funnelIndex ? "text-primary/30" : "text-muted-foreground/15"} />
          )}
        </div>
      ))}
    </div>
  )
}

function MiaBubble({ text }: { text: string }) {
  return (
    <div className="flex gap-2.5">
      <div className="w-6 h-6 bg-primary shrink-0 flex items-center justify-center mt-0.5">
        <span className="text-primary-foreground text-[8px] font-black" style={{ fontFamily: "var(--font-barlow-condensed)" }}>M</span>
      </div>
      <div className="bg-secondary px-3.5 py-2.5 text-sm text-foreground leading-relaxed whitespace-pre-wrap max-w-[88%]">
        {text}
      </div>
    </div>
  )
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="px-3.5 py-2.5 text-sm leading-relaxed max-w-[85%] bg-primary text-primary-foreground">
        {text}
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-1" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
        {label}
        {required && <span className="text-primary">*</span>}
      </label>
      {children}
    </div>
  )
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
        {title}
      </p>
      <div className="border border-border bg-secondary p-3 space-y-1.5">
        {children}
      </div>
    </div>
  )
}
