"use client";

import * as React from "react";

/**
 * Responsive frame shared by the live 3D stage and its loading placeholder,
 * so the orb → Spline handoff never shifts size or position.
 */
export const STAGE_FRAME_CLASS =
  "max-w-[360px] sm:max-w-[480px] lg:max-w-[620px]";

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
