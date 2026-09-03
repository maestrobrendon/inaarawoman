// Single registration site for GSAP + plugins. Import from here everywhere else
// so plugins are guaranteed registered exactly once and tree-shaking stays tight
// (never import the "gsap/all" bundle).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';
import { Draggable } from 'gsap/Draggable';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText, Draggable, useGSAP);

gsap.defaults({ ease: 'power3.out', duration: 0.7 });

// Mobile browsers fire resize on address-bar collapse; don't recompute triggers for it.
ScrollTrigger.config({ ignoreMobileResize: true });

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

export { gsap, ScrollTrigger, SplitText, Draggable, useGSAP };
