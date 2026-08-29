import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function About() {
  const { t } = useLanguage();
  
  const portals = [
    { name: 'MyScheme', url: 'https://www.myscheme.gov.in', coverage: 'All central and state government schemes' },
    { name: 'PM-KISAN', url: 'https://pmkisan.gov.in', coverage: 'Direct income support scheme for farmers' },
    { name: 'PMJAY (Ayushman Bharat)', url: 'https://pmjay.gov.in', coverage: 'Free health insurance cover up to 5 Lakhs' },
    { name: 'National Scholarship Portal', url: 'https://scholarships.gov.in', coverage: 'Central and state education scholarships' },
    { name: 'eSHRAM', url: 'https://eshram.gov.in', coverage: 'National registry and cards for unorganized workers' },
    { name: 'Jan Dhan Yojana', url: 'https://pmjdy.gov.in', coverage: 'Zero-balance financial inclusion bank accounts' }
  ];

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          About JanSahay AI
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Bridging the digital divide to make social security accessible to every Indian.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-6 sm:p-8 rounded-3xl shadow-sm mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t.aboutMission}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
          {t.aboutText}
        </p>
      </div>

      {/* Portals Covered */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-6 sm:p-8 rounded-3xl shadow-sm mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Official Portals Covered
        </h2>
        <div className="space-y-4">
          {portals.map((p) => (
            <div key={p.name} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">
                  {p.name}
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {p.coverage}
                </p>
              </div>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 sm:mt-0 inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Visit Site &rarr;
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Disclaimers */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-6 sm:p-8 rounded-3xl shadow-sm text-center">
        <span className="text-3xl">⚖️</span>
        <h2 className="mt-4 text-base font-bold text-gray-900 dark:text-white">
          Legal Disclaimer
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
          {t.disclaimer} JanSahay AI uses automated retrieval algorithms to organize public schemes. While we try to maintain utmost accuracy, we are not responsible for updates or inaccuracies in the guidelines. Please refer to the respective official sites for final checks and submissions.
        </p>
      </div>

    </div>
  );
}
