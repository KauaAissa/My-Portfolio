import { notFound } from "next/navigation";

import { i18n, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Navbar } from "@/components/shared/Navbar";
import { HtmlLangSync } from "@/components/shared/HtmlLangSync";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);

  return (
    <>
      <HtmlLangSync lang={lang} />
      <Navbar dict={dict.nav} lang={lang as Locale} />
      {children}
    </>
  );
}
