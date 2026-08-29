import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage, languages } from '../context/LanguageContext';
import { useLocationContext } from '../context/LocationContext';
import { useDarkMode } from '../hooks/useDarkMode';

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const { location, changeLocation, detectLocation, loading: geoLoading, errorMsg: geoError, statesList } = useLocationContext();
  const { dark, toggle: toggleDark } = useDarkMode();
  const routeLocation = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showLocModal, setShowLocModal] = useState(false);
  const [tempLoc, setTempLoc] = useState({ state: location.state, district: location.district });
  const [locError, setLocError] = useState('');

  const isActive = (path) => {
    return routeLocation.pathname === path ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400';
  };

  const currentDistricts = statesList.find(st => st.name === tempLoc.state)?.districts || [];

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

  // Sync temp location if global location changes via geo-detect
  React.useEffect(() => {
    setTempLoc({ state: location.state, district: location.district });
  }, [location]);

  React.useEffect(() => {
    if (geoError) {
      setLocError(geoError);
    }
  }, [geoError]);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {t.title}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold text-indigo-700 bg-indigo-50 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full">
                AI Beta
              </span>
            </Link>

            {/* Location Selector */}
            <div 
              onClick={() => setShowLocModal(true)}
              className="ml-3 flex items-center space-x-1 text-2xs sm:text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 px-2.5 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors cursor-pointer"
            >
              <span>📍</span>
              <span className="font-bold text-gray-700 dark:text-gray-200 max-w-[80px] sm:max-w-none truncate">
                {location.district}, {location.state}
              </span>
            </div>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`text-sm ${isActive('/')}`}>{t.navHome}</Link>
            <Link to="/schemes" className={`text-sm ${isActive('/schemes')}`}>{t.navBrowse}</Link>
            <Link to="/eligibility" className={`text-sm ${isActive('/eligibility')}`}>🧠 Eligibility</Link>
            <Link to="/calculator" className={`text-sm ${isActive('/calculator')}`}>{t.navCalculator}</Link>
            <Link to="/dashboard" className={`text-sm ${isActive('/dashboard')}`}>📊 Dashboard</Link>
            <Link to="/locator" className={`text-sm ${isActive('/locator')}`}>🗺️ Locator</Link>
            <Link to="/chat" className={`text-sm ${isActive('/chat')}`}>{t.navChat}</Link>
            <Link to="/about" className={`text-sm ${isActive('/about')}`}>{t.navAbout}</Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDark}
              title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-200"
            >
              {dark ? '☀️' : '🌙'}
            </button>
            
            {/* Language Selector */}
            <div className="relative inline-block text-left">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="block w-full pl-3 pr-8 py-1.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-2">
            {/* Quick Language Selector for mobile */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="block w-24 px-1.5 py-1 text-xs bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-indigo-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
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
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base ${isActive('/')}`}>{t.navHome}</Link>
          <Link to="/schemes" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base ${isActive('/schemes')}`}>{t.navBrowse}</Link>
          <Link to="/eligibility" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base ${isActive('/eligibility')}`}>🧠 Eligibility Checker</Link>
          <Link to="/dashboard" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base ${isActive('/dashboard')}`}>📊 Analytics Dashboard</Link>
          <Link to="/reminders" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base ${isActive('/reminders')}`}>🔔 My Reminders</Link>
          <Link to="/locator" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base ${isActive('/locator')}`}>🗺️ Office Locator</Link>
          <Link to="/calculator" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base ${isActive('/calculator')}`}>{t.navCalculator}</Link>
          <Link to="/chat" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base ${isActive('/chat')}`}>{t.navChat}</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base ${isActive('/about')}`}>{t.navAbout}</Link>
          {/* Dark Mode Toggle */}
          <button
            onClick={() => { toggleDark(); setIsOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-base text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      )}

      {/* Location Selection Modal */}
      {showLocModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLocModal(false)}
          />
          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>📍</span> {t.selectLocation}
              </h3>
              <button
                onClick={() => setShowLocModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Detect My Location */}
            <button
              onClick={handleGeoDetect}
              disabled={geoLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {geoLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Detecting...
                </>
              ) : (
                <>🎯 {t.detectLocation}</>
              )}
            </button>

            {locError && (
              <p className="text-xs text-red-500 text-center">{t[locError] || locError}</p>
            )}

            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              OR
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* State Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">{t.selectState}</label>
              <select
                value={tempLoc.state}
                onChange={e => handleStateChange(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {statesList.map(st => (
                  <option key={st.name} value={st.name}>{st.name}</option>
                ))}
              </select>
            </div>

            {/* District Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">{t.selectDistrict}</label>
              <select
                value={tempLoc.district}
                onChange={e => setTempLoc(prev => ({ ...prev, district: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {currentDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveLoc}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              ✅ Save Location
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
