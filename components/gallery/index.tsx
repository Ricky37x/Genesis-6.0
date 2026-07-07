"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLenis } from "lenis/react";

// Register useGSAP plugin
gsap.registerPlugin(useGSAP);

interface GalleryImage {
  src: string;
  title: string;
  category: string;
  photographer: string;
}

const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: "/gallery/amadej-tauses-xWOTojs1eg4-unsplash.jpg",
    title: "Alpine Peaks",
    photographer: "Amadej Tauses",
    category: "NATURE",
  },
  {
    src: "/gallery/anastase-maragos-_PyN0ignfko-unsplash.jpg",
    title: "Primal Athleticism",
    photographer: "Anastase Maragos",
    category: "SPORTS",
  },
  {
    src: "/gallery/annie-spratt-Ng2UydNj4W8-unsplash.jpg",
    title: "Secret Garden",
    photographer: "Annie Spratt",
    category: "BOTANICAL",
  },
  {
    src: "/gallery/leo_visions-pH3a_0GRXYk-unsplash.jpg",
    title: "Digital Synthesis",
    photographer: "Leo Visions",
    category: "ABSTRACT",
  },
  {
    src: "/gallery/mana5280-6k5aeGvhuEA-unsplash.jpg",
    title: "Urban Electric",
    photographer: "Mana5280",
    category: "STREET",
  },
  {
    src: "/gallery/microsoft-copilot-oTDuuLUhH20-unsplash.jpg",
    title: "Neural Flow",
    photographer: "Microsoft Copilot",
    category: "TECHNOLOGY",
  },
  {
    src: "/gallery/peter-olexa-ZO4rHqkCat4-unsplash.jpg",
    title: "Cyber Geometry",
    photographer: "Peter Olexa",
    category: "ARCHITECTURE",
  },
  {
    src: "/gallery/peter-olexa-mxIGWk111u0-unsplash.jpg",
    title: "Golden Hour Shards",
    photographer: "Peter Olexa",
    category: "ABSTRACT",
  },
  {
    src: "/gallery/rafael-peier-jbgnfanT8Bw-unsplash.jpg",
    title: "Monolithic Pillar",
    photographer: "Rafael Peier",
    category: "ARCHITECTURE",
  },
  {
    src: "/gallery/the-metropolitan-museum-of-art-Bvw8rNl4fD4-unsplash.jpg",
    title: "Sculpted History",
    photographer: "The Met Museum",
    category: "ART",
  },
];

// Duplicate images to create a seamless infinite scrolling track
const DUPLICATED_IMAGES = [...GALLERY_IMAGES, ...GALLERY_IMAGES];

export default function Gallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);

  // Ref to track Lenis vertical scroll velocity
  const scrollVelocityRef = useRef(0);
  useLenis((lenis) => {
    scrollVelocityRef.current = lenis.velocity;
  });

  // Navigate lightbox images
  const navigateImage = useCallback((direction: number) => {
    if (!activeImage) return;
    const currentIndex = GALLERY_IMAGES.findIndex(img => img.src === activeImage.src);
    const nextIndex = (currentIndex + direction + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
    setActiveImage(GALLERY_IMAGES[nextIndex]);
  }, [activeImage]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeImage) return;
      if (e.key === "Escape") {
        setActiveImage(null);
      } else if (e.key === "ArrowLeft") {
        navigateImage(-1);
      } else if (e.key === "ArrowRight") {
        navigateImage(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeImage, navigateImage]);

  // Infinite horizontal scroll and vertical parallax follow using useGSAP
  useGSAP(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    // Continuous scroll animation
    const scrollTween = gsap.to(marquee, {
      xPercent: -50,
      ease: "none",
      duration: 12,
      repeat: -1,
    });

    const mm = gsap.matchMedia();

    // Desktop hover devices: vertical floating and U-bend / opposite U-bend interaction
    mm.add("(hover: hover)", () => {
      const cards = gsap.utils.toArray<HTMLElement>(".gallery-card");
      const marqueeSection = containerRef.current?.querySelector(".gallery-marquee-section") as HTMLElement;
      if (!marqueeSection) return;

      // Create high-performance cached property getters
      const getMarqueeY = gsap.getProperty(marqueeSection);
      const getMarqueeXPercent = gsap.getProperty(marquee);

      let cardWidth = 0;
      let cardGap = 0;
      let marqueeWidth = 0;
      let lastMarqueeY = 0;
      let smoothVelY = 0;

      const updateDimensions = () => {
        if (cards.length === 0) return;
        const firstCard = cards[0];
        const secondCard = cards[1];
        if (firstCard) {
          cardWidth = firstCard.offsetWidth;
        }
        if (firstCard && secondCard) {
          cardGap = secondCard.offsetLeft - (firstCard.offsetLeft + cardWidth);
        }
        if (marquee) {
          marqueeWidth = marquee.offsetWidth;
        }
      };

      updateDimensions();
      window.addEventListener("resize", updateDimensions);

      const updatePhysics = () => {
        if (cards.length === 0) return;

        if (cardWidth === 0 || marqueeWidth === 0) {
          updateDimensions();
          if (cardWidth === 0 || marqueeWidth === 0) return;
        }

        // Get the current Y coordinate of the marquee section via cached getter (0 DOM reads)
        const currentMarqueeY = getMarqueeY("y") as number || 0;
        
        // Initialize last Y if it's the first frame
        if (lastMarqueeY === 0) {
          lastMarqueeY = currentMarqueeY;
        }

        // Smoothly transition marquee horizontal speed based on Lenis vertical scroll velocity
        const scrollVel = scrollVelocityRef.current;
        const targetTimeScale = 1 + Math.abs(scrollVel) * 0.15;
        const currentTimeScale = scrollTween.timeScale();
        scrollTween.timeScale(gsap.utils.interpolate(currentTimeScale, targetTimeScale, 0.08));

        // Clamp and calculate raw velocity per frame (combining mouse movement and Lenis scroll speed contributions)
        const scrollContribution = scrollVel * 0.6; // Positive scrolling down, negative scrolling up
        const rawVelY = gsap.utils.clamp(-35, 35, (currentMarqueeY - lastMarqueeY) + scrollContribution);
        lastMarqueeY = currentMarqueeY;

        // Smooth the velocity using lerp
        smoothVelY = gsap.utils.interpolate(smoothVelY, rawVelY, 0.12);

        // Calculate marquee screen position mathematically from cached xPercent (0 DOM reads)
        const xPercent = getMarqueeXPercent("xPercent") as number || 0;
        const marqueeX = (xPercent / 100) * marqueeWidth;

        // Determine center of screen
        const screenCenterX = window.innerWidth / 2;

        // Influence parameters
        const sigma = 380; // Width of the U-shape influence
        const bendFactor = 6.0; // Multiplier to scale velocity to pixel deflection
        const maxBend = 140; // Hard clamp for vertical bend

        cards.forEach((card, i) => {
          // Calculate current screen center of this card mathematically (0 DOM reads)
          const cardOffsetX = i * (cardWidth + cardGap) + cardWidth / 2;
          const cardScreenX = marqueeX + cardOffsetX;

          // Distance to the center of the screen
          const distX = cardScreenX - screenCenterX;

          // Gaussian weight based on horizontal distance from screen center
          const weight = Math.exp(-(distX * distX) / (2 * sigma * sigma));

          // Vertical bend: proportional to vertical marquee velocity and Gaussian weight
          const targetY = smoothVelY * bendFactor * weight;
          const clampedY = gsap.utils.clamp(-maxBend, maxBend, targetY);

          // Apply transform with force3D for GPU rendering
          gsap.set(card, {
            x: 0,
            y: clampedY,
            skewX: 0,
            force3D: true,
            overwrite: "auto",
          });
        });
      };

      gsap.ticker.add(updatePhysics);

      const handleMouseMove = (e: MouseEvent) => {
        const windowHeight = window.innerHeight;
        const marqueeHeight = marqueeSection.getBoundingClientRect().height;

        // Navbar bottom cutoff (e.g. 96px from the top)
        const navbarHeight = 96;

        // Ideal Y centering the marquee exactly on the mouse cursor
        const idealY = e.clientY - (navbarHeight + marqueeHeight / 2);

        // Clamping boundaries (natural top is 96px, so targetY limit is 0 to windowHeight - 96 - marqueeHeight)
        const minTargetY = 0;
        const maxTargetY = windowHeight - navbarHeight - marqueeHeight;

        let targetY;
        if (minTargetY < maxTargetY) {
          targetY = gsap.utils.clamp(minTargetY, maxTargetY, idealY);
        } else {
          targetY = 0; // Viewport is too small
        }

        gsap.to(marqueeSection, {
          y: targetY,
          duration: 2.0, // Smooth, slower trailing lag (liquid scrub effect)
          ease: "power3.out",
          overwrite: "auto",
        });
      };

      window.addEventListener("mousemove", handleMouseMove);

      return () => {
        window.removeEventListener("resize", updateDimensions);
        gsap.ticker.remove(updatePhysics);
        window.removeEventListener("mousemove", handleMouseMove);
      };
    });

    // Reveal animations on component load
    gsap.from(".gallery-marquee-section", {
      scale: 0.95,
      opacity: 0,
      duration: 1.5,
      ease: "power4.out",
    });

    return () => {
      mm.revert();
    };
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-start pt-24 font-sans text-white overflow-hidden select-none"
      style={{
        background: "linear-gradient(135deg, #07162c 0%, #0e2954 35%, #1f5194 70%, #60a5fa 100%)",
      }}
    >
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Gallery Marquee Row Container */}
      <div className="gallery-marquee-section w-full relative z-10 flex items-center overflow-visible py-3">
        {/* Marquee Track */}
        <div
          ref={marqueeRef}
          className="flex gap-2 sm:gap-3 w-max whitespace-nowrap will-change-transform"
        >
          {DUPLICATED_IMAGES.map((image, index) => (
            <div
              key={index}
              onClick={() => setActiveImage(image)}
              className="gallery-card w-[140px] sm:w-[185px] md:w-[230px] h-[86px] sm:h-[114px] md:h-[142px] flex-shrink-0 relative overflow-hidden rounded-[12px] border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3)] backdrop-blur-sm cursor-pointer"
            >
              {/* Image component */}
              <Image
                src={image.src}
                alt={image.title}
                fill
                sizes="(max-width: 768px) 140px, (max-width: 1024px) 185px, 230px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal Component */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-2xl p-4 transition-opacity duration-500 animate-fadeIn"
          onClick={() => setActiveImage(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setActiveImage(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-full p-3 transition-all hover:scale-110 active:scale-95 z-50 cursor-pointer"
            aria-label="Close lightbox"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation Controls */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateImage(-1);
            }}
            className="absolute left-4 sm:left-8 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-full p-4 transition-all hover:scale-110 active:scale-95 z-40 cursor-pointer"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateImage(1);
            }}
            className="absolute right-4 sm:right-8 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-full p-4 transition-all hover:scale-110 active:scale-95 z-40 cursor-pointer"
            aria-label="Next image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Centered Modal Card */}
          <div
            className="w-full max-w-5xl flex flex-col items-center justify-center z-30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-[16/10] md:max-h-[85vh] rounded-[24px] overflow-hidden border border-white/10 bg-black/40 shadow-2xl">
              <Image
                src={activeImage.src}
                alt={activeImage.title}
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                priority
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
