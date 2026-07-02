"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import type { Dictionary } from "@/types/dictionary";
import me from "@/assets/img/me.jpg";

const EASE = [0.16, 1, 0.3, 1] as const;

export function About({ dict }: { dict: Dictionary["about"] }) {
  return (
    <section
      id="about"
      className="relative mx-auto w-full max-w-6xl px-6 py-32 md:py-44"
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        {/* Portrait - floating glass card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative mx-auto w-full max-w-sm lg:sticky lg:top-28 lg:mx-0"
        >
          {/* Ambient glow */}
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-[40px] opacity-60 blur-3xl"
            style={{
              background:
                "radial-gradient(60% 60% at 40% 30%, rgba(120,120,255,0.18), transparent 70%), radial-gradient(60% 60% at 70% 80%, rgba(255,120,200,0.14), transparent 70%)",
            }}
          />
          <div className="glass overflow-hidden rounded-[28px] border border-border p-2 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.6)]">
            <div className="relative overflow-hidden rounded-[22px]">
              <Image
                src={me}
                alt={dict.title}
                placeholder="blur"
                priority
                sizes="(max-width: 1024px) 90vw, 420px"
                className="h-auto w-full object-cover"
              />
              {/* Subtle top sheen */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-1/3"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.10), transparent)",
                }}
              />
            </div>
            <div className="px-4 py-3 text-center">
              <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
                {dict.role}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Bio + skills */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
          className="flex flex-col"
        >
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
            {dict.eyebrow}
          </span>
          <h2 className="mt-4 text-4xl font-black tracking-tighter sm:text-5xl">
            {dict.title}
          </h2>

          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm sm:p-7">
            {dict.paragraphs.map((paragraph, i) => (
              <p key={i} className="text-pretty text-foreground/75 sm:text-lg">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Skills */}
          <div className="mt-10">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
              {dict.skillsTitle}
            </span>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {dict.skills.map((group) => (
                <div
                  key={group.group}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm transition-colors hover:border-foreground/20"
                >
                  <span className="text-sm font-semibold tracking-tight">
                    {group.group}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-foreground/30 hover:text-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="mt-10">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
              {dict.languagesTitle}
            </span>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {dict.languages.map((language) => (
                <span
                  key={language}
                  className="rounded-xl border border-border bg-card/60 px-4 py-3 text-sm font-medium text-foreground/85 backdrop-blur-sm transition-colors hover:border-foreground/20"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
