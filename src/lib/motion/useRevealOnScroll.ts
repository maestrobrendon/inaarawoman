import { RefObject } from 'react';
import { gsap, ScrollTrigger, useGSAP, EASE, MQ } from './gsap';

interface RevealOptions {
  /** Travel distance in px before settling. */
  y?: number;
  /** Starting opacity. */
  from?: number;
  duration?: number;
  /** Stagger between children matched by `selector` (seconds). */
  stagger?: number;
  /**
   * Child selector to stagger. When omitted the scoped element itself animates.
   * Batched via ScrollTrigger.batch when set so a long list is one trigger.
   */
  selector?: string;
  /** ScrollTrigger start (desktop). Mobile tightens this automatically. */
  start?: string;
  delay?: number;
  /** Reveal style. `fade` = opacity+y, `wipe` = left-to-right clip-path. */
  variant?: 'fade' | 'wipe';
}

const WC = 'transform,opacity';

/**
 * The workhorse scroll reveal. Plays once, animates transform/opacity only
 * (clip-path for the wipe variant — compositor-friendly, not layout), toggles
 * will-change around the tween, and collapses to an instant set under
 * prefers-reduced-motion — all inside one matchMedia contract.
 */
export function useRevealOnScroll(
  scope: RefObject<HTMLElement>,
  opts: RevealOptions = {},
) {
  const {
    y = 40,
    from = 0,
    duration = 1,
    stagger = 0.14,
    selector,
    start = 'top 78%',
    delay = 0,
    variant = 'fade',
  } = opts;

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const targets = selector
        ? gsap.utils.toArray<HTMLElement>(root.querySelectorAll(selector))
        : [root];
      if (!targets.length) return;

      const settled =
        variant === 'wipe' ? { clipPath: 'none' } : { opacity: 1, y: 0 };

      const mm = gsap.matchMedia();

      mm.add(MQ.reduce, () => {
        gsap.set(targets, settled);
      });

      mm.add(
        {
          isMobile: `${MQ.motionOk} and (max-width: 1023px)`,
          isDesktop: `${MQ.motionOk} and (min-width: 1024px)`,
        },
        (ctx) => {
          const { isMobile } = ctx.conditions as { isMobile: boolean };
          const st = isMobile ? 'top 84%' : start;
          const dist = isMobile ? Math.min(y, 24) : y;

          const hidden =
            variant === 'wipe'
              ? { clipPath: 'inset(0 100% 0 0)' }
              : { opacity: from, y: dist };
          const shown =
            variant === 'wipe'
              ? { clipPath: 'inset(0 0% 0 0)' }
              : { opacity: 1, y: 0 };

          gsap.set(targets, hidden);

          const animate = (batch: Element[]) => {
            gsap.set(batch, { willChange: WC });
            gsap.to(batch, {
              ...shown,
              duration,
              delay,
              ease: EASE.out,
              stagger,
              overwrite: true,
              onComplete: () => gsap.set(batch, { clearProps: 'willChange' }),
            });
          };

          if (selector) {
            const b = ScrollTrigger.batch(targets, {
              start: st,
              once: true,
              onEnter: animate,
            });
            return () => b.forEach((t) => t.kill());
          }

          gsap.set(targets, { willChange: WC });
          const tween = gsap.to(targets, {
            ...shown,
            duration,
            delay,
            ease: EASE.out,
            scrollTrigger: {
              trigger: root,
              start: st,
              toggleActions: 'play none none none',
            },
            onComplete: () => gsap.set(targets, { clearProps: 'willChange' }),
          });
          return () => {
            tween.scrollTrigger?.kill();
            tween.kill();
          };
        },
      );

      return () => mm.revert();
    },
    { scope, dependencies: [] },
  );
}
