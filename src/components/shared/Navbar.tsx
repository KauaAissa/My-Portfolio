"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/types/dictionary";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import logo from "@/assets/img/blackcat-logo.png";

export function Navbar({
  dict,
  lang,
}: {
  dict: Dictionary["nav"];
  lang: Locale;
}) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  const links = [
    { href: "#about", label: dict.about },
    { href: "#work", label: dict.work },
    { href: "#metrics", label: dict.metrics },
    { href: "#contact", label: dict.contact },
  ];

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav
        className={cn(
          "flex w-full max-w-5xl items-center justify-between rounded-full border px-3 py-2 transition-all duration-500",
          scrolled
            ? "glass border-border shadow-[0_8px_40px_-12px_rgba(0,0,0,0.3)]"
            : "border-transparent bg-transparent",
        )}
      >
        <a
          href={`/${lang}`}
          className="flex items-center gap-2 pl-2"
          aria-label={SITE.name}
        >
          <Image
            src={logo}
            alt=""
            priority
            className="h-7 w-auto dark:invert"
          />
          <span className="text-sm font-semibold tracking-tight">
            {SITE.name}
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle currentLang={lang} className="hidden sm:flex" />
          <ThemeToggle />
          <Button size="sm" className="hidden sm:inline-flex" asChild>
            <a href="#contact">
              {dict.cta}
              <ArrowUpRight className="size-4" />
            </a>
          </Button>
        </div>
      </nav>
    </motion.header>
  );
}
