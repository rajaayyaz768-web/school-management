import { useEffect, useRef } from 'react';

export function useIntersectionObserver(
  callback: () => void,
  options: IntersectionObserverInit = { threshold: 0.1 }
) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) callback();
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
  }, [callback, options]);

  return ref;
}
