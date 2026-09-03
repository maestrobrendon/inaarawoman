import { ReactNode, useRef } from 'react';
import { gsap, useGSAP, MQ } from './gsap';

interface MarqueeProps {
  children: ReactNode;
  /** Seconds for one full content-width loop (desktop). Mobile runs ~25% slower. */
  duration?: number;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
  /** className for the moving track (spacing/height live here). */
  trackClassName?: string;
}

/**
 * Seamless infinite marquee. Renders the children twice in one track and slides
 * the track by exactly -50% (or +50%) on a linear repeat — the only reliable way
 * to get a loop with no visible jump. Transform-only. Static under reduced motion.
 */
export function Marquee({
  children,
  duration = 24,
  direction = 'left',
  pauseOnHover = false,
  className,
  trackClassName,
}: MarqueeProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      const el = track.current;
      if (!el) return;
      const startX = direction === 'left' ? 0 : -50;
      const endX = direction === 'left' ? -50 : 0;

      const mm = gsap.matchMedia();
      mm.add(MQ.reduce, () => {
        gsap.set(el, { xPercent: 0 });
      });
      mm.add(
        {
          isMobile: `${MQ.motionOk} and (max-width: 1023px)`,
          isDesktop: `${MQ.motionOk} and (min-width: 1024px)`,
        },
        (ctx) => {
          const { isMobile } = ctx.conditions as { isMobile: boolean };
          gsap.set(el, { xPercent: startX });
          tween.current = gsap.to(el, {
            xPercent: endX,
            duration: isMobile ? duration * 1.25 : duration,
            ease: 'none',
            repeat: -1,
          });
          return () => tween.current?.kill();
        },
      );
      return () => mm.revert();
    },
    { scope: wrap, dependencies: [direction, duration] },
  );

  // Hover pause is a pointer affordance only — never bound to touch.
  const hoverProps = pauseOnHover
    ? {
        onPointerEnter: (e: React.PointerEvent) => {
          if (e.pointerType === 'mouse') tween.current?.pause();
        },
        onPointerLeave: (e: React.PointerEvent) => {
          if (e.pointerType === 'mouse') tween.current?.resume();
        },
      }
    : {};

  return (
    <div ref={wrap} className={`overflow-hidden ${className ?? ''}`} {...hoverProps}>
      <div ref={track} className={`flex w-max flex-nowrap ${trackClassName ?? ''}`}>
        <div className="flex shrink-0 flex-nowrap items-center" aria-hidden={false}>
          {children}
        </div>
        <div className="flex shrink-0 flex-nowrap items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
