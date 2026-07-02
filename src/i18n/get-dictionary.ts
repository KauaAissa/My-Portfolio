import type { Locale } from "./config";
import type { Dictionary } from "@/types/dictionary";

/**
 * Dynamically loaded dictionaries. Keeps the client bundle lean -
 * only the requested locale is shipped per request.
 */
const dictionaries = {
  pt: () => import("@/dictionaries/pt.json").then((m) => m.default),
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
} as const;

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  (dictionaries[locale] ?? dictionaries.pt)() as Promise<Dictionary>;
