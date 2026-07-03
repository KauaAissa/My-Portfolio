import type { Metadata } from "next";

import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { SphereStageLazy } from "@/components/3d/SphereStageLazy";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Metrics } from "@/components/sections/Metrics";
import { Projects } from "@/components/sections/Projects";
import { Footer } from "@/components/sections/Footer";

/**
 * Optional Spline scene URL. Provide a `scene.splinecode` export URL to
 * swap the CSS orb for a real 3D scene, e.g.:
 * const SPLINE_SCENE = "https://prod.spline.design/xxxx/scene.splinecode";
 */
const SPLINE_SCENE: string | undefined = "https://prod.spline.design/WBVfL1LR5I4g6oxW/scene.splinecode";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "pt";
  const dict = await getDictionary(locale);

  return {
    title: "Aissa",
    description: dict.hero.subtitle,
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "pt";
  const dict = await getDictionary(locale);

  return (
    <>
      <SphereStageLazy scene={SPLINE_SCENE} />
      <main className="relative z-10">
        <Hero dict={dict.hero} />
        <About dict={dict.about} />
        <Projects dict={dict.projects} />
        <Metrics dict={dict.metrics} />
        <Footer dict={dict.footer} nav={dict.nav} />
      </main>
    </>
  );
}
