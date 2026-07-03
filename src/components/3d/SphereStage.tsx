"use client";

import { DynamicStageModel } from "./DynamicStageModel";
import { StageShell, STAGE_FRAME_CLASS } from "./StageShell";
import { useGlobalScrollProgress } from "@/hooks/useScrollytelling";

/**
 * Persistent, fixed 3D stage that lives behind every section. Because it is
 * driven by *global* scroll progress, the model can act out the full
 * three-act narrative (calm → processing → receding) as the visitor travels
 * down the page, instead of being confined to the Hero.
 *
 * The shell (frame + vignette) is shared with the lazy-loading placeholder,
 * so mounting this component never causes a visual jump.
 */
export function SphereStage({ scene }: { scene?: string }) {
  const progress = useGlobalScrollProgress();

  return (
    <StageShell>
      <DynamicStageModel
        scene={scene}
        scrollProgress={progress}
        className={STAGE_FRAME_CLASS}
        // DEFAULT_CALIBRATION is already tuned for the purple particle sphere.
        // Override per-field here if needed, e.g.:
        // calibration={{ modelScale: 1.3, offsetX: 40 }}
      />
    </StageShell>
  );
}
