import { getUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

/**
 * Dashboard — Protected page.
 * Middleware checks for cookie existence, this page validates the actual session.
 */
export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-2xl border border-(--color-border) bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-(family-name:--font-manrope) text-2xl font-bold text-heading">
              Welcome back, {user.name || "Founder"} 👋
            </h1>
            <p className="mt-1 text-sm text-muted">{user.email}</p>
          </div>
          <LogoutButton />
        </div>

        <hr className="my-6 border-(--color-border)" />

        <p className="text-body">
          Your dashboard is coming soon. This is where The Lab, Blueprint, Pitch Room, and War Room will live.
        </p>
      </div>
    </div>
  );
}
