"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import type { Dictionary } from "@/types/dictionary";

const EASE = [0.16, 1, 0.3, 1] as const;

type Project = Dictionary["projects"]["items"][number];

export function Projects({ dict }: { dict: Dictionary["projects"] }) {
  const [selected, setSelected] = React.useState<Project | null>(null);

  // Lock scroll + allow Escape to close the expanded slat.
  React.useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  return (
    <section
      id="work"
      className="relative mx-auto w-full max-w-6xl px-6 py-24 md:py-44"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: EASE }}
        className="max-w-2xl"
      >
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
          {dict.eyebrow}
        </span>
        <h2 className="mt-4 text-4xl font-black tracking-tighter sm:text-5xl">
          {dict.title}
        </h2>
        <p className="mt-4 leading-relaxed text-muted">{dict.subtitle}</p>
      </motion.div>

      {/* Perspective viewport for the 3D slats */}
      <div
        className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2"
        style={{ perspective: "1200px" }}
      >
        {dict.items.map((project, i) => (
          <ProjectSlat
            key={project.name}
            project={project}
            index={i}
            viewLabel={
              project.url.includes("linkedin.com")
                ? dict.viewProfile
                : dict.viewProject
            }
            onSelect={() => setSelected(project)}
          />
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <ExpandedSlat
            project={selected}
            viewLabel={
              selected.url.includes("linkedin.com")
                ? dict.viewProfile
                : dict.viewProject
            }
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

const SLAT_SURFACE =
  "linear-gradient(155deg, #1c1c1e 0%, #101011 45%, #050505 100%)";

function ProjectSlat({
  project,
  index,
  viewLabel,
  onSelect,
}: {
  project: Project;
  index: number;
  viewLabel: string;
  onSelect: () => void;
}) {
  const ref = React.useRef<HTMLButtonElement>(null);

  // Raw tilt targets, smoothed by springs for a magnetic feel. High
  // stiffness + low mass keeps the card glued to the cursor with no visible
  // lag, while damping keeps the settle organic instead of rubbery.
  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);
  const rotateX = useSpring(rotateXRaw, {
    stiffness: 320,
    damping: 28,
    mass: 0.6,
  });
  const rotateY = useSpring(rotateYRaw, {
    stiffness: 320,
    damping: 28,
    mass: 0.6,
  });

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateYRaw.set((px - 0.5) * 8);
    rotateXRaw.set(-(py - 0.5) * 8);
  };

  const handleLeave = () => {
    rotateXRaw.set(0);
    rotateYRaw.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onSelect}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: EASE, delay: (index % 2) * 0.08 }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group relative block text-left"
    >
      <motion.div
        layoutId={`slat-${project.name}`}
        style={{ background: SLAT_SURFACE }}
        className="relative flex min-h-[440px] flex-col justify-end overflow-hidden rounded-[28px] border border-white/10 p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5 group-hover:border-white/25 group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_60px_140px_-40px_rgba(0,0,0,1)]"
      >
        {/* Diagonal light sweep on hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]"
        >
          <div className="absolute inset-y-0 left-0 w-1/2 -translate-x-[180%] -skew-x-12 bg-gradient-to-r from-transparent via-white/12 to-transparent transition-transform duration-[900ms] ease-out group-hover:translate-x-[260%]" />
        </div>
        {/* Reflective sheen */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-40 transition-opacity duration-500 group-hover:opacity-70"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.08), transparent)",
          }}
        />

        {/* Oversized index */}
        <span
          aria-hidden
          className="absolute right-6 top-4 text-7xl font-black tracking-tighter text-white/[0.06] transition-colors duration-500 group-hover:text-white/[0.14]"
          style={{ transform: "translateZ(30px)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Content, lifted forward in 3D */}
        <div
          className="relative flex flex-col gap-4"
          style={{ transform: "translateZ(50px)" }}
        >
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
            {project.category}
          </span>
          <h3 className="text-2xl font-bold tracking-tighter text-white sm:text-3xl">
            {project.name}
          </h3>
          <p className="max-w-sm text-pretty text-sm leading-relaxed text-white/65">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70"
              >
                {tag}
              </span>
            ))}
          </div>

          <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-white">
            {viewLabel}
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </motion.div>
    </motion.button>
  );
}

function ExpandedSlat({
  project,
  viewLabel,
  onClose,
}: {
  project: Project;
  viewLabel: string;
  onClose: () => void;
}) {
  const closeRef = React.useRef<HTMLButtonElement>(null);

  // Move keyboard focus into the dialog when it opens.
  React.useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={project.name}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        layoutId={`slat-${project.name}`}
        style={{ background: SLAT_SURFACE }}
        className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto overflow-x-hidden rounded-[28px] border border-white/10 p-6 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] sm:p-10"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-lg leading-none text-white/70 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/30 hover:bg-white/10 hover:text-white"
        >
          ×
        </button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: EASE }}
          className="flex flex-col gap-5"
        >
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
            {project.category}
          </span>
          <h3 className="text-3xl font-black tracking-tighter text-white sm:text-4xl">
            {project.name}
          </h3>
          <p className="text-pretty leading-relaxed text-white/75">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70"
              >
                {tag}
              </span>
            ))}
          </div>

          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform hover:-translate-y-0.5"
          >
            {viewLabel}
            <ArrowUpRight className="size-4" />
          </a>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
