import { ReactNode, useEffect, useRef, useState } from 'react';
import { gsap, getReducedMotion, getLenis } from '../../lib/motion';

interface PageTransitionProps {
  children: ReactNode;
  pageKey: string;
}

/**
 * Route transition without a hard cut: the outgoing view fades + lifts 20px
 * (0.35s), then the incoming view fades up from 20px (0.4s) with a slight
 * overlap. Debounced with a guard so a fast double-navigation doesn't queue two
 * timelines; the tween is killed on unmount. Reduced motion -> instant swap.
 *
 * During a transition we hold a snapshot of the previous route so the outgoing
 * fade animates the old view; otherwise `children` renders live.
 */
export default function PageTransition({ children, pageKey }: PageTransitionProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const shownKey = useRef(pageKey);
  const prevChildren = useRef<ReactNode>(children);
  const [snapshot, setSnapshot] = useState<ReactNode | null>(null);

  // capture the previous route's tree exactly when the key flips
  if (pageKey !== shownKey.current && snapshot === null) {
    setSnapshot(prevChildren.current);
  }
  useEffect(() => {
    if (pageKey === shownKey.current) prevChildren.current = children;
  });

  useEffect(() => {
    if (pageKey === shownKey.current) return;
    const el = wrap.current;

    const commit = () => {
      shownKey.current = pageKey;
      prevChildren.current = children;
      getLenis()?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    };

    if (!el || getReducedMotion()) {
      commit();
      setSnapshot(null);
      window.dispatchEvent(new Event('pageTransitionComplete'));
      return;
    }

    window.dispatchEvent(new Event('pageTransitionStart'));
    tl.current?.kill();
    const t = gsap.timeline({
      onComplete: () => window.dispatchEvent(new Event('pageTransitionComplete')),
    });
    tl.current = t;
    t.to(el, {
      opacity: 0,
      y: -20,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => {
        commit();
        setSnapshot(null); // swap to the live new route, still hidden
      },
    }).fromTo(
      el,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', clearProps: 'transform,opacity' },
      '>-0.05',
    );

    return () => t.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey]);

  useEffect(() => () => void tl.current?.kill(), []);

  return (
    <div ref={wrap} style={{ willChange: 'transform, opacity' }}>
      {snapshot ?? children}
    </div>
  );
}
