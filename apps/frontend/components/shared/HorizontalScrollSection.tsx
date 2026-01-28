import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import { getAssetUrl } from '@/lib/r2';

// --- Types ---
interface CardData {
  id: number;
  title: string;
  category: string;
  image: string;
}

// --- Dummy Data ---
// --- Sub-Components ---

/**
 * Individual Feature Card with internal parallax
 */
const FeatureCard = ({ card, scrollX }: { card: CardData; scrollX: MotionValue<number> }) => {
  // Parallax Logic:
  // As the container moves left (negative x), we want the image to move slightly right (positive x)
  // to create the illusion of depth (the image is "further back").
  // We map the global scroll progress (passed via scrollX, which is 0 to 1 equivalent) to a pixel shift.
  // Note: scrollX here is actually the `scrollYProgress` from the parent.
  
  const x = useTransform(scrollX, [0, 1], ['-10%', '10%']);
  
  return (
    <div 
      className={cn(
        "group relative shrink-0 overflow-hidden bg-neutral-900 transform-gpu",
        "h-[60vh] w-[86vw] md:h-[60vh] md:w-[60vw]"
      )}
    >
      {/* Parallax Image Container */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          style={{ x, scale: 1.2 }} // Scale up to cover the parallax movement (10% movement requires 1.2 scale)
          className="h-full w-full will-change-transform sm:w-[80vw] sm:h-[80vh]"
        >
          <Image
            src={card.image}
            alt={card.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw " 
            className="object-cover transition-transform duration-500"
            priority={card.id <= 2} // Prioritize loading for the first 2 cards
          />
        </motion.div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 p-8">
        <span className="mb-2 block text-sm font-bold uppercase tracking-wider text-white">
          {card.category}
        </span>
        <h3 className="text-2xl md:text-3xl font-bold text-white">{card.title}</h3>
      </div>
    </div>
  );
};

// --- Main Component ---

export const HorizontalScrollSection = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  // Move cards inside to use t()
  const cards: CardData[] = [
    {
      id: 1,
      title: t("card.analytics.title"),
      category: t("card.analytics.cat"),
      image: getAssetUrl('trading.jpg'),
    },
    {
      id: 2,
      title: t("card.scale.title"),
      category: t("card.scale.cat"),
      image: getAssetUrl('network.jpg'),
    },
    {
      id: 3,
      title: t("card.contracts.title"),
      category: t("card.contracts.cat"),
      image: getAssetUrl('smart_contract.jpg'),
    },
    {
      id: 4,
      title: t("card.code.title"),
      category: t("card.code.cat"),
      image: getAssetUrl('software.jpg'),
    },
    {
      id: 5,
      title: t("card.neural.title"),
      category: t("card.neural.cat"),
      image: getAssetUrl('neural_network.jpg'),
    },
    {
      id: 6,
      title: t("card.data.title"),
      category: t("card.data.cat"),
      image: getAssetUrl('data_analytic.jpg'),
    },
    {
      id: 7,
      title: t("card.vr.title"),
      category: t("card.vr.cat"),
      image: getAssetUrl('vr.jpg'),
    },
  ];

  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001
  });

  // Transform vertical scroll (0 to 1) to horizontal translation.
  // 0 -> 1% (Initial padding)
  // 1 -> -80% (Scroll far enough to see the last card. Adjust based on number of cards/width)
  // The exact percentage depends on the total width of the content vs the viewport.
  // With 6 cards @ 350px + gaps, total width is approx 2300px.
  // Viewport is ~1000-1900px.
  const x = useTransform(smoothProgress, [0, 1], ['1%', '-90%']);
  // Removed textColor transition to optimize FPS (avoid per-frame style recalc)

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-black">
      {/* Sticky Container */}
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        
        {/* Horizontal Moving Track */}
        <motion.div style={{ x }} className="flex gap-8 pl-12 sm:pl-24 will-change-transform">
          
          {/* Header Card (Static text that scrolls away) */}
          <div className="flex h-[450px] w-[300px] flex-shrink-0 flex-col justify-center pr-12">
            <h2 className="mb-4 text-5xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                {t("scroll.transition.titleA")}
              </span>
            </h2>
            <p className="text-lg text-neutral-400">
              {t("scroll.transition.descA")}
            </p>
          </div>

          {/* Feature Cards */}
          {cards.map((card) => (
            <FeatureCard key={card.id} card={card} scrollX={smoothProgress} />
          ))}

        </motion.div>
      </div>
    </section>
  );
};
