import { redirect } from "next/navigation";
import { i18n } from "@/i18n/config";

/**
 * The root route immediately hands off to the default locale.
 * Middleware handles this for most requests; this is the SSR fallback.
 */
export default function RootPage() {
  redirect(`/${i18n.defaultLocale}`);
}
