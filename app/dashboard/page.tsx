import { getUserIdeas } from "@/app/actions/ideas";
import { Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "./LogoutButton";
import Image from "next/image";
import { Suspense } from "react";
import { IdeasGrid } from "./components/IdeasGrid";

/**
 * Dashboard — lists all user ideas with their latest evaluation status.
 * Each idea card links to the full workspace view.
 */
export default async function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center justify-center gap-1 sm:justify-start">
            
            <Image src="/forgeicon.png" alt="icon" width={42} height={42} />
             <h1 className="text-xl font-bold text-slate-900">Forge</h1>
        
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
            <Link
              href="/onboarding"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex-none"
            >
              <Plus className="h-4 w-4" />
              New Idea
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full px-4 py-8 sm:px-6 sm:py-10">
        <Suspense fallback={<IdeasGridSkeleton />}>
          <IdeasContent />
        </Suspense>
      </main>
    </div>
  );
}

async function IdeasContent() {
  const ideas = await getUserIdeas();

  if (ideas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
        <div className="rounded-full bg-slate-100 p-4">
          <Sparkles className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">No ideas yet</h2>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Submit your first idea and get a strategic evaluation powered by our AI analysis engine.
        </p>
        <Link
          href="/onboarding"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Start with an Idea
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <IdeasGrid ideas={ideas} />
    </div>
  );
}

function IdeasGridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-6 w-28 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-14 animate-pulse rounded bg-slate-200" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div>
              <div className="mb-3 h-5 w-20 animate-pulse rounded bg-slate-100" />
              <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-12 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
