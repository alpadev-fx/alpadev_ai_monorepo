"use client";


import ScrollingBanner from "../shared/scrolling-banner";

const companies = [
  { name: "Depo", logo: "/depo.png" },
  { name: "FoodFresh", logo: "/foodfresh.png" },
  { name: "IPTV", logo: "/iptv.png" },
  { name: "MR", logo: "/mr.png" },
  { name: "PadelHouse", logo: "/padelhouse.png" },
  { name: "Hogmon", logo: "/Hogmon.png" },
  { name: "AlpaDev", logo: "/alpadev.jpg" },
];

import { useLanguage } from "@/contexts/LanguageContext";

export default function TrustedBy() {
  const { t } = useLanguage();
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8 -mt-32 relative z-10">
      <div className="text-center mb-8">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          {t("trustedBy.title")}
        </p>
      </div>
      <ScrollingBanner shouldPauseOnHover gap="100px" duration={50}>
        {[...companies, ...companies, ...companies].map(({ name, logo }, index) => (
          <div key={`${name}-${index}`} className="flex items-center justify-center mx-12 p-4 rounded-lg transition-all duration-300">
            <img
              src={logo}
              alt={`${name} logo`}
              className="object-contain h-32 w-auto max-w-none"
            />
          </div>
        ))}
      </ScrollingBanner>
    </section>
  );
}
