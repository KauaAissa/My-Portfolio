"use client";

import * as React from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/types/dictionary";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import logo from "@/assets/img/blackcat-logo.png";

const MENU_EASE = [0.16, 1, 0.3, 1] as const;

export function Navbar({
  dict,
  lang,
}: {
  dict: Dictionary["nav"];
  lang: Locale;
}) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  // Lock body scroll while the mobile menu is open.
  React.useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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
          scrolled || menuOpen
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
              className="rounded-full border border-transparent px-4 py-2 text-sm text-muted transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-border hover:bg-foreground/[0.05] hover:text-foreground hover:backdrop-blur-md"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle currentLang={lang} className="hidden sm:flex" />
          <ThemeToggle />
          <Button size="sm" className="hidden sm:inline-flex" asChild>
            <a href={`mailto:${SITE.email}`}>
              {dict.cta}
              <ArrowUpRight className="size-4" />
            </a>
          </Button>

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-foreground/5 md:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: MENU_EASE }}
            className="glass absolute inset-x-4 top-[76px] z-40 flex flex-col gap-2 rounded-3xl border border-border p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-md md:hidden"
          >
            {links.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.05, ease: MENU_EASE }}
                className="rounded-2xl px-4 py-3 text-base font-medium text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                {link.label}
              </motion.a>
            ))}

            <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-4">
              <LanguageToggle currentLang={lang} />
              <Button size="sm" asChild>
                <a href={`mailto:${SITE.email}`} onClick={() => setMenuOpen(false)}>
                  {dict.cta}
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
