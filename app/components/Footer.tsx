import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-(--color-border) bg-white py-10 sm:py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 sm:flex-row sm:justify-between">
        {/* Logo + tagline */}
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg">
            <Image src="/forge-icon.png" alt="Forge Logo" width={66} height={66} />
            </div>
            <span className="font-(family-name:--font-manrope) text-2xl font-bold text-heading">
              Forge
            </span>
          </div>
          <p className="text-sm text-muted">
            Built for builders who want clarity.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted sm:justify-end">
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
