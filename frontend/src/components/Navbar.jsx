import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage, languages } from '../context/LanguageContext';
import { useLocationContext } from '../context/LocationContext';
import { useDarkMode } from '../hooks/useDarkMode';
import { useAuth } from '../context/AuthContext';

// TopHeader component: brand + utilities (location, language, theme, auth)
function TopHeader({ setIsOpen, isOpen }) {
  const { lang, setLang, t } = useLanguage();
  const { location, changeLocation, detectLocation, loading: geoLoading, errorMsg: geoError, statesList } = useLocationContext();
  const { dark, toggle: toggleDark } = useDarkMode();
  const { user, logout } = useAuth();
  const [showLocModal, setShowLocModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [tempLoc, setTempLoc] = useState({ state: location.state, district: location.district });
  const [locError, setLocError] = useState('');

  // sync temporary location when global location changes
  useEffect(() => {
    setTempLoc({ state: location.state, district: location.district });
  }, [location]);

  // surface geo errors to the modal UI
  useEffect(() => {
    if (geoError) setLocError(geoError);
  }, [geoError]);

  const handleStateChange = (stateName) => {
    const districts = statesList.find(st => st.name === stateName)?.districts || [];
    setTempLoc({ state: stateName, district: districts[0] || '' });
  };

  const handleSaveLoc = () => {
    changeLocation(tempLoc.state, tempLoc.district);
    setShowLocModal(false);
    setLocError('');
  };

  const handleGeoDetect = () => {
    detectLocation();
  };

  return (
    <div className="relative z-30 flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      {/* Brand */}
      <Link to="/" className="flex items-center space-x-2">
        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          {t.title}
        </span>
        <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold text-indigo-700 bg-indigo-50 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full">
          AI Beta
        </span>
      </Link>

      {/* Desktop utilities */}
      <div className="hidden md:flex items-center space-x-4">
        {/* Location selector */}
        <div
          onClick={() => setShowLocModal(true)}
          className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 px-2.5 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors cursor-pointer"
        >
          <span>📍</span>
          <span className="font-bold text-gray-700 dark:text-gray-200 max-w-[120px] truncate">
            {location.district}, {location.state}
          </span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleDark}
          title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-200"
        >
          {dark ? '☀️' : '🌙'}
        </button>

        {/* Language selector */}
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="block min-w-[120px] px-3 py-1.5 text-sm font-medium bg-gray-50 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white cursor-pointer"
          aria-label="Select language"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>

        {/* Auth controls */}
        {user ? (
          <div className="relative inline-block text-left">
            <button
              onClick={() => setShowProfileMenu(prev => !prev)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors text-sm font-semibold focus:outline-none"
              aria-expanded={showProfileMenu}
            >
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                {(user.full_name || user.email || 'U')[0]}
              </span>
              <span className="hidden sm:inline max-w-[120px] truncate">{user.full_name || user.email}</span>
              <svg className={`w-4 h-4 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                <div className="origin-top-right absolute right-0 mt-2 w-52 rounded-2xl shadow-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-1.5 z-50">
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700/60 mb-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.full_name || user.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-xl transition-colors font-medium"
                  >
                    📊 Dashboard / Profile
                  </Link>
                  <Link
                    to="/applications"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-xl transition-colors font-medium"
                  >
                    📂 My Applications
                  </Link>
                  <button
                    onClick={() => { logout(); setShowProfileMenu(false); setIsOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors font-medium mt-1 border-t border-gray-100 dark:border-gray-700/60"
                  >
                    🚪 Logout
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {t.login || 'Login'}
            </Link>
            <Link to="/signup" className="text-sm font-medium px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
              {t.signup || 'Sign Up'}
            </Link>
          </div>
        )}
      </div>

      {/* Mobile utilities */}
      <div className="flex items-center md:hidden space-x-2">
        {/* Compact language selector */}
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="block min-w-[90px] px-2 py-1 text-xs font-medium bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white cursor-pointer"
          aria-label="Select language"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>
        {/* Theme toggle */}
        <button
          onClick={toggleDark}
          title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-md text-gray-500 hover:text-indigo-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {dark ? '☀️' : '🌙'}
        </button>
        {/* Hamburger */}
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-indigo-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Location modal – extracted for readability */}
      {showLocModal && (
        <LocationModal
          location={location}
          tempLoc={tempLoc}
          setTempLoc={setTempLoc}
          onSave={handleSaveLoc}
          onClose={() => setShowLocModal(false)}
          onDetect={handleGeoDetect}
          geoLoading={geoLoading}
          geoError={geoError}
          locError={locError}
          setLocError={setLocError}
          statesList={statesList}
          currentDistricts={statesList.find(st => st.name === tempLoc.state)?.districts || []}
          handleStateChange={handleStateChange}
          t={t}
        />
      )}
    </div>
  );
}

// Location modal component (rendered via portal to prevent backdrop-blur containment)
function LocationModal({ location, tempLoc, setTempLoc, onSave, onClose, onDetect, geoLoading, geoError, locError, setLocError, statesList, currentDistricts, handleStateChange, t }) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📍</span> {t.selectLocation || 'Select Location'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">✕</button>
        </div>
        <button
          onClick={onDetect}
          disabled={geoLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {geoLoading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : null}
          {geoLoading ? 'Detecting...' : `🎯 ${t.detectLocation || 'Detect My Location'}`}
        </button>
        {locError && <p className="text-xs text-red-500 text-center">{t[locError] || locError}</p>}
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          OR
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">{t.selectState || 'Select State'}</label>
          <select
            value={tempLoc.state}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {statesList.map((st) => (
              <option key={st.name} value={st.name}>
                {st.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">{t.selectDistrict || 'Select District'}</label>
          <select
            value={tempLoc.district}
            onChange={(e) => setTempLoc((prev) => ({ ...prev, district: e.target.value }))}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {currentDistricts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <button onClick={onSave} className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity">
          ✅ Save Location
        </button>
      </div>
    </div>,
    document.body
  );
}

function PrimaryNavigation({ isOpen, setIsOpen }) {
  const { pathname } = useLocation();
  const { t } = useLanguage();

  const isActive = (path) => (pathname === path ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400');

  const links = [
    { to: '/', label: t.navHome || 'Home' },
    { to: '/schemes', label: t.navBrowse || 'Browse Schemes' },
    { to: '/eligibility', label: t.navEligibility || 'Eligibility Checker' },
    { to: '/applications', label: t.navApplications || 'My Applications' },
    { to: '/dashboard', label: t.navDashboard || 'Dashboard' },
    { to: '/about', label: t.navAbout || 'About' },
  ];

  return (
    <>
      {/* Desktop navigation bar */}
      <div className="relative z-10 hidden md:flex items-center space-x-6 h-12 px-4 sm:px-6 lg:px-8 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 text-sm">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className={`py-1 ${isActive(l.to)}`}>
            {l.label}
          </Link>
        ))}
      </div>
      {/* Mobile navigation (slide‑down) */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base ${isActive(l.to)}`}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50" aria-label="Main navigation">
      <TopHeader isOpen={isOpen} setIsOpen={setIsOpen} />
      <PrimaryNavigation isOpen={isOpen} setIsOpen={setIsOpen} />
    </nav>
  );
}
