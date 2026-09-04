import { useEffect, useState } from 'react';
import {
  STORE_SETTINGS_DEFAULTS,
  StoreSettings,
  fetchStoreSettings,
} from '../lib/storeSettings';

/**
 * Storefront-facing store settings. Returns defaults synchronously, then swaps
 * in the merged DB values once loaded.
 */
export function useStoreSettings(): { settings: StoreSettings; loading: boolean } {
  const [settings, setSettings] = useState<StoreSettings>(STORE_SETTINGS_DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchStoreSettings().then((s) => {
      if (alive) {
        setSettings(s);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  return { settings, loading };
}
