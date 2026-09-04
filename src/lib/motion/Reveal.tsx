import { createElement, ElementType, forwardRef, ReactNode, useRef } from 'react';
import { useRevealOnScroll } from './useRevealOnScroll';

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Travel distance in px. */
  y?: number;
  duration?: number;
  delay?: number;
  /** Stagger direct-child elements matching this selector. */
  stagger?: number;
  selector?: string;
  variant?: 'fade' | 'wipe';
  style?: React.CSSProperties;
}

/**
 * Drop-in replacement for the old `<motion.div initial animate variants>` pattern.
 * Renders a plain element and runs the shared scroll reveal on it.
 */
export const Reveal = forwardRef<HTMLElement, RevealProps>(function Reveal(
  { children, as = 'div', className, y, duration, delay, stagger, selector, variant, style },
  _ref,
) {
  const ref = useRef<HTMLElement>(null);
  useRevealOnScroll(ref, { y, duration, delay, stagger, selector, variant });
  return createElement(as, { ref, className, style }, children);
});
