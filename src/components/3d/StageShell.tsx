"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Responsive frame shared by the live 3D stage and its loading placeholder,
 * so the orb → Spline handoff never shifts size or position.
 */
export const STAGE_FRAME_CLASS =
  "max-w-[360px] sm:max-w-[480px] lg:max-w-[620px]";

/**
 * Understated loading presence: a soft, breathing pool of light in the
 * site's signature gradient. Deliberately shapeless so it never reads as
 * "another sphere" - the particle scene simply materializes out of it.
 */
export function StageGlow() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <motion.div
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.1, 1], opacity: [0.35, 0.6, 0.35] }
        }
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="h-[72%] w-[72%] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 40% 35%, rgba(120,120,255,0.28), transparent 62%), radial-gradient(circle at 65% 70%, rgba(255,120,200,0.20), transparent 62%)",
        }}
      />
    </div>
  );
}

/**
 * Persistent, fixed backdrop that hosts the 3D model behind every section.
 * Kept dependency-free (no Spline imports) so the lazy loader can render the
 * exact same shell while the heavy WebGL chunk is still downloading -
 * guaranteeing visual continuity from first paint to full 3D.
 */
export function StageShell({ children }: { children?: React.ReactNode }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center"
    >
      {children}
      {/* Vignette seats the object into the background at every scroll depth. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 45%, transparent 42%, var(--background) 82%)",
        }}
      />
    </div>
  );
}
