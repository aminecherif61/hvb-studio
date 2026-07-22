"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

/** One easing curve for the whole site — slow start, long settle. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Fade + rise as an element enters the viewport. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Curtain reveal for photographs — the image is unveiled, not popped in.
 * The observed wrapper stays unclipped (a clip-path with zero visible area
 * never intersects, so the observer would never fire); the curtain animates
 * on an inner layer via variant propagation.
 */
export function ImageReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      <motion.div
        className={className}
        variants={{
          hidden: { clipPath: "inset(0 0 100% 0)" },
          visible: { clipPath: "inset(0 0 0% 0)" },
        }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      >
        <motion.div
          variants={{ hidden: { scale: 1.12 }, visible: { scale: 1 } }}
          transition={{ duration: 1.4, delay, ease: EASE }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** Subtle vertical parallax — photographs drift slower than the page. */
export function Parallax({
  children,
  strength = 60,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [strength, -strength]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y }} className="relative h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}

/** Slow cinematic settle for fullscreen heroes. */
export function HeroDrift({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { scale: 1.08, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 2.2, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Word-level stagger for display headlines. */
export function StaggerLines({
  lines,
  className,
  lineClassName,
  delay = 0,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            className={`block ${lineClassName ?? ""}`}
            initial={reduce ? false : { y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1.1, delay: delay + i * 0.12, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
