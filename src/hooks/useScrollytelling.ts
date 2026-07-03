"use client";

import {
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import type { RefObject } from "react";

type Offset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

/**
 * Critically-damped spring applied to raw scroll progress so camera moves
 * glide organically instead of tracking every micro-jitter of the wheel.
 */
const CAMERA_SPRING = {
  stiffness: 110,
  damping: 26,
  mass: 0.5,
  restDelta: 0.0005,
} as const;

export interface Scrollytelling {
  /** Raw progress of the target through the viewport, 0 → 1. */
  progress: MotionValue<number>;
  /** Fade in on enter, fade out on exit. */
  opacity: MotionValue<number>;
  /** Vertical parallax drift (px). */
  y: MotionValue<number>;
  /** Subtle scale breathing tied to scroll. */
  scale: MotionValue<number>;
  /** Blur (px) that sharpens as the section centers. */
  blur: MotionValue<number>;
  /** Ready-to-use CSS `blur()` string bound to `blur`. */
  filter: MotionValue<string>;
}

/**
 * Cinematic scroll driver for a section. Wire the returned MotionValues
 * into `style` props of `motion.*` elements to build scrollytelling scenes.
 *
 * @param target Ref to the section element being tracked.
 * @param offset Optional custom scroll offset window.
 */
export function useScrollytelling(
  target: RefObject<HTMLElement | null>,
  offset: Offset = ["start end", "end start"],
): Scrollytelling {
  const { scrollYProgress } = useScroll({ target, offset });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.92]);
  const blur = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, 8]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  return { progress: scrollYProgress, opacity, y, scale, blur, filter };
}

export interface CameraShot {
  progress: MotionValue<number>;
  /** Uniform scale (dolly). */
  scale: MotionValue<number>;
  /** translateZ in px - the "camera depth" of the element. */
  z: MotionValue<number>;
  opacity: MotionValue<number>;
  /** Blur px. */
  blur: MotionValue<number>;
  /** Ready-to-use CSS `blur()` string. */
  filter: MotionValue<string>;
}

/**
 * "Dolly out" - the element zooms toward the viewer (scale up + translateZ
 * forward) and dissolves into blur as it scrolls away. Use on the layer you
 * want to leave through the camera (e.g. the Hero as Metrics arrives).
 */
export function useCameraExit(
  target: RefObject<HTMLElement | null>,
  offset: Offset = ["start start", "end start"],
): CameraShot {
  const { scrollYProgress } = useScroll({ target, offset });
  // Smoothed progress drives the visuals; raw progress stays available for
  // precise triggers (e.g. hiding the scroll hint).
  const smooth = useSpring(scrollYProgress, CAMERA_SPRING);

  const scale = useTransform(smooth, [0, 1], [1, 1.65]);
  const z = useTransform(smooth, [0, 1], [0, 500]);
  const opacity = useTransform(smooth, [0, 0.55, 1], [1, 0.45, 0]);
  const blur = useTransform(smooth, [0, 1], [0, 18]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  return { progress: scrollYProgress, scale, z, opacity, blur, filter };
}

/**
 * "Dolly in" - the element emerges from the depth of the scene (small, far,
 * blurred) and settles into focus as it enters the viewport. Pair with
 * `useCameraExit` on the previous section for a seamless camera handoff.
 */
export function useCameraEnter(
  target: RefObject<HTMLElement | null>,
  offset: Offset = ["start end", "start center"],
): CameraShot {
  const { scrollYProgress } = useScroll({ target, offset });
  const smooth = useSpring(scrollYProgress, CAMERA_SPRING);

  const scale = useTransform(smooth, [0, 1], [0.72, 1]);
  const z = useTransform(smooth, [0, 1], [-600, 0]);
  const opacity = useTransform(smooth, [0, 0.6, 1], [0, 0.85, 1]);
  const blur = useTransform(smooth, [0, 1], [16, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  return { progress: scrollYProgress, scale, z, opacity, blur, filter };
}

/**
 * Normalized progress of the entire document, 0 (top) → 1 (bottom).
 * Drives global, cross-section choreography such as the 3D sphere's "acts".
 */
export function useGlobalScrollProgress(): MotionValue<number> {
  const { scrollYProgress } = useScroll();
  return scrollYProgress;
}
