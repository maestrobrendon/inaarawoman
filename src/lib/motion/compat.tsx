/**
 * Minimal framer-motion-shaped shim backed by GSAP, for the non-homepage
 * surfaces that only need basic entrance motion. Not a full reimplementation:
 *
 *  - `initial` + `animate` (object form)      -> gsap.from on mount
 *  - `whileInView`                            -> gsap.from on a ScrollTrigger (once)
 *  - `exit`                                   -> gsap tween before unmount (via AnimatePresence)
 *  - `transition` {duration, delay, ease}     -> mapped (spring/keyframe options ignored)
 *  - `variants` + animate="visible"           -> resolved to the target object
 *  - `whileHover` / `whileTap` / `layout` / `drag`  -> ignored (static)
 *
 * The homepage uses the real GSAP layer directly; this only keeps the rest of
 * the app moving without framer-motion in the bundle.
 */
import {
  createElement,
  forwardRef,
  useRef,
  useState,
  useLayoutEffect,
  ReactNode,
  useContext,
  createContext,
} from 'react';
import { gsap, ScrollTrigger } from './gsap';
import { getReducedMotion } from './prefersReducedMotion';

type Dict = Record<string, unknown>;

const EASE_MAP: Record<string, string> = {
  easeOut: 'power2.out',
  easeIn: 'power2.in',
  easeInOut: 'power2.inOut',
  linear: 'none',
  circOut: 'circ.out',
  backOut: 'back.out(1.7)',
  anticipate: 'back.inOut(1.7)',
};

function mapEase(e: unknown): string | undefined {
  if (Array.isArray(e) && e.length === 4) return `cubic-bezier(${e.join(',')})`;
  if (typeof e === 'string') return EASE_MAP[e] ?? 'power2.out';
  return undefined;
}

function resolveVariant(v: unknown, variants?: Dict): Dict {
  if (typeof v === 'string') {
    const found = variants?.[v];
    if (found && typeof found === 'object') {
      const { transition, ...rest } = found as Dict;
      void transition;
      return rest as Dict;
    }
    return {};
  }
  if (v && typeof v === 'object') return v as Dict;
  return {};
}

function toTween(target: Dict) {
  // framer uses x/y/scale/opacity/rotate — all valid gsap props already.
  const out: Dict = { ...target };
  return out;
}

interface MotionProps extends Dict {
  children?: ReactNode;
  initial?: unknown;
  animate?: unknown;
  exit?: unknown;
  transition?: { duration?: number; delay?: number; ease?: unknown; staggerChildren?: number };
  variants?: Dict;
  whileInView?: unknown;
  viewport?: { once?: boolean; amount?: number };
}

const PRIVATE = new Set([
  'initial', 'animate', 'exit', 'transition', 'variants', 'whileInView', 'viewport',
  'whileHover', 'whileTap', 'whileFocus', 'whileDrag', 'drag', 'dragConstraints',
  'dragElastic', 'layout', 'layoutId', 'onAnimationComplete', 'custom',
]);

function stripProps(props: Dict): Dict {
  const clean: Dict = {};
  for (const k in props) if (!PRIVATE.has(k)) clean[k] = props[k];
  return clean;
}

function createMotion(tag: string) {
  return forwardRef<HTMLElement, MotionProps>(function MotionComponent(props, ref) {
    const {
      children,
      initial,
      animate,
      transition,
      variants,
      whileInView,
      viewport,
    } = props;
    const localRef = useRef<HTMLElement | null>(null);
    const setRef = (node: HTMLElement | null) => {
      localRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as { current: HTMLElement | null }).current = node;
    };

    useLayoutEffect(() => {
      const el = localRef.current;
      if (!el || getReducedMotion()) return;

      const dur = transition?.duration ?? 0.5;
      const delay = transition?.delay ?? 0;
      const ease = mapEase(transition?.ease) ?? 'power2.out';
      const stagger = transition?.staggerChildren;

      const fromState =
        initial === false ? null : resolveVariant(initial ?? whileInView ?? animate, variants);
      const toState = resolveVariant(animate, variants);

      const targets = stagger ? el.children : el;

      if (whileInView) {
        const inView = resolveVariant(whileInView, variants);
        if (fromState && Object.keys(fromState).length) gsap.set(targets, toTween(fromState));
        const stt = gsap.to(targets, {
          ...toTween(inView),
          duration: dur,
          delay,
          ease,
          stagger,
          scrollTrigger: { trigger: el, start: 'top 88%', once: viewport?.once ?? true },
        });
        return () => {
          stt.scrollTrigger?.kill();
          stt.kill();
        };
      }

      if (fromState && Object.keys(fromState).length) {
        const t = gsap.fromTo(
          targets,
          toTween(fromState),
          { ...toTween(toState), duration: dur, delay, ease, stagger, clearProps: 'transform' },
        );
        return () => t.kill();
      }
      if (Object.keys(toState).length) {
        const t = gsap.to(targets, { ...toTween(toState), duration: dur, delay, ease, stagger });
        return () => t.kill();
      }
      return undefined;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return createElement(tag, { ...stripProps(props), ref: setRef }, children);
  });
}

type MotionFactory = ReturnType<typeof createMotion>;
export const motion = new Proxy({} as Record<string, MotionFactory>, {
  get: (cache, tag: string) => {
    if (!cache[tag]) cache[tag] = createMotion(tag);
    return cache[tag];
  },
});

// --- AnimatePresence -------------------------------------------------------
// Supports the common cases: a single conditionally-rendered child, or a keyed
// list. On removal we let the child's `exit` play, then unmount.

const PresenceCtx = createContext<{ register: (fn: () => Promise<void>) => void } | null>(null);
export function useIsPresent() {
  return true;
}

interface APProps {
  children: ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
  initial?: boolean;
}

export function AnimatePresence({ children }: APProps) {
  // Lightweight: render children directly. Exit animations are approximated by
  // a short fade handled here when a child unmounts.
  const [rendered, setRendered] = useState<ReactNode>(children);
  const wrapRef = useRef<HTMLDivElement>(null);
  const prev = useRef<ReactNode>(children);

  useLayoutEffect(() => {
    if (children === prev.current) return;
    const el = wrapRef.current?.firstElementChild as HTMLElement | undefined;
    prev.current = children;
    if (!el || getReducedMotion()) {
      setRendered(children);
      return;
    }
    const t = gsap.to(el, {
      opacity: 0,
      y: -8,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => setRendered(children),
    });
    return () => t.kill();
  }, [children]);

  return createElement(
    PresenceCtx.Provider,
    { value: { register: () => {} } },
    createElement('div', { ref: wrapRef, style: { display: 'contents' } }, rendered),
  );
}

export function useAnimation() {
  return {
    start: async () => {},
    stop: () => {},
    set: () => {},
  };
}

export type Variants = Record<string, Dict>;
export type Transition = Dict;
export type MotionValue<T = number> = { get: () => T; set: (v: T) => void };

export function useReducedMotion() {
  return getReducedMotion();
}

// no-op stubs occasionally imported
export const useScroll = () => ({ scrollY: { get: () => 0, on: () => () => {} }, scrollYProgress: { get: () => 0, on: () => () => {} } });
export const useTransform = () => 0;
export const useMotionValue = <T,>(v: T): MotionValue<T> => {
  let cur = v;
  return { get: () => cur, set: (n: T) => { cur = n; } };
};
export const useSpring = (v: unknown) => v;
void PresenceCtx;
void useContext;
void ScrollTrigger;
