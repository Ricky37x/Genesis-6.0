"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "#/" },
    { label: "Events", href: "#events" },
    { label: "Gallery", href: "#gallery" },
    { label: "Partners", href: "#partners" },
    { label: "Team", href: "#team" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className="absolute top-0 left-0 z-50 w-full px-6 py-4 md:px-12 md:py-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        
        {/* Brand Logo Container */}
        <Link href="/" className="flex items-center group select-none">
          <Image
            src="/genesislogo.png"
            alt="Genesis Logo"
            width={140}
            height={44}
            className="h-11 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation Links & Register Action */}
        <div className="hidden items-center gap-10 md:flex">
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[15px] font-semibold text-blue-100 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Link
            href="#register"
            className="inline-flex items-center justify-center rounded-full bg-[#1a73e8] px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1557b0] active:scale-[0.98] transition-all duration-200"
          >
            Register Now
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-sm md:hidden hover:bg-white/20 focus:outline-none"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? (
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 mx-4 rounded-2xl border border-white/10 bg-slate-950/90 p-6 shadow-xl backdrop-blur-md md:hidden transition-all duration-300">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-blue-100 hover:text-white border-b border-white/5 pb-2 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="#register"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-[#1a73e8] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1557b0] transition-colors duration-200"
            >
              Register Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
