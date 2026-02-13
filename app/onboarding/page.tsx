"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import gsap from "gsap";
import { submitIdea } from "@/app/actions/ideas";
import { useIdeaStore } from "@/lib/stores/idea-store";

// Step definitions
const STEPS = [
  {
    id: 0,
    label: "Idea",
    question: "Describe your idea in one sentence.",
    supporting:
      "Don\u2019t overthink it. Just explain what you\u2019re building and for whom.",
    placeholder:
      "A platform that helps freelance designers automate client invoicing.",
    type: "idea" as const,
  },
  {
    id: 1,
    label: "User",
    question: "Who is this built for?",
    supporting:
      "Be specific. Avoid \u201Ceveryone.\u201D\nGood: \u201CFreelance graphic designers working with 3\u201310 clients.\u201D\nBad: \u201CAnyone who needs invoices.\u201D",
    placeholder: "Describe your target user\u2026",
    type: "text" as const,
  },
  {
    id: 2,
    label: "Problem",
    question: "What specific problem are they experiencing?",
    supporting:
      "What\u2019s frustrating, inefficient, expensive, or painful? Be as specific as possible.",
    placeholder: "Describe the core problem\u2026",
    type: "text" as const,
  },
  {
    id: 3,
    label: "Alternatives",
    question: "How are they solving this today?",
    supporting:
      "List tools, workarounds, or competitors. This helps assess competition and differentiation.",
    placeholder: "Current solutions or workarounds\u2026",
    type: "text" as const,
  },
  {
    id: 4,
    label: "Timing",
    question: "Why is this the right time for this idea?",
    supporting:
      "What changed? Technology? Behavior? Market shift? This forces depth beyond \u201Cbecause it\u2019s cool.\u201D",
    placeholder: "What makes now the right moment\u2026",
    type: "text" as const,
  },
  {
    id: 5,
    label: "You",
    question: "Why are you the right person to build this?",
    supporting:
      "Experience, access, insight, unfair advantage. This is optional \u2014 but powerful.",
    placeholder: "Your unique advantage\u2026",
    type: "text" as const,
  },
];

const STAGES = [
  "Just an idea",
  "Validating",
  "Building MVP",
  "Already launched",
];

export default function OnboardingPage() {
  const router = useRouter();
  const stepRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<number, string>>({});
  const [stage, setStage] = useState<string | null>(null);
  const setIdea = useIdeaStore((state) => state.setIdea);

  // Animate step transition
  const animateStep = useCallback(
    (direction: "next" | "prev") => {
      if (!stepRef.current || isAnimating) return;
      setIsAnimating(true);

      const yOut = direction === "next" ? -60 : 60;
      const yIn = direction === "next" ? 60 : -60;

      gsap.to(stepRef.current, {
        opacity: 0,
        y: yOut,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setCurrentStep((prev) =>
            direction === "next" ? prev + 1 : prev - 1
          );
          gsap.set(stepRef.current, { y: yIn, opacity: 0 });
          gsap.to(stepRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
            onComplete: () => setIsAnimating(false),
          });
        },
      });
    },
    [isAnimating]
  );

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) animateStep("next");
  };

  const handleBack = () => {
    if (currentStep > 0) animateStep("prev");
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const doc = await submitIdea({
        idea: formData[0] || "",
        targetUser: formData[1] || "",
        problem: formData[2] || "",
        alternatives: formData[3] || "",
        timing: formData[4] || "",
        founderFit: formData[5] || "",
        stage: stage || "Just an idea",
      });

      // Cache in Zustand for instant access on dashboard
      setIdea(doc);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  const step = STEPS[currentStep];

  return (
    <div className="relative min-h-screen bg-white">
      {/* Fixed logo */}
      <div className="fixed left-0 top-0 z-50 px-6 pt-6 sm:px-10 sm:pt-8">
        <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 backdrop-blur-md">
          <Image
            src="/forge-icon.png"
            alt="Forge Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="font-[family-name:var(--font-manrope)] text-lg font-bold text-heading">
            Forge
          </span>
        </div>
      </div>

      {/* Full-screen form */}
      <div className="flex min-h-screen">
        {/* Progress chain  left side (hidden on mobile) */}
        <div className="hidden w-20 flex-shrink-0 items-center justify-center py-16 sm:flex lg:w-28">
          <div className="relative flex flex-col items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex flex-col items-center">
                {/* Circle */}
                <div className="relative z-10 flex items-center justify-center">
                  {i < currentStep ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-white transition-all duration-300">
                      <Check className="h-4 w-4" />
                    </div>
                  ) : i === currentStep ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/25 transition-all duration-300">
                      <span className="text-xs font-bold">{i}</span>
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--color-border)] bg-white text-muted transition-all duration-300">
                      <span className="text-xs font-medium">{i}</span>
                    </div>
                  )}
                </div>
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-10 w-0.5 transition-colors duration-300 ${
                      i < currentStep
                        ? "bg-secondary"
                        : "bg-[var(--color-border)]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form content  centered */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-10 lg:px-16">
          {/* Mobile step indicator */}
          <div className="mb-8 flex items-center gap-2 sm:hidden">
            <span className="text-sm font-medium text-muted">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>

          <div ref={stepRef} className="w-full max-w-3xl">
            {/* Welcome header  only on step 0 */}
            {currentStep === 0 && (
              <div className="mb-10">
                            
                <p className="mt-3 max-w-full text-base leading-relaxed text-body \">
                  We&apos;ll walk you through a few focused questions to clarify
                  what you&apos;re building and why it matters.
                </p>
                <div className="mt-6 h-px w-full bg-[var(--color-border)]" />
              </div>
            )}

            {/* Step label */}
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
              Step {step.id + 1} &mdash; {step.label}
            </span>

            {/* Question */}
            <h2 className="font-[family-name:var(--font-manrope)] text-2xl font-semibold leading-snug text-heading sm:text-3xl">
              {step.question}
            </h2>

            {/* Supporting text */}
            <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-muted">
              {step.supporting}
            </p>

            {/* Input */}
            <div className="mt-8">
              <textarea
                value={formData[step.id] || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    [step.id]: e.target.value,
                  }))
                }
                placeholder={step.placeholder}
                rows={4}
                className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-base)] px-5 py-4 text-base text-heading placeholder:text-muted/60 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Stage picker  only on step 0 */}
            {step.type === "idea" && (
              <div className="mt-6">
                <p className="mb-3 text-sm font-medium text-body">
                  What stage is this idea in?
                </p>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStage(s)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                        stage === s
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-[var(--color-border)] bg-white text-body hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-10 flex items-center gap-4">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  disabled={isAnimating}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-6 text-sm font-medium text-body transition-colors hover:bg-[var(--color-bg-base)] hover:text-heading disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              )}
              {currentStep < STEPS.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={isAnimating}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={handleFinish}
                    disabled={isAnimating || isSubmitting}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-secondary px-8 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-secondary-hover disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        Finish
                        <Check className="h-4 w-4" />
                      </>
                    )}
                  </button>
                  {submitError && (
                    <p className="text-sm text-red-500">{submitError}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
