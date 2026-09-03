import { useEffect } from 'react';
import { gsap } from '../../lib/motion';
import { getReducedMotion } from '../../lib/motion';

const SEEN_KEY = 'inaara:preloaded';

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* private mode — no worse than showing it once more */
  }
}

/**
 * Animates out the first-paint loader that lives in index.html (so it's on
 * screen before this bundle parses). The HTML's inline script already drew the
 * underline and removed the node instantly on repeat views / reduced motion;
 * here we just fade the overlay away once and mark the session.
 */
export default function Preloader() {
  useEffect(() => {
    const el = document.getElementById('preloader');
    markSeen();
    if (!el) return;

    if (getReducedMotion()) {
      el.remove();
      return;
    }

    const tl = gsap.timeline({ onComplete: () => el.remove() });
    tl.to('#preloader-underline', { scaleX: 1, duration: 0.3, ease: 'power2.inOut' })
      .to(el, { opacity: 0, scale: 1.02, duration: 0.45, ease: 'power2.out' }, '>-0.05');

    return () => {
      tl.kill();
      el.remove();
    };
  }, []);

  return null;
}
