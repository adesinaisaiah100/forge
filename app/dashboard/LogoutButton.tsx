"use client";

import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-[#F8FAFC] hover:text-heading"
    >
      Sign out
    </button>
  );
}
