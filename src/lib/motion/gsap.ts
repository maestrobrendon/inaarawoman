// Single registration site for GSAP + plugins. Import from here everywhere else
// so plugins are guaranteed registered exactly once and tree-shaking stays tight
// (never import the "gsap/all" bundle).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

gsap.defaults({ ease: 'power3.out', duration: 0.9 });

// Mobile browsers fire resize on address-bar collapse; don't recompute triggers for it.
ScrollTrigger.config({ ignoreMobileResize: true });

// Console handles for QA / debugging (gsap ships its own globals anyway).
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).gsap = gsap;
  (window as unknown as Record<string, unknown>).ScrollTrigger = ScrollTrigger;
}

// Shared easing vocabulary — keep the whole site on the same curves.
export const EASE = {
  out: 'power4.out',
  inOut: 'power2.inOut',
  expo: 'expo.out',
  elastic: 'elastic.out(1, 0.5)',
} as const;

// Media query strings for the one matchMedia contract used across the motion layer.
export const MQ = {
  reduce: '(prefers-reduced-motion: reduce)',
  motionOk: '(prefers-reduced-motion: no-preference)',
  desktop: '(min-width: 1024px) and (pointer: fine)',
  mobile: '(max-width: 1023px)',
} as const;

export { gsap, ScrollTrigger, SplitText, useGSAP };
