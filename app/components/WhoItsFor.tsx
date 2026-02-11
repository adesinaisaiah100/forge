const audiences = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: "First-time Founders",
    description:
      "You have an idea but no playbook. Forge gives you the structure to move from concept to action.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: "Solo Builders",
    description:
      "No co-founder to bounce ideas off? Forge acts as your structured thinking partner.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    title: "Students with Startup Ideas",
    description:
      "Turn class projects and hackathon sparks into validated, presentable startup plans.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Non-technical Entrepreneurs",
    description:
      "You don't need to code to build something real. Start with clarity, not complexity.",
  },
];

export default function WhoItsFor() {
  return (
    <section id="who-its-for" className="bg-[var(--color-bg-base)] py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            Who it&apos;s For
          </p>
          <h2 className="font-[family-name:var(--font-advent-pro)] text-4xl font-bold text-heading sm:text-5xl lg:text-6xl">
            Built for people who want to build
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((a, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[var(--color-border)] bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                {a.icon}
              </div>
              <h3 className="font-[family-name:var(--font-manrope)] text-base font-bold text-heading">
                {a.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-body">
                {a.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
