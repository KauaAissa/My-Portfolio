"use client";

import { useEffect } from "react";

/**
 * Keeps <html lang> in sync with the active locale segment on the client,
 * since the root layout renders a static default.
 */
export function HtmlLangSync({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
