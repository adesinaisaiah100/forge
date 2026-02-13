/**
 * Auth Layout — wraps /login (and future auth pages)
 * Split layout: form on the left, image on the right.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg-base)]">
      {children}
    </div>
  );
}
