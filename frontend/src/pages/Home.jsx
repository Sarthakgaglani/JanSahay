import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useBookmarks } from '../context/BookmarkContext';
import { useRecentSchemes } from '../hooks/useRecentSchemes';
import { getStats } from '../api';

export default function Home() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const { bookmarks } = useBookmarks();
  const { getRecent, clearRecent } = useRecentSchemes();
  const [query, setQuery] = useState('');
  const [stats, setStats] = useState({ schemes_count: 11, portals_count: 6, languages_count: 7 });
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [recentSchemes, setRecentSchemes] = useState([]);

  useEffect(() => {
    setRecentSchemes(getRecent());
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats', err);
      }
    };
    fetchStats();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/chat?q=${encodeURIComponent(query)}`);
    }
  };

  // Web Speech API Voice Input
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError(t.voiceNotSupported);
      setTimeout(() => setVoiceError(''), 3000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : 
                       lang === 'gu' ? 'gu-IN' : 
                       lang === 'ta' ? 'ta-IN' : 
                       lang === 'te' ? 'te-IN' : 
                       lang === 'bn' ? 'bn-IN' : 
                       lang === 'mr' ? 'mr-IN' : 'en-IN';
                       
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError('');
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setVoiceError(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setQuery(speechToText);
      // Auto-submit search after voice input
      navigate(`/chat?q=${encodeURIComponent(speechToText)}`);
    };

    recognition.start();
  };

  const categories = [
    { name: 'Agriculture', icon: '🌾', label: { en: 'Agriculture', hi: 'कृषि', gu: 'કૃષિ', ta: 'விவசாயம்', te: 'వ్యవసాయం', bn: 'কৃষি', mr: 'कृषि' } },
    { name: 'Health', icon: '🏥', label: { en: 'Health', hi: 'स्वास्थ्य', gu: 'આરોગ્ય', ta: 'சுகாதாரம்', te: 'ఆరోగ్యం', bn: 'স্বাস্থ্য', mr: 'आरोग्य' } },
    { name: 'Education', icon: '🎓', label: { en: 'Education', hi: 'शिक्षा', gu: 'શિક્ષણ', ta: 'கல்வி', te: 'విద్య', bn: 'শিক্ষা', mr: 'शिक्षण' } },
    { name: 'Workers', icon: '👷', label: { en: 'Workers', hi: 'श्रमिक', gu: 'શ્રમિકો', ta: 'தொழிலாளர்கள்', te: 'కార్మికులు', bn: 'শ্রমিক', mr: 'कामगार' } },
    { name: 'Finance', icon: '💰', label: { en: 'Finance', hi: 'वित्त व बीमा', gu: 'નાણાકીય', ta: 'நிதி', te: 'ఆర్థికం', bn: 'অর্থায়ন', mr: 'वित्त' } },
    { name: 'General', icon: '📋', label: { en: 'General', hi: 'सामान्य', gu: 'સામાન્ય', ta: 'பொதுவானவை', te: 'సాధారణం', bn: 'সাধারণ', mr: 'सामान्य' } }
  ];

  const featured = [
    { name: 'PM-KISAN', desc: 'Direct financial support of ₹6,000 yearly for all landholding farmers.', link: '/schemes/pradhan-mantri-kisan-samman-nidhi-pm-kisan' },
    { name: 'AB-PMJAY', desc: 'Cashless healthcare protection cover of ₹5 Lakh per year per family.', link: '/schemes/ayushman-bharat-pradhan-mantri-jan-arogya-yojana-ab-pmjay' },
    { name: 'eSHRAM Card', desc: 'Accident cover of ₹2 Lakh and unified registry access for unorganized labor.', link: '/schemes/eshram-card-registration' }
  ];

  return (
    <div className="flex-1 bg-gradient-to-b from-indigo-50/40 via-white to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
          {t.tagline}
        </h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          {t.subtitle} — Powered by AI. Simple, multilingual, voice search, and completely free.
        </p>

        {/* Large Search Area */}
        <form onSubmit={handleSearchSubmit} className="mt-10 max-w-2xl mx-auto">
          <div className="relative flex items-center p-1 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            <span className="pl-4 text-gray-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full py-4 pl-3 pr-24 text-base bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white"
            />
            
            {/* Action Buttons */}
            <div className="absolute right-2 flex items-center space-x-1">
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`p-2.5 rounded-xl transition-all duration-200 ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
                title="Speak to Search"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isListening ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  )}
                </svg>
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200"
              >
                Go
              </button>
            </div>
          </div>
          {isListening && (
            <p className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium animate-pulse-subtle">
              {t.voicePromptStart}
            </p>
          )}
          {voiceError && (
            <p className="mt-2 text-sm text-red-500 font-medium">
              {voiceError}
            </p>
          )}
        </form>
      </section>

      {/* Public Stats Panel */}
      <section className="bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 py-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center mb-6">
            {t.statisticsTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats.schemes_count}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t.statSchemes}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats.portals_count}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t.statPortals}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats.languages_count}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t.statLanguages}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
          {t.browseCategories}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((c) => (
            <Link
              key={c.name}
              to={`/schemes?category=${c.name}`}
              className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 group text-center"
            >
              <span className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">{c.icon}</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {c.label[lang] || c.label['en']}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Schemes */}
      <section className="bg-gray-50/50 dark:bg-gray-900/40 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
            {t.featuredSchemes}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((f) => (
              <div key={f.name} className="flex flex-col justify-between p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 text-xs font-semibold text-violet-700 bg-violet-50 dark:bg-violet-900/30 dark:text-violet-300 rounded-full">
                      Popular
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">{f.name}</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
                </div>
                <Link
                  to={f.link}
                  className="mt-6 inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  {t.knowMore} &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
          {t.howItWorks}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 mx-auto text-2xl font-bold">
              1
            </div>
            <h3 className="mt-6 text-lg font-bold text-gray-900 dark:text-white">{t.step1Title}</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t.step1Desc}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 mx-auto text-2xl font-bold">
              2
            </div>
            <h3 className="mt-6 text-lg font-bold text-gray-900 dark:text-white">{t.step2Title}</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t.step2Desc}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 mx-auto text-2xl font-bold">
              3
            </div>
            <h3 className="mt-6 text-lg font-bold text-gray-900 dark:text-white">{t.step3Title}</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t.step3Desc}</p>
          </div>
        </div>
      </section>
      {/* Recently Viewed Section */}
      {recentSchemes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              🕐 Recently Viewed
            </h2>
            <button
              onClick={() => { clearRecent(); setRecentSchemes([]); }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear history
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {recentSchemes.map(s => (
              <Link
                key={s.slug}
                to={`/schemes/${s.slug}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 transition-all duration-200"
              >
                <span className="text-xs px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">{s.category}</span>
                {s.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Saved Bookmarks Section */}
      {bookmarks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              🔖 Saved Schemes
            </h2>
            <Link to="/schemes" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
              Browse all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {bookmarks.slice(0, 3).map(s => (
              <Link
                key={s.slug}
                to={`/schemes/${s.slug}`}
                className="flex flex-col p-4 bg-white dark:bg-gray-800 border border-amber-100 dark:border-amber-900/40 rounded-2xl hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">{s.category}</span>
                  <span className="text-sm">🔖</span>
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2">{s.name}</p>
              </Link>
            ))}
          </div>
          {bookmarks.length > 3 && (
            <p className="mt-4 text-xs text-center text-gray-400">
              + {bookmarks.length - 3} more saved. <Link to="/schemes" className="text-indigo-500 hover:underline">View all schemes</Link>
            </p>
          )}
        </section>
      )}

    </div>
  );
}
