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
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

const DEG = Math.PI / 180;
const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

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
  const { resolvedTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const isDark = resolvedTheme !== "light";

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

  // Reveal the scene only once it is fully initialized, so the incomplete
  // texture / uncalibrated frames never flash on screen (fixes the pop-in on
  // first load, refresh and language change).
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    setReady(false);
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

      // Wait a couple of frames so textures finish decoding before the fade-in,
      // avoiding the "Texture marked for update but image is incomplete" flash.
      requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
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
        <React.Suspense fallback={null}>
          <motion.div
            className="h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ duration: 0.9, ease: REVEAL_EASE }}
          >
            <Spline
              scene={scene}
              onLoad={handleLoad}
              style={{ background: "transparent" }}
              className="pointer-events-none !h-full !w-full !bg-transparent [&_canvas]:!bg-transparent"
            />
          </motion.div>
        </React.Suspense>
      ) : (
        <AnimatedOrb isDark={isDark} reduceMotion={!!reduceMotion} />
      )}
    </motion.div>
  );
}

function AnimatedOrb({
  isDark,
  reduceMotion,
}: {
  isDark: boolean;
  reduceMotion: boolean;
}) {
  const core = isDark ? "#ffffff" : "#1d1d1f";
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

      {/* Accent core dot */}
      <div
        aria-hidden
        className="absolute h-2 w-2 rounded-full"
        style={{ background: core, opacity: 0 }}
      />
    </div>
  );
}
