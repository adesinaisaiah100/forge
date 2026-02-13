"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import Image from "next/image";

gsap.registerPlugin(useGSAP, MotionPathPlugin);

const steps = [
  {
    num: "1",
    title: "Rough Idea",
    desc: "Turn your raw idea into a clear problem by identifying who it’s for, what hurts, and why it matters now.",
    badgeBg: "bg-primary/15",
    badgeText: "text-primary",
    hoverBg: "group-hover:bg-primary/25",
  },
  {
    num: "2",
    title: "Validation",
    desc: "Pressure-test the idea by looking at real demand, existing alternatives, and whether this is worth pursuing.",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-600",
    hoverBg: "group-hover:bg-emerald-200",
  },
  {
    num: "3",
    title: "MVP Plan",
    desc: "Decide what to build first by defining a focused MVP that’s small enough to ship and learn from.",
    badgeBg: "bg-sky-100",
    badgeText: "text-sky-600",
    hoverBg: "group-hover:bg-sky-200",
  },
  {
    num: "4",
    title: "Pitch & Launch",
    desc: "Turn your idea into a clear story with a pitch deck and concrete next steps to share and launch.",
    badgeBg: "bg-gradient-to-r from-[#2563EB] to-[#10B981]",
    badgeText: "text-white shadow-sm",
    hoverBg: "",
  },
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const connectors = containerRef.current.querySelectorAll("[data-connector]");
      const badges = containerRef.current.querySelectorAll("[data-badge]");
      const cards = containerRef.current.querySelectorAll("[data-card]");

      if (!connectors.length || !cards.length) return;

      // Stagger card entrance
      gsap.fromTo(
        cards,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: "power2.out", delay: 0.3 }
      );

      // Sequential pulse: card 1 scales → pulse travels connector 1 → card 2 scales → ...
      const masterTl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

      // First card scales at the very start
      masterTl.fromTo(
        cards[0],
        { scale: 1 },
        { scale: 1.04, duration: 0.3, ease: "back.out(2)" },
        0
      );
      masterTl.to(cards[0], { scale: 1, duration: 0.25, ease: "power2.in" }, 0.3);

      connectors.forEach((svgEl, i) => {
        const path = svgEl.querySelector("path") as SVGPathElement;
        const dot = svgEl.querySelector("circle") as SVGCircleElement;
        if (!path || !dot) return;

        const offset = i * 1.4; // sequential timing

        // Pulse dot appears, travels along connector path
        const segTl = gsap.timeline();
        segTl.set(dot, { attr: { opacity: 0 } });
        segTl.to(dot, { attr: { opacity: 0.95 }, duration: 0.2 });
        segTl.to(
          dot,
          {
            duration: 1,
            ease: "power1.inOut",
            motionPath: {
              path,
              align: path,
              alignOrigin: [0.5, 0.5],
            },
          },
          0
        );
        segTl.to(dot, { attr: { opacity: 0 }, duration: 0.2 }, 0.8);

        masterTl.add(segTl, offset + 0.5);

        // Next card scales up when pulse arrives
        const nextCard = cards[i + 1];
        if (nextCard) {
          masterTl.fromTo(
            nextCard,
            { scale: 1 },
            { scale: 1.19, duration: 0.3, ease: "back.out(2)" },
            offset + 1.3
          );
          masterTl.to(nextCard, { scale: 1, duration: 0.25, ease: "power2.in" }, offset + 1.6);
        }
      });
    },
    { scope: containerRef, dependencies: [] }
  );

  return (
    <section className="relative flex min-h-[calc(100vh-72px)] flex-col overflow-hidden bg-white">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(37,99,235,0.10),transparent_40%),radial-gradient(circle_at_80%_15%,rgba(16,185,129,0.10),transparent_35%)]" />

      {/* Content — centered column */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-5 px-6 pt-8 pb-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-3 py-1 text-xs font-semibold text-body/80 shadow-sm ring-1 ring-[var(--color-border)]/70 backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Idea to MVP, guided.
        </div>

        <h1 className="font-[family-name:var(--font-manrope)] text-4xl font-extrabold leading-tight tracking-tight text-heading sm:text-5xl lg:text-6xl">
          Turn messy idea into a{' '}
          <span className="bg-gradient-to-r from-[#2563EB] to-[#10B981] bg-clip-text text-transparent">
            launch-ready
          </span>{' '}
          product story.
        </h1>

        <p className="max-w-2xl text-lg leading-relaxed text-body/80">
          Describe your idea, get an honest verdict, define your MVP, and generate a pitch deck — all in one guided flow.
        </p>

        <div className="flex flex-col gap-3 pt-1 sm:flex-row">
          <a
            href="/onboarding"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/35"
          >
            Start with an Idea
          </a>
          <a
            href="#how-it-works"
            className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--color-border)] px-7 text-base font-semibold text-body transition-all hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-sm hover:ring-1 hover:ring-[var(--color-border)]"
          >
            See How It Works
          </a>
        </div>

        <div className="flex items-center gap-3 pt-1 text-sm text-muted">
          <div className="flex -space-x-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary/60 text-[10px] font-bold text-white shadow ring-2 ring-white">A</span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-[10px] font-bold text-white shadow ring-2 ring-white">B</span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-[10px] font-bold text-white shadow ring-2 ring-white">C</span>
          </div>
          <span className="text-body/80">Guided by founders, PMs, and designers who ship.</span>
        </div>
      </div>

      {/* Horizontal flow illustration — Card → Connector → Card → ... */}
      <div ref={containerRef} className="relative mx-auto w-full max-w-7xl px-6 pb-12 lg:px-10 mt-15">
        {/* Glow behind cards */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(ellipse_at_50%_100%,rgba(37,99,235,0.10),transparent_60%),radial-gradient(ellipse_at_70%_90%,rgba(16,185,129,0.10),transparent_50%)]" />

        {/* Mobile: stacked cards. Desktop: interleaved row */}
        <div className="relative flex flex-col items-stretch gap-4 pt-8 md:flex-row md:items-stretch md:gap-0">

          {/* Card 1 */}
          <div data-card className="relative group flex-1 flex flex-col items-center rounded-2xl border border-white/50 bg-white/70 px-5 pb-5 pt-10 shadow-lg ring-1 ring-[var(--color-border)]/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
              <Image src="/bulb.png" alt="Rough Idea" width={42} height={42} className="drop-shadow-md" />
            </div>
            <span className="font-[family-name:var(--font-nunito)] text-lg font-semibold text-heading">Rough Idea</span>
          </div>

          {/* Connector 1→2 */}
          <div className="hidden shrink-0 self-center overflow-visible md:flex">
          <svg data-connector aria-hidden="true" viewBox="0 0 80 40" className="mx-1 h-10 w-20 overflow-visible">
            <defs>
              <linearGradient id="cg1" x1="0" x2="1" y1="0" y2="0">
                <stop stopColor="#2563EB" offset="0%" stopOpacity="0.4" />
                <stop stopColor="#10B981" offset="100%" stopOpacity="0.4" />
              </linearGradient>
              <radialGradient id="pg1">
                <stop stopColor="#2563EB" offset="0%" stopOpacity="0.95" />
                <stop stopColor="#10B981" offset="100%" stopOpacity="0" />
              </radialGradient>
            </defs>
            <path d="M2 20 C20 10, 60 30, 78 20" fill="none" stroke="url(#cg1)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="0" cy="0" r="10" fill="url(#pg1)" opacity="0" />
          </svg>
          </div>

          {/* Card 2 */}
          <div data-card className="relative group flex-1 flex flex-col items-center rounded-2xl border border-white/55 bg-white/75 px-5 pb-5 pt-10 shadow-lg ring-1 ring-[var(--color-border)]/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
              <Image src="/validated idea.png" alt="Validation" width={82} height={82} className="drop-shadow-md" />
            </div>
            <span className="font-[family-name:var(--font-nunito)] text-lg font-semibold text-heading">Validation</span>
          </div>

          {/* Connector 2→3 */}
          <div className="hidden shrink-0 self-center overflow-visible md:flex">
          <svg data-connector aria-hidden="true" viewBox="0 0 80 40" className="mx-1 h-10 w-20 overflow-visible">
            <defs>
              <linearGradient id="cg2" x1="0" x2="1" y1="0" y2="0">
                <stop stopColor="#2563EB" offset="0%" stopOpacity="0.4" />
                <stop stopColor="#10B981" offset="100%" stopOpacity="0.4" />
              </linearGradient>
              <radialGradient id="pg2">
                <stop stopColor="#10B981" offset="0%" stopOpacity="0.95" />
                <stop stopColor="#2563EB" offset="100%" stopOpacity="0" />
              </radialGradient>
            </defs>
            <path d="M2 20 C20 30, 60 10, 78 20" fill="none" stroke="url(#cg2)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="0" cy="0" r="10" fill="url(#pg2)" opacity="0" />
          </svg>
          </div>

          {/* Card 3 */}
          <div data-card className="relative group flex-1 flex flex-col items-center rounded-2xl border border-white/55 bg-white/75 px-5 pb-5 pt-10 shadow-lg ring-1 ring-[var(--color-border)]/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
              <Image src="/plan.png" alt="MVP Plan" width={42} height={42} className="drop-shadow-md" />
            </div>
            <span className="font-[family-name:var(--font-nunito)] text-lg font-semibold text-heading">MVP Plan</span>
          </div>

          {/* Connector 3→4 */}
          <div className="hidden shrink-0 self-center overflow-visible md:flex">
          <svg data-connector aria-hidden="true" viewBox="0 0 80 40" className="mx-1 h-10 w-20 overflow-visible">
            <defs>
              <linearGradient id="cg3" x1="0" x2="1" y1="0" y2="0">
                <stop stopColor="#10B981" offset="0%" stopOpacity="0.4" />
                <stop stopColor="#2563EB" offset="100%" stopOpacity="0.4" />
              </linearGradient>
              <radialGradient id="pg3">
                <stop stopColor="#2563EB" offset="0%" stopOpacity="0.95" />
                <stop stopColor="#10B981" offset="100%" stopOpacity="0" />
              </radialGradient>
            </defs>
            <path d="M2 20 C20 10, 60 30, 78 20" fill="none" stroke="url(#cg3)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="0" cy="0" r="10" fill="url(#pg3)" opacity="0" />
          </svg>
          </div>

          {/* Card 4 */}
          <div data-card className="relative group flex-1 flex flex-col items-center rounded-2xl border border-white/60 bg-white/80 px-5 pb-5 pt-10 shadow-lg ring-1 ring-[var(--color-border)]/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
              <Image src="/launch.png" alt="Pitch & Launch" width={42} height={42} className="drop-shadow-md" />
            </div>
            <span className="font-[family-name:var(--font-nunito)] text-lg font-semibold text-heading">Pitch & Launch</span>
          </div>

        </div>
      </div>
    </section>
  );
}
