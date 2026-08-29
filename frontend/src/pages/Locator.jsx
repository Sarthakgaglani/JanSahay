import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext';
import { useLocationContext } from '../context/LocationContext';

// Shared office data (extracted from OfficeLocator.jsx)
const OFFICE_TYPES = [
  {
    key: 'csc',
    label: 'CSC Centre',
    icon: '🏢',
    description: 'Common Service Centre for any govt scheme, Aadhaar, digital documents, online applications.',
    helpline: '1800-121-3468',
    helplineLabel: 'CSC Helpdesk (Toll Free)',
    website: 'https://csc.gov.in',
    mapsQuery: 'Common+Service+Centre+near+',
    color: 'indigo',
  },
  {
    key: 'ayushman',
    label: 'Ayushman Hospital',
    icon: '🏥',
    description: 'Empanelled hospital for Ayushman Bharat / PMJAY — cashless treatment upto ₹5 lakh.',
    helpline: '14555',
    helplineLabel: 'Ayushman Bharat Helpline',
    website: 'https://pmjay.gov.in',
    mapsQuery: 'Ayushman+Bharat+hospital+near+',
    color: 'red',
  },
  {
    key: 'scholarship',
    label: 'Scholarship Office',
    icon: '🎓',
    description: 'District Social Welfare / Minority Welfare office and college nodal officers for scholarship help.',
    helpline: '0120-6619540',
    helplineLabel: 'National Scholarship Portal Helpdesk',
    website: 'https://scholarships.gov.in',
    mapsQuery: 'district+welfare+office+near+',
    color: 'blue',
  },
  {
    key: 'bank',
    label: 'Bank / Jan Dhan',
    icon: '🏦',
    description: 'Bank branch or Bank Mitra for Jan Dhan account, APY pension, PMJJBY and PMSBY insurance.',
    helpline: '1800-180-1111',
    helplineLabel: 'Jan Suraksha Helpline (Toll Free)',
    website: 'https://pmjdy.gov.in',
    mapsQuery: 'bank+branch+near+',
    color: 'green',
  },
  {
    key: 'eshram',
    label: 'eSHRAM Office',
    icon: '🛠️',
    description: 'CSC or District Labour Office to register for eSHRAM card and get ₹2 lakh accident cover.',
    helpline: '14434',
    helplineLabel: 'eSHRAM Helpline',
    website: 'https://eshram.gov.in',
    mapsQuery: 'Common+Service+Centre+near+',
    color: 'amber',
  },
  {
    key: 'kisan',
    label: 'Kisan Help Centre',
    icon: '🌾',
    description: 'Gram Panchayat or CSC for PM-KISAN registration, Aadhaar linking, and payment issues.',
    helpline: '155261',
    helplineLabel: 'PM-KISAN Helpline',
    website: 'https://pmkisan.gov.in',
    mapsQuery: 'Gram+Panchayat+near+',
    color: 'emerald',
  },
];

const COLOR_MAP = {
  indigo: {
    tab: 'bg-indigo-600 text-white',
    tabInactive: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-300',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    icon: 'bg-indigo-50 dark:bg-indigo-900/30',
    btn: 'from-indigo-500 to-indigo-700',
  },
  red: {
    tab: 'bg-red-600 text-white',
    tabInactive: 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-300',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    icon: 'bg-red-50 dark:bg-red-900/30',
    btn: 'from-red-500 to-red-700',
  },
  blue: {
    tab: 'bg-blue-600 text-white',
    tabInactive: 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-300',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    icon: 'bg-blue-50 dark:bg-blue-900/30',
    btn: 'from-blue-500 to-blue-700',
  },
  green: {
    tab: 'bg-green-600 text-white',
    tabInactive: 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-300',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    icon: 'bg-green-50 dark:bg-green-900/30',
    btn: 'from-green-500 to-green-700',
  },
  amber: {
    tab: 'bg-amber-600 text-white',
    tabInactive: 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    icon: 'bg-amber-50 dark:bg-amber-900/30',
    btn: 'from-amber-500 to-amber-700',
  },
  emerald: {
    tab: 'bg-emerald-600 text-white',
    tabInactive: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    icon: 'bg-emerald-50 dark:bg-emerald-900/30',
    btn: 'from-emerald-500 to-emerald-700',
  },
};

export default function Locator() {
  const { t } = useLanguage();
  const { location, statesList } = useLocationContext();
  const [selected, setSelected] = useState('csc');
  const [copyToast, setCopyToast] = useState(false);

  const office = OFFICE_TYPES.find(o => o.key === selected);
  const colors = COLOR_MAP[office.color];

  const mapsUrl = `https://www.google.com/maps/search/${office.mapsQuery}${encodeURIComponent(location.district + ' ' + location.state + ' India')}`;

  const handleShareOffice = async () => {
    const text = `${office.icon} ${office.label} near ${location.district}, ${location.state}\nHelpline: ${office.helpline}\nPortal: ${office.website}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2500);
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      <Helmet>
        <title>Office Locator — Find Govt Scheme Offices Near You | JanSahay AI</title>
        <meta name="description" content="Find the nearest CSC centre, Ayushman hospital, scholarship office, bank branch, eSHRAM office or Kisan help centre in your district." />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            🗺️ Office Locator
          </h1>
          <p className="mt-3 text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
            Find the nearest office for any government scheme in your district — with helpline numbers and directions.
          </p>
        </div>

        {/* Location Chip */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-2.5 shadow-sm">
            <span className="text-lg">📍</span>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Your Location</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">{location.district}, {location.state}</p>
            </div>
          </div>
        </div>

        {/* Office Type Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {OFFICE_TYPES.map(o => {
            const c = COLOR_MAP[o.color];
            const isActive = selected === o.key;
            return (
              <button
                key={o.key}
                onClick={() => setSelected(o.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? c.tab : c.tabInactive}`}
              >
                <span>{o.icon}</span>
                {o.label}
              </button>
            );
          })}
        </div>

        {/* Office Card */}
        <div className="animate-fade-in-up bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl shadow-sm p-6 sm:p-8">
          {/* Icon + Title */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`flex-shrink-0 text-4xl h-16 w-16 flex items-center justify-center rounded-2xl ${colors.icon}`}>
              {office.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{office.label}</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{office.description}</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Helpline */}
            <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-900/60 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50">
              <span className="text-2xl">📞</span>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-0.5">{office.helplineLabel}</p>
                <a
                  href={`tel:${office.helpline.split('/')[0].trim()}`}
                  className="text-lg font-bold text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {office.helpline}
                </a>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">Tap to call</p>
              </div>
            </div>

            {/* Official Portal */}
            <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-900/60 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50">
              <span className="text-2xl">🌐</span>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-0.5">Official Portal</p>
                <a
                  href={office.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                >
                  {office.website.replace('https://', '')}
                </a>
              </div>
            </div>
          </div>

          {/* Location + Maps Button */}
          <div className="bg-gray-50 dark:bg-gray-900/60 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50 mb-6">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-1">Searching near</p>
            <p className="text-base font-bold text-gray-800 dark:text-white">📍 {office.icon} {office.label} in {location.district}, {location.state}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 min-w-[160px] flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r ${colors.btn} text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity`}
            >
              🗺️ Find on Google Maps
            </a>
            <a
              href={`tel:${office.helpline.split('/')[0].trim()}`}
              className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              📞 Call Helpline
            </a>
            <button
              onClick={handleShareOffice}
              className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              📤 Share Info
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-6 text-xs text-center text-gray-400 dark:text-gray-600">
          JanSahay AI is not affiliated with the Government of India. Always verify office locations via official portals.
        </p>
      </div>

      {/* Copy Toast */}
      {copyToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl">
            ✅ Office info copied!
          </div>
        </div>
      )}
    </div>
  );
}
