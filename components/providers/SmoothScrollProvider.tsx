"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";
import "lenis/dist/lenis.css";

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

function ScrollReset() {
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname, lenis]);

  return null;
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, syncTouch: true }}>
      <ScrollReset />
      {children}
    </ReactLenis>
  );
}
