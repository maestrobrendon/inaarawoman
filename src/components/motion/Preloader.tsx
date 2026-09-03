import { useRef, useState } from 'react';
import { gsap, useGSAP, EASE } from '../../lib/motion';
import { getReducedMotion } from '../../lib/motion';

const SEEN_KEY = 'inaara:preloaded';

function alreadySeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}
function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* private mode — show once per load, no worse */
  }
}

/**
 * First-load only (per session), branded loader. A thin underline draws under
 * the INAARA wordmark on a fixed ~700ms timeline, then the overlay fades + eases
 * up 1 -> 1.02 and unmounts. Never gates on real asset load; the page renders
 * behind it. Skipped entirely under reduced motion.
 */
export default function Preloader() {
  const [done, setDone] = useState(() => alreadySeen() || getReducedMotion());
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (done) return;
      markSeen();
      const tl = gsap.timeline({
        onComplete: () => setDone(true),
      });
      tl.fromTo(
        '[data-pre-underline]',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.5, ease: EASE.inOut },
      )
        .to('[data-pre-word]', { opacity: 1, duration: 0.3 }, 0)
        .to({}, { duration: 0.15 })
        .to(root.current, {
          opacity: 0,
          scale: 1.02,
          duration: 0.6,
          ease: 'power2.out',
        });
      return () => tl.kill();
    },
    { scope: root, dependencies: [] },
  );

  if (done) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[10001] grid place-items-center bg-white"
      aria-hidden
    >
      <div className="flex flex-col items-center gap-3">
        <span
          data-pre-word
          className="font-serif text-[clamp(28px,7vw,52px)] tracking-[0.14em] text-[#1a1a1a] opacity-0"
        >
          INAARA
        </span>
        <span
          data-pre-underline
          className="block h-px w-[clamp(120px,32vw,220px)] origin-left bg-[#1a1a1a]"
        />
      </div>
    </div>
  );
}
