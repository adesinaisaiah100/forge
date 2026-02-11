export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-white py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 sm:flex-row sm:justify-between">
        {/* Logo + tagline */}
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <svg
                width="14"
                height="14"
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
            <span className="font-[family-name:var(--font-manrope)] text-lg font-bold text-heading">
              Forge
            </span>
          </div>
          <p className="text-sm text-muted">
            Built for builders who want clarity.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-6 text-sm text-muted">
          <a href="#" className="transition-colors hover:text-heading">
            About
          </a>
          <a href="#" className="transition-colors hover:text-heading">
            Contact
          </a>
          <a href="#" className="transition-colors hover:text-heading">
            Privacy
          </a>
          <a href="#" className="transition-colors hover:text-heading">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
