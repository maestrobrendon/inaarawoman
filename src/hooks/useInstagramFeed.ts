import { useEffect, useState } from 'react';

export interface InstagramPost {
  image: string;
  permalink: string;
  caption?: string;
}

/**
 * Fetches the latest Instagram posts from a JSON feed endpoint.
 *
 * Set `VITE_INSTAGRAM_FEED_URL` to either:
 *  - a Behold.so feed URL (https://feeds.behold.so/<id>) — zero backend, refreshes automatically, or
 *  - your own proxy (e.g. a Supabase Edge Function) that calls the Instagram Graph API
 *    with a stored long-lived token and returns `{ data: [...] }` or a raw array.
 *
 * Accepts Behold's shape, the Graph API shape (`media_url` / `thumbnail_url` / `permalink`),
 * or a plain `{ image, permalink, caption }[]`. Returns [] (and the caller falls back to
 * product imagery) whenever the URL is unset or the request fails.
 */
export function useInstagramFeed(limit = 10) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const url = import.meta.env.VITE_INSTAGRAM_FEED_URL as string | undefined;
    if (!url) return;

    let cancelled = false;
    setLoading(true);

    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((json) => {
        if (cancelled) return;
        const raw: any[] = Array.isArray(json) ? json : json.data || json.posts || [];
        const mapped = raw
          .map((p): InstagramPost | null => {
            const isVideo = p.mediaType === 'VIDEO' || p.media_type === 'VIDEO';
            // Prefer Behold's CDN-hosted, square-cropped renditions — stable and
            // uniform. Fall back to raw Instagram URLs (these carry an expiry).
            const image =
              p.image ||
              p.sizes?.large?.mediaUrl ||
              p.sizes?.medium?.mediaUrl ||
              p.sizes?.small?.mediaUrl ||
              (isVideo ? p.thumbnailUrl || p.thumbnail_url : p.mediaUrl || p.media_url) ||
              p.thumbnailUrl ||
              p.thumbnail_url;
            const permalink = p.permalink || p.link || 'https://www.instagram.com/inaarawoman_/';
            if (!image) return null;
            return { image, permalink, caption: p.caption || p.prunedCaption };
          })
          .filter((p): p is InstagramPost => p !== null)
          .slice(0, limit);
        setPosts(mapped);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { posts, loading };
}
