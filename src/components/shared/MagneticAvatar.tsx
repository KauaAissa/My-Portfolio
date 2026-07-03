"use client";

import * as React from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/** How far (px) the avatar "feels" the cursor before reacting. */
const MAGNET_RADIUS = 340;
/** Pull strength - fraction of the cursor offset applied as translation. */
const MAGNET_STRENGTH = 0.16;
/** Duration (s) shared by the float and the ground shadow so they stay in sync. */
const FLOAT_DURATION = 7;

/**
 * Animated 2D avatar with a cinematic, layered motion stack:
 *
 *  1. Scroll-triggered entrance (rise + settle, once per visit).
 *  2. Infinite organic float (`y: [0, -12, 0]`, mirrored, slow).
 *  3. Magnetic mouse-follow - the avatar is gently pulled toward the cursor
 *     within a proximity radius, with spring physics and a subtle 3D lean.
 *  4. Extras: pulsing ambient aura, orbiting ring (echoing the 3D orb),
 *     and a ground shadow that breathes in counter-phase with the float.
 *
 * Fully honors `prefers-reduced-motion` - it degrades to a static portrait.
 */
export function MagneticAvatar({ alt }: { alt: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Raw magnetic targets, smoothed by springs for a fluid, weighty feel.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 140, damping: 18, mass: 0.5 });
  const y = useSpring(my, { stiffness: 140, damping: 18, mass: 0.5 });

  // The magnetic pull also leans the avatar in 3D, adding real depth.
  const rotateY = useTransform(x, [-30, 30], [-9, 9]);
  const rotateX = useTransform(y, [-30, 30], [9, -9]);

  React.useEffect(() => {
    if (reduceMotion) return;

    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const dist = Math.hypot(dx, dy);

      // Smooth falloff: full pull near the centre, zero at the radius edge.
      const force = Math.max(0, 1 - dist / MAGNET_RADIUS);
      mx.set(dx * force * MAGNET_STRENGTH);
      my.set(dy * force * MAGNET_STRENGTH);
    };

    const onLeave = () => {
      mx.set(0);
      my.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [reduceMotion, mx, my]);

  return (
    // 1) Scroll-triggered entrance
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9, rotate: -3 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1, ease: EASE }}
      className="relative mx-auto w-full max-w-[480px] sm:max-w-[640px] lg:mx-0 lg:max-w-[720px]"
      style={{ perspective: 900 }}
    >
      {/* 3) Magnetic layer - spring-driven pull + 3D lean toward the cursor */}
      <motion.div
        ref={ref}
        style={
          reduceMotion
            ? undefined
            : { x, y, rotateX, rotateY, transformStyle: "preserve-3d" }
        }
        whileHover={reduceMotion ? undefined : { scale: 1.05 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="group relative"
      >
        {/* Pulsing ambient aura, in the site's signature gradient language */}
        <motion.div
          aria-hidden
          animate={
            reduceMotion
              ? undefined
              : { scale: [1, 1.12, 1], opacity: [0.55, 0.85, 0.55] }
          }
          transition={{
            duration: FLOAT_DURATION,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="absolute -inset-10 -z-10 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, rgba(120,120,255,0.25), transparent 65%), radial-gradient(circle at 70% 75%, rgba(255,120,200,0.18), transparent 65%)",
          }}
        />

        {/* 2) Infinite organic float + subtle rotational wobble */}
        <motion.div
          animate={
            reduceMotion ? undefined : { y: [0, -12, 0], rotate: [-1.2, 1.2] }
          }
          transition={{
            duration: FLOAT_DURATION,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="relative aspect-square w-full"
        >
          {/* Orbiting ring - visual echo of the 3D orb, centred on the
              avatar and floating together with it. */}
          <motion.div
            aria-hidden
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 -z-10 rounded-full border border-foreground/10"
            style={{ rotateX: 74 }}
          />
          <Image
            src="/avatar-kaua.png"
            alt={alt}
            fill
            sizes="(max-width: 1024px) 90vw, 720px"
            className="select-none object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.35)] transition-[filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:drop-shadow-[0_32px_72px_rgba(120,120,255,0.35)]"
            draggable={false}
          />
        </motion.div>

        {/* Ground shadow - breathes in counter-phase with the float, selling
            the illusion that the avatar really lifts off the page. */}
        <motion.div
          aria-hidden
          animate={
            reduceMotion
              ? undefined
              : { scaleX: [1, 0.8, 1], opacity: [0.4, 0.22, 0.4] }
          }
          transition={{
            duration: FLOAT_DURATION,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="mx-auto mt-2 h-4 w-3/5 rounded-[100%] bg-black/50 blur-md dark:bg-black/70"
        />
      </motion.div>
    </motion.div>
  );
}
