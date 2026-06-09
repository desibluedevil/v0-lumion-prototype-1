"use client"

import { useState, useRef, useEffect } from "react"
import { Send, ChevronRight, Phone, MessageSquare, Mail, Check, User, Clipboard } from "lucide-react"

// ─── Flow definition ────────────────────────────────────────────────────────

type Step = {
  id: string
  label: string
  question: string
  options: string[]
}

const STEPS: Step[] = [
  {
    id: "goal",
    label: "Goal",
    question: "What are you hoping welding can do for you?",
    options: [
      "Start a higher-paying career",
      "Get into pipeline / travel welding",
      "Learn a skilled trade with no college",
      "Upgrade my current welding skills",
      "Not sure yet",
    ],
  },
  {
    id: "experience",
    label: "Experience",
    question: "How much welding experience do you have?",
    options: [
      "None",
      "Some shop class / hobby experience",
      "I've welded on the job",
      "I already weld and want advanced training",
    ],
  },
  {
    id: "timeline",
    label: "Timeline",
    question: "When would you want to start if the fit is right?",
    options: [
      "ASAP",
      "Next 30–90 days",
      "Later this year",
      "Just researching",
    ],
  },
  {
    id: "concern",
    label: "Concern",
    question: "What's the biggest thing you're trying to figure out?",
    options: [
      "Can I afford it?",
      "Can I move to Wyoming?",
      "Do I need experience?",
      "Will I get a good job after?",
      "Which program fits me?",
    ],
  },
]

const CONCERN_RESPONSES: Record<string, string> = {
  "Can I afford it?":
    "WWA programs range from $17,050 to $35,800. Housing, tools, and materials are included — no hidden costs. Financing options and payment plans are available.",
  "Can I move to Wyoming?":
    "Housing is included with every program. You'll move into a fully furnished home near campus. Many students relocate from out of state — we make it easy.",
  "Do I need experience?":
    "No prior experience needed. WWA trains students from the ground up. Our Foundational program starts with zero assumptions.",
  "Will I get a good job after?":
    "WWA graduates have a 94% hire rate. Pipeline welders earn $80K–$150K+ annually. We connect you with employers before you graduate.",
  "Which program fits me?":
    "We offer three paths: Foundational (12 weeks), Advanced Pipe (18 weeks), and Professional Pipe (24 weeks). The right one depends on your experience and goals.",
}

// ─── Program recommendation logic ───────────────────────────────────────────

function recommendProgram(experience: string): { name: string; duration: string } {
  if (experience === "I already weld and want advanced training") {
    return { name: "Professional Pipe Welder", duration: "24 weeks" }
  }
  if (experience === "I've welded on the job") {
    return { name: "Advanced Pipe Welder", duration: "18 weeks" }
  }
  return { name: "Foundational Pipe Welder", duration: "12 weeks" }
}

function intentLevel(timeline: string): "High" | "Medium" | "Researching" {
  if (timeline === "ASAP" || timeline === "Next 30–90 days") return "High"
  if (timeline === "Later this year") return "Medium"
  return "Researching"
}

function advisorOpener(answers: string[]): string {
  const [goal, experience, timeline, concern] = answers
  return `"Hey [Name], I'm reaching out from Western Welding Academy. Mia flagged that you're interested in ${goal?.toLowerCase() ?? "a welding career"}, have ${experience?.toLowerCase() ?? "some"} experience, and your main question was about ${concern?.toLowerCase() ?? "getting started"}. Do you have 10 minutes to talk through your options?"`
}

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────────────────────

export default function MiaPanel({ compact = false }: { compact?: boolean }) {
  const [started, setStarted] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [optionsUsed, setOptionsUsed] = useState<Set<number>>(new Set())
  const [phase, setPhase] = useState<Phase>("idle")
  const [lead, setLead] = useState<LeadData>({ name: "", phone: "", email: "", contact: "Text", time: "Morning" })
  const [activeTab, setActiveTab] = useState<"student" | "enrollment">("student")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, phase])

  const showOptions =
    phase === "flow" &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "mia" &&
    !optionsUsed.has(stepIndex)

  // ── Derived fit data ───────────────────────────────────────────────────────

  const [goal, experience, timeline, concern] = answers
  const program = recommendProgram(experience ?? "")
  const intent = intentLevel(timeline ?? "")

  // ── Helpers ────────────────────────────────────────────────────────────────

  function pushMia(text: string, delay = 0) {
    if (delay === 0) {
      setMessages((prev) => [...prev, { role: "mia", text }])
    } else {
      setTimeout(() => setMessages((prev) => [...prev, { role: "mia", text }]), delay)
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  function startFlow() {
    setStarted(true)
    setPhase("flow")
    setMessages([{
      role: "mia",
      text: "I'll ask you 4 quick questions to see if WWA is the right fit. No pressure — honest answers only.",
    }])
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "mia", text: STEPS[0].question }])
    }, 500)
  }

  function handleOption(option: string) {
    const newAnswers = [...answers, option]
    setAnswers(newAnswers)
    setOptionsUsed((prev) => new Set(prev).add(stepIndex))
    setMessages((prev) => [...prev, { role: "user", text: option }])

    const next = stepIndex + 1

    if (next < STEPS.length) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "mia", text: STEPS[next].question }])
        setStepIndex(next)
      }, 400)
    } else {
      const response =
        CONCERN_RESPONSES[option] ??
        "That's a great question. Our admissions team can walk you through the specifics based on your situation."
      setPhase("grounded")
      setTimeout(() => pushMia(response), 400)
      setTimeout(() => pushMia("Based on what you shared, I can put together your fit summary and connect you with an enrollment advisor."), 900)
    }
  }

  function showFitSummary() {
    setPhase("summary")
    setMessages((prev) => [
      ...prev,
      { role: "user", text: "Show my fit summary" },
    ])
  }

  function handleCapture() {
    setPhase("capture")
  }

  function handleSubmitLead() {
    if (!lead.name || !lead.phone) return
    setPhase("handoff")
  }

  function handleSend() {
    if (!inputValue.trim()) return
    const text = inputValue.trim()
    setInputValue("")
    setMessages((prev) => [...prev, { role: "user", text }])
    setTimeout(() => {
      pushMia(
        "Good question. For specifics, our admissions team can give you the most accurate answer based on your situation. You can reach them at 1-800-580-4173 or continue the fit check above."
      )
    }, 600)
  }

  // ── Progress bar ──────────────────────────────────────────────────────────

  const PROGRESS_STEPS = [...STEPS.map((s) => s.label), "Fit Summary"]
  const progressIndex =
    !started
      ? -1
      : phase === "summary" || phase === "capture" || phase === "handoff"
      ? PROGRESS_STEPS.length - 1
      : stepIndex

  // ── Funnel strip ─────────────────────────────────────────────────────────

  const FUNNEL = ["Visitor", "Qualified Lead", "Hot Lead", "Enrollment Convo", "Application"]
  const funnelIndex =
    phase === "handoff"
      ? 2
      : phase === "capture" || phase === "summary"
      ? 1
      : phase === "grounded" || (phase === "flow" && answers.length >= 3)
      ? 1
      : 0

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Handoff screen
  // ─────────────────────────────────────────────────────────────────────────

  if (phase === "handoff") {
    return (
      <HandoffScreen
        lead={lead}
        answers={answers}
        program={program}
        intent={intent}
        funnel={FUNNEL}
        funnelIndex={funnelIndex}
        advisorScript={advisorOpener(answers)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        compact={compact}
      />
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Lead capture screen
  // ─────────────────────────────────────────────────────────────────────────

  if (phase === "capture") {
    return (
      <LeadCaptureScreen
        lead={lead}
        setLead={setLead}
        onSubmit={handleSubmitLead}
        funnel={FUNNEL}
        funnelIndex={funnelIndex}
        compact={compact}
      />
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Main chat panel
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className={`flex flex-col bg-card border border-border ${compact ? "h-[540px]" : "h-[600px]"} overflow-hidden`}>
      {/* Header */}
      <PanelHeader />

      {/* Progress bar */}
      {started && (
        <ProgressBar steps={PROGRESS_STEPS} progressIndex={progressIndex} />
      )}

      {/* Funnel strip */}
      {started && (
        <FunnelStrip funnel={FUNNEL} funnelIndex={funnelIndex} />
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {phase === "idle" ? (
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-3">
              <MiaBubble text="I can help you figure out if welding school makes sense for your goals, budget, timeline, and experience level." />
              <MiaBubble text="This isn't a sales pitch. It's a 4-question fit check — honest answers, no pressure." />
            </div>
            <button
              onClick={startFlow}
              className="w-full mt-4 py-3 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Start 2-Minute Fit Check
              <ChevronRight size={16} />
            </button>
          </div>
        ) : (
          <>
            {messages.map((msg, i) =>
              msg.role === "mia" ? (
                <MiaBubble key={i} text={msg.text} />
              ) : (
                <div key={i} className="flex justify-end">
                  <div className="px-4 py-3 text-sm leading-relaxed max-w-[85%] bg-primary text-primary-foreground">
                    {msg.text}
                  </div>
                </div>
              )
            )}

            {/* Option chips */}
            {showOptions && (
              <div className="pl-10 space-y-2 pt-1">
                {STEPS[stepIndex].options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOption(opt)}
                    className="w-full text-left px-4 py-2.5 border border-border text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Grounded → show fit summary CTA */}
            {phase === "grounded" && (
              <div className="pl-10 pt-1">
                <button
                  onClick={showFitSummary}
                  className="w-full py-3 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  See My Fit Summary
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Fit Summary card */}
            {phase === "summary" && (
              <FitSummaryCard
                answers={answers}
                program={program}
                intent={intent}
                onCapture={handleCapture}
              />
            )}
          </>
        )}
      </div>

      {/* Freeform input */}
      {started && phase !== "summary" && (
        <div className="px-4 py-3 border-t border-border shrink-0 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask Mia anything about WWA..."
            className="flex-1 bg-input border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleSend}
            aria-label="Send message"
            className="px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      )}
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
  program: { name: string; duration: string }
  intent: "High" | "Medium" | "Researching"
  onCapture: () => void
}) {
  const [goal, experience, timeline, concern] = answers
  const secondaryConcern = concern === "Can I afford it?" ? "Housing / relocation" : "Financing"

  const intentColor =
    intent === "High" ? "text-green-400" : intent === "Medium" ? "text-yellow-400" : "text-muted-foreground"

  return (
    <div className="pl-2 pt-2 space-y-3">
      <div className="border border-border bg-secondary p-4 space-y-3">
        <p className="text-sm text-foreground leading-relaxed">
          WWA could be a strong fit if you want hands-on pipe welding training, are open to relocating to Wyoming, and want a career path with strong earning potential.
        </p>
        <div className="border-t border-border pt-3 space-y-2">
          {[
            ["Program fit", program.name],
            ["Experience level", experience ?? "—"],
            ["Timeline", timeline ?? "—"],
            ["Main concern", concern ?? "—"],
            ["Secondary concern", secondaryConcern],
            ["Intent level", intent],
            ["Recommended next step", "Talk to enrollment today"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-start gap-4 text-xs">
              <span className="text-muted-foreground shrink-0">{label}</span>
              <span className={`font-semibold text-right ${label === "Intent level" ? intentColor : "text-foreground"}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
      <MiaBubble text="Want me to have an enrollment advisor text or call you with details on financing, housing, and next start dates?" />
      <div className="pl-10 space-y-2">
        <button
          onClick={onCapture}
          className="w-full py-3 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          Yes, Send Me Info
          <ChevronRight size={16} />
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

// ─── Lead Capture Screen ──────────────────────────────────────────────────────

function LeadCaptureScreen({
  lead,
  setLead,
  onSubmit,
  funnel,
  funnelIndex,
  compact,
}: {
  lead: LeadData
  setLead: (l: LeadData) => void
  onSubmit: () => void
  funnel: string[]
  funnelIndex: number
  compact: boolean
}) {
  const contactIcons: Record<ContactPref, React.ReactNode> = {
    Text: <MessageSquare size={13} />,
    Call: <Phone size={13} />,
    Email: <Mail size={13} />,
  }

  return (
    <div className={`flex flex-col bg-card border border-border ${compact ? "h-[540px]" : "h-[600px]"} overflow-hidden`}>
      <PanelHeader />
      <FunnelStrip funnel={funnel} funnelIndex={funnelIndex} />

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <MiaBubble text="Just a few details and I'll get the right person to reach out — no spam, no sales pressure." />

        <div className="space-y-3">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Name
            </label>
            <input
              type="text"
              value={lead.name}
              onChange={(e) => setLead({ ...lead, name: e.target.value })}
              placeholder="Your name"
              className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Phone
            </label>
            <input
              type="tel"
              value={lead.phone}
              onChange={(e) => setLead({ ...lead, phone: e.target.value })}
              placeholder="(555) 000-0000"
              className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Email
            </label>
            <input
              type="email"
              value={lead.email}
              onChange={(e) => setLead({ ...lead, email: e.target.value })}
              placeholder="you@email.com"
              className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Preferred contact */}
          <div className="space-y-1">
            <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Preferred contact
            </label>
            <div className="flex gap-2">
              {(["Text", "Call", "Email"] as ContactPref[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setLead({ ...lead, contact: opt })}
                  className={`flex-1 py-2.5 border text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 transition-colors ${
                    lead.contact === opt
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  {contactIcons[opt]}
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Best time */}
          <div className="space-y-1">
            <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Best time to reach you
            </label>
            <div className="flex gap-2">
              {(["Morning", "Afternoon", "Evening"] as BestTime[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setLead({ ...lead, time: opt })}
                  className={`flex-1 py-2.5 border text-xs font-bold tracking-widest uppercase transition-colors ${
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
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={!lead.name || !lead.phone}
          className="w-full py-3 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          Send My Fit Summary to Enrollment
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── Handoff Screen ───────────────────────────────────────────────────────────

function HandoffScreen({
  lead,
  answers,
  program,
  intent,
  funnel,
  funnelIndex,
  advisorScript,
  activeTab,
  setActiveTab,
  compact,
}: {
  lead: LeadData
  answers: string[]
  program: { name: string; duration: string }
  intent: "High" | "Medium" | "Researching"
  funnel: string[]
  funnelIndex: number
  advisorScript: string
  activeTab: "student" | "enrollment"
  setActiveTab: (t: "student" | "enrollment") => void
  compact: boolean
}) {
  const [goal, , timeline, concern] = answers
  const intentColor =
    intent === "High" ? "text-green-400" : intent === "Medium" ? "text-yellow-400" : "text-muted-foreground"

  return (
    <div className={`flex flex-col bg-card border border-border ${compact ? "h-[540px]" : "h-[600px]"} overflow-hidden`}>
      <PanelHeader />
      <FunnelStrip funnel={funnel} funnelIndex={funnelIndex} />

      {/* Tabs */}
      <div className="flex border-b border-border shrink-0">
        {(["student", "enrollment"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            {tab === "student" ? <User size={12} /> : <Clipboard size={12} />}
            {tab === "student" ? "Confirmation" : "Enrollment View"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {activeTab === "student" ? (
          <>
            {/* Confirmation */}
            <div className="flex items-center gap-3 py-3 border-b border-border">
              <div className="w-8 h-8 bg-green-500/20 border border-green-500/50 flex items-center justify-center shrink-0">
                <Check size={16} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{"You're all set."}</p>
                <p className="text-xs text-muted-foreground mt-0.5">An enrollment advisor will reach out with your fit summary.</p>
              </div>
            </div>

            {/* What we're sending */}
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-3" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                What we&apos;re sending to enrollment
              </p>
              <div className="border border-border bg-secondary p-4 space-y-2">
                {[
                  ["Lead name", lead.name || "—"],
                  ["Intent", intent],
                  ["Timeline", timeline ?? "—"],
                  ["Program interest", program.name],
                  ["Main concern", answers[3] ?? "—"],
                  ["Preferred contact", `${lead.contact} · ${lead.time}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-start gap-4 text-xs">
                    <span className="text-muted-foreground shrink-0">{label}</span>
                    <span className={`font-semibold text-right ${label === "Intent" ? intentColor : "text-foreground"}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact info */}
            <div className="border border-border p-4 space-y-1 text-xs text-muted-foreground">
              <p>Questions before they reach out?</p>
              <p className="text-foreground font-semibold">1-800-580-4173</p>
              <p className="text-foreground">admissions@westernweldingacademy.com</p>
            </div>
          </>
        ) : (
          <>
            {/* Enrollment team view */}
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-primary mb-1" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                Enrollment Lead Profile
              </p>
              <p className="text-xs text-muted-foreground">Mia-qualified · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            </div>

            {/* Student snapshot */}
            <Section title="Student Snapshot">
              {[
                ["Name", lead.name || "—"],
                ["Phone", lead.phone || "—"],
                ["Email", lead.email || "—"],
                ["Goal", goal ?? "—"],
                ["Experience", answers[1] ?? "—"],
                ["Timeline", timeline ?? "—"],
                ["Main concern", answers[3] ?? "—"],
                ["Contact pref", `${lead.contact} · ${lead.time}`],
              ].map(([l, v]) => <Row key={l} label={l} value={v} />)}
            </Section>

            {/* Why Mia routed this lead */}
            <Section title="Why Mia Routed This Lead">
              <div className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
                <p>Intent level: <span className={`font-semibold ${intentColor}`}>{intent}</span></p>
                <p>Timeline indicates urgency — ready within 30–90 days or sooner.</p>
                <p>Concern is solvable — {answers[3]?.toLowerCase() ?? "financing / housing"} can be addressed by admissions.</p>
                <p>Program fit is clear: <span className="text-foreground font-semibold">{program.name}</span>.</p>
                <p>Student expressed willingness to be contacted.</p>
              </div>
            </Section>

            {/* Conversation summary */}
            <Section title="Conversation Summary">
              <div className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
                {answers.map((ans, i) => (
                  <p key={i}><span className="text-foreground">{STEPS[i]?.label}:</span> {ans}</p>
                ))}
              </div>
            </Section>

            {/* Recommended next best action */}
            <Section title="Recommended Next Action">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Call or text within 24 hours. Use the opener below. Address {answers[3]?.toLowerCase() ?? "their main concern"} first, then walk through start dates and program options.
              </p>
              <div className="mt-3 border border-border bg-background p-3">
                <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-2" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Suggested Opener</p>
                <p className="text-xs text-foreground italic leading-relaxed">{advisorScript}</p>
              </div>
            </Section>

            {/* Advisor CTAs */}
            <div className="space-y-2 pb-2">
              <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                Advisor Actions
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: <MessageSquare size={13} />, label: "Text Student" },
                  { icon: <Phone size={13} />, label: "Call Student" },
                  { icon: <Mail size={13} />, label: "Mark Nurture" },
                ].map(({ icon, label }) => (
                  <button
                    key={label}
                    className="py-2.5 border border-border text-xs font-bold tracking-widest uppercase text-muted-foreground hover:border-primary hover:text-foreground transition-colors flex flex-col items-center gap-1.5"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Shared sub-components ───────────────────────────────────────────────────

function PanelHeader() {
  return (
    <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-bold" style={{ fontFamily: "var(--font-barlow-condensed)" }}>MIA</span>
        </div>
        <div>
          <div className="text-foreground font-bold text-sm tracking-widest uppercase leading-none" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            Ask Mia
          </div>
          <div className="text-muted-foreground text-xs mt-0.5">Enrollment Decision Assistant</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs text-muted-foreground">Online</span>
      </div>
    </div>
  )
}

function ProgressBar({ steps, progressIndex }: { steps: string[]; progressIndex: number }) {
  return (
    <div className="px-5 py-3 border-b border-border shrink-0">
      <div className="flex items-center gap-1">
        {steps.map((label, i) => {
          const done = i < progressIndex
          const active = i === progressIndex
          return (
            <div key={label} className="flex items-center gap-1 flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                <div className={`h-1 w-full transition-colors ${done ? "bg-primary" : active ? "bg-primary/50" : "bg-border"}`} />
                <span
                  className={`text-[9px] font-bold tracking-widest uppercase truncate ${done || active ? "text-primary" : "text-muted-foreground/50"}`}
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  {label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FunnelStrip({ funnel, funnelIndex }: { funnel: string[]; funnelIndex: number }) {
  return (
    <div className="px-5 py-2 border-b border-border shrink-0 flex items-center gap-1 overflow-hidden">
      {funnel.map((label, i) => (
        <div key={label} className="flex items-center gap-1 shrink-0">
          <span
            className={`text-[9px] font-bold tracking-widest uppercase whitespace-nowrap ${
              i === funnelIndex ? "text-primary" : i < funnelIndex ? "text-primary/50" : "text-muted-foreground/30"
            }`}
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            {label}
          </span>
          {i < funnel.length - 1 && (
            <ChevronRight size={8} className={i < funnelIndex ? "text-primary/40" : "text-muted-foreground/20"} />
          )}
        </div>
      ))}
    </div>
  )
}

function MiaBubble({ text }: { text: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 bg-primary shrink-0 flex items-center justify-center mt-0.5">
        <span className="text-primary-foreground text-[10px] font-bold" style={{ fontFamily: "var(--font-barlow-condensed)" }}>MIA</span>
      </div>
      <div className="bg-secondary px-4 py-3 text-sm text-foreground leading-relaxed whitespace-pre-wrap max-w-[85%]">
        {text}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
        {title}
      </p>
      <div className="border border-border bg-secondary p-3 space-y-1.5">
        {children}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 text-xs">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-semibold text-foreground text-right">{value}</span>
    </div>
  )
}
