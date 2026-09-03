import { useRef } from 'react';
import { gsap, useGSAP, MQ } from '../../lib/motion';

/**
 * Desktop-only magnetic cursor dot. One fixed element, position driven by
 * quickTo (interpolated — far cheaper than writing style every mousemove).
 * Scales up + goes translucent over any clickable element. Renders nothing on
 * touch / coarse pointers and under reduced motion.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = dot.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add(`${MQ.desktop} and ${MQ.motionOk}`, () => {
        document.documentElement.classList.add('has-custom-cursor');
        gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 0 });

        const xTo = gsap.quickTo(el, 'x', { duration: 0.25, ease: 'power3.out' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.25, ease: 'power3.out' });
        const scaleTo = gsap.quickTo(el, 'scale', { duration: 0.3, ease: 'power2.out' });
        const opacityTo = gsap.quickTo(el, 'opacity', { duration: 0.3 });

        let visible = false;
        const move = (e: PointerEvent) => {
          if (e.pointerType !== 'mouse') return;
          xTo(e.clientX);
          yTo(e.clientY);
          if (!visible) {
            visible = true;
            opacityTo(1);
          }
        };
        const isInteractive = (t: EventTarget | null) =>
          t instanceof Element && !!t.closest('a, button, [role="button"], [data-cursor], input, select, textarea');
        const over = (e: PointerEvent) => {
          if (isInteractive(e.target)) {
            scaleTo(2.5);
            opacityTo(0.6);
          }
        };
        const out = (e: PointerEvent) => {
          if (isInteractive(e.target) && !isInteractive((e as PointerEvent & { relatedTarget: EventTarget | null }).relatedTarget)) {
            scaleTo(1);
            opacityTo(1);
          }
        };
        const leaveWindow = () => {
          visible = false;
          opacityTo(0);
        };

        window.addEventListener('pointermove', move, { passive: true });
        window.addEventListener('pointerover', over, { passive: true });
        window.addEventListener('pointerout', out, { passive: true });
        document.addEventListener('pointerleave', leaveWindow);

        return () => {
          document.documentElement.classList.remove('has-custom-cursor');
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerover', over);
          window.removeEventListener('pointerout', out);
          document.removeEventListener('pointerleave', leaveWindow);
        };
      });
      return () => mm.revert();
    },
    { scope: dot, dependencies: [] },
  );

  return (
    <div
      ref={dot}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[10000] h-2.5 w-2.5 rounded-full bg-[#1a1a1a] opacity-0 mix-blend-difference"
      style={{ willChange: 'transform' }}
    />
  );
}
