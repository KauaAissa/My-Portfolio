"use client";

import { DynamicStageModel } from "./DynamicStageModel";
import { useGlobalScrollProgress } from "@/hooks/useScrollytelling";

/**
 * Persistent, fixed 3D stage that lives behind every section. Because it is
 * driven by *global* scroll progress, the model can act out the full
 * three-act narrative (calm → processing → receding) as the visitor travels
 * down the page, instead of being confined to the Hero.
 */
export function SphereStage({ scene }: { scene?: string }) {
  const progress = useGlobalScrollProgress();

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center"
    >
      <DynamicStageModel
        scene={scene}
        scrollProgress={progress}
        className="max-w-[620px]"
        // DEFAULT_CALIBRATION is already tuned for the purple particle sphere.
        // Override per-field here if needed, e.g.:
        // calibration={{ modelScale: 1.3, offsetX: 40 }}
      />
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
