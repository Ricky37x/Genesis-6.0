"use client";

import { useRef, useState, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLenis } from "lenis/react";
import { SplitText } from "gsap/SplitText";

// Register GSAP plugins
gsap.registerPlugin(useGSAP, SplitText);

const RIPPLE_CONFIG = {
  riseRate: 0.45,       // The multiplier for shifting the text upward as the marquee goes lower
  maxRise: 180,         // Absolute maximum pixel upward shift for the text
  wakeStrength: 12,     // Scaling multiplier for the velocity-based ripple push
  rippleRadius: 220,    // Gaussian standard deviation (sigma) defining the proximity envelope
  followEase: 0.22,     // Linear interpolation factor for text position updates (much faster follow)
  velocityEase: 0.35,   // Linear interpolation factor for marquee velocity smoothing (instantaneous reaction)
};

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

  const lenis = useLenis();
  const scrollVelocityRef = useRef(0);
  useLenis((lenis) => {
    scrollVelocityRef.current = lenis.velocity;
  });

  // Stop Lenis vertical scroll when in Gallery component, restoring on unmount
  useEffect(() => {
    if (lenis) {
      lenis.stop();
      return () => {
        lenis.start();
      };
    }
  }, [lenis]);

  // Stable callback to open lightbox to prevent child re-renders
  const handleImageClick = useCallback((image: GalleryImage) => {
    setActiveImage(image);
  }, []);

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

  // Infinite horizontal scroll driven by page-wide vertical scroll/wheel gestures
  useGSAP(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    const container = containerRef.current;
    if (!container) return;

    const cards = gsap.utils.toArray<HTMLElement>(
      container.querySelectorAll(".gallery-card")
    );
    const marqueeSection = container.querySelector(".gallery-marquee-section") as HTMLElement;
    if (!marqueeSection) return;

    const targetsGradient = container.querySelectorAll(".gallery-text-target-gradient");
    const targetsSolid = container.querySelectorAll(".gallery-text-target-solid");

    // Split text targets: gradient lines for the title and solid lines for the subheadings
    const splitGradient = new SplitText(targetsGradient, {
      type: "lines",
      linesClass: "gallery-text-line inline-block w-full bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent",
    });
    const splitSolid = new SplitText(targetsSolid, {
      type: "lines",
      linesClass: "gallery-text-line inline-block w-full text-blue-100",
    });

    const lines = [...splitGradient.lines, ...splitSolid.lines];

    // Apply initial 3D transforms for optimization
    gsap.set(lines, { force3D: true });

    // Temporarily remove parent backgrounds on the gradient element to prevent clipping when children are translated
    gsap.set(targetsGradient, {
      background: "none",
      webkitBackgroundClip: "unset",
      backgroundClip: "unset",
    });

    // Create high-performance cached property getters/setters
    const getMarqueeY = gsap.getProperty(marqueeSection);
    const getMarqueeXPercent = gsap.getProperty(marquee);

    // Create quickSetter instances
    const lineSetters = lines.map(line => gsap.quickSetter(line, "y", "px"));
    const cardYSetters = cards.map(card => gsap.quickSetter(card, "y", "px"));
    const cardRotSetters = cards.map(card => gsap.quickSetter(card, "rotation", "deg"));

    const cardYDisplacements = cards.map(() => 0);
    const cardRotDisplacements = cards.map(() => 0);

    // Initialize high-performance quickTo for smooth mouse-follow Y positions
    const quickY = gsap.quickTo(marqueeSection, "y", {
      duration: 2.0,
      ease: "power3.out",
    });

    cards.forEach(card => {
      gsap.set(card, {
        x: 0,
        skewX: 0,
        rotation: 0,
        force3D: true,
      });
    });

    let cardWidth = 0;
    let cardGap = 0;
    let marqueeWidth = 0;
    let marqueeHeight = 0;
    let screenWidth = 0;
    let lastMarqueeY = 0;
    let smoothVelY = 0;

    // Text lines geometry tracking
    let restingYPositions: number[] = [];
    let marqueeInitialTop = 0;
    const lineDisplacements = lines.map(() => 0);

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
      if (marqueeSection) {
        marqueeHeight = marqueeSection.offsetHeight;
        marqueeInitialTop = marqueeSection.offsetTop;
      }
      screenWidth = window.innerWidth;

      // Track text line geometry
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();

        // Reset offsets temporarily to measure true resting positions
        lines.forEach(line => gsap.set(line, { y: 0 }));

        restingYPositions = lines.map(line => {
          const rect = line.getBoundingClientRect();
          return rect.top - containerRect.top + rect.height / 2;
        });

        // Restore line displacements
        lines.forEach((line, idx) => gsap.set(line, { y: lineDisplacements[idx] }));
      }
    };

    let resizeAnimationFrameId: number | null = null;
    const handleResize = () => {
      if (resizeAnimationFrameId !== null) return;
      resizeAnimationFrameId = window.requestAnimationFrame(() => {
        updateDimensions();
        resizeAnimationFrameId = null;
      });
    };

    updateDimensions();
    window.addEventListener("resize", handleResize);

    // Scroll-driven horizontal marquee position states (unwrapped track)
    let currentXPercent = 0;
    let targetXPercent = 0;

    const updatePhysics = () => {
      if (cards.length === 0) return;

      if (cardWidth === 0 || marqueeWidth === 0 || marqueeHeight === 0 || screenWidth === 0) {
        updateDimensions();
        if (cardWidth === 0 || marqueeWidth === 0 || marqueeHeight === 0 || screenWidth === 0) return;
      }

      // Baseline autoplay movement to the left (3% of track width per second at 60fps)
      targetXPercent -= 0.05;

      // Smoothly transition horizontal marquee position
      const nextXPercent = gsap.utils.interpolate(currentXPercent, targetXPercent, 0.08);
      const velX = nextXPercent - currentXPercent;
      currentXPercent = nextXPercent;

      // Render the wrapped value to keep track infinite
      gsap.set(marquee, { xPercent: gsap.utils.wrap(-50, 0, currentXPercent) });

      // Get the current Y coordinate of the marquee section via cached getter (0 DOM reads)
      const currentMarqueeY = getMarqueeY("y") as number || 0;

      // Initialize last Y if it's the first frame
      if (lastMarqueeY === 0) {
        lastMarqueeY = currentMarqueeY;
      }

      // Clamp and calculate raw velocity per frame based on horizontal motion and vertical section follow
      const verticalContribution = currentMarqueeY - lastMarqueeY;
      lastMarqueeY = currentMarqueeY;

      const rawVelY = gsap.utils.clamp(-30, 30, (velX * 1.5) + verticalContribution);

      // Smooth the velocity using lerp
      smoothVelY = gsap.utils.interpolate(smoothVelY, rawVelY, RIPPLE_CONFIG.velocityEase);
      if (Math.abs(smoothVelY) < 0.01) {
        smoothVelY = 0;
      }

      // Calculate current marquee center relative to container
      const marqueeCenterY = marqueeInitialTop + currentMarqueeY + marqueeHeight / 2;

      // Update reactive text ripple and content rise
      lines.forEach((line, idx) => {
        const restingY = restingYPositions[idx];
        if (restingY === undefined) return;

        // 1. Content Rise logic
        let targetRiseY = 0;
        if (marqueeCenterY > restingY) {
          const overlap = marqueeCenterY - restingY;
          targetRiseY = -Math.min(RIPPLE_CONFIG.maxRise, overlap * RIPPLE_CONFIG.riseRate);
        }

        // 2. Wake / Ripple effect
        const distY = restingY - marqueeCenterY;
        const proximity = Math.exp(-(distY * distY) / (2 * RIPPLE_CONFIG.rippleRadius * RIPPLE_CONFIG.rippleRadius));
        
        // Deadzone for velocity factor
        const absVel = Math.abs(smoothVelY);
        const velFactor = absVel < 0.05 ? 0 : absVel;
        const targetRippleY = Math.sign(distY) * proximity * velFactor * RIPPLE_CONFIG.wakeStrength;

        // Combined target displacement
        const targetDisplacement = targetRiseY + targetRippleY;

        const currentDisplacement = lineDisplacements[idx];

        // Snap to target if they are extremely close, skipping redundant quickSetter writes
        if (Math.abs(targetDisplacement - currentDisplacement) < 0.05) {
          if (currentDisplacement !== targetDisplacement) {
            lineDisplacements[idx] = targetDisplacement;
            lineSetters[idx](targetDisplacement);
          }
        } else {
          // Interpolate current displacement toward target
          const nextDisplacement = gsap.utils.interpolate(currentDisplacement, targetDisplacement, RIPPLE_CONFIG.followEase);
          lineDisplacements[idx] = nextDisplacement;
          lineSetters[idx](nextDisplacement);
        }
      });

      // Calculate marquee screen position mathematically from wrapped xPercent property
      const xPercent = getMarqueeXPercent("xPercent") as number || 0;
      const marqueeX = (xPercent / 100) * marqueeWidth;

      // Determine center of screen
      const screenCenterX = screenWidth / 2;

      // Influence parameters
      const sigma = Math.max(150, Math.min(340, screenWidth * 0.26));
      const twoSigmaSq = 2 * sigma * sigma;
      const bendFactor = 11.5;
      const maxBend = 300;
      const maxRotation = 9;

      cards.forEach((card, i) => {
        // Calculate current screen center of this card mathematically (0 DOM reads)
        const cardOffsetX = i * (cardWidth + cardGap) + cardWidth / 2;
        const cardScreenX = marqueeX + cardOffsetX;

        // Distance to the center of the screen
        const distX = cardScreenX - screenCenterX;

        // Gaussian weight based on horizontal distance from screen center
        const weight = Math.exp(-(distX * distX) / twoSigmaSq);

        // Vertical bend: proportional to vertical marquee velocity and Gaussian weight
        const targetY = smoothVelY * bendFactor * weight;
        const clampedY = gsap.utils.clamp(-maxBend, maxBend, targetY);

        // Dynamic rotation (tilt) matching the curve slope
        const targetRot = - (distX / sigma) * (clampedY / maxBend) * maxRotation;
        const clampedRot = gsap.utils.clamp(-maxRotation, maxRotation, targetRot);

        const lastY = cardYDisplacements[i];
        const lastRot = cardRotDisplacements[i];

        // Threshold check to avoid tiny updates
        if (Math.abs(clampedY - lastY) > 0.05) {
          cardYSetters[i](clampedY);
          cardYDisplacements[i] = clampedY;
        } else if (lastY !== clampedY && Math.abs(clampedY) < 0.01) {
          cardYSetters[i](clampedY);
          cardYDisplacements[i] = clampedY;
        }

        if (Math.abs(clampedRot - lastRot) > 0.05) {
          cardRotSetters[i](clampedRot);
          cardRotDisplacements[i] = clampedRot;
        } else if (lastRot !== clampedRot && Math.abs(clampedRot) < 0.01) {
          cardRotSetters[i](clampedRot);
          cardRotDisplacements[i] = clampedRot;
        }
      });
    };

    gsap.ticker.add(updatePhysics);

    const handleWheel = (e: WheelEvent) => {
      // deltaY > 0 means scroll down, moving images to the left (decreasing xPercent)
      targetXPercent -= (e.deltaY * 0.04);
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;
        touchStartY = touchY;
        targetXPercent -= (deltaY * 0.12);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: true });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });

    const handleMouseMove = (e: MouseEvent) => {
      const windowHeight = window.innerHeight;
      const navbarHeight = 96;
      const idealY = e.clientY - (navbarHeight + marqueeHeight / 2);
      const minTargetY = 0;
      const maxTargetY = windowHeight - navbarHeight - marqueeHeight;

      let targetY;
      if (minTargetY < maxTargetY) {
        targetY = gsap.utils.clamp(minTargetY, maxTargetY, idealY);
      } else {
        targetY = 0;
      }

      quickY(targetY);
    };

    const mm = gsap.matchMedia();
    mm.add("(hover: hover)", () => {
      window.addEventListener("mousemove", handleMouseMove);
      return () => {
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
      window.removeEventListener("resize", handleResize);
      if (resizeAnimationFrameId !== null) {
        window.cancelAnimationFrame(resizeAnimationFrameId);
      }
      gsap.ticker.remove(updatePhysics);
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      mm.revert();

      // Restore parent styling properties
      gsap.set(targetsGradient, {
        clearProps: "background,webkitBackgroundClip,backgroundClip",
      });
      splitGradient.revert();
      splitSolid.revert();
    };
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full flex flex-col items-center justify-start pt-24 font-sans text-white overflow-hidden select-none"
      style={{
        background: "linear-gradient(135deg, #07162c 0%, #0e2954 35%, #1f5194 70%, #60a5fa 100%)",
      }}
    >
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Memoized Main Title Section */}
      <GalleryTitle />

      {/* Gallery Marquee Row Container */}
      <div className="gallery-marquee-section w-full relative z-10 flex items-center overflow-visible py-3">
        <GalleryMarqueeTrack
          marqueeRef={marqueeRef}
          images={DUPLICATED_IMAGES}
          onImageClick={handleImageClick}
        />
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

// Memoized title section to prevent layout/SplitText disruption on parent state updates
const GalleryTitle = memo(() => {
  return (
    <div className="gallery-title-wrapper absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none select-none z-20">
      <h1 className="gallery-text-target-gradient text-[70px] md:text-[106px] font-bold tracking-tight font-mirava-sans bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
        OUR GALLERY
      </h1>
      <div className="mt-4 md:mt-6 flex flex-col items-center gap-1 sm:gap-2 font-absans text-sm sm:text-base md:text-lg tracking-wider font-medium">
        <p className="gallery-text-target-solid text-blue-100">
          Main event moments and celebrations
        </p>
        <p className="gallery-text-target-solid text-blue-100">
          Learning experiences and technical sessions
        </p>
        <p className="gallery-text-target-solid text-blue-100">
          Behind the scenes and team interactions
        </p>
      </div>
    </div>
  );
});
GalleryTitle.displayName = "GalleryTitle";

// Memoized marquee track to isolate slide modifications from parent state updates
interface GalleryMarqueeTrackProps {
  marqueeRef: React.RefObject<HTMLDivElement | null>;
  images: GalleryImage[];
  onImageClick: (image: GalleryImage) => void;
}

const GalleryMarqueeTrack = memo(({ marqueeRef, images, onImageClick }: GalleryMarqueeTrackProps) => {
  return (
    <div
      ref={marqueeRef}
      className="flex gap-2 sm:gap-3 w-max whitespace-nowrap will-change-transform"
    >
      {images.map((image, index) => (
        <div
          key={index}
          onClick={() => onImageClick(image)}
          className="gallery-card w-[140px] sm:w-[185px] md:w-[230px] h-[86px] sm:h-[114px] md:h-[142px] flex-shrink-0 relative overflow-hidden rounded-[12px] border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3)] backdrop-blur-sm cursor-pointer"
        >
          <Image
            src={image.src}
            alt={image.title}
            fill
            sizes="(max-width: 768px) 140px, (max-width: 1024px) 185px, 230px"
            priority={index < 5} // Preload first 5 images above the fold for optimized LCP
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
});
GalleryMarqueeTrack.displayName = "GalleryMarqueeTrack";
