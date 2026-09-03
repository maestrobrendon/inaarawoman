import { createElement, ElementType, ReactNode, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText, useGSAP, EASE, MQ } from './gsap';

interface SplitRevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: React.CSSProperties;
  /** 'load' fires on mount (above-the-fold); 'scroll' waits for a ScrollTrigger. */
  trigger?: 'load' | 'scroll';
  /** Per-character stagger (seconds). */
  stagger?: number;
  duration?: number;
  delay?: number;
  /** Called once the reveal timeline starts — used to sequence sibling elements. */
  onStart?: () => void;
}

/**
 * Per-character "flip-up" reveal. Each glyph sits in its own overflow-clipped
 * mask and rotates upright (rotateX 20deg -> 0) while fading in, staggered left
 * to right across the whole block as one continuous sequence. Transform +
 * opacity only. Reduced motion -> text shown instantly, no split.
 */
export function SplitReveal({
  children,
  as = 'h1',
  className,
  style,
  trigger = 'load',
  stagger = 0.03,
  duration = 0.7,
  delay = 0,
  onStart,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add(MQ.reduce, () => {
        gsap.set(el, { opacity: 1 });
      });

      mm.add(MQ.motionOk, () => {
        let split: SplitText | null = null;
        let tween: gsap.core.Tween | null = null;
        let st: ScrollTrigger | null = null;

        const build = () => {
          split = SplitText.create(el, {
            type: 'chars,words',
            mask: 'chars',
            charsClass: 'char',
            wordsClass: 'split-word',
          });
          const chars = split.chars;
          gsap.set(el, { opacity: 1, perspective: 800 });
          gsap.set(chars, {
            opacity: 0,
            rotationX: 20,
            transformOrigin: '50% 100%',
            transformPerspective: 800,
            willChange: 'transform,opacity',
          });

          const play = () => {
            onStart?.();
            tween = gsap.to(chars, {
              opacity: 1,
              rotationX: 0,
              duration,
              ease: EASE.out,
              stagger,
              delay,
              onComplete: () => gsap.set(chars, { clearProps: 'willChange' }),
            });
          };

          if (trigger === 'scroll') {
            st = ScrollTrigger.create({
              trigger: el,
              start: 'top 85%',
              once: true,
              onEnter: play,
            });
          } else {
            play();
          }
        };

        // Split after fonts settle so glyph metrics don't shift under the masks.
        if (document.fonts?.status === 'loaded') build();
        else document.fonts?.ready.then(build);

        return () => {
          tween?.kill();
          st?.kill();
          split?.revert();
        };
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [] },
  );

  return createElement(
    as,
    { ref, className, style: { opacity: 0, ...style } },
    children,
  );
}
