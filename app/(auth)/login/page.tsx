"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginWithOAuth } from "@/app/actions/auth";

// ──────────────────────────────────────────────
// OAuth Provider Config
// ──────────────────────────────────────────────
const providers = [
  {
    id: "google",
    name: "Google",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    ),
  },
  {
    id: "github",
    name: "GitHub",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#0A66C2" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    id: "discord",
    name: "Discord",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#5865F2" aria-hidden="true">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
];

// ──────────────────────────────────────────────
// Error messages
// ──────────────────────────────────────────────
const errorMessages: Record<string, string> = {
  oauth_failed: "Authentication was cancelled or failed. Please try again.",
  session_failed: "Could not create your session. Please try again.",
};

// ──────────────────────────────────────────────
// Page wrapper — Suspense boundary required for useSearchParams()
// ──────────────────────────────────────────────
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginSkeleton() {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-(--color-border) bg-white px-8 py-10 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-primary/20" />
          <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-gray-100" />
          <div className="mt-4 flex w-full flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Login Content — uses useSearchParams, hence needs Suspense
// ──────────────────────────────────────────────
function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuth = async (providerId: string) => {
    setLoadingProvider(providerId);
    try {
      await loginWithOAuth(providerId);
    } catch {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="rounded-2xl border border-(--color-border) bg-white px-8 py-10 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
        {/* Header */}
        <div className="mb-8 text-center">
          {/* Logo */}
          <Link href="/" className="mb-6 inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-(family-name:--font-manrope) text-xl font-bold text-heading">
              Forge
            </span>
          </Link>

          <h1 className="font-(family-name:--font-manrope) text-2xl font-bold text-heading">
            Welcome to Forge
          </h1>
          <p className="mt-2 text-sm text-muted">
            Sign in to turn your ideas into launch-ready MVPs.
          </p>
        </div>

        {/* Error message */}
        {error && errorMessages[error] && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessages[error]}
          </div>
        )}

        {/* OAuth buttons */}
        <div className="flex flex-col gap-3">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleOAuth(provider.id)}
              disabled={loadingProvider !== null}
              className="group relative flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-(--color-border) bg-white text-sm font-medium text-heading transition-all hover:border-[#CBD5E1] hover:bg-[#F8FAFC] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingProvider === provider.id ? (
                <svg
                  className="h-5 w-5 animate-spin text-muted"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                provider.icon
              )}
              <span>
                Continue with {provider.name}
              </span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-(--color-border)" />
          <span className="text-xs text-muted">No passwords needed</span>
          <div className="h-px flex-1 bg-(--color-border)" />
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs leading-relaxed text-muted">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-primary underline-offset-2 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      {/* Back to home */}
      <p className="mt-6 text-center text-sm text-muted">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-body transition-colors hover:text-heading"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>
      </p>
    </div>
  );
}
