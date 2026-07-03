"use client";

import * as React from "react";
import { motion, useInView, useMotionValue, animate } from "framer-motion";

import type { Dictionary } from "@/types/dictionary";
import { useCameraEnter } from "@/hooks/useScrollytelling";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Metrics({ dict }: { dict: Dictionary["metrics"] }) {
  const ref = React.useRef<HTMLElement>(null);

  // Metrics rises from the depth of the scene as the Hero dollies away -
  // the second half of the cinematic camera handoff.
  const { scale, z, opacity, filter } = useCameraEnter(ref);

  return (
    <section
      id="metrics"
      ref={ref}
      className="relative mx-auto w-full max-w-6xl px-6 py-24 md:py-44"
      style={{ perspective: 1200 }}
    >
      <motion.div
        style={{ scale, z, opacity, filter, transformPerspective: 1200 }}
        className="will-change-transform"
      >
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
            {dict.eyebrow}
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tighter sm:text-5xl">
            {dict.title}
          </h2>
          <p className="mt-4 leading-relaxed text-muted">{dict.subtitle}</p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {dict.items.map((item, i) => (
            <MetricCard key={item.label} item={item} index={i} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function MetricCard({
  item,
  index,
}: {
  item: Dictionary["metrics"]["items"][number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE, delay: index * 0.08 }}
      className="group relative flex flex-col gap-2 bg-background/80 p-8 backdrop-blur-md transition-colors duration-500 hover:bg-card"
    >
      <Counter value={item.value} />
      <span className="text-sm font-medium">{item.label}</span>
      <span className="text-sm leading-relaxed text-muted">
        {item.description}
      </span>
    </motion.div>
  );
}

/**
 * Animates the numeric portion of a metric string (e.g. "1.2M", "99.9%")
 * from 0 to its target when scrolled into view, preserving suffixes.
 */
function Counter({ value }: { value: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const match = value.match(/^([\d.]+)(.*)$/);
  const target = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : value;
  const decimals = match && match[1].includes(".") ? 1 : 0;

  const mv = useMotionValue(0);
  const [display, setDisplay] = React.useState("0");

  React.useEffect(() => {
    if (!inView || !match) return;
    const controls = animate(mv, target, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (latest) => setDisplay(latest.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [inView, target, decimals, match, mv]);

  return (
    <span
      ref={ref}
      className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl"
    >
      {match ? display : value}
      {match ? suffix : null}
    </span>
  );
}
