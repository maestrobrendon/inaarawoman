import { RefObject } from 'react';
import { gsap, useGSAP, EASE, MQ } from './gsap';

/**
 * Desktop-only magnetic pull. Within `radius` px of the element the pointer
 * drags it up to `strength` px toward the cursor; on leave it springs back with
 * an elastic ease. No-op on touch / coarse pointers and under reduced motion.
 */
export function useMagnetic(
  ref: RefObject<HTMLElement>,
  { radius = 90, strength = 8 }: { radius?: number; strength?: number } = {},
) {
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add(`${MQ.desktop} and ${MQ.motionOk}`, () => {
        const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: EASE.out });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: EASE.out });

        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const dist = Math.hypot(dx, dy);
          if (dist < radius + Math.max(r.width, r.height) / 2) {
            xTo((dx / radius) * strength);
            yTo((dy / radius) * strength);
          } else {
            xTo(0);
            yTo(0);
          }
        };
        const onLeave = () => {
          gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: EASE.elastic });
        };

        window.addEventListener('pointermove', onMove, { passive: true });
        el.addEventListener('pointerleave', onLeave);
        return () => {
          window.removeEventListener('pointermove', onMove);
          el.removeEventListener('pointerleave', onLeave);
        };
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [] },
  );
}
