import { useRef, useState } from 'react';
import { gsap, useGSAP } from '../../lib/motion';

/**
 * Thin top progress bar shown during route transitions. Driven by the
 * pageTransitionStart / pageTransitionComplete window events dispatched by
 * PageTransition. Transform-only (scaleX).
 */
export default function LoadingBar() {
  const [active, setActive] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const onStart = () => setActive(true);
    const onDone = () => setActive(false);
    window.addEventListener('pageTransitionStart', onStart);
    window.addEventListener('pageTransitionComplete', onDone);
    return () => {
      window.removeEventListener('pageTransitionStart', onStart);
      window.removeEventListener('pageTransitionComplete', onDone);
    };
  }, []);

  useGSAP(
    () => {
      if (!active || !bar.current) return;
      gsap.fromTo(
        bar.current,
        { scaleX: 0, opacity: 1 },
        { scaleX: 1, duration: 0.5, ease: 'power2.inOut' },
      );
      return () => {
        if (bar.current) gsap.to(bar.current, { opacity: 0, duration: 0.2 });
      };
    },
    { dependencies: [active] },
  );

  if (!active) return null;

  return (
    <div
      ref={bar}
      className="fixed left-0 right-0 top-0 z-[10000] h-0.5 origin-left bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500"
      style={{ willChange: 'transform' }}
    />
  );
}
