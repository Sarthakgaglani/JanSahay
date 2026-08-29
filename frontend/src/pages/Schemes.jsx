import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useLocationContext } from '../context/LocationContext';
import { useBookmarks } from '../context/BookmarkContext';
import { getSchemes } from '../api';

export default function Schemes() {
  const { t, lang } = useLanguage();
  const { location } = useLocationContext();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const [searchParams, setSearchParams] = useSearchParams();
  const [schemes, setSchemes] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filterByState, setFilterByState] = useState(false);

  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      try {
        const data = await getSchemes({
          category,
          search: searchParams.get('search') || '',
          page,
          limit: 12,
          lang,
          state: filterByState ? location.state : undefined
        });
        setSchemes(data.schemes);
        setTotal(data.total);
        setPages(data.pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, [category, searchParams, page, lang, filterByState, location.state]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({
      category,
      search,
      page: '1'
    });
  };

  const handleCategorySelect = (cat) => {
    setSearchParams({
      category: cat === 'All' ? '' : cat,
      search,
      page: '1'
    });
  };

  const handlePageSelect = (p) => {
    setSearchParams({
      category,
      search,
      page: p.toString()
    });
  };

  const categories = ['All', 'Agriculture', 'Health', 'Education', 'Workers', 'Finance', 'General'];

  const getPortalBadge = (portal) => {
    const badges = {
      pmkisan: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800',
      pmjay: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800',
      scholarships: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800',
      eshram: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800',
      pmjdy: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800'
    };
    return badges[portal] || 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      
      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          {t.navBrowse}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Find public welfare schemes launched by the central and state governments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Panel (Left Sidebar on Large, Top on Small) */}
        <div className="space-y-6">
          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="flex space-x-2 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search schemes..."
              className="w-full bg-transparent border-none text-sm focus:outline-none focus:ring-0 text-gray-900 dark:text-white pl-2 py-1.5"
            />
            <button
              type="submit"
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
            >
              Search
            </button>
          </form>

          {/* Categories select sidebar */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              Filter by Category
            </h3>
            <div className="flex flex-wrap lg:flex-col gap-2">
              {categories.map((cat) => {
                const isActive = (cat === 'All' && !category) || (cat.toLowerCase() === category.toLowerCase());
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-gray-900/60 dark:hover:bg-gray-900 dark:text-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* State Location Filter */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">
              Location Filter
            </h3>
            <button
              onClick={() => setFilterByState(f => !f)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                filterByState
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-gray-900/60 dark:text-gray-300'
              }`}
            >
              <span>📍 {location.state}</span>
              <span className="text-xs opacity-75">{filterByState ? 'ON' : 'OFF'}</span>
            </button>
            {filterByState && (
              <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-400">
                Showing schemes relevant to {location.state}
              </p>
            )}
          </div>
        </div>

        {/* Schemes Cards Grid (Right side) */}
        <div className="lg:col-span-3 space-y-8">
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-2xl h-48 space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : schemes.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <span className="text-4xl">🔍</span>
              <h3 className="mt-4 text-base font-bold text-gray-800 dark:text-white">No Schemes Found</h3>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <>
              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {schemes.map((s, index) => (
                  <div
                    key={s.slug}
                    className="animate-fade-in-up flex flex-col justify-between bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-750/70 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500">
                          {s.category}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${getPortalBadge(s.portal)}`}>
                            {s.portal}
                          </span>
                          {/* Bookmark icon */}
                          <button
                            onClick={(e) => { e.preventDefault(); toggleBookmark({ slug: s.slug, name: s.name, category: s.category, portal: s.portal }); }}
                            className="text-base hover:scale-125 transition-transform duration-200"
                            title={isBookmarked(s.slug) ? 'Remove bookmark' : 'Save scheme'}
                          >
                            {isBookmarked(s.slug) ? '🔖' : '🏷️'}
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
                        {s.name}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                        {s.description}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-gray-50 dark:border-gray-700/50 pt-4">
                      <Link
                        to={`/schemes/${s.slug}`}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                      >
                        {t.knowMore} &rarr;
                      </Link>
                      {s.application_url && (
                        <a
                          href={s.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-850 rounded-xl text-xs font-bold transition-colors border border-gray-200 dark:border-gray-700"
                        >
                          Apply
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {pages > 1 && (
                <div className="flex items-center justify-center space-x-2 pt-6">
                  <button
                    onClick={() => handlePageSelect(page - 1)}
                    disabled={page === 1}
                    className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg disabled:opacity-40"
                  >
                    &larr;
                  </button>
                  {[...Array(pages)].map((_, idx) => {
                    const curr = idx + 1;
                    return (
                      <button
                        key={curr}
                        onClick={() => handlePageSelect(curr)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${
                          page === curr 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'border-gray-200 dark:border-gray-850 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {curr}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageSelect(page + 1)}
                    disabled={page === pages}
                    className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg disabled:opacity-40"
                  >
                    &rarr;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
}
