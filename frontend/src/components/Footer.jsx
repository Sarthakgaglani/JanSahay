import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  
  const portals = [
    { name: 'MyScheme', url: 'https://www.myscheme.gov.in' },
    { name: 'PM-KISAN', url: 'https://pmkisan.gov.in' },
    { name: 'PMJAY (Ayushman Bharat)', url: 'https://pmjay.gov.in' },
    { name: 'National Scholarship', url: 'https://scholarships.gov.in' },
    { name: 'eSHRAM', url: 'https://eshram.gov.in' },
    { name: 'Jan Dhan Yojana', url: 'https://pmjdy.gov.in' }
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200 dark:bg-gray-950 dark:border-gray-900 transition-colors duration-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Mission */}
          <div className="md:col-span-2">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              {t.title}
            </span>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 max-w-md">
              {t.aboutText}
            </p>
          </div>

          {/* Source Portals */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              {t.statPortals}
            </h3>
            <ul className="mt-4 space-y-2">
              {portals.map((p) => (
                <li key={p.name}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                  >
                    {p.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal and Disclaimer */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Disclaimer
            </h3>
            <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
              {t.disclaimer}
            </p>
            <p className="mt-3 text-xs font-medium text-amber-700 dark:text-amber-300 leading-relaxed">
              Prototype data: This demo uses synthetic data and simulated government-service responses. It is not an official government website and does not submit applications to government systems.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-900 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} {t.title}. {t.allRightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}
