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
        "flex h-10 items-center gap-1 rounded-full border border-border px-1",
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
            "rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide transition-colors",
            locale === currentLang
              ? "bg-foreground text-background"
              : "text-muted hover:text-foreground",
          )}
        >
          {locale}
        </button>
      ))}
    </div>
  );
}
