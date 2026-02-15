import { getUserIdeas } from "@/app/actions/ideas";
import { Plus, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogoutButton } from "./LogoutButton";
import Image from "next/image";

/**
 * Dashboard — lists all user ideas with their latest evaluation status.
 * Each idea card links to the full workspace view.
 */
export default async function DashboardPage() {
  const ideas = await getUserIdeas();

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full items-center justify-between px-6 py-4">
          <div className="flex gap-1 justify-center items-center">
            
            <Image src="/forgeicon.png" alt="icon" width={42} height={42} />
             <h1 className="text-xl font-bold text-slate-900">Forge</h1>
        
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              New Idea
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full px-6 py-10">
        {ideas.length === 0 ? (
          /* Empty State */
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
        ) : (
          /* Ideas Grid */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Your Ideas</h2>
              <span className="text-sm text-slate-500">{ideas.length} idea{ideas.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ideas.map((idea) => (
                <Link
                  key={idea.$id}
                  href={`/dashboard/ideas/${idea.$id}`}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {idea.stage}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 line-clamp-2 group-hover:text-slate-700 transition-colors">
                      {idea.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                      {idea.idea.substring(0, 120)}
                      {idea.idea.length > 120 ? "..." : ""}
                    </p>
                  </div>
                  <div className={cn(
                    "mt-4 flex items-center justify-between pt-4 border-t border-slate-100"
                  )}>
                    <span className="text-xs text-slate-400">
                      {new Date(idea.$createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 group-hover:text-slate-900 transition-colors">
                      Open <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
