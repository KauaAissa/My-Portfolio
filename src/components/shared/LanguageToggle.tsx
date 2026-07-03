"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { i18n, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageToggle({
  currentLang,
  className,
}: {
  currentLang: Locale;
  className?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (locale: Locale) => {
    if (locale === currentLang) return;
    const segments = pathname.split("/");
    segments[1] = locale;
    router.push(segments.join("/") || `/${locale}`);
  };

  return (
    <div
      className={cn(
        "flex h-10 items-center gap-1 rounded-full border border-border bg-foreground/[0.02] px-1 backdrop-blur-md transition-colors duration-300 hover:border-foreground/25",
        className,
      )}
    >
      <Globe className="ml-1.5 size-[14px] text-muted" aria-hidden />
      {i18n.locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => switchTo(locale)}
          aria-pressed={locale === currentLang}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            locale === currentLang
              ? "bg-foreground text-background shadow-[0_4px_12px_-4px_rgba(0,0,0,0.3)]"
              : "text-muted hover:bg-foreground/[0.07] hover:text-foreground",
          )}
        >
          {locale}
        </button>
      ))}
    </div>
  );
}
