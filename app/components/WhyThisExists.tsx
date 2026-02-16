import Image from "next/image";

export default function WhyThisExists() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-28">
      {/* Left image — chaos/ideas */}
      <div className="pointer-events-none absolute left-20 top-1/2 -translate-y-1/2 hidden lg:block">
        <Image src="/chaosideas.png" alt="" width={290} height={290} className="opacity-80" />
      </div>

      {/* Right image — structure */}
      <div className="pointer-events-none absolute right-20 top-1/2 -translate-y-1/2 hidden lg:block">
        <Image src="/structure.png" alt="" width={290} height={290} className="opacity-80" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        {/* Label */}
        <p className="mb-6 text-sm font-semibold uppercase tracking-wider text-primary">
          Why We Exist
        </p>

        {/* Hero statement */}
        <h2 className="font-(family-name:--font-manrope) text-3xl font-extrabold leading-tight text-heading sm:text-6xl">
          The world doesn&apos;t need more ideas.
        </h2>
        <h2 className="mt-1 font-(family-name:--font-manrope) text-3xl font-extrabold leading-tight sm:text-6xl">
          It needs{" "}
          <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            clearer ones.
          </span>
        </h2>

        {/* Body */}
        <div className="mx-auto mt-12 max-w-xl space-y-6 text-lg leading-loose text-body/90">
          <p>
            Most founders don&apos;t struggle with creativity — they struggle with <span className="font-semibold text-heading">direction.</span>
          </p>

          <div className="space-y-2 text-base leading-relaxed text-body/80">
            <p>What problem are we really solving?</p>
            <p>Who is this actually for?</p>
            <p>What should we build first?</p>
            <p>Is this even worth building?</p>
          </div>

          <p>
            We built <span className="font-semibold text-heading">Forge</span> to bring structure to that chaos.
          </p>

          <p>
            Not to replace your thinking — but to <span className="font-semibold text-heading">sharpen</span> it.<br />
            Not to generate hype — but to create <span className="font-semibold text-heading">clarity.</span>
          </p>

          <p>
            Because the difference between an idea and a real product isn&apos;t inspiration.
          </p>
        </div>

        {/* Final punch line */}
        <p className="mt-12 font-(family-name:--font-manrope) text-2xl font-extrabold tracking-tight text-heading sm:mt-14 sm:text-3xl">
          It&apos;s{" "}
          <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            decisions.
          </span>
        </p>
      </div>
    </section>
  );
}
