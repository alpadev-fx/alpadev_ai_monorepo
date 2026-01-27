'use client';

import * as React from 'react';
import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useAnimate,
  useInView,
  LayoutGroup,
} from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// --- Types ---

interface OrbitItem {
  id: number;
  name: string;
  src: string;
}

interface RadialIntroProps {
  orbitItems?: OrbitItem[]; // Made optional to provide default/fallback
  stageSize?: number;
  imageSize?: number;
  className?: string;
  videoUrl?: string; // Optional video background if they still want it behind the hole
}

// --- Constants & Helpers ---

const transition = {
  delay: 0,
  stiffness: 300,
  damping: 35,
  type: 'spring',
  restSpeed: 0.01,
  restDelta: 0.01,
};

const spinConfig = {
  duration: 30,
  ease: 'linear',
  repeat: Infinity,
};

const qsa = (root: Element, sel: string) =>
  Array.from(root.querySelectorAll(sel));

const angleOf = (el: Element) => Number((el as HTMLElement).dataset.angle || 0);

const armOfImg = (img: Element) =>
  (img as HTMLElement).closest('[data-arm]') as HTMLElement | null;

// --- Inner Component: The "Black Hole" / Orbit System ---

export function OrbitSystem({
  orbitItems,
  stageSize = 320,
  imageSize = 60,
}: {
  orbitItems: OrbitItem[];
  stageSize?: number;
  imageSize?: number;
}) {
  const step = 360 / orbitItems.length;
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope, { margin: "-20% 0px -20% 0px" });

  React.useEffect(() => {
    const root = scope.current;
    if (!root) return;

    // get arm and image elements
    const arms = qsa(root, '[data-arm]');
    const imgs = qsa(root, '[data-arm-image]');
    const stops: Array<() => void> = [];

    // Helper to safely cancel animations
    const safeAnimate = (element: any, keyframes: any, options: any) => {
      try {
        return animate(element, keyframes, options);
      } catch (e) {
        return { cancel: () => {} };
      }
    };

    if (!isInView) {
        // RESET STATE when out of view
        safeAnimate(imgs, { top: '50%', opacity: 0, rotate: 0 }, { duration: 0 });
        arms.forEach((el) => {
             safeAnimate(el, { rotate: angleOf(el) }, { duration: 0 });
        });
        return;
    }

    // --- PLAY ANIMATION sequence when in view ---

    // image lift-in
    safeAnimate(imgs, { top: 0 }, transition);

    // build sequence for orbit placement
    setTimeout(() => {
       arms.forEach((el) => {
         safeAnimate(el, { rotate: angleOf(el) }, { ...transition });
       });
       imgs.forEach((img) => {
         safeAnimate(img, { rotate: -angleOf(armOfImg(img)!), opacity: 1 }, { ...transition });
       });
    }, 700);


    // start continuous spin for arms and images
    setTimeout(() => {
      // arms spin clockwise
      arms.forEach((el) => {
        const angle = angleOf(el);
        const ctrl = safeAnimate(el, { rotate: [angle, angle + 360] }, spinConfig);
        stops.push(() => ctrl.cancel());
      });

      // images counter-spin to stay upright
      imgs.forEach((img) => {
        const arm = armOfImg(img);
        const angle = arm ? angleOf(arm) : 0;
        const ctrl = safeAnimate(
          img,
          { rotate: [-angle, -angle - 360] },
          spinConfig,
        );
        stops.push(() => ctrl.cancel());
      });
    }, 1300);

    return () => stops.forEach((stop) => stop());
  }, [isInView, orbitItems, step, animate]);

  return (
    <div className="relative flex items-center justify-center">
        <motion.div
            ref={scope}
            className="relative overflow-visible"
            style={{ width: stageSize, height: stageSize }}
            initial={false}
        >
            {orbitItems.map((item, i) => (
            <motion.div
                key={item.id}
                data-arm
                className="will-change-transform absolute inset-0"
                style={{ zIndex: orbitItems.length - i }}
                data-angle={i * step}
                layoutId={`arm-${item.id}`}
            >
                <motion.div
                data-arm-image
                className="rounded-full overflow-hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 aspect-square"
                style={{
                    width: imageSize,
                    height: imageSize,
                    opacity: i === 0 ? 1 : 0,
                    top: 'center', 
                }}
                layoutId={`arm-img-${item.id}`}
                >
                  <Image
                    src={item.src}
                    alt={item.name}
                    width={imageSize} 
                    height={imageSize}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </motion.div>
            </motion.div>
            ))}
        </motion.div>
        
        {/* Central Black Hole / Gravity Point Visual (Optional) */}
        <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-black to-transparent opacity-50" />
    </div>
  );
}

// --- Main Component: HeroZoom + OrbitSystem ---

export const RadialIntro = ({
  orbitItems = [], // Default to empty array if not provided
  stageSize = 600, // Increased default stage size for Hero impact
  imageSize = 80,
  className,
  videoUrl, // kept as optional prop
}: RadialIntroProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Scroll Progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // 2. Smooth Physics
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // 3. Transformations
  const scale = useTransform(smoothProgress, [0, 1], [1, 0.85]);
  const borderRadius = useTransform(smoothProgress, [0, 1], ['0px', '48px']);
  
  // Optional: Fade out the orbit system slightly as it shrinks? 
  // Or keep it visible. Let's keep it visible.

  return (
    <LayoutGroup>
      <section 
        ref={containerRef} 
        className={cn("relative h-[250vh]", className)}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
          <motion.div
            style={{ 
              scale, 
              borderRadius,
            }}
            className="relative h-full w-full overflow-hidden bg-neutral-900 shadow-2xl flex items-center justify-center"
          >
            {/* Background - Can be a video or a cool gradient/mesh */}
            {videoUrl ? (
                <>
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover opacity-50"
                >
                    <source src={videoUrl} type="video/mp4" />
                </video>
                 <div className="absolute inset-0 bg-black/60" />
                 </>
            ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-black" />
            )}

            {/* The Orbiting "Black Hole" Content */}
            <div className="relative z-10 scale-125">
                 {orbitItems.length > 0 ? (
                    <OrbitSystem 
                        orbitItems={orbitItems} 
                        stageSize={stageSize} 
                        imageSize={imageSize} 
                    />
                 ) : (
                    // Fallback content if no items provided
                    <div className="text-white opacity-50">No orbit items provided</div>
                 )}
            </div>
            
             {/* Scroll Indicator */}
             <motion.div 
              style={{ opacity: useTransform(smoothProgress, [0, 0.2], [1, 0]) }}
              className="absolute bottom-12 flex flex-col items-center gap-2 pointer-events-none"
            >
              <span className="text-sm font-medium uppercase tracking-widest text-white/60">Scroll to Explore</span>
              <div className="h-12 w-[1px] bg-gradient-to-b from-white to-transparent" />
            </motion.div>

          </motion.div>
        </div>
      </section>
    </LayoutGroup>
  );
};
