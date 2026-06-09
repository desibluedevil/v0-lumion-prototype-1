import { Flame, HardHat, Wrench, Home } from "lucide-react"

const pillars = [
  {
    Icon: Flame,
    title: "Train Like You're Already On The Job",
    description:
      "85% of your training happens in the booth, 40 hours per week.",
  },
  {
    Icon: HardHat,
    title: "A School Built by Welders, for Welders",
    description:
      "Taught by industry veterans with 330+ years of combined experience.",
  },
  {
    Icon: Wrench,
    title: "No Experience Needed — Just Work Ethic",
    description:
      "Train from the ground up or refine your craft at the highest level.",
  },
  {
    Icon: Home,
    title: "All-Inclusive Tuition",
    description:
      "Your tuition covers everything — housing, tools and materials.",
  },
]

export default function Mission() {
  return (
    <section id="mission" className="bg-card border-t border-border">
      {/* Mission statement */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-8 pt-12 lg:pt-20 pb-12 lg:pb-16">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-0.5 w-12 bg-primary" />
            <span
              className="text-primary text-xs font-black tracking-[0.2em] uppercase"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Our Mission
            </span>
          </div>

          <h2
            className="text-foreground uppercase leading-none mb-8 text-balance"
            style={{
              fontFamily: "var(--font-barlow-condensed)",
              fontSize: "clamp(2.4rem, 4vw, 3.5rem)",
              fontWeight: 900,
              letterSpacing: "-0.01em",
            }}
          >
            We Deliver<br />
            High-Earning Careers
          </h2>

          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            Founded by welders, Western Welding Academy is committed to delivering industry-leading
            student outcomes. Train in Gillette, Wyoming, focusing on real-world training that
            prepares you for a successful welding career.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="h-px bg-border" />
      </div>

      {/* Four pillars */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 sm:divide-x-0 lg:divide-x divide-border">
          {pillars.map(({ Icon, title, description }) => (
            <div key={title} className="px-0 lg:px-10 lg:first:pl-0 lg:last:pr-0 space-y-5 py-8 sm:py-0 border-b sm:border-b-0 last:border-b-0 border-border">
              {/* Icon */}
              <div className="w-11 h-11 border border-primary/40 flex items-center justify-center">
                <Icon size={22} className="text-primary" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3
                className="text-foreground font-black uppercase leading-tight text-balance"
                style={{
                  fontFamily: "var(--font-barlow-condensed)",
                  fontSize: "1.15rem",
                  letterSpacing: "0.01em",
                }}
              >
                {title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground text-sm leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
