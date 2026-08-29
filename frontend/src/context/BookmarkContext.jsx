import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const BookmarkContext = createContext();

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jansahay_bookmarks') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('jansahay_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = useCallback((scheme) => {
    // scheme = { slug, name, category, portal }
    setBookmarks(prev => {
      const exists = prev.some(b => b.slug === scheme.slug);
      if (exists) return prev.filter(b => b.slug !== scheme.slug);
      return [scheme, ...prev];
    });
  }, []);

  const isBookmarked = useCallback((slug) => {
    return bookmarks.some(b => b.slug === slug);
  }, [bookmarks]);

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
  }, []);

  return (
    <BookmarkContext.Provider value={{ bookmarks, toggleBookmark, isBookmarked, clearBookmarks }}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => useContext(BookmarkContext);
