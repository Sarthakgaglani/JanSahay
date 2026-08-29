import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext';
import { getSchemeDetail, getSchemes } from '../api';
import OfficeLocator from '../components/OfficeLocator';
import { jsPDF } from 'jspdf';
import { useBookmarks } from '../context/BookmarkContext';
import { useRecentSchemes } from '../hooks/useRecentSchemes';

const REMINDERS_KEY = 'jansahay_reminders';

function getReminders() {
  try { return JSON.parse(localStorage.getItem(REMINDERS_KEY) || '[]'); } catch { return []; }
}
function saveReminders(list) {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(list));
}

export default function SchemeDetail() {
  const { t, lang } = useLanguage();
  const { slug } = useParams();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const { addRecent } = useRecentSchemes();
  const [scheme, setScheme] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reminderSet, setReminderSet] = useState(false);
  const [reminderMsg, setReminderMsg] = useState('');
  const [bookmarkAnimating, setBookmarkAnimating] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = window.location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  }, []);

  const handleBookmarkToggle = useCallback(() => {
    if (!scheme) return;
    toggleBookmark({ slug: scheme.slug || slug, name: scheme.name, category: scheme.category, portal: scheme.portal });
    setBookmarkAnimating(true);
    setTimeout(() => setBookmarkAnimating(false), 400);
  }, [scheme, slug, toggleBookmark]);

  const handlePrint = () => {
    window.print();
  };

  // PDF Checklist Generator using jsPDF
  const handleDownloadPDF = () => {
    if (!scheme) return;
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageW, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('JanSahay AI — Document Checklist', pageW / 2, 13, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('jansahay.vercel.app  |  Powered by AI  |  Free for all Indians', pageW / 2, 22, { align: 'center' });

    y = 42;
    doc.setTextColor(30, 30, 30);

    // Scheme Name
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const nameLines = doc.splitTextToSize(scheme.name, pageW - 30);
    doc.text(nameLines, 15, y);
    y += nameLines.length * 9 + 4;

    // Category badge
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(99, 102, 241);
    doc.text(`Category: ${scheme.category}  |  Portal: ${scheme.portal?.toUpperCase()}`, 15, y);
    y += 10;

    // Divider
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.line(15, y, pageW - 15, y);
    y += 8;

    const addSection = (title, content) => {
      if (!content) return;
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(title, 15, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(content, pageW - 30);
      lines.forEach(line => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, 15, y);
        y += 6;
      });
      y += 6;
    };

    addSection('📋 About This Scheme', scheme.description);
    addSection('✅ Who is Eligible?', scheme.eligibility);
    addSection('📄 Documents Required', scheme.documents);
    addSection('🛠️ How to Apply', scheme.steps);

    if (scheme.application_url) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text('🔗 Official Apply Link:', 15, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(99, 102, 241);
      const urlLines = doc.splitTextToSize(scheme.application_url, pageW - 30);
      doc.text(urlLines, 15, y);
      y += urlLines.length * 6 + 6;
    }

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Disclaimer: JanSahay AI is not affiliated with the Government of India. Always verify on the official portal before applying.`,
        pageW / 2, 287, { align: 'center' }
      );
      doc.text(`Page ${i} of ${totalPages}`, pageW - 15, 287, { align: 'right' });
    }

    const filename = `${scheme.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_checklist.pdf`;
    doc.save(filename);
  };

  // Set Reminder in localStorage
  const handleSetReminder = () => {
    const reminders = getReminders();
    const alreadySet = reminders.some(r => r.schemeSlug === slug);
    if (alreadySet) {
      setReminderMsg('Reminder already set! Check My Reminders page.');
      setTimeout(() => setReminderMsg(''), 3000);
      return;
    }
    const newReminder = {
      id: Date.now(),
      schemeName: scheme.name,
      schemeSlug: slug,
      portal: scheme.portal,
      deadline: scheme.deadline || null,
      savedAt: new Date().toISOString(),
    };
    reminders.push(newReminder);
    saveReminders(reminders);
    setReminderSet(true);
    setReminderMsg('Reminder saved! View in My Reminders.');
    setTimeout(() => setReminderMsg(''), 3000);
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    const fetchSchemeDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getSchemeDetail(slug, lang);
        setScheme(data);
        // Track recently viewed
        addRecent({ slug: data.slug || slug, name: data.name, category: data.category, portal: data.portal });
        // Fetch related schemes in the same category
        const relData = await getSchemes({ category: data.category, limit: 3, lang });
        // Filter out current scheme from related list
        setRelated(relData.schemes.filter(s => s.slug !== slug).slice(0, 2));
      } catch (err) {
        console.error(err);
        setError('Failed to load scheme details. Please go back and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchemeDetail();
  }, [slug, lang]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="flex-1 max-w-xl mx-auto text-center py-20 px-4">
        <span className="text-4xl">⚠️</span>
        <h2 className="mt-4 text-lg font-bold text-gray-800 dark:text-white">Scheme Not Found</h2>
        <p className="mt-2 text-sm text-red-500">{error || "The requested scheme does not exist."}</p>
        <Link to="/schemes" className="mt-6 inline-block px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md">
          Back to Schemes
        </Link>
      </div>
    );
  }

  // Generate FAQ Schema JSON-LD dynamically
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What is ${scheme.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": scheme.description
        }
      },
      {
        "@type": "Question",
        "name": `Who is eligible for ${scheme.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": scheme.eligibility
        }
      },
      {
        "@type": "Question",
        "name": `What documents are required to apply for ${scheme.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": scheme.documents
        }
      }
    ]
  };

  const getPortalLabel = (portal) => {
    const labels = {
      pmkisan: 'PM-KISAN Portal',
      pmjay: 'Ayushman Bharat Portal',
      scholarships: 'National Scholarship Portal',
      eshram: 'eSHRAM Portal',
      pmjdy: 'Jan Dhan Portal',
      myscheme: 'MyScheme Portal'
    };
    return labels[portal] || portal.toUpperCase();
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      
      {/* Helmet SEO integration */}
      <Helmet>
        <title>{`${scheme.name} — Eligibility, Documents & Apply | JanSahay`}</title>
        <meta name="description" content={`Understand eligibility, document checklists, and application steps for ${scheme.name} in your regional language.`} />
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link to="/" className="hover:underline">Home</Link> &gt; 
        <Link to="/schemes" className="mx-2 hover:underline">Schemes</Link> &gt; 
        <span className="text-gray-800 dark:text-gray-200 font-medium truncate inline-block max-w-[200px] sm:max-w-xs align-bottom">
          {scheme.name}
        </span>
      </nav>

      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-6 sm:p-8 rounded-3xl shadow-sm mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 text-xs font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-800 rounded-full uppercase">
            {scheme.category}
          </span>
          <span className="px-3 py-1 text-xs font-bold bg-gray-50 border border-gray-200 text-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 rounded-full uppercase">
            {getPortalLabel(scheme.portal)}
          </span>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
          {scheme.name}
        </h1>
        
        <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
          {scheme.description}
        </p>

        <div className="mt-8 flex flex-wrap gap-3 print:hidden">
          {scheme.application_url && (
            <a
              href={scheme.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-200"
            >
              🚀 {t.applyNow}
            </a>
          )}
          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkToggle}
            className={`inline-flex items-center gap-2 px-5 py-3 border font-bold rounded-2xl shadow-sm transition-all duration-200 ${
              isBookmarked(scheme.slug || slug)
                ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/20 dark:border-amber-700 dark:text-amber-400'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-amber-50 hover:border-amber-300'
            }`}
          >
            <span className={bookmarkAnimating ? 'animate-bookmark-pop inline-block' : 'inline-block'}>
              {isBookmarked(scheme.slug || slug) ? '🔖' : '🏷️'}
            </span>
            {isBookmarked(scheme.slug || slug) ? 'Saved' : 'Save'}
          </button>
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-2xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
          >
            📤 Share
          </button>
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-2xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
          >
            📄 Download Checklist
          </button>
          <button
            onClick={handleSetReminder}
            className={`inline-flex items-center gap-2 px-5 py-3 border font-bold rounded-2xl shadow-sm transition-all duration-200 ${
              reminderSet
                ? 'bg-green-50 border-green-300 text-green-700 dark:bg-green-950/20 dark:border-green-700 dark:text-green-400'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950/20'
            }`}
          >
            {reminderSet ? '✅ Reminder Set' : '🔔 Set Reminder'}
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-2xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
          >
            🖨️ {t.printSummary}
          </button>
        </div>
        {reminderMsg && (
          <div className="mt-3 text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
            <span>✅</span> {reminderMsg}
            {reminderMsg.includes('Reminders') && <Link to="/reminders" className="underline">View →</Link>}
          </div>
        )}
      </div>

      {/* Share Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl">
            ✅ Link copied to clipboard!
          </div>
        </div>
      )}

      {/* Grid of eligibility & documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        
        {/* Eligibility card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-6 sm:p-8 rounded-3xl shadow-sm">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-4">
            <span className="text-xl">✅</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              {t.whoQualifies}
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {scheme.eligibility}
          </p>
        </div>

        {/* Documents card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-6 sm:p-8 rounded-3xl shadow-sm">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-4">
            <span className="text-xl">📄</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              {t.docsNeeded}
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {scheme.documents}
          </p>
        </div>
      </div>
      {/* Step-by-Step Guide */}
      {scheme.steps && (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-6 sm:p-8 rounded-3xl shadow-sm mb-10">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-6">
            <span className="text-xl">🛠️</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              {t.howToApply}
            </h2>
          </div>
          
          <div className="space-y-4">
            {scheme.steps.split('\n').map((step, idx) => {
              const stepText = step.replace(/^\d+\.\s*/, '');
              return (
                <div key={idx} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    {idx + 1}
                  </div>
                  <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {stepText}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Nearest Enquiry Office */}
      <OfficeLocator slug={slug} />

      {/* Related Schemes */}
      {related.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-900 pt-10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider">
            {t.relatedSchemes}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {related.map((r) => (
              <Link
                key={r.slug}
                to={`/schemes/${r.slug}`}
                className="block p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <h4 className="text-sm sm:text-base font-bold text-gray-800 dark:text-white line-clamp-1">
                  {r.name}
                </h4>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {r.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
