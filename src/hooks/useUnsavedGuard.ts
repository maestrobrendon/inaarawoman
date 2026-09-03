import { useEffect } from 'react';

/**
 * Warns before the user leaves a page with unsaved edits via a hard browser
 * navigation, reload or tab close. In-app route changes are surfaced by the
 * page's own "unsaved changes" banner.
 */
export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
}
