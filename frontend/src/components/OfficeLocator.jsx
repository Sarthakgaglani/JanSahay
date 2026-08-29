import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLocationContext } from '../context/LocationContext';

// Mapping scheme portal types to enquiry office data
const OFFICE_DATA = {
  pmkisan: {
    type: 'CSC / Gram Panchayat Office',
    typeHi: 'सीएससी / ग्राम पंचायत कार्यालय',
    icon: '🏘️',
    helpline: '155261 / 011-24300606',
    helplineLabel: 'PM-KISAN Helpline',
    website: 'https://pmkisan.gov.in',
    googleMapsQuery: 'Common+Service+Centre+near+',
    description: 'Visit your nearest CSC (Common Service Centre) or Gram Panchayat office to register, update Aadhaar/bank details, or resolve payment issues.',
    descriptionHi: 'पंजीकरण, आधार/बैंक विवरण अपडेट, या भुगतान संबंधी समस्याओं के लिए अपने नजदीकी CSC (कॉमन सर्विस सेंटर) या ग्राम पंचायत कार्यालय जाएं।',
  },
  pmjay: {
    type: 'Empanelled Government Hospital / Ayushman Kiosk',
    typeHi: 'सूचीबद्ध सरकारी अस्पताल / आयुष्मान कियोस्क',
    icon: '🏥',
    helpline: '14555',
    helplineLabel: 'Ayushman Bharat Helpline',
    website: 'https://pmjay.gov.in',
    googleMapsQuery: 'Ayushman+Bharat+hospital+near+',
    description: 'Visit the Ayushman Bharat help desk at any empanelled government hospital. You can also call 14555 to check eligibility, create card, or report fraud.',
    descriptionHi: 'किसी भी सूचीबद्ध सरकारी अस्पताल में आयुष्मान भारत हेल्प डेस्क पर जाएं। पात्रता जांचने, कार्ड बनवाने या धोखाधड़ी की रिपोर्ट करने के लिए 14555 पर कॉल करें।',
  },
  eshram: {
    type: 'CSC Centre / District Labour Office',
    typeHi: 'सीएससी केंद्र / जिला श्रम कार्यालय',
    icon: '🛠️',
    helpline: '14434',
    helplineLabel: 'eSHRAM Helpline',
    website: 'https://eshram.gov.in',
    googleMapsQuery: 'Common+Service+Centre+near+',
    description: 'Register at your nearest CSC centre or District Labour Office to get your e-SHRAM card. The card provides accident insurance and links you to welfare schemes.',
    descriptionHi: 'ई-श्रम कार्ड प्राप्त करने के लिए अपने निकटतम CSC केंद्र या जिला श्रम कार्यालय में पंजीकरण करें।',
  },
  apy: {
    type: 'Bank Branch / Post Office / Bank Mitra',
    typeHi: 'बैंक शाखा / डाकघर / बैंक मित्र',
    icon: '🏦',
    helpline: '1800-110-001',
    helplineLabel: 'APY / NPS Helpline (Toll Free)',
    website: 'https://www.npscra.nsdl.co.in/scheme-details.php',
    googleMapsQuery: 'bank+branch+near+',
    description: 'Open an APY account at any bank branch, India Post payment bank, or Bank Mitra. Contributions are auto-debited from your savings account monthly.',
    descriptionHi: 'किसी भी बैंक शाखा, इंडिया पोस्ट पेमेंट बैंक, या बैंक मित्र पर APY खाता खोलें। योगदान मासिक आपके बचत खाते से स्वतः काट लिया जाता है।',
  },
  pmjjby: {
    type: 'Bank Branch / Bank Mitra / Post Office',
    typeHi: 'बैंक शाखा / बैंक मित्र / डाकघर',
    icon: '🏦',
    helpline: '1800-180-1111',
    helplineLabel: 'Jan Dhan / PMJJBY Helpline (Toll Free)',
    website: 'https://jansuraksha.gov.in',
    googleMapsQuery: 'bank+branch+near+',
    description: 'Enrol at your savings account bank branch. A premium of ₹436/year is auto-debited. Nominees receive ₹2 lakh on policyholder death.',
    descriptionHi: 'अपने बचत खाते की बैंक शाखा में नामांकन करें। ₹436/वर्ष का प्रीमियम स्वतः काटा जाता है। पॉलिसीधारक की मृत्यु पर नामांकित व्यक्ति को ₹2 लाख मिलते हैं।',
  },
  pmsby: {
    type: 'Bank Branch / Bank Mitra',
    typeHi: 'बैंक शाखा / बैंक मित्र',
    icon: '🏦',
    helpline: '1800-180-1111',
    helplineLabel: 'Jan Suraksha Helpline (Toll Free)',
    website: 'https://jansuraksha.gov.in',
    googleMapsQuery: 'bank+branch+near+',
    description: 'Enrol at your bank branch. ₹20/year premium is auto-debited. Provides ₹2 lakh on accidental death and ₹1 lakh for partial disability.',
    descriptionHi: 'बैंक शाखा में नामांकन करें। ₹20/वर्ष का प्रीमियम स्वतः काटा जाता है। दुर्घटना में मृत्यु पर ₹2 लाख और आंशिक दिव्यांगता पर ₹1 लाख मिलता है।',
  },
  scholarship: {
    type: 'School / College Nodal Officer & State Welfare Office',
    typeHi: 'स्कूल / कॉलेज नोडल अधिकारी और राज्य कल्याण विभाग',
    icon: '🎓',
    helpline: '0120-6619540',
    helplineLabel: 'National Scholarship Portal Helpdesk',
    website: 'https://scholarships.gov.in',
    googleMapsQuery: 'district+welfare+office+near+',
    description: 'Apply online at scholarships.gov.in. For physical assistance, contact your institution\'s nodal officer or the District Social Welfare / Minority Welfare Office.',
    descriptionHi: 'scholarships.gov.in पर ऑनलाइन आवेदन करें। भौतिक सहायता के लिए अपने संस्थान के नोडल अधिकारी या जिला समाज कल्याण / अल्पसंख्यक कल्याण कार्यालय से संपर्क करें।',
  },
  default: {
    type: 'CSC (Common Service Centre)',
    typeHi: 'सीएससी (कॉमन सर्विस सेंटर)',
    icon: '🏢',
    helpline: '1800-121-3468',
    helplineLabel: 'CSC Helpdesk (Toll Free)',
    website: 'https://csc.gov.in',
    googleMapsQuery: 'Common+Service+Centre+near+',
    description: 'Visit your nearest Common Service Centre (CSC) for help with any government scheme, digital documentation, and online applications.',
    descriptionHi: 'किसी भी सरकारी योजना, डिजिटल दस्तावेज़ीकरण और ऑनलाइन आवेदनों में सहायता के लिए अपने निकटतम कॉमन सर्विस सेंटर (CSC) पर जाएं।',
  }
};

// Map slug keywords to office type
function detectOfficeType(slug = '') {
  if (slug.includes('kisan') || slug.includes('pmay') || slug.includes('ujjwala') || slug.includes('jan-dhan')) return 'pmkisan';
  if (slug.includes('pmjay') || slug.includes('ayushman')) return 'pmjay';
  if (slug.includes('eshram') || slug.includes('shram')) return 'eshram';
  if (slug.includes('apy') || slug.includes('atal-pension')) return 'apy';
  if (slug.includes('pmjjby') || slug.includes('jeevan-jyoti')) return 'pmjjby';
  if (slug.includes('pmsby') || slug.includes('suraksha-bima')) return 'pmsby';
  if (slug.includes('scholarship') || slug.includes('chatravritti')) return 'scholarship';
  return 'default';
}

export default function OfficeLocator({ slug }) {
  const { t, lang } = useLanguage();
  const { location } = useLocationContext();
  const isHindi = lang === 'hi';

  const officeKey = detectOfficeType(slug || '');
  const office = OFFICE_DATA[officeKey];

  const mapsUrl = `https://www.google.com/maps/search/${office.googleMapsQuery}${encodeURIComponent(location.district + ' ' + location.state)}`;

  return (
    <div className="mt-8 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/60 to-violet-50/40 dark:from-indigo-950/30 dark:to-violet-950/20 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">{office.icon}</div>
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {t.enquiryOffice}
          </h3>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 mt-0.5">
            📍 {location.district}, {location.state}
          </p>
        </div>
      </div>

      {/* Office Type Badge */}
      <div className="mb-3">
        <span className="inline-flex items-center gap-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full">
          {office.icon} {isHindi ? office.typeHi : office.type}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
        {isHindi ? office.descriptionHi : office.description}
      </p>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Helpline */}
        <div className="flex items-start gap-2.5 bg-white/70 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50">
          <span className="text-xl mt-0.5">📞</span>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{t.helpline}</p>
            <a
              href={`tel:${office.helpline.split('/')[0].trim()}`}
              className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {office.helpline}
            </a>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{office.helplineLabel}</p>
          </div>
        </div>

        {/* Website */}
        <div className="flex items-start gap-2.5 bg-white/70 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50">
          <span className="text-xl mt-0.5">🌐</span>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Official Portal</p>
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

      {/* Google Maps Button */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-md"
      >
        🗺️ {t.viewOnMap}
      </a>
    </div>
  );
}
