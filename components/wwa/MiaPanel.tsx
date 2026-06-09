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
  // Tracks the option the user just tapped so we can flash a blue highlight before transitioning
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  // Controls the success toast shown for ~2s before the handoff screen appears
  const [showToast, setShowToast] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  // Ref attached to the first option button so we can focus it when options appear
  const firstOptionRef = useRef<HTMLButtonElement>(null)
  // Anchor placed immediately before the "Yes — show me the summary" bubble.
  // scrollToSummaryAnchor() uses this to jump to exactly that spot.
  const summaryAnchorRef = useRef<HTMLDivElement>(null)
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

      // Default: open/reset to idle so user sees Mia's Plan and clicks Start themselves
      setPhase("idle")
      setStepIndex(0)
      setAnswers([])
      setMessages([])
      setOptionsVisible(false)
      setGroundedReady(false)
      setSubmitted(false)
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

  // ── Keyboard focus management — move focus to first option after it appears ──
  useEffect(() => {
    if (optionsVisible && firstOptionRef.current) {
      // Small delay lets the DOM paint before we steal focus
      const t = setTimeout(() => firstOptionRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, [optionsVisible, stepIndex])



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

    function scrollDown(smooth: boolean) {
      if (!el) return
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "instant" })
    }

    // On phase change always reset user-scroll flag and jump to the right position.
    userScrolledUp.current = false
    if (phase === "capture" || phase === "handoff") {
      el.scrollTo({ top: 0, behavior: "smooth" })
    } else if (phase === "summary") {
      // Anchor scroll handled by showFitSummary() via rAF — don't fight it here
    } else {
      scrollDown(false)
    }

    // Watch for DOM mutations (new children added = new messages / chips)
    const observer = new MutationObserver(() => {
      // capture / handoff scroll to top; summary uses anchor scroll — skip both
      if (phase === "capture" || phase === "handoff" || phase === "summary") return
      if (!userScrolledUp.current) {
        scrollDown(true)
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

    // Flash the selected chip blue for 300ms so the user sees confirmation
    setSelectedOption(option)
    setTimeout(() => setSelectedOption(null), 300)

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

  function scrollToAnchor(anchorRef: React.RefObject<HTMLDivElement | null>, behavior: ScrollBehavior = "smooth") {
    const container = scrollRef.current
    const anchor = anchorRef.current
    if (!container || !anchor) return
    const anchorTop = anchor.offsetTop
    container.scrollTo({ top: anchorTop, behavior })
  }

  function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
  }

  function showFitSummary() {
    setMessages((prev) => [...prev, { role: "user", text: "Yes — show me the summary" }])
    setPhase("summary")
    setGroundedReady(false)
    // Double rAF lets React paint the FitSummaryCard before we measure scrollHeight.
    // Then scroll all the way to the top so the card title is the first thing visible.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = scrollRef.current
        if (!el) return
        // Scroll to position of the anchor (start of summary user bubble) so content begins at top
        scrollToAnchor(summaryAnchorRef, "smooth")
        // Then after another frame let the full card render and scroll to show it fully
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollToBottom("smooth")
          })
        })
      })
    })
  }

  function goBackToGrounded() {
    // Remove the last user message ("Yes — show me the summary") and return to grounded
    setMessages((prev) => prev.filter((m) => m.text !== "Yes — show me the summary"))
    setPhase("grounded")
    setGroundedReady(true)
    // Scroll back to the bottom so the user sees the bridge message + See Fit Summary CTA
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToBottom("smooth")
      })
    })
  }

  function handleSubmit() {
    if (!canSubmit) return
    setSubmitted(true)
    setShowToast(true)
    // Show green success toast for 1800ms, then transition to handoff screen
    setTimeout(() => {
      setShowToast(false)
      setPhase("handoff")
    }, 1800)
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
    // Snapshot phase and stepIndex at call time to avoid stale closure in the timeout
    const capturedPhase = phase
    const capturedStepIndex = stepIndex

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
        // In idle phase there's no fit check to return to — skip the status pill
        ...(capturedPhase !== "idle" ? [{ role: "status" as const, text: "Returning to your fit check…" }] : []),
      ])
      setTimeout(() => {
        if (gen.current !== myGen) return
        setFreeAnswering(false)
        // Only re-show options if still in the guided flow (not idle/grounded/summary)
        if (capturedPhase === "flow" && capturedStepIndex < STEPS.length) {
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

  // ── Handoff screen ──────────────────────────────────────────���─────────────

  if (phase === "handoff") {
    const advisorScript = buildAdvisorOpener(answers, lead.name)
    const conversationSummary = buildConversationSummary(answers, program)
    return (
      <PanelShell compact={compact}>
        <PanelHeader onReset={resetFlow} onClose={onClose} phase="handoff" />
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 bg-white">
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
        <PanelHeader onReset={resetFlow} onClose={onClose} phase="capture" />
        <StepProgress stepIndex={stepIndex} phase={phase} answersCount={answers.length} />
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 bg-white">
          <MiaBubble text="Last step. I'll send your fit summary to the right enrollment advisor — they'll follow up within one business day." />

          <Field label="First name" required>
            <input
              id="mia-field-first-name"
              type="text"
              value={lead.name}
              onChange={(e) => setLead((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Your name"
              autoComplete="given-name"
              className="w-full border border-[#E5E5E5] rounded-xl px-3 py-2.5 text-sm text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#2563EB] transition-colors bg-white"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            />
          </Field>

          <Field label="Phone" required>
            <input
              id="mia-field-phone"
              type="tel"
              inputMode="numeric"
              value={lead.phone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10)
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
              className={`w-full border rounded-xl px-3 py-2.5 text-sm text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none transition-colors bg-white ${
                phonePartial ? "border-red-400 focus:border-red-500" : "border-[#E5E5E5] focus:border-[#2563EB]"
              }`}
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            />
            {phonePartial && (
              <p className="text-[10px] text-red-500 mt-1" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
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
              className="w-full border border-[#E5E5E5] rounded-xl px-3 py-2.5 text-sm text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#2563EB] transition-colors bg-white"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
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
                    className={`flex-1 py-2 border rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      lead.contact === opt
                        ? "border-[#2563EB] bg-[#2563EB] text-white"
                        : "border-[#E5E5E5] text-[#666666] hover:border-[#111] hover:text-[#111] bg-white"
                    }`}
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
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
                  className={`flex-1 py-2 border rounded-xl text-xs font-semibold transition-colors ${
                    lead.time === opt
                      ? "border-[#2563EB] bg-[#2563EB] text-white"
                      : "border-[#E5E5E5] text-[#666666] hover:border-[#111] hover:text-[#111] bg-white"
                  }`}
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </Field>

          {/* Helper text */}
          <div className="border border-[#E5E5E5] rounded-xl px-3 py-2.5 space-y-1 bg-[#F8F8F8]">
            <p className="text-[11px] text-[#666666] leading-relaxed" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
              Your answers help the advisor understand your goals before they reach out.
            </p>
            <p className="text-[10px] text-[#AAAAAA]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
              {"We'll only use this to follow up about WWA programs. No spam."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-3.5 font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed text-white hover:enabled:brightness-110 rounded-2xl"
            style={{ backgroundColor: "#111111", fontFamily: "var(--font-inter), sans-serif" }}
          >
            Connect Me With Enrollment
            <ChevronRight size={15} />
          </button>

          {!canSubmit && (
            <p className="text-center text-[10px] text-[#AAAAAA]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
              Enter your name and phone number to continue.
            </p>
          )}
        </div>

        {/* Sticky nav bar — Back (Edit Answers) + Start Over */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-2.5 border-t border-[#E5E5E5] bg-white">
          <button
            type="button"
            onClick={() => setPhase("summary")}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-[#CCCCCC] text-[#444444] text-[11px] font-semibold transition-colors hover:border-[#2563EB] hover:text-[#2563EB] focus-visible:outline-none"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            <ChevronLeft size={12} />
            Back
          </button>
          <button
            type="button"
            onClick={resetFlow}
            className="text-[11px] font-semibold transition-colors text-[#2563EB] hover:text-[#1d4ed8] focus-visible:outline-none"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            Start Over
          </button>
        </div>

        {/* Success toast — slides in from the top when form is submitted */}
        <SuccessToast visible={showToast} />
      </PanelShell>
    )
  }

  // ── Main flow / idle ───────────���───��──────────────────────────────────────

  return (
    <PanelShell compact={compact}>
      <PanelHeader onReset={phase !== "idle" ? resetFlow : undefined} onClose={onClose} phase={phase} />
      <StepProgress stepIndex={stepIndex} phase={phase} answersCount={answers.length} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-white">
        {phase === "idle" ? (
          <>
            <IdleState onStart={startFlow} programContext={programContext} />
            {/* Freeform Q&A messages accumulate below the IdleState CTA so they
                are naturally at the bottom of the scroll area — MutationObserver
                auto-scrolls to show them as they arrive. */}
            {messages.length > 0 && messages.map((msg, i) => {
              const nextMsg = messages[i + 1]
              const isLast = !nextMsg || nextMsg.role !== msg.role
              return msg.role === "mia" ? (
                <MiaBubble key={i} text={msg.text} isLast={isLast} />
              ) : msg.role === "status" ? (
                <StatusPill key={i} text={msg.text} />
              ) : (
                <UserBubble key={i} text={msg.text} isLast={isLast} />
              )
            })}
          </>
        ) : (
          <>
            {messages.map((msg, i) => {
              const nextMsg = messages[i + 1]
              const isLast = !nextMsg || nextMsg.role !== msg.role
              return msg.role === "mia" ? (
                <MiaBubble key={i} text={msg.text} isLast={isLast} />
              ) : msg.role === "status" ? (
                <StatusPill key={i} text={msg.text} />
              ) : (
                <div key={i}>
                  {/* Invisible anchor — scroll target for "See My Fit Summary" */}
                  {msg.text === "Yes — show me the summary" && (
                    <div ref={summaryAnchorRef} aria-hidden="true" className="h-0" />
                  )}
                  <UserBubble text={msg.text} isLast={isLast} />
                </div>
              )
            })}

            {/* Step option chips */}
            {phase === "flow" && optionsVisible && stepIndex < STEPS.length && (
              <div className="ml-10 space-y-2 pt-1">
                {STEPS[stepIndex].options.map((opt, idx) => {
                  const isSelected = selectedOption === opt
                  return (
                    <button
                      key={opt}
                      ref={idx === 0 ? firstOptionRef : undefined}
                      type="button"
                      onClick={() => handleOption(opt)}
                      className="w-full text-left px-4 py-2.5 rounded-2xl text-sm transition-all duration-300 focus-visible:outline-none"
                      style={{
                        backgroundColor: isSelected ? "#2563EB" : "#111111",
                        color: "#FFFFFF",
                        fontFamily: "var(--font-inter), sans-serif",
                      }}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Grounded → See Fit Summary CTA */}
            {phase === "grounded" && groundedReady && (
              <div className="ml-10 pt-2 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={showFitSummary}
                  className="w-full py-3 font-bold text-sm transition-colors flex items-center justify-center gap-2 text-white hover:brightness-110 rounded-2xl"
                  style={{ backgroundColor: "#2563EB", fontFamily: "var(--font-inter), sans-serif" }}
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
                onCapture={() => {
                  setMessages((prev) => [...prev, { role: "user", text: "Connect me with enrollment" }])
                  setPhase("capture")
                }}
                onBack={goBackToGrounded}
                onReset={resetFlow}
              />
            )}
          </>
        )}
      </div>

      {/* Back / Start Over nav bar — sticky at the bottom of the guided flow */}
      {(phase === "flow" || phase === "grounded" || phase === "summary") && (
        <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-2.5 border-t border-[#E5E5E5] bg-white">
          {/* Back — rounded outline button */}
          {(phase === "flow" && stepIndex > 0) || phase === "grounded" || phase === "summary" ? (
            <button
              type="button"
              onClick={
                phase === "summary"
                  ? goBackToGrounded
                  : phase === "grounded"
                  ? () => {
                      // From grounded, go back to the last flow step (concern question)
                      const prevAnswers = answers.slice(0, 3)
                      setMessages((prev) => {
                        // Remove everything after the last flow question (concern), which is the user's answer + status pill + Mia's grounded response(s)
                        const lastFlowQ = [...prev].reverse().findIndex((m) => m.role === "mia" && m.text === STEPS[3].question)
                        const cutIdx = lastFlowQ >= 0 ? prev.length - lastFlowQ : prev.length - 2
                        return prev.slice(0, cutIdx)
                      })
                      setAnswers(prevAnswers)
                      setStepIndex(3)
                      setPhase("flow")
                      setGroundedReady(false)
                      setOptionsVisible(true)
                    }
                  : goBackOneStep
              }
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-[#CCCCCC] text-[#444444] text-[11px] font-semibold transition-colors hover:border-[#2563EB] hover:text-[#2563EB] focus-visible:outline-none"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              <ChevronLeft size={12} />
              Back
            </button>
          ) : (
            <span />
          )}

          {/* Start Over — plain blue text link */}
          <button
            type="button"
            onClick={resetFlow}
            className="text-[11px] font-semibold transition-colors text-[#2563EB] hover:text-[#1d4ed8] focus-visible:outline-none"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            Start Over
          </button>
        </div>
      )}

      {/* Minimal Lumion footer on summary screen */}
      {phase === "summary" && (
        <div className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 border-t border-[#E5E5E5] bg-white">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M2 8h4M2 12h20M2 16h4M8 4l-4 16M16 4l4 16" stroke="#AAAAAA" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="text-[10px] text-[#AAAAAA]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
            Powered by Lumion
          </span>
        </div>
      )}

      {/* Freeform "Ask Mia" input — shown on idle, flow, and grounded phases */}
      {(phase === "idle" || phase === "flow" || phase === "grounded") && (
        <div className="px-4 pt-3 pb-2 border-t border-[#E5E5E5] bg-white">
          <form
            onSubmit={(e) => { e.preventDefault(); handleFreeInput() }}
            className="flex items-center gap-2 bg-[#F5F5F5] rounded-full px-4 py-2"
          >
            <input
              type="text"
              value={freeInput}
              onChange={(e) => setFreeInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={freeAnswering}
              className="flex-1 min-w-0 bg-transparent text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none disabled:opacity-50"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            />
            <button
              type="submit"
              disabled={!freeInput.trim() || freeAnswering}
              aria-label="Send question to Mia"
              className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${freeInput.trim() && !freeAnswering ? "bg-[#2563EB] hover:bg-[#1d4ed8]" : "bg-[#CCCCCC] hover:bg-[#2563EB]"}`}
            >
              <Send size={13} />
            </button>
          </form>
          {/* Powered by Lumion footer */}
          <div className="flex items-center justify-center gap-1.5 pt-2 pb-0.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M2 8h4M2 12h20M2 16h4M8 4l-4 16M16 4l4 16" stroke="#AAAAAA" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-[10px] text-[#AAAAAA]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
              Powered by Lumion
            </span>
          </div>
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
    <div className="flex flex-col">
      <div className="space-y-3 pt-1">
        {/* Program context label — only shown when launched from a card */}
        {programContext && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="w-1.5 h-1.5 bg-[#2563EB] rounded-full shrink-0" />
            <p
              className="text-xs font-semibold text-[#2563EB]"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              {"Checking fit for: "}
              <span className="text-[#111111]">{programContext}</span>
            </p>
          </div>
        )}

        {/* Mia's opening message */}
        <MiaBubble text="Tell me what you're trying to figure out. I'll check program fit, cost, housing, timeline, and whether an advisor should follow up." />

        {/* Mia's Plan card */}
        <div className="ml-10 border border-[#E5E5E5] rounded-2xl rounded-tl-md overflow-hidden" style={{ backgroundColor: "#F8F8F8" }}>
          <div className="px-3 py-2 border-b border-[#E5E5E5] flex items-center gap-2 bg-white">
            <Clipboard size={11} className="text-[#2563EB] shrink-0" />
            <span
              className="text-[11px] font-semibold text-[#111111]"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              Mia&apos;s Plan
            </span>
          </div>
          <ol className="px-3 py-2.5 space-y-1.5">
            {PLAN_STEPS.map(({ n, label }) => (
              <li key={n} className="flex items-start gap-2.5">
                <span
                  className="shrink-0 w-4 h-4 flex items-center justify-center rounded-full bg-[#E5E5E5] text-[9px] font-bold text-[#555555] mt-px"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  {n}
                </span>
                <span className="text-xs text-[#555555] leading-snug" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{label}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* CTAs */}
      <div className="pt-3 pb-1 space-y-2 border-t border-[#E5E5E5] mt-3">
        <button
          type="button"
          onClick={onStart}
          className="w-full py-3.5 font-bold text-sm transition-colors flex items-center justify-center gap-2 text-white hover:brightness-110 rounded-2xl"
          style={{ backgroundColor: "#111111", fontFamily: "var(--font-inter), sans-serif" }}
        >
          Start Fit Check
          <ChevronRight size={15} />
        </button>
        <p className="text-center text-[10px] text-[#AAAAAA] leading-relaxed" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
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
  const [goal, experience, timeline, concern] = answers
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
          className="text-sm font-bold text-[#111111]"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Your Fit Summary
        </h2>
        <p className="text-[11px] text-[#888888] mt-0.5 leading-snug" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
          Based on your goal, experience, timeline, and main concern.
        </p>
      </div>

      {/* Section 0 — Your Answers */}
      <SummarySection label="Your Answers">
        <div className="space-y-1.5">
          {[
            ["Goal", goal],
            ["Experience", experience],
            ["Timeline", timeline],
            ["Main concern", concern?.replace(/\s*—.*$/, "").trim()],
          ]
            .filter(([, v]) => Boolean(v))
            .map(([l, v]) => (
              <div key={l} className="flex justify-between items-start gap-3 text-xs">
                <span className="text-[#888888] shrink-0" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{l}</span>
                <span className="font-semibold text-[#111111] text-right" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{v}</span>
              </div>
            ))}
        </div>
      </SummarySection>

      {/* Section 1 — Recommended Starting Point */}
      <SummarySection label="Recommended Starting Point">
        <div className="space-y-1.5">
          {[
            ["Program", program.name],
            ["Duration", program.duration],
            ["All-in tuition", program.tuition],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between items-start gap-3 text-xs">
              <span className="text-[#888888] shrink-0" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{l}</span>
              <span className="font-semibold text-[#111111] text-right" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{v}</span>
            </div>
          ))}
          <p className="text-[11px] text-[#AAAAAA] leading-snug pt-0.5" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
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
                <span className="shrink-0 w-1 h-1 rounded-full bg-[#2563EB] mt-1.5" />
                <span className="text-[#111111] leading-snug" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{b}</span>
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
              <span className="shrink-0 w-1 h-1 rounded-full bg-[#CCCCCC] mt-1.5" />
              <span className="text-[#666666] leading-snug italic" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{q}</span>
            </li>
          ))}
        </ul>
      </SummarySection>

      {/* Section 4 — Next Step */}
      <div className="border border-blue-200 bg-blue-50 px-3 py-2.5 rounded-xl">
        <p
          className="text-[10px] font-semibold tracking-wider uppercase text-[#2563EB] mb-1"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Suggested Next Step
        </p>
        <p className="text-xs text-[#111111] font-semibold leading-snug" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{nextStepText}</p>
      </div>

      {/* Guardrail */}
      <p className="text-[10px] text-[#AAAAAA] leading-relaxed px-0.5" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
        This is a fit check, not an admissions decision.
      </p>

      {/* CTAs */}
      <div className="space-y-2 pt-1 border-t border-[#E5E5E5]">
        <div className="pt-2">
          <button
            type="button"
            onClick={onCapture}
            className="w-full py-3 font-bold text-sm transition-colors flex items-center justify-center gap-2 text-white hover:brightness-110 rounded-2xl"
            style={{ backgroundColor: "#111111", fontFamily: "var(--font-inter), sans-serif" }}
          >
            Connect Me With Enrollment
            <ChevronRight size={15} />
          </button>
        </div>
        <a
          href="tel:18005551234"
          className="w-full py-2.5 border border-[#E5E5E5] text-xs font-semibold text-[#666666] hover:border-[#111] hover:text-[#111] transition-colors flex items-center justify-center rounded-2xl"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Call Directly
        </a>
      </div>
    </div>
  )
}

function SummarySection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border border-[#E5E5E5] rounded-xl overflow-hidden bg-white">
      <div className="px-3 py-2 border-b border-[#E5E5E5] bg-[#F8F8F8]">
        <span
          className="text-[10px] font-semibold tracking-wider uppercase text-[#666666]"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          {label}
        </span>
      </div>
      <div className="px-3 py-2.5">{children}</div>
    </div>
  )
}

// ─── Student Confirmation ───────────────────────��─────────────────────────────

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
          className="text-lg font-bold text-[#111111] leading-tight"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          {"You're all set."}
        </h2>
        <p className="text-xs text-[#666666] mt-1.5 leading-relaxed" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
          {"We've sent your fit summary and details to an enrollment advisor. You should hear back within one business day."}
        </p>
      </div>

      {/* ── WHAT MIA DID ──────────────────────────────────────────── */}
      <div className="border border-[#E5E5E5] rounded-xl overflow-hidden bg-white">
        <div className="px-4 py-2.5 border-b border-[#E5E5E5] bg-[#F8F8F8]">
          <span
            className="text-[10px] font-semibold tracking-wider uppercase text-[#666666]"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            What Mia Did
          </span>
        </div>
        <ul className="px-4 py-3 space-y-2">
          {MIA_RECEIPTS.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-xs">
              <div className="w-4 h-4 flex items-center justify-center shrink-0 bg-green-50 border border-green-300 rounded-full">
                <Check size={9} className="text-green-600" />
              </div>
              <span className="text-[#111111]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── WHAT THE ADVISOR WILL SEE ─────────────────────────────── */}
      <div className="border border-[#E5E5E5] rounded-xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          className="w-full px-4 py-2.5 flex items-center justify-between gap-2 hover:bg-[#F8F8F8] transition-all bg-white"
          aria-expanded={profileOpen}
        >
          <div className="flex items-center gap-2">
            <User size={11} className="text-[#888888] shrink-0" />
            <span
              className="text-[10px] font-semibold tracking-wider uppercase text-[#444444]"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              View Enrollment Profile
            </span>
          </div>
          {profileOpen ? <ChevronUp size={12} className="text-[#888888]" /> : <ChevronDown size={12} className="text-[#888888]" />}
        </button>

        {profileOpen && (
          <>
            <div className="border-t border-[#E5E5E5] px-4 py-3 space-y-2">
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
                  <span className="text-[#888888] shrink-0" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{label}</span>
                  <span className="font-semibold text-[#111111] text-right" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#E5E5E5] px-1 py-1">
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

      {/* ── Actions ─────────────────���──────────────────────────────── */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={onReset}
          className="w-full py-3 border border-[#E5E5E5] rounded-2xl text-xs font-semibold text-[#666666] hover:border-[#111] hover:text-[#111] transition-colors flex items-center justify-center gap-2"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          <RotateCcw size={11} />
          Start Over
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-[#AAAAAA] hover:text-[#666666] transition-colors flex items-center justify-center gap-1.5"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
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

  // Intent display helpers
  const intentLabel = intent === "High" ? "High" : intent === "Medium" ? "Warm" : "Researching"
  const intentColor =
    intent === "High" ? "text-green-700" : intent === "Medium" ? "text-yellow-700" : "text-[#888888]"
  const intentBg =
    intent === "High"
      ? "bg-green-50 border-green-300"
      : intent === "Medium"
      ? "bg-yellow-50 border-yellow-300"
      : "bg-[#F5F5F5] border-[#E0E0E0]"

  // Derive routing signals from answers
  const concernLabel = concern?.replace(/\s*—.*$/, "").trim() ?? "—"
  const solvableBlocker =
    concern?.toLowerCase().includes("cost")
      ? "Financing options available — solvable."
      : concern?.toLowerCase().includes("location") || concern?.toLowerCase().includes("wyom")
      ? "Housing included — solvable."
      : concern?.toLowerCase().includes("experience")
      ? "Beginner path available — solvable."
      : concern?.toLowerCase().includes("outcome")
      ? "94% hire rate, salary data available — solvable."
      : "Enrollment advisor can address directly."
  const contactWillingness = lead.phone ? "Provided phone — willing to be contacted." : "No phone — email-only follow-up."
  const fitSignal =
    experience?.includes("None") || experience?.includes("beginner")
      ? "Beginner track fit confirmed."
      : experience?.includes("on the job")
      ? "Mid-level track eligible."
      : "Advanced track eligible."

  // Concern talking points
  const talkingPoints: Record<string, string[]> = {
    cost: [
      "Walk through financing eligibility.",
      "Clarify all-in cost including housing and tools.",
      "Mention potential employer reimbursement programs.",
    ],
    location: [
      "Explain included housing in Gillette, WY.",
      "Describe what a typical week looks like on site.",
      "Offer to connect with a current student if helpful.",
    ],
    experience: [
      "Confirm the beginner path starts from zero.",
      "Explain the hands-on progression model.",
      "Share what students with no background have achieved.",
    ],
    outcome: [
      "Lead with the 94% hire rate.",
      "Share salary ranges for first-year graduates.",
      "Name specific employer partners if known.",
    ],
    fit: [
      "Walk through program options based on their goal.",
      "Discuss timeline alignment with next cohort dates.",
      "Offer a campus visit or virtual tour if available.",
    ],
  }
  const talkingPointKey = Object.keys(talkingPoints).find((k) =>
    concern?.toLowerCase().includes(k)
  ) ?? "fit"
  const concernPoints = talkingPoints[talkingPointKey]

  // Next best action
  const nextAction =
    intent === "High"
      ? `Text ${lead.name || "this student"} today with financing options, housing details, and next cohort timing.`
      : intent === "Medium"
      ? `Follow up within 48 hours. Send program guide for ${program.name} and next cohort start dates.`
      : `Add to nurture sequence. Send program overview. Check back in 2–3 weeks.`

  return (
    <div className={`space-y-4 ${embedded ? "px-3 pt-3 pb-4" : "pb-2"}`}>

      {/* ── Header ───���─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between pb-3 border-b border-[#E5E5E5] gap-3">
        <div>
          <p
            className="text-sm font-bold text-[#111111]"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            Enrollment Lead Profile
          </p>
          <p className="text-[11px] text-[#888888] mt-0.5 leading-snug" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
            Generated by Mia &middot;{" "}
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
        {!embedded && (
          <span
            className={`shrink-0 text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full border ${intentBg} ${intentColor}`}
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            {intentLabel} Intent
          </span>
        )}
      </div>

      {/* ── 1. Student Snapshot ────────────────────────────────────── */}
      <InfoSection title="Student Snapshot">
        {[
          ["Name", lead.name || "—"],
          ["Phone", lead.phone || "—"],
          ["Preferred contact", lead.contact || "—"],
          ["Best time", lead.time || "—"],
          ["Recommended program", program.name],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between items-start gap-4 text-xs">
            <span className="text-[#888888] shrink-0" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{l}</span>
            <span className="font-semibold text-[#111111] text-right" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{v}</span>
          </div>
        ))}
      </InfoSection>

      {/* ── 2. Why Mia Routed This Lead ───────────────────────────── */}
      <InfoSection title="Why Mia Routed This Lead">
        {[
          ["Intent", <span key="i" className={`font-semibold ${intentColor}`}>{intentLabel}</span>],
          ["Timeline", timeline ?? "—"],
          ["Solvable blocker", solvableBlocker],
          ["Contact willingness", contactWillingness],
          ["Fit signal", fitSignal],
        ].map(([l, v]) => (
          <div key={String(l)} className="flex justify-between items-start gap-4 text-xs">
            <span className="text-[#888888] shrink-0" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{l}</span>
            <span className="font-semibold text-[#111111] text-right" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{v}</span>
          </div>
        ))}
      </InfoSection>

      {/* ── 3. Main Concern ─────────────────────��─────────────────── */}
      <InfoSection title="Main Concern">
        <p className="text-xs font-semibold text-[#111111] mb-2" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{concernLabel}</p>
        <p
          className="text-[10px] font-semibold tracking-wider uppercase text-[#888888] mb-1.5"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Suggested Talking Points
        </p>
        <ul className="space-y-1.5">
          {concernPoints.map((pt) => (
            <li key={pt} className="flex items-start gap-2 text-xs">
              <span className="shrink-0 w-1 h-1 rounded-full bg-[#2563EB] mt-1.5" />
              <span className="text-[#555555] leading-snug" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{pt}</span>
            </li>
          ))}
        </ul>
      </InfoSection>

      {/* ── 4. Conversation Summary ───────────────────────────────── */}
      <InfoSection title="Conversation Summary">
        <p className="text-xs text-[#555555] leading-relaxed" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{conversationSummary}</p>
      </InfoSection>

      {/* ── 5. Recommended Next Best Action ──────────────────────── */}
      <div className="border border-blue-200 bg-blue-50 px-3 py-2.5 rounded-xl">
        <p
          className="text-[10px] font-semibold tracking-wider uppercase text-[#2563EB] mb-1"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Recommended Next Best Action
        </p>
        <p className="text-xs text-[#111111] font-semibold leading-snug" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{nextAction}</p>
      </div>

      {/* ── 6. Suggested Advisor Opener ───────────────────────────── */}
      <InfoSection title="Suggested Advisor Opener">
        <p className="text-xs text-[#444444] italic leading-relaxed" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{advisorScript}</p>
      </InfoSection>

      {/* ── Actions ───────────────────────────────────────────────── */}
      <div className="space-y-2 pt-1">
        <p
          className="text-[10px] font-semibold tracking-wider uppercase text-[#888888]"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Actions
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
              className="py-3 border border-[#E5E5E5] rounded-xl text-[10px] font-semibold text-[#666666] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors flex flex-col items-center gap-1.5 bg-white"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
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
      className={`relative flex flex-col overflow-hidden border border-[#E0E0E0] bg-white ${
        compact ? "h-[560px]" : "h-full"
      }`}
      style={{
        fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
        boxShadow: "0 4px 24px -4px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </div>
  )
}

function PanelHeader({ onReset, onClose, phase }: { onReset?: () => void; onClose?: () => void; phase?: Phase }) {
  const statusText =
    phase === "flow" ? "Fit Check in Progress" :
    phase === "grounded" ? "Reviewing Your Answers" :
    phase === "summary" ? "Fit Summary Ready" :
    phase === "capture" ? "Almost Done — One More Step" :
    phase === "handoff" ? "Connected to Enrollment" :
    "Online · Ask me anything"

  return (
    <div className="px-4 py-3 border-b border-[#E5E5E5] bg-white flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2.5">
        {/* WWA circular logo badge with green online dot */}
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full border-2 border-[#111] bg-white flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 40 40" width="28" height="28" aria-hidden="true">
              <circle cx="20" cy="20" r="19" fill="#111" />
              <text x="20" y="25" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="sans-serif">WWA</text>
            </svg>
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <div className="text-[#111111] font-bold text-sm">
            Western Welding Academy
          </div>
          <div className="text-[#888888] text-[11px]">{statusText}</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="p-1.5 text-[#888] hover:text-[#111] transition-colors rounded"
            title="Start over"
            aria-label="Start over"
          >
            <RotateCcw size={12} />
          </button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#888] hover:text-[#111] transition-colors rounded"
            title="Close panel"
            aria-label="Close Mia panel"
          >
            <X size={16} />
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
  const handoffActive = phase === "handoff"
  const flowDone = phase === "grounded" || summaryActive || handoffActive
  const isIdle = phase === "idle"
  if (isIdle) return null
  return (
    <div className="px-4 py-2 border-b border-[#E5E5E5] bg-white shrink-0 flex items-center gap-1.5">
      {PROGRESS_STEPS.map((label, i) => {
        const isSummaryStep = i === PROGRESS_STEPS.length - 1
        const isDone = isIdle ? false : isSummaryStep ? handoffActive : flowDone || i < answersCount
        const isActive = isIdle ? false : isSummaryStep ? summaryActive || handoffActive : !flowDone && i === stepIndex
        return (
          <div key={label} className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="w-full flex flex-col gap-0.5">
              <div
                className={`h-0.5 transition-colors ${
                  isDone || isActive ? "bg-[#2563EB]" : "bg-[#E0E0E0]"
                }`}
              />
              <span
                className={`text-[9px] font-semibold tracking-wide uppercase truncate ${
                  isDone || isActive ? "text-[#2563EB]" : "text-[#BBBBBB]"
                }`}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
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

// ─── Success Toast ────────────────────────────────────────────────────────────

function SuccessToast({ visible }: { visible: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute top-0 inset-x-0 z-50 flex items-center justify-center gap-2.5 px-4 py-3 border-b border-green-200 transition-all duration-300 bg-green-50"
      style={{
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div className="w-5 h-5 rounded-full bg-green-100 border border-green-400 flex items-center justify-center shrink-0">
        <Check size={11} className="text-green-600" />
      </div>
      <span
        className="text-xs font-semibold text-green-700"
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        Submitted — connecting you with an advisor
      </span>
    </div>
  )
}

function StatusPill({ text }: { text: string }) {
  if (!text) return null
  return (
    <div className="flex items-center gap-2 ml-10 py-1">
      <span className="w-1 h-1 rounded-full bg-[#AAAAAA] shrink-0 animate-pulse" />
      <span
        className="text-[11px] text-[#888888] italic leading-snug"
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        {text}
      </span>
    </div>
  )
}

function MiaBubble({ text, isLast = true }: { text: string; isLast?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2.5 items-end">
        <div className="w-7 h-7 rounded-full bg-[#111111] border border-[#333] shrink-0 flex items-center justify-center mb-1">
          <span className="text-white text-[8px] font-bold" style={{ fontFamily: "var(--font-inter), sans-serif" }}>M</span>
        </div>
        <div
          className="px-3.5 py-2.5 text-sm text-[#111111] leading-relaxed whitespace-pre-wrap max-w-[84%] rounded-2xl rounded-bl-md"
          style={{ backgroundColor: "#EBEBEB", fontFamily: "var(--font-inter), sans-serif" }}
        >
          {text}
        </div>
      </div>
      {isLast && (
        <span
          className="text-[10px] text-[#AAAAAA] ml-10 pl-0.5"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Admissions Assistant · AI Agent
        </span>
      )}
    </div>
  )
}

function UserBubble({ text, isLast = true }: { text: string; isLast?: boolean }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <div
        className="px-3.5 py-2.5 text-sm leading-relaxed max-w-[80%] text-white rounded-2xl rounded-br-md"
        style={{ backgroundColor: "#111111", fontFamily: "var(--font-inter), sans-serif" }}
      >
        {text}
      </div>
      {isLast && (
        <span
          className="text-[10px] text-[#AAAAAA] mr-0.5"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          just now
        </span>
      )}
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
          className="text-[10px] font-semibold tracking-wider uppercase text-[#666666] flex items-center gap-1"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          {label}
          {required && <span className="text-[#2563EB]">*</span>}
        </legend>
        {children}
      </fieldset>
    )
  }
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="text-[10px] font-semibold tracking-wider uppercase text-[#666666] flex items-center gap-1"
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        {label}
        {required && <span className="text-[#2563EB]">*</span>}
      </label>
      {children}
    </div>
  )
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p
        className="text-[10px] font-semibold tracking-wider uppercase text-[#888888]"
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        {title}
      </p>
      <div className="border border-[#E5E5E5] rounded-xl p-3 space-y-1.5 bg-white">{children}</div>
    </div>
  )
}
