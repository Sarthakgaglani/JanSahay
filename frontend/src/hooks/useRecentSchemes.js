import { useCallback } from 'react';

export function useRecentSchemes() {
  const addRecent = useCallback((scheme) => {
    // scheme = { slug, name, category, portal }
    try {
      const saved = JSON.parse(localStorage.getItem('jansahay_recent') || '[]');
      const updated = [scheme, ...saved.filter(s => s.slug !== scheme.slug)].slice(0, 5);
      localStorage.setItem('jansahay_recent', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save recent scheme:', e);
    }
  }, []);

  const getRecent = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('jansahay_recent') || '[]');
    } catch {
      return [];
    }
  }, []);

  const clearRecent = useCallback(() => {
    localStorage.removeItem('jansahay_recent');
  }, []);

  return { addRecent, getRecent, clearRecent };
}
