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
  RotateCcw,
  Send,
  X,
  ChevronDown,
  ChevronUp,
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
    body: "Financing may be available for qualified applicants. An advisor can walk you through options.",
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
    headline: "WWA reports a 94% hire rate across 2,000+ graduates.",
    body: "Salary ranges vary by employer, location, experience, and role. No school can guarantee employment, but WWA has a strong placement track record.",
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
// Any component can call focusMia(intent) to open / preload the Mia panel.
//
// intent.programName  — pre-seeds the program context (used by program cards)
// intent.autoStart    — immediately starts the flow from step 0
// intent.jumpToConcern — skips straight to the Concern step, optionally with
//                        a pre-selected answer (used by "Ask about financing")

export interface FocusMiaIntent {
  programName?: string
  autoStart?: boolean
  jumpToConcern?: boolean
  prefillConcern?: string
}

type FocusMiaListener = (intent: FocusMiaIntent) => void
const focusMiaListeners = new Set<FocusMiaListener>()

// revealMia — separate bus so FloatingMia can re-open the panel from any CTA
type RevealMiaListener = () => void
const revealMiaListeners = new Set<RevealMiaListener>()
export function revealMia() {
  revealMiaListeners.forEach((fn) => fn())
}
export function onRevealMia(fn: RevealMiaListener) {
  revealMiaListeners.add(fn)
  return () => revealMiaListeners.delete(fn)
}

export function focusMia(intent: FocusMiaIntent = {}) {
  // Always re-open the panel first (if hidden on desktop or mobile)
  revealMia()
  // Then notify panel listeners with the intent
  focusMiaListeners.forEach((fn) => fn(intent))
}

// ─── Types ─�����───────────���──────────────────────────────────────────────────────

type Message = { role: "mia" | "user" | "status"; text: string }
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

export default function MiaPanel({ compact = false, onClose }: { compact?: boolean; onClose?: () => void }) {
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
  const [optionsVisible, setOptionsVisible] = useState(false)
  const [groundedReady, setGroundedReady] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [freeInput, setFreeInput] = useState("")
  const [freeAnswering, setFreeAnswering] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  // Track whether the user has scrolled up manually so we don't hijack their position.
  // Reset to false whenever a phase change happens (new screen = resume auto-scroll).
  const userScrolledUp = useRef(false)
  // Generation counter — increments whenever the flow is reset or a new intent fires.
  // setTimeout callbacks capture their generation and bail if it's stale.
  const gen = useRef(0)

  // Register this panel as a focusMia listener
  useEffect(() => {
    const handler: FocusMiaListener = (intent) => {
      const { programName, autoStart, jumpToConcern, prefillConcern } = intent
      // Bump generation so any in-flight timeouts from the previous intent become no-ops
      const myGen = ++gen.current

      if (programName) setProgramContext(programName)

      if (jumpToConcern) {
        // Jump directly to the Concern step, optionally pre-selecting an answer
        setPhase("flow")
        setStepIndex(3)
        setAnswers([])
        setOptionsVisible(false)
        setGroundedReady(false)
        setSubmitted(false)

        // Build a condensed message thread leading up to the Concern question
        const intro: Message[] = [
          { role: "mia", text: "Honest answers only — I'll tell you straight if WWA isn't the right move." },
          { role: "mia", text: STEPS[3].question },
        ]

        if (prefillConcern) {
          // Pre-select the concern answer and immediately run through grounded response
          const resp = CONCERN_RESPONSES[prefillConcern]
          const responseText = resp
            ? `${resp.headline}\n\n${resp.body}`
            : "That's a fair concern. An advisor can walk you through specifics."
          const bridgeText =
            "Based on what you've told me, I can pull up your fit summary — which program matches, what it costs, and what to expect. Ready?"

          setMessages([
            ...intro,
            { role: "user", text: prefillConcern },
          ])
          // Pad to index 3 so destructuring [goal, experience, timeline, concern] works correctly
          setAnswers(["", "", "", prefillConcern])
          setPhase("grounded")
          setTimeout(() => {
            if (gen.current !== myGen) return
            setMessages((prev) => [...prev, { role: "mia", text: responseText }])
            setTimeout(() => {
              if (gen.current !== myGen) return
              setMessages((prev) => [...prev, { role: "mia", text: bridgeText }])
              setGroundedReady(true)
            }, 700)
          }, 300)
        } else {
          setMessages(intro)
          setOptionsVisible(true)
        }
        return
      }

      if (autoStart) {
        // Start the flow fresh from step 0
        // Clear programContext unless a specific program was provided
        if (!programName) setProgramContext(null)
        setPhase("flow")
        setStepIndex(0)
        setAnswers([])
        setOptionsVisible(false)
        setGroundedReady(false)
        setSubmitted(false)
        setMessages([
          { role: "mia", text: "Honest answers only — I'll tell you straight if WWA isn't the right move." },
        ])
        setTimeout(() => {
          if (gen.current !== myGen) return
          setMessages((prev) => [...prev, { role: "mia", text: STEPS[0].question }])
          setOptionsVisible(true)
        }, 400)
        return
      }

      // Default: just set context; if idle stay idle (user clicks Start themselves)
      setPhase((prev) => prev)
    }
    focusMiaListeners.add(handler)
    return () => { focusMiaListeners.delete(handler) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [, experience, timeline, concern] = answers
  const program = recommendProgram(experience ?? "", programContext)
  const intent = intentLevel(timeline ?? "")

  // Required: name + complete phone. contact and time have pre-selected defaults so always satisfied.
  // A complete US phone in (###) ###-#### format is exactly 14 chars.
  const phoneDigits = lead.phone.replace(/\D/g, "")
  const phoneComplete = phoneDigits.length === 10
  const phonePartial = lead.phone.trim().length > 0 && !phoneComplete
  const canSubmit = lead.name.trim().length > 0 && phoneComplete && !submitted

  // ── User-scroll detection ──────────────────────────────────────────────────
  // When the user scrolls up more than 40px from the bottom we stop auto-scrolling.
  // When they reach the bottom again we re-enable it.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    function onScroll() {
      if (!el) return
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      userScrolledUp.current = distFromBottom > 40
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [phase]) // re-attach when phase changes (new scrollRef target may render)

  // ── Auto-scroll via MutationObserver ──────────────────────────────────────
  // Fires after every DOM mutation inside the scroll container so we scroll
  // after each new message bubble or option chip finishes painting — not just
  // on React state changes (which precede the paint).
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    function scrollToBottom(smooth: boolean) {
      if (!el) return
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "instant" })
    }

    // On phase change always reset user-scroll flag and jump to the right position.
    userScrolledUp.current = false
    if (phase === "capture" || phase === "handoff") {
      el.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      scrollToBottom(false)
    }

    // Watch for DOM mutations (new children added = new messages / chips)
    const observer = new MutationObserver(() => {
      if (phase === "capture" || phase === "handoff") return
      if (!userScrolledUp.current) {
        scrollToBottom(true)
      }
    })
    observer.observe(el, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [phase])

  // ── Helpers ──────────────────────────────────────────────────────────────

  function pushMia(text: string) {
    setMessages((prev) => [...prev, { role: "mia", text }])
  }

  // ── Flow ──────────────────────────────────────────────────────────────────

  function startFlow() {
    const myGen = ++gen.current
    setPhase("flow")
    setStepIndex(0)
    setAnswers([])
    setOptionsVisible(false)
    setGroundedReady(false)
    setSubmitted(false)
    setMessages([
      {
        role: "mia",
        text: "Honest answers only — I'll tell you straight if WWA isn't the right move.",
      },
    ])
    setTimeout(() => {
      if (gen.current !== myGen) return
      setMessages((prev) => [...prev, { role: "mia", text: STEPS[0].question }])
      setOptionsVisible(true)
    }, 500)
  }

  function goBackOneStep() {
    if (stepIndex === 0) return
    const prevStep = stepIndex - 1
    const prevAnswers = answers.slice(0, prevStep)
    // When Back is pressed, optionsVisible is true — the last 2 messages are
    // [prev user answer, current Mia question]. Remove both so the chat is
    // clean when the user re-answers the previous question.
    setMessages((prev) => prev.slice(0, prev.length - 2))
    setAnswers(prevAnswers)
    setStepIndex(prevStep)
    setOptionsVisible(true)
  }

  // Status lines shown between user answer and next Mia question / grounded response
  const STEP_STATUS: Record<number, string> = {
    0: "Got it. I'll use that to check which program path makes the most sense.",
    1: "Checking beginner vs. advanced program fit…",
    2: "Looking at how soon enrollment should follow up…",
    3: "Checking WWA facts for this answer…",
  }

  function handleOption(option: string) {
    const myGen = ++gen.current
    const newAnswers = [...answers, option]
    const newStep = stepIndex + 1

    setAnswers(newAnswers)
    setOptionsVisible(false)
    setMessages((prev) => [
      ...prev,
      { role: "user", text: option },
      { role: "status", text: STEP_STATUS[stepIndex] ?? "" },
    ])

    if (newStep < STEPS.length) {
      setTimeout(() => {
        if (gen.current !== myGen) return
        setStepIndex(newStep)
        setMessages((prev) => [...prev, { role: "mia", text: STEPS[newStep].question }])
        setOptionsVisible(true)
      }, 700)
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
        if (gen.current !== myGen) return
        pushMia(responseText)
        setTimeout(() => {
          if (gen.current !== myGen) return
          pushMia(bridgeText)
          setGroundedReady(true)
        }, 900)
      }, 700)
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
  }

  // ── Freeform "Ask Mia" ─────────────────────────────────────────────────────

  function matchFreeInput(q: string): string {
    const t = q.toLowerCase()
    if (/cost|tuition|financ|price|pay|afford|money/.test(t))
      return "Programs range from $17,050 to $35,800. Housing, tools, and materials are included. Financing may be available for qualified applicants. An advisor can walk you through options."
    if (/hous|wyom|gillett|moving?|relocat|where|locat/.test(t))
      return "WWA is in Gillette, Wyoming. Housing is included, which helps students relocate for training."
    if (/no experience|beginner|never|never welded|zero|start|new to/.test(t))
      return "You do not need prior welding experience for the beginner path. Foundational Pipe Welder starts from zero."
    if (/job|hire|hired|salary|wage|earn|placement|career/.test(t))
      return "WWA reports a 94% hire rate. Salary ranges vary by employer, location, experience, and role."
    if (/program|fit|which|right for|suit|match|pick/.test(t))
      return "I can check that. I'll look at your goal, experience, timeline, and biggest concern, then suggest a starting point."
    return "That's a good question. An enrollment advisor can give you a direct answer based on your situation."
  }

  function handleFreeInput() {
    const q = freeInput.trim()
    if (!q || freeAnswering) return
    const myGen = gen.current // don't bump — we're not resetting the guided flow

    setFreeInput("")
    setFreeAnswering(true)
    setOptionsVisible(false)
    setMessages((prev) => [
      ...prev,
      { role: "user", text: q },
      { role: "status", text: "Checking WWA facts for this question…" },
    ])

    setTimeout(() => {
      if (gen.current !== myGen) return
      const answer = matchFreeInput(q)
      setMessages((prev) => [
        ...prev,
        { role: "mia", text: answer },
        { role: "status", text: "Returning to your fit check…" },
      ])
      setTimeout(() => {
        if (gen.current !== myGen) return
        setFreeAnswering(false)
        // Only re-show options if still in the guided flow phase (not grounded/summary)
        if (phase === "flow" && stepIndex < STEPS.length) {
          setOptionsVisible(true)
        }
      }, 500)
    }, 650)
  }

  function resetFlow() {
    gen.current++ // cancel any pending setTimeout callbacks from the previous flow
    setPhase("idle")
    setStepIndex(0)
    setAnswers([])
    setMessages([])
    setOptionsVisible(false)
    setGroundedReady(false)
    setSubmitted(false)
    setProgramContext(null)
    setLead({ name: "", phone: "", email: "", contact: "Text", time: "Morning" })
  }

  // ── Handoff screen ────────────────────────────────────────────────────────

  if (phase === "handoff") {
    const advisorScript = buildAdvisorOpener(answers, lead.name)
    const conversationSummary = buildConversationSummary(answers, program)
    return (
      <PanelShell compact={compact}>
        <PanelHeader onReset={resetFlow} onClose={onClose} />
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
          <StudentConfirmation
            lead={lead}
            answers={answers}
            program={program}
            intent={intent}
            advisorScript={advisorScript}
            conversationSummary={conversationSummary}
            onReset={resetFlow}
            onClose={onClose}
          />
        </div>
      </PanelShell>
    )
  }

  // ── Lead capture screen ───────────────────────────────────────────────────

  if (phase === "capture") {
    return (
      <PanelShell compact={compact}>
        <PanelHeader onReset={resetFlow} onClose={onClose} />
        <StepProgress stepIndex={stepIndex} phase={phase} answersCount={answers.length} />
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
          <MiaBubble text="Last step. I'll send your fit summary to the right enrollment advisor — they'll follow up within one business day." />

          <Field label="First name" required>
            <input
              id="mia-field-first-name"
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
              id="mia-field-phone"
              type="tel"
              inputMode="numeric"
              value={lead.phone}
              onChange={(e) => {
                // Strip everything that isn't a digit
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10)
                // Format as (###) ###-####
                let formatted = ""
                if (digits.length <= 3) {
                  formatted = digits.length ? `(${digits}` : ""
                } else if (digits.length <= 6) {
                  formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`
                } else {
                  formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
                }
                setLead((prev) => ({ ...prev, phone: formatted }))
              }}
              placeholder="(555) 000-0000"
              autoComplete="tel"
              className={`w-full bg-input border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors ${
                phonePartial ? "border-red-500/70 focus:border-red-500" : "border-border focus:border-primary"
              }`}
            />
            {phonePartial && (
              <p className="text-[10px] text-red-400 mt-1">
                Enter a complete 10-digit phone number.
              </p>
            )}
          </Field>

          <Field label="Email (optional)">
            <input
              id="mia-field-email-(optional)"
              type="email"
              value={lead.email}
              onChange={(e) => setLead((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="you@email.com"
              autoComplete="email"
              className="w-full bg-input border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </Field>

          <Field label="Best way to reach you" required asGroup>
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

          <Field label="Best time to reach you" required asGroup>
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

          {/* Helper text — always visible before submit */}
          <div className="border border-border/50 bg-secondary/30 px-3 py-2.5 space-y-1">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Your answers help the advisor understand your goals before they reach out.
            </p>
            <p className="text-[10px] text-muted-foreground/70">
              {"We'll only use this to follow up about WWA programs. No spam."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-3.5 bg-primary text-primary-foreground font-black tracking-widest uppercase text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-primary/90"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Connect Me With Enrollment
            <ChevronRight size={15} />
          </button>

          {!canSubmit && (
            <p className="text-center text-[10px] text-muted-foreground/60">
              Enter your name and phone number to continue.
            </p>
          )}

          <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-1">
            <button
              type="button"
              onClick={() => setPhase("summary")}
              className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              <ChevronLeft size={11} />
              Edit Answers
            </button>
            <button
              type="button"
              onClick={resetFlow}
              className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              <RotateCcw size={9} />
              Start Over
            </button>
          </div>
        </div>
      </PanelShell>
    )
  }

  // ── Main flow / idle ───────────────��──────────────────────────────────────

  return (
    <PanelShell compact={compact}>
      <PanelHeader onReset={phase !== "idle" ? resetFlow : undefined} onClose={onClose} />

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
              ) : msg.role === "status" ? (
                <StatusPill key={i} text={msg.text} />
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
                <div className="flex items-center gap-3 pt-1 mt-1 border-t border-border/50">
                  {stepIndex > 0 ? (
                    <button
                      type="button"
                      onClick={goBackOneStep}
                      className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
                      style={{ fontFamily: "var(--font-barlow-condensed)" }}
                    >
                      <ChevronLeft size={11} />
                      Back
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={resetFlow}
                    className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-muted-foreground/50 hover:text-muted-foreground transition-colors ml-auto"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    <RotateCcw size={9} />
                    Start Over
                  </button>
                </div>
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
                onReset={resetFlow}
              />
            )}
          </>
        )}
      </div>

      {/* Freeform "Ask Mia" input — shown during flow and grounded phases only */}
      {(phase === "flow" || phase === "grounded") && (
        <div className="px-5 pb-4 pt-2 border-t border-border/60 bg-background/95">
          <form
            onSubmit={(e) => { e.preventDefault(); handleFreeInput() }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={freeInput}
              onChange={(e) => setFreeInput(e.target.value)}
              placeholder="Ask Mia about cost, housing, experience, jobs, or programs…"
              disabled={freeAnswering}
              className="flex-1 min-w-0 bg-secondary border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!freeInput.trim() || freeAnswering}
              aria-label="Send question to Mia"
              className="shrink-0 w-8 h-8 flex items-center justify-center border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send size={13} />
            </button>
          </form>
        </div>
      )}
    </PanelShell>
  )
}

// ─── Idle State ───────────────────────────────────────────────────────────────

const PLAN_STEPS = [
  { n: 1, label: "Understand your goal" },
  { n: 2, label: "Check your experience level" },
  { n: 3, label: "Look at your timeline" },
  { n: 4, label: "Answer your biggest concern" },
  { n: 5, label: "Recommend a next step" },
  { n: 6, label: "Prepare advisor handoff if you're ready" },
]

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
              {"Checking fit for: "}
              <span className="text-foreground">{programContext}</span>
            </p>
          </div>
        )}

        {/* Mia's opening message */}
        <MiaBubble text="Tell me what you're trying to figure out. I'll check program fit, cost, housing, timeline, and whether an advisor should follow up." />

        {/* Mia's Plan card */}
        <div className="ml-9 border border-border bg-secondary/30">
          <div className="px-3 py-2 border-b border-border flex items-center gap-2">
            <Clipboard size={11} className="text-primary shrink-0" />
            <span
              className="text-[10px] font-black tracking-widest uppercase text-foreground"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Mia&apos;s Plan
            </span>
          </div>
          <ol className="px-3 py-2.5 space-y-1.5">
            {PLAN_STEPS.map(({ n, label }) => (
              <li key={n} className="flex items-start gap-2.5">
                <span
                  className="shrink-0 w-4 h-4 flex items-center justify-center border border-border text-[9px] font-black text-muted-foreground mt-px"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  {n}
                </span>
                <span className="text-xs text-muted-foreground leading-snug">{label}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* CTAs */}
      <div className="pt-4 pb-1 space-y-2">
        <button
          type="button"
          onClick={onStart}
          className="w-full py-3.5 bg-primary text-primary-foreground font-black tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          Start Fit Check
          <ChevronRight size={15} />
        </button>
        <p className="text-center text-[10px] text-muted-foreground/60 leading-relaxed">
          No pressure. If WWA is not the right fit, I&apos;ll say that.
        </p>
      </div>
    </div>
  )
}

// ─── Fit Summary Card ─────────────────────────────────────────────────────────

// Build "Why Mia recommended this" bullets from raw answers
function whyBullets(answers: string[]): string[] {
  const [goal, experience, timeline, concern] = answers
  const bullets: string[] = []
  if (goal) bullets.push(`Your goal is ${goal.replace(/\.$/, "").toLowerCase()}.`)
  if (experience?.includes("None") || experience?.includes("beginner"))
    bullets.push("You have no prior welding experience.")
  else if (experience?.includes("on the job"))
    bullets.push("You have some on-the-job welding experience.")
  else if (experience === "Experienced welder")
    bullets.push("You are an experienced welder.")
  if (timeline?.includes("ASAP"))
    bullets.push("You want to start as soon as possible.")
  else if (timeline?.includes("30–90"))
    bullets.push("You want to start within 30–90 days.")
  else if (timeline?.includes("Later this year"))
    bullets.push("You are targeting later this year.")
  if (concern) bullets.push(`Your main concern is ${concern.replace(/\s*—.*$/, "").toLowerCase()}.`)
  return bullets
}

// Derive 2–3 suggested questions based on the student's concern
function suggestedQuestions(concern?: string): string[] {
  const base = [
    '"When is the next available cohort?"',
    '"What does a typical week in the program look like?"',
  ]
  if (!concern) return base
  const t = concern.toLowerCase()
  if (t.includes("cost"))
    return ['"What financing options could I qualify for?"', '"What is the all-in cost with housing?"', ...base.slice(0, 1)]
  if (t.includes("location") || t.includes("wyom"))
    return ['"What does housing look like if I move to Gillette?"', '"Is there support for relocating students?"', ...base.slice(0, 1)]
  if (t.includes("experience") || t.includes("skill"))
    return ['"Am I ready for the program at my experience level?"', ...base]
  if (t.includes("outcome") || t.includes("hired"))
    return ['"What do most graduates earn in the first year?"', '"Which employers hire WWA graduates?"', ...base.slice(0, 1)]
  return base
}

function FitSummaryCard({
  answers,
  program,
  intent,
  onCapture,
  onBack,
  onReset,
}: {
  answers: string[]
  program: { name: string; duration: string; tuition: string }
  intent: "High" | "Medium" | "Researching"
  onCapture: () => void
  onBack: () => void
  onReset: () => void
}) {
  const [, , , concern] = answers
  const bullets = whyBullets(answers)
  const questions = suggestedQuestions(concern)

  const nextStepText =
    intent === "High"
      ? "Talk to enrollment this week."
      : intent === "Medium"
      ? "Get a program guide and keep exploring."
      : "Get a program guide and keep exploring."

  return (
    <div className="space-y-3 pt-1">

      {/* Title + subtitle */}
      <div>
        <h2
          className="text-sm font-black tracking-widest uppercase text-foreground"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          Your Fit Summary
        </h2>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
          Based on your goal, experience, timeline, and main concern.
        </p>
      </div>

      {/* Section 1 — Recommended Starting Point */}
      <SummarySection label="Recommended Starting Point">
        <div className="space-y-1.5">
          {[
            ["Program", program.name],
            ["Duration", program.duration],
            ["All-in tuition", program.tuition],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between items-start gap-3 text-xs">
              <span className="text-muted-foreground shrink-0">{l}</span>
              <span className="font-semibold text-foreground text-right">{v}</span>
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground/80 leading-snug pt-0.5">
            Starting point is based on your experience level and stated goal.
          </p>
        </div>
      </SummarySection>

      {/* Section 2 — Why Mia Recommended This */}
      {bullets.length > 0 && (
        <SummarySection label="Why Mia Recommended This">
          <ul className="space-y-1.5">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-xs">
                <span className="shrink-0 w-1 h-1 rounded-full bg-primary mt-1.5" />
                <span className="text-foreground leading-snug">{b}</span>
              </li>
            ))}
          </ul>
        </SummarySection>
      )}

      {/* Section 3 — What To Ask Enrollment */}
      <SummarySection label="What To Ask Enrollment">
        <ul className="space-y-1.5">
          {questions.map((q) => (
            <li key={q} className="flex items-start gap-2 text-xs">
              <span className="shrink-0 w-1 h-1 rounded-full bg-border mt-1.5" />
              <span className="text-muted-foreground leading-snug italic">{q}</span>
            </li>
          ))}
        </ul>
      </SummarySection>

      {/* Section 4 — Next Step */}
      <div className="border border-primary/30 bg-primary/5 px-3 py-2.5">
        <p
          className="text-[10px] font-black tracking-widest uppercase text-primary mb-1"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          Suggested Next Step
        </p>
        <p className="text-xs text-foreground font-semibold leading-snug">{nextStepText}</p>
      </div>

      {/* Guardrail */}
      <p className="text-[10px] text-muted-foreground/60 leading-relaxed px-0.5">
        This is a fit check, not an admissions decision.
      </p>

      {/* CTAs */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={onCapture}
          className="w-full py-3 bg-primary text-primary-foreground font-black tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          Connect Me With Enrollment
          <ChevronRight size={15} />
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-2.5 border border-border text-xs font-bold tracking-widest uppercase text-muted-foreground hover:border-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            <ChevronLeft size={12} />
            Edit Answers
          </button>
          <a
            href="tel:18005551234"
            className="flex-1 py-2.5 border border-border text-xs font-bold tracking-widest uppercase text-muted-foreground hover:border-foreground hover:text-foreground transition-colors flex items-center justify-center"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Call Directly
          </a>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="w-full py-2 text-[10px] font-bold tracking-widest uppercase text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center justify-center gap-1.5"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          <RotateCcw size={10} />
          Start Over
        </button>
      </div>
    </div>
  )
}

function SummarySection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-secondary/30">
      <div className="px-3 py-2 border-b border-border">
        <span
          className="text-[10px] font-black tracking-widest uppercase text-foreground"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          {label}
        </span>
      </div>
      <div className="px-3 py-2.5">{children}</div>
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
  conversationSummary,
  onReset,
  onClose,
}: {
  lead: LeadData
  answers: string[]
  program: { name: string; duration: string; tuition: string }
  intent: "High" | "Medium" | "Researching"
  advisorScript: string
  conversationSummary: string
  onReset: () => void
  onClose?: () => void
}) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [, experience, timeline, concern] = answers

  const MIA_RECEIPTS = [
    "Fit summary created",
    "Program fit matched",
    "Main concern captured",
    "Advisor handoff prepared",
    "Enrollment follow-up queued",
  ]

  return (
    <div className="space-y-4 pb-4">

      {/* ── YOU'RE ALL SET ─────────────────────────────────────────── */}
      <div className="pt-1">
        <h2
          className="text-lg font-black tracking-widest uppercase text-foreground leading-tight"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          {"You're all set."}
        </h2>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          {"We've sent your fit summary and details to an enrollment advisor. You should hear back within one business day."}
        </p>
      </div>

      {/* ── WHAT MIA DID ──────────────────────────────────────────── */}
      <div className="border border-border bg-secondary/30">
        <div className="px-4 py-2.5 border-b border-border">
          <span
            className="text-[10px] font-black tracking-widest uppercase text-foreground"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            What Mia Did
          </span>
        </div>
        <ul className="px-4 py-3 space-y-2">
          {MIA_RECEIPTS.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-xs">
              <div className="w-4 h-4 flex items-center justify-center shrink-0 bg-primary/10 border border-primary/30">
                <Check size={9} className="text-primary" />
              </div>
              <span className="text-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── WHAT THE ADVISOR WILL SEE ─────────────────────────────── */}
      <div className="border border-border bg-secondary/30">
        <button
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          className="w-full px-4 py-2.5 flex items-center justify-between gap-2 hover:bg-secondary/60 transition-colors"
          aria-expanded={profileOpen}
        >
          <div className="flex items-center gap-2">
            <Clipboard size={11} className="text-muted-foreground shrink-0" />
            <span
              className="text-[10px] font-black tracking-widest uppercase text-foreground"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              What the Advisor Will See
            </span>
          </div>
          {profileOpen ? <ChevronUp size={12} className="text-muted-foreground" /> : <ChevronDown size={12} className="text-muted-foreground" />}
        </button>

        {profileOpen && (
          <>
            {/* Student-readable summary fields */}
            <div className="border-t border-border px-4 py-3 space-y-2">
              {[
                ["Name", lead.name],
                ["Phone", lead.phone],
                ["Preferred contact", lead.contact],
                ["Best time", lead.time],
                ["Recommended program", program.name],
                ...(experience ? [["Experience level", experience]] as [string, string][] : []),
                ...(timeline ? [["Timeline", timeline]] as [string, string][] : []),
                ...(concern ? [["Main concern", concern.replace(/\s*—.*$/, "").trim()]] as [string, string][] : []),
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-start gap-4 text-xs">
                  <span className="text-muted-foreground shrink-0">{label}</span>
                  <span className="font-semibold text-foreground text-right">{value}</span>
                </div>
              ))}
            </div>
            {/* Full advisor profile below */}
            <div className="border-t border-border px-1 py-1">
              <EnrollmentView
                lead={lead}
                answers={answers}
                program={program}
                intent={intent}
                advisorScript={advisorScript}
                conversationSummary={conversationSummary}
                embedded
              />
            </div>
          </>
        )}
      </div>

      {/* ── Actions ────────────────────────────────────────────────── */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={onReset}
          className="w-full py-3 border border-border text-xs font-black tracking-widest uppercase text-muted-foreground hover:border-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          <RotateCcw size={11} />
          Start Over
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-xs font-bold tracking-widest uppercase text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center justify-center gap-1.5"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            <X size={11} />
            Close
          </button>
        )}
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
  embedded = false,
}: {
  lead: LeadData
  answers: string[]
  program: { name: string; duration: string; tuition: string }
  intent: "High" | "Medium" | "Researching"
  advisorScript: string
  conversationSummary: string
  embedded?: boolean
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
    <div className={`space-y-4 ${embedded ? "px-3 pt-3 pb-4" : "pb-2"}`}>
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
          ["Contact pref.", `${lead.contact} · ${lead.time}`],
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
        compact ? "h-[560px]" : "h-full"
      }`}
    >
      {children}
    </div>
  )
}

function PanelHeader({ onReset, onClose }: { onReset?: () => void; onClose?: () => void }) {
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
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-muted-foreground">Online</span>
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            title="Start over"
            aria-label="Start over"
          >
            <RotateCcw size={11} />
          </button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            title="Close panel"
            aria-label="Close Mia panel"
          >
            <X size={14} />
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

function StatusPill({ text }: { text: string }) {
  if (!text) return null
  return (
    <div className="flex items-center gap-2 ml-9 py-1">
      <span className="w-1 h-1 rounded-full bg-primary shrink-0 animate-pulse" />
      <span
        className="text-[11px] text-primary/80 italic leading-snug"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {text}
      </span>
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
  asGroup,
  children,
}: {
  label: string
  required?: boolean
  asGroup?: boolean
  children: React.ReactNode
}) {
  const id = `mia-field-${label.toLowerCase().replace(/[\s()]/g, "-")}`
  if (asGroup) {
    return (
      <fieldset className="space-y-1 border-0 p-0 m-0">
        <legend
          className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-1"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          {label}
          {required && <span className="text-primary">*</span>}
        </legend>
        {children}
      </fieldset>
    )
  }
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
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
