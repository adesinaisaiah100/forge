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
    <section id="how-it-works" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="mb-12 text-center sm:mb-16">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            How it Works
          </p>
          <h2 className="font-(family-name:--font-manrope) text-3xl font-bold text-heading sm:text-4xl">
            A simple path from idea to action
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {steps.map((step, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border border-(--color-border) bg-white p-6 pl-10 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md sm:p-8 sm:pl-14"
            >
              <span className="absolute -left-3 top-0 -translate-y-1/2 select-none bg-linear-to-br from-primary to-secondary bg-clip-text text-6xl leading-none font-black text-transparent sm:-left-5 sm:text-7xl">
                {i + 1}
              </span>
              <h3 className="font-(family-name:--font-manrope) text-lg font-bold text-heading">
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
        <div className="mt-10 hidden items-center justify-center gap-4 text-sm font-medium text-muted sm:flex">
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
