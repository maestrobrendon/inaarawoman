import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';
import { getReducedMotion } from './prefersReducedMotion';

let active: Lenis | null = null;

/** The shared Lenis instance, when one is running (homepage only). */
export function getLenis() {
  return active;
}

/**
 * Smooth/inertia scrolling — homepage only. Synced to GSAP's ticker (not its own
 * rAF) so Lenis and ScrollTrigger never fight. Touch multiplier kept near native.
 * Not instantiated at all under prefers-reduced-motion.
 */
export default function LenisController() {
  const { pathname } = useLocation();
  const enabled = pathname === '/' && !getReducedMotion();

  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 1.1,
      syncTouch: false,
    });
    active = lenis;

    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      lenis.off('scroll', onScroll);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      active = null;
    };
  }, [enabled]);

  return null;
}
