import { useEffect, useState } from "react";

interface UseInViewOptions {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
}

export const useInView = (options: UseInViewOptions = {}) => {
  const [ref, setRef] = useState<Element | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      {
        threshold: options.threshold || 0,
        root: options.root || null,
        rootMargin: options.rootMargin || "0px",
      },
    );

    observer.observe(ref);

    return () => {
      observer.disconnect();
    };
  }, [ref, options.threshold, options.root, options.rootMargin]);

  return [setRef, inView] as const;
};
