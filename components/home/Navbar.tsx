"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pillRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { contextSafe } = useGSAP(() => {
    // Initialize the pill position using GSAP to avoid React inline style conflicts
    gsap.set(pillRef.current, { xPercent: -100 });
  });

  const onMouseEnter = contextSafe(() => {
    gsap.to(pillRef.current, {
      xPercent: 0,
      duration: 0.6,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(textRef.current, {
      color: "#1a73e8",
      duration: 0.6,
      ease: "power2.out",
      overwrite: "auto",
    });
  });

  const onMouseLeave = contextSafe(() => {
    gsap.to(pillRef.current, {
      xPercent: 100,
      duration: 0.6,
      ease: "power2.out",
      overwrite: "auto",
      onComplete: () => {
        gsap.set(pillRef.current, { xPercent: -100 });
      },
    });
    gsap.to(textRef.current, {
      color: "#ffffff",
      duration: 0.6,
      ease: "power2.out",
      overwrite: "auto",
    });
  });

  const onNavLinkMouseEnter = contextSafe((e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    const defaults = target.querySelectorAll(".char-default");
    const hovers = target.querySelectorAll(".char-hover");

    gsap.to(defaults, {
      y: "-100%",
      duration: 0.35,
      stagger: 0.025,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(hovers, {
      y: "0%",
      duration: 0.35,
      stagger: 0.025,
      ease: "power2.out",
      overwrite: "auto",
    });
  });

  const onNavLinkMouseLeave = contextSafe((e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    const defaults = target.querySelectorAll(".char-default");
    const hovers = target.querySelectorAll(".char-hover");

    gsap.to(defaults, {
      y: "0%",
      duration: 0.35,
      stagger: 0.02,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(hovers, {
      y: "100%",
      duration: 0.35,
      stagger: 0.02,
      ease: "power2.out",
      overwrite: "auto",
    });
  });

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Events", href: "/events" },
    { label: "Gallery", href: "/gallery" },
    { label: "Partners", href: "#partners" },
    { label: "Team", href: "/teams" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className={`fixed top-0 left-0 z-50 w-full px-6 md:px-12 transition-all duration-300 font-absans ${
      scrolled 
        ? "bg-[#07162c]/85 backdrop-blur-md py-2 md:py-3 shadow-xl" 
        : "bg-transparent py-3 md:py-5"
    }`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        
        {/* Brand Logo Container */}
        <Link href="/" className="flex items-center group select-none">
          <Image
            src="/genesislogo.png"
            alt="Genesis Logo"
            width={182}
            height={57}
            style={{ height: scrolled ? "44px" : "54px", width: "auto" }}
            className="object-contain transition-all duration-300"
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
                className="group relative block text-[17px] font-semibold text-blue-100 hover:text-white"
                onMouseEnter={onNavLinkMouseEnter}
                onMouseLeave={onNavLinkMouseLeave}
              >
                <div className="relative flex overflow-hidden py-1">
                  {/* Accessibility Label */}
                  <span className="sr-only">{link.label}</span>

                  {/* Visual Animated Characters */}
                  <span aria-hidden="true" className="flex">
                    {link.label.split("").map((char, index) => (
                      <span key={index} className="relative inline-block overflow-hidden">
                        {/* Default character */}
                        <span className="char-default inline-block translate-y-0 transition-colors duration-200">
                          {char === " " ? "\u00A0" : char}
                        </span>
                        {/* Hover character */}
                        <span className="char-hover absolute top-0 left-0 inline-block translate-y-full text-white">
                          {char === " " ? "\u00A0" : char}
                        </span>
                      </span>
                    ))}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/events"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`relative inline-flex items-center justify-center rounded-full bg-[#1a73e8] text-white shadow-sm overflow-hidden active:scale-[0.98] transition-all duration-300 ${
              scrolled ? "px-5 py-2.5 text-[15px] font-medium" : "px-6 py-3.5 text-[16px] font-semibold"
            }`}
          >
            <span
              ref={pillRef}
              className="register-pill absolute inset-0 bg-white rounded-full pointer-events-none"
            />
            <span ref={textRef} className="register-text relative z-10">
              Register Now
            </span>
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
                className="text-[18px] font-medium text-blue-100 hover:text-white border-b border-white/5 pb-2 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-[#1a73e8] py-3 text-[16px] font-semibold text-white shadow-sm hover:bg-[#1557b0] transition-colors duration-200"
            >
              Register Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
