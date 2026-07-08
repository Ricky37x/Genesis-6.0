"use client";

import { useEffect, useState } from "react";
import styles from "./Footer.module.css";

interface Bubble {
  id: number;
  size: number;
  distance: number;
  position: number;
  time: number;
  delay: number;
}

export default function Footer() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const list: Bubble[] = [];
    for (let i = 0; i < 128; i++) {
      list.push({
        id: i,
        size: 2 + Math.random() * 4,
        distance: 6 + Math.random() * 4,
        position: -5 + Math.random() * 110,
        time: 2 + Math.random() * 2,
        delay: -1 * (2 + Math.random() * 2),
      });
    }
    setBubbles(list);
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.bubbles}>
        {bubbles.map((b) => (
          <div
            key={b.id}
            className={styles.bubble}
            style={{
              "--size": `${b.size}rem`,
              "--distance": `${b.distance}rem`,
              "--position": `${b.position}%`,
              "--time": `${b.time}s`,
              "--delay": `${b.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>
      <div className={styles.content} />

      <svg style={{ position: "fixed", top: "100vh" }}>
        <defs>
          <filter id="blob">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="blob"
            />
          </filter>
        </defs>
      </svg>
    </footer>
  );
}
