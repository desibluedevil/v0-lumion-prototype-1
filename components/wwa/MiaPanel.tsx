"use client"

import { useState, useRef, useEffect } from "react"
import { Send, ChevronRight } from "lucide-react"

// ─── Flow definition ────────────────────────────────────────────────────────

type Step = {
  id: string
  label: string          // progress bar label
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

// ─── Grounded concern responses ─────────────────────────────────────────────

const CONCERN_RESPONSES: Record<string, string> = {
  "Can I afford it?":
    "WWA programs range from $17,050 to $35,800 depending on your path. Housing, tools, and materials are all included in tuition — no hidden costs.",
  "Can I move to Wyoming?":
    "Housing is included with every program. You'll move into a fully furnished home near campus. Many students relocate from out of state.",
  "Do I need experience?":
    "You do not need prior experience. WWA trains students from the ground up — our Foundational program starts with zero assumptions.",
  "Will I get a good job after?":
    "WWA graduates have a 94% hire rate. Pipeline welders can earn $80K–$150K+ annually. We'll connect you with employers before you even graduate.",
  "Which program fits me?":
    "We offer three paths: Foundational (12 weeks), Advanced Pipe (18 weeks), and Elite (24 weeks). The right one depends on your experience and goals.",
}

// ─── Types ───────────────────────────────────────────────────────────────────

type Message = {
  role: "mia" | "user"
  text: string
  options?: string[]
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MiaPanel({ compact = false }: { compact?: boolean }) {
  const [started, setStarted] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)   // 0–3: main steps; 4: grounded; 5: fit summary
  const [answers, setAnswers] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [optionsUsed, setOptionsUsed] = useState<Set<number>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // ── Derived state ──────────────────────────────────────────────────────────

  const phase: "idle" | "flow" | "grounded" | "summary" =
    !started
      ? "idle"
      : stepIndex < STEPS.length
      ? "flow"
      : stepIndex === STEPS.length
      ? "grounded"
      : "summary"

  // Current step options shown when last message is from Mia and we're in flow
  const showOptions =
    phase === "flow" &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "mia" &&
    !optionsUsed.has(stepIndex)

  // ── Helpers ────────────────────────────────────────────────────────────────

  function pushMia(text: string, delay = 0) {
    if (delay === 0) {
      setMessages((prev) => [...prev, { role: "mia", text }])
    } else {
      setTimeout(
        () => setMessages((prev) => [...prev, { role: "mia", text }]),
        delay
      )
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  function startFlow() {
    setStarted(true)
    setMessages([
      {
        role: "mia",
        text: "I'll ask you 4 quick questions to see if WWA is the right fit. No pressure — honest answers only.",
      },
    ])
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "mia", text: STEPS[0].question },
      ])
    }, 500)
  }

  function handleOption(option: string) {
    const newAnswers = [...answers, option]
    setAnswers(newAnswers)
    setOptionsUsed((prev) => new Set(prev).add(stepIndex))
    setMessages((prev) => [...prev, { role: "user", text: option }])

    const next = stepIndex + 1

    if (next < STEPS.length) {
      // Move to next flow step
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "mia", text: STEPS[next].question },
        ])
        setStepIndex(next)
      }, 400)
    } else {
      // Step 4 → grounded response
      const concern = option
      const response =
        CONCERN_RESPONSES[concern] ??
        "That's a great question. Our admissions team can walk you through the specifics based on your situation."
      setStepIndex(STEPS.length) // → "grounded" phase
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "mia", text: response }])
      }, 400)
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "mia",
            text: "Based on what you shared, I can create a quick fit summary and recommend your next step.",
          },
        ])
      }, 900)
    }
  }

  function showFitSummary() {
    setStepIndex(STEPS.length + 1) // → "summary" phase

    // Build a personal summary from answers
    const [goal, experience, timeline, concern] = answers
    const summary = [
      `Goal: ${goal ?? "—"}`,
      `Experience: ${experience ?? "—"}`,
      `Timeline: ${timeline ?? "—"}`,
      `Biggest concern: ${concern ?? "—"}`,
    ].join("\n")

    setMessages((prev) => [
      ...prev,
      { role: "user", text: "Show my fit summary" },
      {
        role: "mia",
        text: `Here's your fit snapshot:\n\n${summary}\n\nBased on this, a good next step is a no-pressure call with our admissions team. They can confirm program fit, walk through financing, and answer any specific questions.`,
      },
    ])
  }

  function handleSend() {
    if (!inputValue.trim()) return
    const text = inputValue.trim()
    setInputValue("")
    setMessages((prev) => [...prev, { role: "user", text }])
    setTimeout(() => {
      pushMia(
        "Good question. For specifics like that, our admissions team can give you the most accurate answer based on your situation. You can reach them at 1-800-580-4173 or continue the fit check above."
      )
    }, 600)
  }

  // ── Progress bar ──────────────────────────────────────────────────────────

  const PROGRESS_STEPS = [...STEPS.map((s) => s.label), "Fit Summary"]
  const progressIndex =
    phase === "idle" ? -1 : phase === "summary" ? PROGRESS_STEPS.length - 1 : stepIndex

  return (
    <div
      className={`flex flex-col bg-card border border-border ${compact ? "h-[540px]" : "h-[600px]"} overflow-hidden`}
    >
      {/* Panel header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary flex items-center justify-center">
            <span
              className="text-primary-foreground text-xs font-bold"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              MIA
            </span>
          </div>
          <div>
            <div
              className="text-foreground font-bold text-sm tracking-widest uppercase leading-none"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Ask Mia
            </div>
            <div className="text-muted-foreground text-xs mt-0.5">
              Enrollment Decision Assistant
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>

      {/* Progress indicator — visible once started */}
      {started && (
        <div className="px-5 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-1">
            {PROGRESS_STEPS.map((label, i) => {
              const done = i < progressIndex
              const active = i === progressIndex
              return (
                <div key={label} className="flex items-center gap-1 flex-1 min-w-0">
                  <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                    <div
                      className={`h-1 w-full transition-colors ${
                        done
                          ? "bg-primary"
                          : active
                          ? "bg-primary/50"
                          : "bg-border"
                      }`}
                    />
                    <span
                      className={`text-[9px] font-bold tracking-widest uppercase truncate ${
                        done || active ? "text-primary" : "text-muted-foreground/50"
                      }`}
                      style={{ fontFamily: "var(--font-barlow-condensed)" }}
                    >
                      {label}
                    </span>
                  </div>
                  {i < PROGRESS_STEPS.length - 1 && (
                    <div className="w-1 shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
      >
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
            {messages.map((msg, i) => {
              if (msg.role === "mia") {
                return (
                  <MiaBubble key={i} text={msg.text} />
                )
              }
              return (
                <div key={i} className="flex justify-end">
                  <div className="px-4 py-3 text-sm leading-relaxed max-w-[85%] bg-primary text-primary-foreground">
                    {msg.text}
                  </div>
                </div>
              )
            })}

            {/* Option chips for current flow step */}
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

            {/* Grounded step CTA */}
            {phase === "grounded" && (
              <div className="pl-10 pt-1">
                <button
                  onClick={showFitSummary}
                  className="w-full py-3 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  Show My Fit Summary
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Summary step CTAs */}
            {phase === "summary" && (
              <div className="pl-10 space-y-2 pt-1">
                <button
                  className="w-full py-3 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  Book a Call with Admissions
                </button>
                <button
                  className="w-full py-2.5 border border-border text-sm font-bold tracking-widest uppercase text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  Download Program Guide
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Freeform input — always visible once started */}
      {started && (
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

// ─── Sub-component ────────────────────────────────────────────────────────────

function MiaBubble({ text }: { text: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 bg-primary shrink-0 flex items-center justify-center mt-0.5">
        <span
          className="text-primary-foreground text-[10px] font-bold"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          MIA
        </span>
      </div>
      <div className="bg-secondary px-4 py-3 text-sm text-foreground leading-relaxed whitespace-pre-wrap max-w-[85%]">
        {text}
      </div>
    </div>
  )
}
