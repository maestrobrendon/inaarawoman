import { useEffect, useState } from 'react';
import {
  HOMEPAGE_DEFAULTS,
  HomepageContent,
  fetchHomepageContent,
} from '../lib/homepageContent';

/**
 * Homepage CMS content. Returns the hardcoded defaults synchronously on first
 * render (no layout flash), then swaps in the merged DB content once it loads.
 */
export function useHomepageContent(): { content: HomepageContent; loading: boolean } {
  const [content, setContent] = useState<HomepageContent>(HOMEPAGE_DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchHomepageContent().then((c) => {
      if (alive) {
        setContent(c);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  return { content, loading };
}
