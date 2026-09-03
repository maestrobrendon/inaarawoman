import { RefObject } from 'react';
import { gsap, useGSAP, MQ } from './gsap';

/**
 * Physical tap feedback for touch. One delegated pointer listener on `root`
 * scales any `[data-tap]` descendant down to 0.97 on press and springs it back
 * on release/cancel. Bound to pointer events (not click) so it feels connected
 * to the finger. Touch pointers only; inert under reduced motion.
 */
export function useTapFeedback(root: RefObject<HTMLElement>) {
  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add(MQ.motionOk, () => {
        const setters = new WeakMap<Element, ReturnType<typeof gsap.quickTo>>();
        const scaleOf = (t: Element) => {
          let s = setters.get(t);
          if (!s) {
            s = gsap.quickTo(t, 'scale', { duration: 0.25, ease: 'elastic.out(1,0.6)' });
            setters.set(t, s);
          }
          return s;
        };
        const target = (e: PointerEvent) =>
          (e.target as Element | null)?.closest('[data-tap]') ?? null;

        const down = (e: PointerEvent) => {
          if (e.pointerType !== 'touch') return;
          const t = target(e);
          if (t) gsap.to(t, { scale: 0.97, duration: 0.12, ease: 'power2.out' });
        };
        const up = (e: PointerEvent) => {
          if (e.pointerType !== 'touch') return;
          const t = target(e);
          if (t) scaleOf(t)(1);
        };

        el.addEventListener('pointerdown', down, { passive: true });
        el.addEventListener('pointerup', up, { passive: true });
        el.addEventListener('pointercancel', up, { passive: true });
        return () => {
          el.removeEventListener('pointerdown', down);
          el.removeEventListener('pointerup', up);
          el.removeEventListener('pointercancel', up);
        };
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [] },
  );
}
