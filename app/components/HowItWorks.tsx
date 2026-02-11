import Image from "next/image";

const steps = [
  {
    image: "/clarify.png",
    title: "Clarify Your Idea",
    description:
      "We ask focused questions that turn vague thoughts into a clear, structured problem statement.",
  },
  {
    image: "/risk.png",
    title: "Get an Honest Verdict",
    description:
      "Understand risks, differentiation, and whether the idea is worth building — no sugar-coating.",
  },
  {
    image: "/builld.png",
    title: "Build & Pitch",
    description:
      "Define your MVP feature list and generate a ready-to-share pitch deck — all from one flow.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[var(--color-bg-base)] py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="mb-16 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            How it Works
          </p>
          <h2 className="font-[family-name:var(--font-manrope)] text-3xl font-bold text-heading sm:text-4xl">
            A simple path from idea to action
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className="group relative  rounded-2xl border border-[var(--color-border)] bg-white p-8 pl-14 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <span className="absolute -left-5 top-0 -translate-y-1/2 text-7xl font-black leading-none bg-gradient-to-br from-[#2563EB] to-[#10B981] bg-clip-text text-transparent  select-none">
                {i + 1}
              </span>
              <h3 className="font-[family-name:var(--font-manrope)] text-lg font-bold text-heading">
                {step.title}
              </h3>
              <p className="mt-2 leading-relaxed text-body">
                {step.description}
              </p>
              <div className="mt-5 flex justify-center">
                <Image src={step.image} alt={step.title} width={180} height={180} className="drop-shadow-sm" />
              </div>
            </div>
          ))}
        </div>

        {/* Flow indicator */}
        <div className="mt-12 flex items-center justify-center gap-4 text-sm font-medium text-muted">
          <span className="rounded-full bg-blue-50 px-4 py-1.5 text-primary">
            Describe
          </span>
          <span>→</span>
          <span className="rounded-full bg-blue-50 px-4 py-1.5 text-primary">
            Evaluate
          </span>
          <span>→</span>
          <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-secondary">
            Build
          </span>
        </div>
      </div>
    </section>
  );
}
