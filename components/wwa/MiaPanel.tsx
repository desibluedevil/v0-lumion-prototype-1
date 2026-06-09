"use client"

import { useState } from "react"
import { Send, ChevronRight } from "lucide-react"

type Message = {
  role: "mia" | "user"
  text: string
}

const FIT_CHECK_FLOW: { question: string; options: string[] }[] = [
  {
    question: "What's your current situation?",
    options: [
      "I'm employed but want a career change",
      "I'm between jobs",
      "I'm a recent graduate",
      "I'm exploring options",
    ],
  },
  {
    question: "What's your timeline for starting training?",
    options: [
      "ASAP — within the next month",
      "3–6 months from now",
      "6–12 months out",
      "Just researching for now",
    ],
  },
  {
    question: "How are you thinking about funding?",
    options: [
      "I'll need financial aid or loans",
      "I have savings or employer support",
      "I'm not sure yet — I need to learn more",
    ],
  },
  {
    question: "Any prior welding or trade experience?",
    options: [
      "None — complete beginner",
      "Some hobby or shop class experience",
      "I've welded professionally before",
    ],
  },
]

export default function MiaPanel({ compact = false }: { compact?: boolean }) {
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [finished, setFinished] = useState(false)

  function startFitCheck() {
    setStarted(true)
    setMessages([
      {
        role: "mia",
        text: "Great — let's figure out if WWA is the right fit for you. I'll ask you 4 quick questions. Takes about 2 minutes.",
      },
    ])
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "mia", text: FIT_CHECK_FLOW[0].question },
      ])
    }, 600)
  }

  function handleOption(option: string) {
    const nextMessages: Message[] = [
      ...messages,
      { role: "user", text: option },
    ]
    const nextStep = step + 1

    if (nextStep < FIT_CHECK_FLOW.length) {
      setMessages([
        ...nextMessages,
        { role: "mia", text: FIT_CHECK_FLOW[nextStep].question },
      ])
      setStep(nextStep)
    } else {
      setMessages([
        ...nextMessages,
        {
          role: "mia",
          text: "Based on what you've shared, WWA could be a strong fit. Our Foundational Pipe Welder program is a great starting point — 12 weeks, full hands-on training, and housing is included. Want me to send you the program details?",
        },
      ])
      setFinished(true)
    }
  }

  function handleSend() {
    if (!inputValue.trim()) return
    const text = inputValue.trim()
    setInputValue("")
    setMessages((prev) => [...prev, { role: "user", text }])
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "mia",
          text: "Thanks for sharing that. To give you the most accurate picture, I'd recommend booking a quick call with our admissions team — they can answer specific questions about your situation.",
        },
      ])
    }, 800)
  }

  const currentOptions =
    started && !finished && step < FIT_CHECK_FLOW.length
      ? FIT_CHECK_FLOW[step].options
      : []

  const showOptions =
    messages.length > 0 &&
    messages[messages.length - 1].role === "mia" &&
    currentOptions.length > 0

  return (
    <div
      className={`flex flex-col bg-card border border-border ${compact ? "h-[480px]" : "h-[520px]"} overflow-hidden`}
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin">
        {!started ? (
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-7 h-7 bg-primary shrink-0 flex items-center justify-center mt-0.5">
                  <span
                    className="text-primary-foreground text-[10px] font-bold"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    MIA
                  </span>
                </div>
                <div className="bg-secondary px-4 py-3 text-sm text-foreground leading-relaxed">
                  I can help you figure out if welding school makes sense for your goals, budget, timeline, and experience level.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 shrink-0" />
                <div className="bg-secondary px-4 py-3 text-sm text-foreground leading-relaxed">
                  This isn&apos;t a sales pitch. It&apos;s a 2-minute fit check — honest answers, no pressure.
                </div>
              </div>
            </div>
            <button
              onClick={startFitCheck}
              className="w-full mt-4 py-3 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Start 2-Minute Fit Check
              <ChevronRight size={16} />
            </button>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {msg.role === "mia" && (
                  <div className="w-7 h-7 bg-primary shrink-0 flex items-center justify-center mt-0.5">
                    <span
                      className="text-primary-foreground text-[10px] font-bold"
                      style={{ fontFamily: "var(--font-barlow-condensed)" }}
                    >
                      MIA
                    </span>
                  </div>
                )}
                <div
                  className={`px-4 py-3 text-sm leading-relaxed max-w-[85%] ${
                    msg.role === "mia"
                      ? "bg-secondary text-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {showOptions && (
              <div className="pl-10 space-y-2">
                {currentOptions.map((opt) => (
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
            {finished && (
              <div className="pl-10 space-y-2">
                <button className="w-full py-3 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  Send Me Program Details
                </button>
                <button className="w-full py-2 border border-border text-sm font-semibold tracking-widest uppercase text-muted-foreground hover:border-foreground hover:text-foreground transition-colors" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  Talk to Admissions
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      {started && !finished && (
        <div className="px-4 py-3 border-t border-border shrink-0 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Or type your question..."
            className="flex-1 bg-input border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleSend}
            className="px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
