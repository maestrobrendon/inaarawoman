import { useEffect, useState } from 'react';
import { MQ } from './gsap';

export function getReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(MQ.reduce).matches;
}

// Reactive version for components that need to re-render on the OS setting changing.
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(getReducedMotion);

  useEffect(() => {
    const mql = window.matchMedia(MQ.reduce);
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
