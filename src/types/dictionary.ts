import type pt from "@/dictionaries/pt.json";

/**
 * The canonical shape of a translation dictionary, derived from the pt locale.
 * Safe to import in client components (no server-only side effects).
 */
export type Dictionary = typeof pt;
