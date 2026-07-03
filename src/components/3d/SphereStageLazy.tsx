"use client";

import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";
import { StageGlow, StageShell, STAGE_FRAME_CLASS } from "./StageShell";

/**
 * Lightweight stand-in rendered while the Spline chunk downloads. It uses
 * the exact same shell + frame as the live stage, so the handoff to the
 * real 3D scene is a seamless in-place crossfade instead of a pop-in.
 */
function StagePlaceholder() {
  return (
    <StageShell>
      <div
        className={cn(
          "relative flex aspect-square w-full items-center justify-center",
          STAGE_FRAME_CLASS,
        )}
      >
        <StageGlow />
      </div>
    </StageShell>
  );
}

/**
 * Client-side lazy loader for the Spline 3D stage.
 *
 * `ssr: false` keeps the heavy WebGL runtime (~1MB of Spline + three.js)
 * out of the server render and the initial HTML, so first paint of the
 * text content is never blocked by the 3D scene. The placeholder guarantees
 * the stage is visually alive from the very first client paint.
 */
const SphereStage = dynamic(
  () => import("./SphereStage").then((m) => m.SphereStage),
  { ssr: false, loading: () => <StagePlaceholder /> },
);

export function SphereStageLazy({ scene }: { scene?: string }) {
  return <SphereStage scene={scene} />;
}
