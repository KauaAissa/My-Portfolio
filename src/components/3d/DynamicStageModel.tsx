"use client";

import * as React from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Spline from "@splinetool/react-spline";
import type { Application, SPEObject } from "@splinetool/runtime";

import { cn } from "@/lib/utils";
import { AnimatedOrb } from "./AnimatedOrb";

const DEG = Math.PI / 180;
const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Frames rendered off-screen after `onLoad` before the scene is revealed.
 * Spline fires `onLoad` when the scene graph is parsed - particle textures
 * are still decoding and emitters haven't settled, so revealing immediately
 * flashes a half-assembled scene. ~20 frames (≈330ms at 60fps) lets the
 * runtime warm up while the canvas is still invisible.
 */
const WARMUP_FRAMES = 20;

/* ------------------------------------------------------------------ *
 *  CALIBRATION
 *  Tweak these to fit ANY Spline model without breaking the layout.
 *  Every value is overridable per-instance via the `calibration` prop.
 * ------------------------------------------------------------------ */
export interface StageCalibration {
  /** Multiplier applied to the model's intrinsic scale - shrink big models, grow small ones. */
  modelScale: number;
  /** Axis the continuous idle/processing rotation spins around. */
  rotateAxis: "x" | "y" | "z";
  /** Idle rotation speed in degrees per millisecond (Act 1). */
  spinIdle: number;
  /** Extra rotation speed added during the Act-2 "processing" burst. */
  spinBoost: number;
  /** Max degrees the sphere tilts toward the cursor (subtle live interaction). */
  pointerTilt: number;
  /** Max px the wrapper drifts with the cursor for a parallax feel. */
  pointerParallax: number;
  /** Static framing rotation (degrees) applied on load. */
  baseRotationX: number;
  baseRotationY: number;
  baseRotationZ: number;
  /** Static framing position offset (world units) applied on load. */
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  /** Wrapper scale across the four acts [enter, hero, metrics, projects]. */
  actScale: [number, number, number, number];
  /** Wrapper opacity across the four acts. */
  actOpacity: [number, number, number, number];
  /** translateZ (px) the model recedes to in Act 3. */
  recedeZ: number;
}

export const DEFAULT_CALIBRATION: StageCalibration = {
  // Balanced, immersive size for the purple particle sphere.
  modelScale: 1.15,
  rotateAxis: "y",
  // Act 1: subtle, organic drift.
  spinIdle: 0.015,
  // Act 2: stylish acceleration - "processing" Python/AI automations.
  spinBoost: 0.32,
  // Gentle, alive reaction to the mouse.
  pointerTilt: 15,
  pointerParallax: 24,
  baseRotationX: 0,
  baseRotationY: 0,
  baseRotationZ: 0,
  offsetX: 0,
  offsetY: 0,
  offsetZ: 0,
  actScale: [1, 1.06, 0.96, 0.72],
  actOpacity: [1, 1, 0.35, 0],
  recedeZ: -420,
};

interface DynamicStageModelProps {
  /**
   * Spline scene URL (e.g. https://prod.spline.design/xxx/scene.splinecode).
   * When omitted, a dependency-free animated orb is rendered so the site
   * always ships something premium without an external asset.
   */
  scene?: string;
  /**
   * Global scroll progress (0 → 1) that choreographs the model across three acts:
   *  - Act 1 (Hero): calm, front and centre.
   *  - Act 2 (Metrics): rotation accelerates and the model vibrates - "processing".
   *  - Act 3 (Projects): the model recedes into depth and fades out.
   */
  scrollProgress?: MotionValue<number>;
  /** Per-instance calibration overrides - merged over {@link DEFAULT_CALIBRATION}. */
  calibration?: Partial<StageCalibration>;
  /** Object names to probe for the primary mesh/group inside the scene. */
  objectNames?: string[];
  /** Called once the Spline runtime is ready. */
  onSplineLoad?: (app: Application) => void;
  className?: string;
}

const DEFAULT_OBJECT_NAMES = [
  "Particles",
  "Particle System",
  "ParticleSystem",
  "Model",
  "Scene",
  "Chip",
  "CPU",
  "Sphere",
  "Ball",
  "Orb",
  "Group",
  "Object",
  "Cube",
  "Torus",
];

/**
 * High-performance, model-agnostic 3D stage. Renders an optimized Spline scene
 * when a URL is provided, otherwise a themed CSS/Framer orb. The same
 * scroll-based "act" choreography drives either variant, and every spatial
 * property is calibratable so no model breaks the layout.
 */
export function DynamicStageModel({
  scene,
  scrollProgress,
  calibration,
  objectNames = DEFAULT_OBJECT_NAMES,
  onSplineLoad,
  className,
}: DynamicStageModelProps) {
  const reduceMotion = useReducedMotion();

  // Merge calibration once per render and expose it to the frame loop via ref.
  const cfg = React.useMemo<StageCalibration>(
    () => ({ ...DEFAULT_CALIBRATION, ...calibration }),
    [calibration],
  );
  const cfgRef = React.useRef(cfg);
  cfgRef.current = cfg;

  // A stable fallback so the transforms below always have a source.
  const idle = useMotionValue(0);
  const progress = scrollProgress ?? idle;

  // --- Readiness pipeline -------------------------------------------------
  // The Spline canvas mounts invisible and keeps rendering off-screen until
  // it has been calibrated AND warmed up for WARMUP_FRAMES. Only then does
  // the placeholder orb dissolve into the real scene. If the scene never
  // loads (slow network / bad URL), the orb simply stays - graceful fallback.
  const [ready, setReady] = React.useState(false);
  // Placeholder is unmounted only after its fade-out completes.
  const [placeholderGone, setPlaceholderGone] = React.useState(false);
  const disposedRef = React.useRef(false);

  React.useEffect(() => {
    disposedRef.current = false;
    return () => {
      disposedRef.current = true;
    };
  }, []);

  React.useEffect(() => {
    setReady(false);
    setPlaceholderGone(false);
  }, [scene]);

  // --- Wrapper choreography (works for both Spline canvas and CSS orb) ---
  const scale = useTransform(progress, [0, 0.33, 0.66, 1], cfg.actScale);
  const z = useTransform(progress, [0, 0.66, 1], [0, 0, cfg.recedeZ]);
  const opacity = useTransform(progress, [0, 0.6, 0.85, 1], cfg.actOpacity);

  // Continuous rotation, updated every frame (no scroll vibration).
  const spin = useMotionValue(0); // degrees (used by the CSS orb wrapper)
  // Cursor-driven parallax drift of the wrapper (subtle interaction).
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  // Normalized cursor target (-0.5 → 0.5) + smoothed value for buttery lag.
  const pointerTargetRef = React.useRef({ x: 0, y: 0 });
  const pointerSmoothRef = React.useRef({ x: 0, y: 0 });

  // Spline runtime handles (real 3D manipulation when a scene is present).
  const objectRef = React.useRef<SPEObject | null>(null);
  const baseRef = React.useRef<{ px: number; py: number } | null>(null);

  // Track the mouse globally (the canvas itself stays pointer-events-none).
  React.useEffect(() => {
    if (reduceMotion) return;
    const onMove = (e: PointerEvent) => {
      pointerTargetRef.current.x = e.clientX / window.innerWidth - 0.5;
      pointerTargetRef.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduceMotion]);

  useAnimationFrame((_t, delta) => {
    if (reduceMotion) return;
    const c = cfgRef.current;

    const p = progress.get();
    const inAct2 = p > 0.3 && p < 0.68 ? 1 : 0;

    // Rotation ramps hard during Act 2 to sell "data processing".
    const speed = c.spinIdle + inAct2 * c.spinBoost; // deg per ms
    const next = spin.get() + speed * delta;
    spin.set(next);

    // Ease the smoothed cursor value toward the raw target.
    const target = pointerTargetRef.current;
    const smooth = pointerSmoothRef.current;
    smooth.x += (target.x - smooth.x) * 0.06;
    smooth.y += (target.y - smooth.y) * 0.06;

    // Wrapper drifts gently with the cursor (parallax).
    pointerX.set(smooth.x * c.pointerParallax);
    pointerY.set(smooth.y * c.pointerParallax);

    // Drive the real Spline object for authentic 3D depth.
    const obj = objectRef.current;
    if (obj && baseRef.current) {
      const axis = c.rotateAxis;
      const baseDeg =
        axis === "x"
          ? c.baseRotationX
          : axis === "y"
            ? c.baseRotationY
            : c.baseRotationZ;
      // Continuous spin on the primary axis + a slight lean toward the cursor.
      obj.rotation[axis] = (baseDeg + next + smooth.x * c.pointerTilt) * DEG;
      // Vertical mouse tilts the sphere on X (unless X is the spin axis).
      if (axis !== "x") {
        obj.rotation.x = (c.baseRotationX - smooth.y * c.pointerTilt) * DEG;
      }
      // Position stays fixed - no vibration on scroll.
      obj.position.x = baseRef.current.px;
      obj.position.y = baseRef.current.py;
    }
  });

  const handleLoad = React.useCallback(
    (app: Application) => {
      const c = cfgRef.current;

      // Strip the model's native background so it blends into our design system.
      const runtime = app as unknown as {
        setBackgroundColor?: (color: string) => void;
        canvas?: HTMLCanvasElement;
      };
      try {
        runtime.setBackgroundColor?.("transparent");
      } catch {
        /* older runtimes may not expose this - CSS override covers it */
      }
      if (runtime.canvas) {
        runtime.canvas.style.background = "transparent";
      }

      let found: SPEObject | null = null;
      for (const name of objectNames) {
        const obj = app.findObjectByName(name);
        if (obj) {
          found = obj;
          break;
        }
      }

      if (found) {
        // Normalize size so oversized/undersized models never break the frame.
        found.scale.x *= c.modelScale;
        found.scale.y *= c.modelScale;
        found.scale.z *= c.modelScale;

        // Static framing rotation + position offset.
        found.rotation.x = c.baseRotationX * DEG;
        found.rotation.y = c.baseRotationY * DEG;
        found.rotation.z = c.baseRotationZ * DEG;
        found.position.x += c.offsetX;
        found.position.y += c.offsetY;
        found.position.z += c.offsetZ;

        baseRef.current = { px: found.position.x, py: found.position.y };
      }

      objectRef.current = found;
      onSplineLoad?.(app);

      // Warm-up: let the runtime render real frames while the canvas is
      // still at opacity 0, so textures finish decoding and the particle
      // emitters stabilize before anything becomes visible.
      let frames = 0;
      const warmUp = () => {
        if (disposedRef.current) return;
        if (++frames >= WARMUP_FRAMES) setReady(true);
        else requestAnimationFrame(warmUp);
      };
      requestAnimationFrame(warmUp);
    },
    [objectNames, onSplineLoad],
  );

  return (
    <motion.div
      style={{
        scale,
        z,
        opacity,
        x: pointerX,
        y: pointerY,
        // The CSS orb spins in 2D; the Spline object spins in real 3D instead.
        rotate: scene ? undefined : spin,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "pointer-events-none relative flex aspect-square w-full items-center justify-center will-change-transform",
        className,
      )}
    >
      {scene ? (
        <>
          {/* Placeholder orb: visible from the very first paint (it matches
              the lazy-loading fallback 1:1), then dissolves under the real
              scene once it is warmed up. Unmounted after the fade-out. */}
          {!placeholderGone && (
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: ready ? 0 : 1, scale: ready ? 1.05 : 1 }}
              transition={{ duration: 0.8, ease: REVEAL_EASE }}
              onAnimationComplete={() => {
                if (ready) setPlaceholderGone(true);
              }}
            >
              <AnimatedOrb />
            </motion.div>
          )}

          {/* Real 3D scene: mounts invisible, warms up off-screen, then
              crossfades in with a subtle settle-into-place scale. */}
          <motion.div
            className="h-full w-full"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={
              ready
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.96 }
            }
            transition={{ duration: 1.1, ease: REVEAL_EASE }}
          >
            <React.Suspense fallback={null}>
              <Spline
                scene={scene}
                onLoad={handleLoad}
                style={{ background: "transparent" }}
                className="pointer-events-none !h-full !w-full !bg-transparent [&_canvas]:!bg-transparent"
              />
            </React.Suspense>
          </motion.div>
        </>
      ) : (
        <AnimatedOrb />
      )}
    </motion.div>
  );
}

