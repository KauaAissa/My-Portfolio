"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, AtSign, ExternalLink } from "lucide-react";

import type { Dictionary } from "@/types/dictionary";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";
import logo from "@/assets/img/blackcat-logo.png";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Footer({
  dict,
  nav,
}: {
  dict: Dictionary["footer"];
  nav: Dictionary["nav"];
}) {
  const socials = [
    { label: "GitHub", href: SITE.github, Icon: ExternalLink },
    { label: "LinkedIn", href: SITE.linkedin, Icon: ExternalLink },
    { label: "Email", href: `mailto:${dict.email}`, Icon: AtSign },
  ];

  const navLinks = [
    { href: "#about", label: nav.about },
    { href: "#work", label: nav.work },
    { href: "#metrics", label: nav.metrics },
    { href: "#contact", label: nav.contact },
  ];

  return (
    <footer
      id="contact"
      className="relative mx-auto w-full max-w-6xl px-6 pb-12 pt-24 md:pt-44"
    >
      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: EASE }}
        className="flex flex-col items-start gap-8 border-b border-border pb-20"
      >
        <h2 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
          {dict.title}
        </h2>
        <p className="max-w-md leading-relaxed text-muted">{dict.subtitle}</p>
        <Button size="lg" asChild>
          <a href={`mailto:${dict.email}`}>
            {dict.cta}
            <ArrowUpRight className="size-4" />
          </a>
        </Button>
      </motion.div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
          <span className="flex items-center gap-2">
            <Image src={logo} alt="" className="h-6 w-auto dark:invert" />
            <span className="text-sm font-semibold">{SITE.name}</span>
          </span>
          <a
            href={`mailto:${dict.email}`}
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            {dict.email}
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
            {dict.nav}
          </span>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
            {dict.social}
          </span>
          {socials.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              <Icon className="size-4" />
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
