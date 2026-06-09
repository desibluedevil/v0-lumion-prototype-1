"use client"

import { useState, useRef, useEffect } from "react"
import {
  Phone,
  MessageSquare,
  Mail,
  Check,
  ChevronRight,
  ChevronLeft,
  User,
  Clipboard,
  AlertCircle,
  RotateCcw,
} from "lucide-react"

// ─── Data ─────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: "goal",
    label: "Goal",
    question: "What are you hoping welding can do for you?",
    options: [
      "Start a higher-paying career",
      "Get into pipeline / travel welding",
      "Learn a trade without going to college",
      "Upgrade my current welding skills",
      "Not sure yet",
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
      "Experienced welder",
    ],
  },
  {
    id: "timeline",
    label: "Timeline",
    question: "If the fit is right, when would you want to start?",
    options: [
      "ASAP — I'm ready now",
      "Next 30–90 days",
      "Later this year",
      "Just researching",
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
    headline: "Programs range from $17,050 to $35,800. Housing, tools, and materials are included.",
    body: "Financing may be available for qualified applicants.",
  },
  "Location — can I move to Wyoming?": {
    headline: "WWA is in Gillette, Wyoming, and housing is included so students can relocate for training.",
    body: "Over 2,000 students have relocated from across the country. The housing is part of the program.",
  },
  "Experience — do I need prior skills?": {
    headline: "Prior welding experience is not required for the beginner path.",
    body: "The Foundational Pipe Welder program starts from zero.",
  },
  "Outcome — will I actually get hired?": {
    headline: "WWA highlights a 94% hire rate and starting salary ranges by program.",
    body: "No school should guarantee a job, but WWA has strong graduate outcomes across 2,000+ graduates.",
  },
  "Fit — which program is right for me?": {
    headline: "Based on your experience and goals, Mia can recommend which program to explore first.",
    body: "Foundational (12 wks) for beginners. Professional Pipe (19 wks) for career changers. Expert Pipe (24 wks) for experienced welders.",
  },
}

type ProgramName = "Foundational Pipe Welder" | "Professional Pipe Welder" | "Expert Pipe Welder"

const PROGRAM_META: Record<ProgramName, { duration: string; tuition: string }> = {
  "Foundational Pipe Welder": { duration: "12 weeks", tuition: "$17,050" },
  "Professional Pipe Welder": { duration: "19 weeks", tuition: "$27,600" },
  "Expert Pipe Welder": { duration: "24 weeks", tuition: "$35,800" },
}

// When a programContext hint is set, bias the recommendation toward that program
// unless the user's experience level is a clear mismatch (e.g. "Experienced welder"
// asking about Foundational — in that case, still recommend Expert).
function recommendProgram(
  experience: string,
  contextHint?: string | null,
): { name: string; duration: string; tuition: string } {
  // Hard experience mismatches override the context hint
  if (experience === "Experienced welder")
    return { name: "Expert Pipe Welder", duration: "24 weeks", tuition: "$35,800" }
  if (
    (experience.includes("None") || experience.includes("beginner")) &&
    contextHint === "Expert Pipe Welder"
  )
    return { name: "Foundational Pipe Welder", duration: "12 weeks", tuition: "$17,050" }

  // If a valid context hint exists, use it
  if (contextHint && contextHint in PROGRAM_META) {
    const meta = PROGRAM_META[contextHint as ProgramName]
    return { name: contextHint, ...meta }
  }

  // Default experience-based logic
  if (experience.includes("on the job"))
    return { name: "Professional Pipe Welder", duration: "19 weeks", tuition: "$27,600" }
  return { name: "Foundational Pipe Welder", duration: "12 weeks", tuition: "$17,050" }
}

function intentLevel(timeline: string): "High" | "Medium" | "Researching" {
  if (timeline.includes("ASAP") || timeline.includes("30–90")) return "High"
  if (timeline.includes("Later this year")) return "Medium"
  return "Researching"
}

function buildAdvisorOpener(answers: string[], leadName: string): string {
  const [, experience, timeline, concern] = answers
  const name = leadName.trim() || "This lead"
  const expShort = experience?.includes("None") || experience?.includes("beginner")
    ? "no prior welding experience"
    : experience?.includes("on the job")
    ? "some on-the-job welding experience"
    : experience === "Experienced welder"
    ? "significant welding experience"
    : "some welding background"
  const timeShort = timeline?.includes("ASAP")
    ? "ready to start immediately"
    : timeline?.includes("30–90")
    ? "looking to start within 90 days"
    : timeline?.includes("Later this year")
    ? "targeting later this year"
    : "still in the research phase"
  const concernShort = concern?.replace(/\s*—.*$/, "").toLowerCase().trim() ?? "their situation"
  return `"${name} is ${timeShort}, has ${expShort}, and is mainly concerned about ${concernShort}. Lead with how WWA addresses that concern directly, then walk through program fit and next cohort dates."`
}

function buildConversationSummary(answers: string[], program: { name: string }): string {
  const [goal, experience, timeline, concern] = answers
  const parts = [
    goal ? `Student goal: ${goal}.` : null,
    experience ? `Experience level: ${experience}.` : null,
    timeline ? `Start timeline: ${timeline}.` : null,
    concern ? `Main concern raised: ${concern}.` : null,
    `Mia addressed the concern with WWA-specific data and recommended ${program.name}.`,
    "Student requested enrollment contact after reviewing fit summary.",
  ]
  return parts.filter(Boolean).join(" ")
}

// ─── Focus event bus ──────────────────────────────────────────────────────────
// Any component can call focusMia(programName?) to scroll to and optionally
// pre-seed the Mia panel with a program context, without prop drilling.

type FocusMiaListener = (programName?: string) => void
const focusMiaListeners = new Set<FocusMiaListener>()

export function focusMia(programName?: string) {
  const el = document.getElementById("hero-mia")
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" })
    el.style.outline = "2px solid var(--color-primary)"
    setTimeout(() => { el.style.outline = "" }, 1200)
  }
  focusMiaListeners.forEach((fn) => fn(programName))
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

// ─── Main component ───────────────────────────────────────────────────────────

export default function MiaPanel({ compact = false }: { compact?: boolean }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [phase, setPhase] = useState<Phase>("idle")
  const [programContext, setProgramContext] = useState<string | null>(null)
  const [lead, setLead] = useState<LeadData>({
    name: "",
    phone: "",
    email: "",
    contact: "Text",
    time: "Morning",
  })
  const [activeTab, setActiveTab] = useState<"student" | "enrollment">("student")
  const [optionsVisible, setOptionsVisible] = useState(false)
  const [groundedReady, setGroundedReady] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  // Register this panel as a focusMia listener
  useEffect(() => {
    const handler: FocusMiaListener = (name) => {
      setProgramContext(name ?? null)
      // If idle, auto-start (the context label will show in IdleState briefly,
      // then startFlow will run). If already in a flow, just update context.
      setPhase((prev) => {
        if (prev === "idle") return "idle" // IdleState renders context label; user clicks Start
        return prev
      })
    }
    focusMiaListeners.add(handler)
    return () => { focusMiaListeners.delete(handler) }
  }, [])

  const [, experience, timeline, concern] = answers
  const program = recommendProgram(experience ?? "", programContext)
  const intent = intentLevel(timeline ?? "")

  // Required: name + phone. contact and time have pre-selected defaults so always satisfied.
  const canSubmit = lead.name.trim().length > 0 && lead.phone.trim().length > 0 && !submitted

  // Auto-scroll to bottom on every state change that produces new content
  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
    }
  }, [messages, phase, optionsVisible, groundedReady])

  // ── Helpers ──────────────────────────────────────────────────────────────

  function pushMia(text: string) {
    setMessages((prev) => [...prev, { role: "mia", text }])
  }

  // ── Flow ──────────────────────────────────────────────────────────────────

  function startFlow() {
    setPhase("flow")
    setStepIndex(0)
    setAnswers([])
    setOptionsVisible(false)
    setGroundedReady(false)
    setSubmitted(false)
    setMessages([
      {
        role: "mia",
        text: "I'll ask 4 questions to figure out if WWA is a realistic fit for you. Honest answers only — I'll tell you straight if it's not the right move.",
      },
    ])
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "mia", text: STEPS[0].question }])
      setOptionsVisible(true)
    }, 500)
  }

  function goBackOneStep() {
    if (stepIndex === 0) return
    const prevStep = stepIndex - 1
    const prevAnswers = answers.slice(0, prevStep)
    // Remove the last user bubble and the last Mia question bubble for this step
    setMessages((prev) => {
      // Drop the last Mia question + last user answer (2 messages)
      return prev.slice(0, prev.length - 2)
    })
    setAnswers(prevAnswers)
    setStepIndex(prevStep)
    setOptionsVisible(true)
  }

  function handleOption(option: string) {
    const newAnswers = [...answers, option]
    const newStep = stepIndex + 1

    setAnswers(newAnswers)
    setOptionsVisible(false)
    setMessages((prev) => [...prev, { role: "user", text: option }])

    if (newStep < STEPS.length) {
      setTimeout(() => {
        setStepIndex(newStep)
        setMessages((prev) => [...prev, { role: "mia", text: STEPS[newStep].question }])
        setOptionsVisible(true)
      }, 350)
    } else {
      // All 4 answers in — show grounded concern response then bridge
      const resp = CONCERN_RESPONSES[option]
      const responseText = resp
        ? `${resp.headline}\n\n${resp.body}`
        : "That's a fair concern. An enrollment advisor can walk you through specifics based on your situation."
      const bridgeText =
        "Based on what you've told me, I can pull up your fit summary — which program matches, what it costs, and what to expect. Ready?"

      setPhase("grounded")
      setGroundedReady(false)

      setTimeout(() => {
        pushMia(responseText)
        setTimeout(() => {
          pushMia(bridgeText)
          setGroundedReady(true)
        }, 900)
      }, 350)
    }
  }

  function showFitSummary() {
    setMessages((prev) => [...prev, { role: "user", text: "Yes — show me the summary" }])
    setPhase("summary")
    setGroundedReady(false)
  }

  function goBackToGrounded() {
    // Remove the last user message ("Yes — show me the summary") and return to grounded
    setMessages((prev) => prev.filter((m) => m.text !== "Yes — show me the summary"))
    setPhase("grounded")
    setGroundedReady(true)
  }

  function handleSubmit() {
    if (!canSubmit) return
    setSubmitted(true)
    setPhase("handoff")
    setActiveTab("student")
  }

  function resetFlow() {
    setPhase("idle")
    setStepIndex(0)
    setAnswers([])
    setMessages([])
    setOptionsVisible(false)
    setGroundedReady(false)
    setSubmitted(false)
    setProgramContext(null)
    setLead({ name: "", phone: "", email: "", contact: "Text", time: "Morning" })
    setActiveTab("student")
  }

  // ── Handoff screen ────────────────────────────────────────────────────────

  if (phase === "handoff") {
    const advisorScript = buildAdvisorOpener(answers, lead.name)
    const conversationSummary = buildConversationSummary(answers, program)
    return (
      <PanelShell compact={compact}>
        <PanelHeader onReset={resetFlow} />
        <div className="flex border-b border-border shrink-0">
          {(["student", "enrollment"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-primary text-foreground bg-secondary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              {tab === "student" ? <User size={11} /> : <Clipboard size={11} />}
              {tab === "student" ? "Confirmation" : "Enrollment Profile"}
            </button>
          ))}
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
          {activeTab === "student" ? (
            <StudentConfirmation
              lead={lead}
              answers={answers}
              program={program}
              intent={intent}
              advisorScript={advisorScript}
              onReset={resetFlow}
              onViewEnrollment={() => setActiveTab("enrollment")}
            />
          ) : (
            <EnrollmentView
              lead={lead}
              answers={answers}
              program={program}
              intent={intent}
              advisorScript={advisorScript}
              conversationSummary={conversationSummary}
            />
          )}
        </div>
      </PanelShell>
    )
  }

  // ── Lead capture screen ───────────────────────────────────────────────────

  if (phase === "capture") {
    return (
      <PanelShell compact={compact}>
        <PanelHeader onReset={resetFlow} />
        <StepProgress stepIndex={stepIndex} phase={phase} answersCount={answers.length} />
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
          <MiaBubble text="Last step. I'll send your fit summary to the right enrollment advisor — they'll follow up within one business day." />

          <Field label="First name" required>
            <input
              type="text"
              value={lead.name}
              onChange={(e) => setLead((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Your name"
              autoComplete="given-name"
              className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </Field>

          <Field label="Phone" required>
            <input
              type="tel"
              value={lead.phone}
              onChange={(e) => setLead((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="(555) 000-0000"
              autoComplete="tel"
              className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </Field>

          <Field label="Email (optional)">
            <input
              type="email"
              value={lead.email}
              onChange={(e) => setLead((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="you@email.com"
              autoComplete="email"
              className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </Field>

          <Field label="Best way to reach you" required>
            <div className="flex gap-2">
              {(["Text", "Call", "Email"] as ContactPref[]).map((opt) => {
                const Icon = opt === "Text" ? MessageSquare : opt === "Call" ? Phone : Mail
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setLead((prev) => ({ ...prev, contact: opt }))}
                    className={`flex-1 py-2 border text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors ${
                      lead.contact === opt
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    <Icon size={12} />
                    {opt}
                  </button>
                )
              })}
            </div>
          </Field>

          <Field label="Best time to reach you" required>
            <div className="flex gap-2">
              {(["Morning", "Afternoon", "Evening"] as BestTime[]).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setLead((prev) => ({ ...prev, time: opt }))}
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

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-3.5 bg-primary text-primary-foreground font-black tracking-widest uppercase text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-primary/90"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Send to Enrollment Team
            <ChevronRight size={15} />
          </button>

          {!canSubmit && (
            <p className="text-center text-[10px] text-muted-foreground/60">
              Enter your name and phone number to continue.
            </p>
          )}

          <p className="text-center text-[10px] text-muted-foreground pb-1">
            No spam. One follow-up from a real advisor.
          </p>
        </div>
      </PanelShell>
    )
  }

  // ── Main flow / idle ──────────────────────────────────────────────────────

  return (
    <PanelShell compact={compact}>
      <PanelHeader onReset={phase !== "idle" ? resetFlow : undefined} />

      {phase !== "idle" && (
        <StepProgress stepIndex={stepIndex} phase={phase} answersCount={answers.length} />
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {phase === "idle" ? (
          <IdleState onStart={startFlow} programContext={programContext} />
        ) : (
          <>
            {messages.map((msg, i) =>
              msg.role === "mia" ? (
                <MiaBubble key={i} text={msg.text} />
              ) : (
                <UserBubble key={i} text={msg.text} />
              )
            )}

            {/* Step option chips */}
            {phase === "flow" && optionsVisible && stepIndex < STEPS.length && (
              <div className="ml-9 space-y-1.5 pt-1">
                {STEPS[stepIndex].options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleOption(opt)}
                    className="w-full text-left px-4 py-2.5 border border-border text-sm text-muted-foreground hover:border-primary hover:text-foreground hover:bg-secondary/40 transition-colors"
                  >
                    {opt}
                  </button>
                ))}
                {stepIndex > 0 && (
                  <button
                    type="button"
                    onClick={goBackOneStep}
                    className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors mt-1 pt-1"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    <ChevronLeft size={11} />
                    Back
                  </button>
                )}
              </div>
            )}

            {/* Grounded → See Fit Summary CTA */}
            {phase === "grounded" && groundedReady && (
              <div className="ml-9 pt-1">
                <button
                  type="button"
                  onClick={showFitSummary}
                  className="w-full py-3 bg-primary text-primary-foreground font-black tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  See My Fit Summary
                  <ChevronRight size={15} />
                </button>
              </div>
            )}

            {/* Fit Summary card */}
            {phase === "summary" && (
              <FitSummaryCard
                answers={answers}
                program={program}
                intent={intent}
                onCapture={() => setPhase("capture")}
                onBack={goBackToGrounded}
              />
            )}
          </>
        )}
      </div>
    </PanelShell>
  )
}

// ─── Idle State ───────────────────────────────────────────────────────────────

function IdleState({
  onStart,
  programContext,
}: {
  onStart: () => void
  programContext?: string | null
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-3 pt-1 flex-1">
        {/* Program context label — only shown when launched from a card */}
        {programContext && (
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/30">
            <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
            <p
              className="text-xs font-bold tracking-wider uppercase text-primary"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              {"You're checking fit for: "}
              <span className="text-foreground">{programContext}</span>
            </p>
          </div>
        )}
        <MiaBubble text="Most people who land here are interested but unsure. I'm here to help you figure out if this is actually a fit — not to sell you." />
        <MiaBubble text="4 questions. 2 minutes. Straight answer at the end." />
        <div className="ml-9 flex items-start gap-2 border border-border bg-secondary/40 px-3 py-2.5">
          <AlertCircle size={13} className="text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            If WWA isn&apos;t the right fit, I&apos;ll tell you that too. No pressure. No follow-up
            unless you ask.
          </p>
        </div>
      </div>
      <div className="pt-4 pb-1">
        <button
          type="button"
          onClick={onStart}
          className="w-full py-3.5 bg-primary text-primary-foreground font-black tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          Start Fit Check — 2 Min
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}

// ─── Fit Summary Card ─────────────────────────────────────────────────────────

function FitSummaryCard({
  answers,
  program,
  intent,
  onCapture,
  onBack,
}: {
  answers: string[]
  program: { name: string; duration: string; tuition: string }
  intent: "High" | "Medium" | "Researching"
  onCapture: () => void
  onBack: () => void
}) {
  const [goal, experience, timeline, concern] = answers
  const intentColor =
    intent === "High"
      ? "text-green-400"
      : intent === "Medium"
      ? "text-yellow-400"
      : "text-muted-foreground"
  const intentBg =
    intent === "High"
      ? "bg-green-500/10 border-green-500/30"
      : intent === "Medium"
      ? "bg-yellow-500/10 border-yellow-500/30"
      : "bg-secondary border-border"

  const nextStep =
    intent === "High"
      ? "Talk to enrollment this week"
      : intent === "Medium"
      ? "Request info — follow up in 2–3 weeks"
      : "Review program options — no rush"

  return (
    <div className="space-y-3 pt-1">
      <div className="border border-border bg-secondary">
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
          <span
            className="text-xs font-black tracking-widest uppercase text-foreground"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Fit Summary
          </span>
          <span
            className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 border ${intentBg} ${intentColor}`}
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            {intent} Intent
          </span>
        </div>
        <div className="px-4 py-3 space-y-2">
          {[
            ["Recommended program", program.name],
            ["Duration", program.duration],
            ["All-in tuition", program.tuition],
            ["Experience level", experience ?? "—"],
            ["Your goal", goal ?? "—"],
            ["Your timeline", timeline ?? "—"],
            ["Main concern", concern?.replace(/\s*—.*$/, "").trim() ?? "—"],
            ["Intent level", intent],
            ["Recommended next step", nextStep],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-start gap-4 text-xs">
              <span className="text-muted-foreground shrink-0">{label}</span>
              <span
                className={`font-semibold text-right ${
                  label === "Intent level" ? intentColor : "text-foreground"
                }`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <MiaBubble text="Want me to send this to an enrollment advisor? They can help with financing, housing, next start dates, and whether WWA is the right move." />

      <div className="ml-9 space-y-2">
        <button
          type="button"
          onClick={onCapture}
          className="w-full py-3 bg-primary text-primary-foreground font-black tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          Connect Me With Enrollment
          <ChevronRight size={15} />
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full py-2.5 border border-border text-xs font-bold tracking-widest uppercase text-muted-foreground hover:border-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          <ChevronLeft size={12} />
          Edit Answers
        </button>
        <button
          type="button"
          onClick={() => window.open("tel:18005551234")}
                  className="w-full py-2.5 border border-border text-xs font-bold tracking-widest uppercase text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  Call Directly: 1-800-555-1234
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
  advisorScript,
  onReset,
  onViewEnrollment,
}: {
  lead: LeadData
  answers: string[]
  program: { name: string; duration: string; tuition: string }
  intent: "High" | "Medium" | "Researching"
  advisorScript: string
  onReset: () => void
  onViewEnrollment: () => void
}) {
  const [, experience, timeline, concern] = answers
  const intentColor =
    intent === "High"
      ? "text-green-400"
      : intent === "Medium"
      ? "text-yellow-400"
      : "text-muted-foreground"

  return (
    <div className="space-y-4 pb-2">
      {/* Confirmation header */}
      <div className="flex items-center gap-3 py-3 border-b border-border">
        <div className="w-8 h-8 bg-green-500/15 border border-green-500/40 flex items-center justify-center shrink-0">
          <Check size={15} className="text-green-400" />
        </div>
        <div>
          <p
            className="text-sm font-black tracking-widest uppercase text-foreground"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            {"You're all set."}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            An enrollment advisor will reach out with your fit summary and next steps.
          </p>
        </div>
      </div>

      {/* What Mia sent */}
      <div>
        <p
          className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          What Mia sent to enrollment
        </p>
        <div className="border border-border bg-secondary p-3 space-y-2">
          {[
            ["Name", lead.name || "—"],
            ["Phone", lead.phone || "—"],
            ["Preferred contact", lead.contact],
            ["Best time to reach", lead.time],
            ["Recommended program", program.name],
            ["Experience level", experience ?? "—"],
            ["Timeline", timeline ?? "—"],
            ["Main concern", concern?.replace(/\s*—.*$/, "").trim() ?? "—"],
            ["Intent level", { value: intent, className: intentColor }],
            ["Suggested advisor opener", { value: advisorScript, italic: true }],
          ].map(([label, value]) => (
            <div key={label as string} className="flex justify-between items-start gap-4 text-xs">
              <span className="text-muted-foreground shrink-0 min-w-[90px]">{label as string}</span>
              {typeof value === "string" ? (
                <span className="font-semibold text-foreground text-right">{value}</span>
              ) : (value as { italic?: boolean }).italic ? (
                <span className="text-muted-foreground italic text-right leading-relaxed">
                  {(value as { value: string }).value}
                </span>
              ) : (
                <span className={`font-semibold text-right ${(value as { className: string }).className}`}>
                  {(value as { value: string }).value}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={onReset}
          className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-bold tracking-widest uppercase hover:bg-primary/90 transition-colors"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          Start Over
        </button>
        <button
          type="button"
          onClick={onViewEnrollment}
          className="w-full py-2.5 border border-border text-xs font-bold tracking-widest uppercase text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          View Enrollment Profile
        </button>
      </div>
    </div>
  )
}

// ─── Enrollment View ──────────────────────────────────────────────────────────

function EnrollmentView({
  lead,
  answers,
  program,
  intent,
  advisorScript,
  conversationSummary,
}: {
  lead: LeadData
  answers: string[]
  program: { name: string; duration: string; tuition: string }
  intent: "High" | "Medium" | "Researching"
  advisorScript: string
  conversationSummary: string
}) {
  const [goal, experience, timeline, concern] = answers
  const intentColor =
    intent === "High"
      ? "text-green-400"
      : intent === "Medium"
      ? "text-yellow-400"
      : "text-muted-foreground"
  const intentBg =
    intent === "High"
      ? "bg-green-500/10 border-green-500/30"
      : intent === "Medium"
      ? "bg-yellow-500/10 border-yellow-500/30"
      : "bg-secondary border-border"

  const nextAction =
    intent === "High"
      ? `Call or text ${lead.name || "this lead"} within 4 hours. Lead with how WWA addresses their ${concern?.replace(/\s*—.*$/, "").toLowerCase().trim() ?? "concern"} concern. Ask about their target start date.`
      : intent === "Medium"
      ? `Follow up within 48 hours. Send program details for ${program.name}. Focus on financing and next cohort dates.`
      : `Add to nurture sequence. Send program overview email. Check back in 2–3 weeks.`

  return (
    <div className="space-y-4 pb-2">
      {/* Lead header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <p
            className="text-sm font-black tracking-widest uppercase text-foreground"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Enrollment Lead Profile
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mia-qualified &middot;{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <span
          className={`text-[10px] font-black tracking-widest uppercase px-2.5 py-1 border ${intentBg} ${intentColor}`}
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          {intent} Intent
        </span>
      </div>

      {/* Student Snapshot */}
      <InfoSection title="Student Snapshot">
        {[
          ["Name", lead.name || "—"],
          ["Phone", lead.phone || "—"],
          ["Email", lead.email || "Not provided"],
          ["Contact pref.", `${lead.contact} · ${lead.time}s`],
          ["Program", program.name],
          ["Tuition", program.tuition],
          ["Duration", program.duration],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between items-start gap-4 text-xs">
            <span className="text-muted-foreground shrink-0">{l}</span>
            <span className="font-semibold text-foreground text-right">{v}</span>
          </div>
        ))}
      </InfoSection>

      {/* Why Mia Routed This Lead */}
      <InfoSection title="Why Mia Routed This Lead">
        <div className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
          <p>Goal: <span className="text-foreground">{goal ?? "—"}</span></p>
          <p>Experience: <span className="text-foreground">{experience ?? "—"}</span></p>
          <p>Timeline: <span className="text-foreground">{timeline ?? "—"}</span></p>
          <p>
            Intent:{" "}
            <span className={`font-semibold ${intentColor}`}>{intent}</span>
            {" — "}
            {intent === "High"
              ? "ready ASAP or within 30–90 days"
              : intent === "Medium"
              ? "planning later this year"
              : "still researching, not yet ready"}
          </p>
        </div>
      </InfoSection>

      {/* Main Concern */}
      <InfoSection title="Main Concern">
        <p className="text-xs text-foreground leading-relaxed">
          {concern ?? "—"}
        </p>
        {concern && CONCERN_RESPONSES[concern] && (
          <p className="text-xs text-muted-foreground leading-relaxed mt-1.5 italic">
            Mia addressed: {CONCERN_RESPONSES[concern].headline}
          </p>
        )}
      </InfoSection>

      {/* Recommended Next Best Action */}
      <InfoSection title="Recommended Next Best Action">
        <p className="text-xs text-foreground leading-relaxed">{nextAction}</p>
      </InfoSection>

      {/* Conversation Summary */}
      <InfoSection title="Conversation Summary">
        <p className="text-xs text-muted-foreground leading-relaxed">{conversationSummary}</p>
      </InfoSection>

      {/* Suggested opener */}
      <InfoSection title="Suggested Opener">
        <p className="text-xs text-foreground italic leading-relaxed">{advisorScript}</p>
      </InfoSection>

      {/* Advisor actions */}
      <div className="space-y-2">
        <p
          className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          Advisor Actions
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { Icon: MessageSquare, label: "Text Student" },
            { Icon: Phone, label: "Call Student" },
            { Icon: Mail, label: "Mark for Nurture" },
          ].map(({ Icon, label }) => (
            <button
              key={label}
              type="button"
              className="py-2.5 border border-border text-[10px] font-bold tracking-widest uppercase text-muted-foreground hover:border-primary hover:text-foreground transition-colors flex flex-col items-center gap-1.5"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Shell & shared sub-components ───────────────────────────────────────────

function PanelShell({ compact, children }: { compact: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`flex flex-col bg-card border border-border overflow-hidden ${
        compact ? "h-[560px]" : "h-[600px]"
      }`}
    >
      {children}
    </div>
  )
}

function PanelHeader({ onReset }: { onReset?: () => void }) {
  return (
    <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-primary flex items-center justify-center shrink-0">
          <span
            className="text-primary-foreground text-[9px] font-black tracking-wider"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            MIA
          </span>
        </div>
        <div className="leading-tight">
          <div
            className="text-foreground font-black text-xs tracking-widest uppercase"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Mia — Enrollment Assistant
          </div>
          <div className="text-muted-foreground text-[10px]">Western Welding Academy</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-muted-foreground">Online</span>
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            title="Start over"
          >
            <RotateCcw size={11} />
          </button>
        )}
      </div>
    </div>
  )
}

const PROGRESS_STEPS = [...STEPS.map((s) => s.label), "Summary"]

function StepProgress({
  stepIndex,
  phase,
  answersCount,
}: {
  stepIndex: number
  phase: Phase
  answersCount: number
}) {
  const summaryActive = phase === "summary" || phase === "capture"
  const flowDone = phase === "grounded" || summaryActive
  return (
    <div className="px-4 py-2 border-b border-border shrink-0 flex items-center gap-1.5">
      {PROGRESS_STEPS.map((label, i) => {
        const isSummaryStep = i === PROGRESS_STEPS.length - 1
        const isDone = isSummaryStep ? false : flowDone || i < answersCount
        const isActive = isSummaryStep ? summaryActive : !flowDone && i === stepIndex
        return (
          <div key={label} className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="w-full flex flex-col gap-0.5">
              <div
                className={`h-0.5 transition-colors ${
                  isDone || isActive ? "bg-primary" : "bg-border"
                }`}
              />
              <span
                className={`text-[10px] font-bold tracking-widest uppercase truncate ${
                  isDone || isActive ? "text-primary" : "text-muted-foreground/40"
                }`}
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                {label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MiaBubble({ text }: { text: string }) {
  return (
    <div className="flex gap-2.5">
      <div className="w-6 h-6 bg-primary shrink-0 flex items-center justify-center mt-0.5">
        <span
          className="text-primary-foreground text-[8px] font-black"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          M
        </span>
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

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label
        className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-1"
        style={{ fontFamily: "var(--font-barlow-condensed)" }}
      >
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
      <p
        className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground"
        style={{ fontFamily: "var(--font-barlow-condensed)" }}
      >
        {title}
      </p>
      <div className="border border-border bg-secondary p-3 space-y-1.5">{children}</div>
    </div>
  )
}
