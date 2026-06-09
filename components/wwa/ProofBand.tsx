const stats = [
  { value: "2,000+", label: "Graduates" },
  { value: "94%", label: "Get Hired" },
  { value: "85%", label: "Hands-On Training" },
  { value: "Included", label: "Housing, Tools & Materials" },
]

export default function ProofBand() {
  return (
    <section id="proof" className="bg-primary border-y border-primary/80">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="grid grid-cols-4 divide-x divide-primary-foreground/20">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="px-8 py-8 flex flex-col items-center text-center"
            >
              <span
                className="text-primary-foreground leading-none font-black tracking-tight"
                style={{
                  fontFamily: "var(--font-barlow-condensed)",
                  fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
                }}
              >
                {stat.value}
              </span>
              <span
                className="text-primary-foreground/80 text-sm font-bold tracking-[0.15em] uppercase mt-2"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
