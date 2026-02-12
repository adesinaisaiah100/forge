/**
 * Auth Layout — wraps /login (and future auth pages)
 * No Navbar or Footer — just centred content with a clean background.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)] px-4">
      {children}
    </div>
  );
}
