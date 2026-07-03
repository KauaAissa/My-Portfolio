"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";

/**
 * Dependency-free, self-themed CSS/Framer orb.
 *
 * Plays three roles in the 3D stage pipeline:
 *  1. Instant placeholder while the heavy Spline chunk downloads.
 *  2. Warm-up layer that crossfades into the real scene once it is ready.
 *  3. Permanent fallback when no scene URL is provided (or it fails to load),
 *     so the site always ships something premium.
 *
 * It is intentionally kept in its own module so the lazy loader can render it
 * without pulling the Spline runtime into the main bundle.
 */
export function AnimatedOrb() {
  const { resolvedTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const isDark = resolvedTheme !== "light";

  const haloA = isDark ? "rgba(120,120,255,0.35)" : "rgba(0,0,0,0.10)";
  const haloB = isDark ? "rgba(255,120,200,0.28)" : "rgba(80,80,120,0.10)";

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* Ambient glow */}
      <motion.div
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }
        }
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-[70%] w-[70%] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${haloA}, transparent 60%), radial-gradient(circle at 70% 70%, ${haloB}, transparent 60%)`,
        }}
      />

      {/* The sphere */}
      <motion.div
        animate={reduceMotion ? undefined : { y: [-10, 10, -10] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative h-[62%] w-[62%] rounded-full"
        style={{
          background: isDark
            ? "radial-gradient(circle at 32% 28%, #2a2a2a 0%, #0d0d0d 55%, #000 100%)"
            : "radial-gradient(circle at 32% 28%, #ffffff 0%, #dcdce0 55%, #b8b8bf 100%)",
          boxShadow: isDark
            ? "inset -30px -30px 60px rgba(0,0,0,0.8), inset 20px 20px 50px rgba(255,255,255,0.06), 0 40px 120px -20px rgba(0,0,0,0.9)"
            : "inset -30px -30px 60px rgba(0,0,0,0.12), inset 20px 20px 50px rgba(255,255,255,0.9), 0 40px 120px -30px rgba(0,0,0,0.25)",
        }}
      >
        {/* Specular highlight */}
        <div
          className="absolute left-[18%] top-[14%] h-[26%] w-[26%] rounded-full blur-md"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(255,255,255,0.55), transparent 70%)"
              : "radial-gradient(circle, rgba(255,255,255,0.95), transparent 70%)",
          }}
        />
        {/* Orbiting ring */}
        <motion.div
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-16%] rounded-full border"
          style={{
            borderColor: isDark
              ? "rgba(255,255,255,0.10)"
              : "rgba(0,0,0,0.10)",
            transform: "rotateX(72deg)",
          }}
        />
      </motion.div>
    </div>
  );
}
