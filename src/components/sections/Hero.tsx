"use client";

import * as React from "react";
import { motion, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, ExternalLink } from "lucide-react";

import type { Dictionary } from "@/types/dictionary";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";
import { useCameraExit } from "@/hooks/useScrollytelling";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero({ dict }: { dict: Dictionary["hero"] }) {
  const ref = React.useRef<HTMLElement>(null);

  // The whole Hero leaves *through the camera*: it zooms toward the viewer
  // and dissolves into blur, handing off to Metrics emerging from the depth.
  const { scale, z, opacity, filter, progress } = useCameraExit(ref);
  const scrollHintOpacity = useTransform(progress, [0, 0.15], [1, 0]);

  const words = dict.titleLine1.split(" ");
  const words2 = dict.titleLine2.split(" ");

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 pt-28"
      style={{ perspective: 1200 }}
    >
      {/* Foreground content - dollies out through the camera on scroll */}
      <motion.div
        style={{ scale, z, opacity, filter, transformPerspective: 1200 }}
        className="relative z-10 flex max-w-4xl flex-col items-center text-center will-change-transform"
      >
        <h1 className="text-balance text-5xl font-black leading-[0.98] tracking-tighter sm:text-6xl md:text-7xl">
          <span className="block">
            {words.map((word, i) => (
              <AnimatedWord key={`a-${i}`} delay={0.15 + i * 0.06}>
                {word}
              </AnimatedWord>
            ))}
          </span>
          <span className="block text-muted">
            {words2.map((word, i) => (
              <AnimatedWord key={`b-${i}`} delay={0.35 + i * 0.06}>
                {word}
              </AnimatedWord>
            ))}
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.6 }}
          className="mt-8 max-w-xl text-pretty text-lg font-medium leading-relaxed text-foreground/85 sm:text-xl"
        >
          {dict.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.75 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button size="lg" asChild>
            <a href="#work">
              {dict.primaryCta}
              <ArrowUpRight className="size-4" />
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href={SITE.github} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
              {dict.secondaryCta}
            </a>
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        style={{ opacity: scrollHintOpacity }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-muted"
      >
        <span className="text-[11px] uppercase tracking-[0.2em]">
          {dict.scroll}
        </span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="size-4" />
        </motion.span>
      </motion.div>
    </section>
  );
}

function AnimatedWord({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <span className="mr-[0.25em] inline-block overflow-hidden align-bottom">
      <motion.span
        initial={{ y: "100%", opacity: 0.1 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE, delay }}
        className="inline-block"
      >
        {children}
      </motion.span>
    </span>
  );
}
