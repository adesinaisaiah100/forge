export default function WhatYouGet() {
  return (
    <section id="what-you-get" className="relative overflow-hidden bg-[var(--color-bg-base)] py-32">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-advent-pro)] text-4xl font-bold tracking-tight text-heading sm:text-5xl">
            Real outputs. Tangible assets.
          </h2>
          <p className="mt-6 text-lg leading-8 text-body/80">
            Don&apos;t just leave with &quot;feedback.&quot; Walk away with the actual artifacts you need to build and raise.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          
          {/* Card 1: Problem Statement */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
               <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-6 w-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
               </svg>
            </div>
            <h3 className="font-[family-name:var(--font-manrope)] text-xl font-bold text-heading">Problem Statement</h3>
            <p className="mt-2 text-sm leading-relaxed text-body/70">
              A crystal-clear definition of the pain point you&apos;re solving, structured for clarity and impact.
            </p>
          </div>

          {/* Card 2: Evaluation */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
               <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-6 w-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
               </svg>
            </div>
            <h3 className="font-[family-name:var(--font-manrope)] text-xl font-bold text-heading">Idea Evaluation</h3>
            <p className="mt-2 text-sm leading-relaxed text-body/70">
              An honest, data-backed verdict on your idea&apos;s viability, risks, and market potential.
            </p>
          </div>

          {/* Card 3: MVP List */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
               <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-6 w-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
            <h3 className="font-[family-name:var(--font-manrope)] text-xl font-bold text-heading">MVP Feature List</h3>
            <p className="mt-2 text-sm leading-relaxed text-body/70">
              A prioritized backlog of exactly what to build first—and more importantly, what to cut.
            </p>
          </div>

          {/* Card 4: Pitch Deck */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-sm transition-all hover:shadow-md lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                  </svg>
                </div>
                <h3 className="font-[family-name:var(--font-manrope)] text-xl font-bold text-heading">Structured Pitch Deck</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-body/70">
                  A slide-by-slide narrative ready for easy design. We generate the story, the flow, and the key points investors need to see.
                </p>
              </div>
              {/* Decorative mini slide preview */}
              <div className="mt-8 hidden shrink-0 sm:mt-0 sm:block">
                  <div className="h-28 w-40 rounded-lg border border-indigo-100 bg-indigo-50/50 p-3 shadow-inner">
                      <div className="h-2 w-16 rounded-full bg-indigo-200"></div>
                      <div className="mt-2 h-1.5 w-24 rounded-full bg-indigo-100"></div>
                      <div className="mt-4 flex gap-2">
                          <div className="h-10 w-full rounded bg-white shadow-sm"></div>
                          <div className="h-10 w-full rounded bg-white shadow-sm"></div>
                      </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Card 5: Roadmap */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
               <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-6 w-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.159.69.159 1.006 0z" />
               </svg>
            </div>
            <h3 className="font-[family-name:var(--font-manrope)] text-xl font-bold text-heading">Execution Roadmap</h3>
            <p className="mt-2 text-sm leading-relaxed text-body/70">
              Step-by-step guidance on what to do next, from validation to your first user.
            </p>
          </div>

        </div>

        {/* Separator / Connection */}
        <div className="mt-24 flex justify-center">
             <div className="h-16 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent"></div>
        </div>

        {/* Integrated CTA */}
        <div className="mx-auto mt-8 max-w-3xl text-center">
             <h2 className="font-[family-name:var(--font-advent-pro)] text-5xl font-bold tracking-tight text-heading sm:text-6xl">
                 Stop guessing. Start building.
             </h2>
             <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-body/80">
                 You have the idea. We provide the structure. <br/>
                 Turn your concept into a real plan in just a few minutes.
             </p>
             <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                 <a
                   href="/onboarding"
                   className="inline-flex h-14 min-w-[200px] items-center justify-center rounded-full bg-primary px-8 text-lg font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/35"
                 >
                   Start Your First Idea
                 </a>
                 <span className="text-sm text-muted">No credit card required</span>
             </div>
        </div>

      </div>
    </section>
  );
}
