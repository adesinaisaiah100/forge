"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full px-4 pt-4 pb-0">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl bg-white/30 px-5 backdrop-blur-xl shadow-[0_8px_32px_-12px_rgba(15,23,42,0.15)] ring-1 ring-white/40 border border-white/30 md:rounded-full md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg ">
           <Image src="/forge-icon.png" alt="Forge Logo" width={36} height={36} />
          </div>
          <span className="font-[family-name:var(--font-manrope)] text-xl font-bold text-heading">
            Forge
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-body transition-colors hover:text-heading"
          >
            How it Works
          </a>
          <a
            href="#who-its-for"
            className="text-sm font-medium text-body transition-colors hover:text-heading"
          >
            Who it&apos;s For
          </a>
          <a
            href="#what-you-get"
            className="text-sm font-medium text-body transition-colors hover:text-heading"
          >
          Outcomes
          </a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-body transition-colors hover:text-heading"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            Start an Idea
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-white/40 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="mx-auto mt-2 w-full max-w-6xl rounded-2xl border border-white/60 bg-white/70 px-4 py-4 backdrop-blur-xl ring-1 ring-[var(--color-border)]/70 shadow-[0_12px_36px_-18px_rgba(15,23,42,0.3)] md:hidden">
          <div className="flex flex-col gap-4">
            <a href="#how-it-works" className="text-sm font-medium text-body" onClick={() => setMobileMenuOpen(false)}>
              How it Works
            </a>
            <a href="#who-its-for" className="text-sm font-medium text-body" onClick={() => setMobileMenuOpen(false)}>
              Who it&apos;s For
            </a>
            <a href="#what-you-get" className="text-sm font-medium text-body" onClick={() => setMobileMenuOpen(false)}>
              What You Get
            </a>
            <hr className="border-[var(--color-border)]/70" />
            <Link href="/login" className="text-sm font-medium text-body" onClick={() => setMobileMenuOpen(false)}>
              Sign In
            </Link>
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm shadow-primary/20 transition-colors hover:bg-primary-hover"
              onClick={() => setMobileMenuOpen(false)}
            >
              Start an Idea
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
