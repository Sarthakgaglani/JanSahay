import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getSchemes } from '../api';

export default function Calculator() {
  const { lang, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    age: '',
    category: 'General',
    occupation: 'Other',
    income: '',
    isTaxpayer: false,
    hasBankAccount: false,
    studentClass: 'none'
  });

  useEffect(() => {
    const fetchAllSchemes = async () => {
      try {
        const res = await getSchemes({ limit: 100, lang });
        setSchemes(res.schemes || []);
      } catch (err) {
        console.error('Failed to load schemes for calculator:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllSchemes();
  }, [lang]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setFormData({
      age: '',
      category: 'General',
      occupation: 'Other',
      income: '',
      isTaxpayer: false,
      hasBankAccount: false,
      studentClass: 'none'
    });
    setShowResults(false);
    setStep(1);
  };

  // Rule evaluator engine
  const evaluateScheme = (slug) => {
    const ageNum = parseInt(formData.age) || 0;
    const incomeNum = parseInt(formData.income) || 0;
    
    switch (slug) {
      case 'atal-pension-yojana-apy': {
        if (ageNum < 18 || ageNum > 40) {
          return { eligible: false, reason: lang === 'hi' ? 'आयु 18 से 40 वर्ष के बीच होनी चाहिए' : 'Age must be between 18 and 40 years' };
        }
        if (formData.isTaxpayer) {
          return { eligible: false, reason: lang === 'hi' ? 'आयकरदाता अपात्र हैं' : 'Income taxpayers are excluded' };
        }
        return { eligible: true };
      }
      case 'pradhan-mantri-awas-yojana-gramin': {
        if (formData.occupation === 'Student') {
          return { eligible: false, reason: lang === 'hi' ? 'छात्र प्राथमिक गृह स्वामी नहीं हैं' : 'Students are not primary household applicants' };
        }
        if (incomeNum > 150000) {
          return { eligible: false, reason: lang === 'hi' ? 'पारिवारिक वार्षिक आय ₹1.5 लाख से कम होनी चाहिए' : 'Annual family income must be below ₹1.5 Lakh' };
        }
        return { eligible: true };
      }
      case 'pradhan-mantri-mudra-yojana-pmmy': {
        if (ageNum < 18) {
          return { eligible: false, reason: lang === 'hi' ? 'आयु कम से कम 18 वर्ष होनी चाहिए' : 'Must be 18 years or older' };
        }
        if (formData.occupation !== 'Small Business Owner') {
          return { eligible: false, reason: lang === 'hi' ? 'लघु व्यवसाय या उद्यमी होना चाहिए' : 'Requires small business/entrepreneur status' };
        }
        return { eligible: true };
      }
      case 'pradhan-mantri-suraksha-bima-yojana-pmsby': {
        if (ageNum < 18 || ageNum > 70) {
          return { eligible: false, reason: lang === 'hi' ? 'आयु 18 से 70 वर्ष के बीच होनी चाहिए' : 'Age must be between 18 and 70 years' };
        }
        if (!formData.hasBankAccount) {
          return { eligible: false, reason: lang === 'hi' ? 'सक्रिय बैंक खाता आवश्यक है' : 'Active bank account is required' };
        }
        return { eligible: true };
      }
      case 'pradhan-mantri-jeevan-jyoti-bima-yojana-pmjjby': {
        if (ageNum < 18 || ageNum > 50) {
          return { eligible: false, reason: lang === 'hi' ? 'आयु 18 से 50 वर्ष के बीच होनी चाहिए' : 'Age must be between 18 and 50 years' };
        }
        if (!formData.hasBankAccount) {
          return { eligible: false, reason: lang === 'hi' ? 'सक्रिय बैंक खाता आवश्यक है' : 'Active bank account is required' };
        }
        return { eligible: true };
      }
      case 'eshram-card-registration': {
        if (ageNum < 16 || ageNum > 59) {
          return { eligible: false, reason: lang === 'hi' ? 'आयु 16 से 59 वर्ष के बीच होनी चाहिए' : 'Age must be between 16 and 59 years' };
        }
        if (formData.isTaxpayer) {
          return { eligible: false, reason: lang === 'hi' ? 'आयकरदाता असंगठित श्रमिक श्रेणी में अपात्र हैं' : 'Income taxpayers are excluded' };
        }
        if (formData.occupation === 'Student') {
          return { eligible: false, reason: lang === 'hi' ? 'छात्र असंगठित श्रमिकों में शामिल नहीं हैं' : 'Students are not considered unorganized workers' };
        }
        return { eligible: true };
      }
      case 'pradhan-mantri-kisan-samman-nidhi-pm-kisan': {
        if (formData.occupation !== 'Farmer') {
          return { eligible: false, reason: lang === 'hi' ? 'केवल भूमिधारक किसान परिवार ही पात्र हैं' : 'Only landholding farmers qualify' };
        }
        if (formData.isTaxpayer) {
          return { eligible: false, reason: lang === 'hi' ? 'आयकरदाता किसान अपात्र हैं' : 'Income taxpayers are excluded' };
        }
        return { eligible: true };
      }
      case 'ayushman-bharat-pradhan-mantri-jan-arogya-yojana-ab-pmjay': {
        if (incomeNum > 150000 && formData.occupation !== 'Unorganized Worker') {
          return { eligible: false, reason: lang === 'hi' ? 'आय ₹1.5 लाख से कम या असंगठित क्षेत्र का श्रमिक होना चाहिए' : 'Requires low-income profile or unorganized worker status' };
        }
        return { eligible: true };
      }
      case 'pradhan-mantri-jan-dhan-yojana-pmjdy': {
        if (ageNum < 10) {
          return { eligible: false, reason: lang === 'hi' ? 'आयु कम से कम 10 वर्ष होनी चाहिए' : 'Must be 10 years or older' };
        }
        if (formData.hasBankAccount) {
          return { eligible: false, reason: lang === 'hi' ? 'आपके पास पहले से ही बैंक खाता है' : 'Already holds a bank account' };
        }
        return { eligible: true };
      }
      case 'post-matric-scholarship-scheme-for-sc-students': {
        if (formData.category !== 'SC') {
          return { eligible: false, reason: lang === 'hi' ? 'केवल अनुसूचित जाति (SC) के छात्र पात्र हैं' : 'Only Scheduled Caste (SC) students qualify' };
        }
        if (incomeNum > 250000) {
          return { eligible: false, reason: lang === 'hi' ? 'वार्षिक पारिवारिक आय ₹2.5 लाख से कम होनी चाहिए' : 'Annual family income must be below ₹2.5 Lakh' };
        }
        if (formData.studentClass !== 'higher') {
          return { eligible: false, reason: lang === 'hi' ? 'उच्च शिक्षा/मैट्रिक के बाद नामांकित होना चाहिए' : 'Must be in post-matric/higher education' };
        }
        return { eligible: true };
      }
      case 'pre-matric-scholarship-scheme-for-minority-students': {
        if (formData.category !== 'Minority') {
          return { eligible: false, reason: lang === 'hi' ? 'केवल अल्पसंख्यक समुदायों के छात्र पात्र हैं' : 'Only minority community students qualify' };
        }
        if (incomeNum > 100000) {
          return { eligible: false, reason: lang === 'hi' ? 'वार्षिक पारिवारिक आय ₹1 लाख से कम होनी चाहिए' : 'Annual family income must be below ₹1 Lakh' };
        }
        if (formData.studentClass !== 'school') {
          return { eligible: false, reason: lang === 'hi' ? 'कक्षा 1 से 10 के बीच नामांकित होना चाहिए' : 'Must be in classes 1 to 10' };
        }
        return { eligible: true };
      }
      default:
        return { eligible: false, reason: 'N/A' };
    }
  };

  const handleCalculate = () => {
    setShowResults(true);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t.thinking}</p>
      </div>
    );
  }

  // Split schemes into categories
  const evaluatedSchemes = schemes.map((s) => {
    const evaluation = evaluateScheme(s.slug);
    return {
      ...s,
      eligible: evaluation.eligible,
      reason: evaluation.reason
    };
  });

  const eligibleSchemes = evaluatedSchemes.filter((s) => s.eligible);
  const ineligibleSchemes = evaluatedSchemes.filter((s) => !s.eligible);

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      
      {/* Hero Header */}
      <div className="text-center mb-12">
        <span className="text-4xl">📊</span>
        <h1 className="mt-3 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {t.calcTitle}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          {t.calcSub}
        </p>
      </div>

      {!showResults ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden transition-all">
          
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              <span>{t.calcStep1}</span>
              <span>{t.calcStep2}</span>
              <span>{t.calcStep3}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* STEP 1: Demographics */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {t.calcAge}
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder={lang === 'hi' ? 'जैसे: 25' : 'e.g. 25'}
                  className="block w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {t.calcCategory}
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="General">{lang === 'hi' ? 'सामान्य (General)' : 'General'}</option>
                  <option value="SC">{lang === 'hi' ? 'अनुसूचित जाति (SC)' : 'SC (Scheduled Caste)'}</option>
                  <option value="ST">{lang === 'hi' ? 'अनुसूचित जनजाति (ST)' : 'ST (Scheduled Tribe)'}</option>
                  <option value="OBC">{lang === 'hi' ? 'अन्य पिछड़ा वर्ग (OBC)' : 'OBC (Other Backward Class)'}</option>
                  <option value="Minority">{lang === 'hi' ? 'अल्पसंख्यक (Minority)' : 'Minority Community'}</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Socio-Economic Profile */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {t.calcOccupation}
                </label>
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Farmer">{lang === 'hi' ? 'किसान' : 'Farmer'}</option>
                  <option value="Unorganized Worker">{lang === 'hi' ? 'असंगठित क्षेत्र के श्रमिक' : 'Unorganized Worker'}</option>
                  <option value="Student">{lang === 'hi' ? 'छात्र' : 'Student'}</option>
                  <option value="Small Business Owner">{lang === 'hi' ? 'लघु व्यवसाय स्वामी/उद्यमी' : 'Small Business Owner/Entrepreneur'}</option>
                  <option value="Other">{lang === 'hi' ? 'अन्य' : 'Other'}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {t.calcIncome}
                </label>
                <input
                  type="number"
                  name="income"
                  value={formData.income}
                  onChange={handleInputChange}
                  placeholder={lang === 'hi' ? 'जैसे: 120000' : 'e.g. 120000'}
                  className="block w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {t.calcTaxpayer}
                  </h3>
                </div>
                <input
                  type="checkbox"
                  name="isTaxpayer"
                  checked={formData.isTaxpayer}
                  onChange={handleInputChange}
                  className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Financial & Education */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {t.calcBankAccount}
                  </h3>
                </div>
                <input
                  type="checkbox"
                  name="hasBankAccount"
                  checked={formData.hasBankAccount}
                  onChange={handleInputChange}
                  className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {t.calcStudentClass}
                </label>
                <select
                  name="studentClass"
                  value={formData.studentClass}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="none">{lang === 'hi' ? 'छात्र नहीं' : 'Not a Student'}</option>
                  <option value="school">{lang === 'hi' ? 'स्कूली छात्र (कक्षा 1-10)' : 'School (Class 1-10)'}</option>
                  <option value="higher">{lang === 'hi' ? 'उच्च शिक्षा (मैट्रिक के बाद)' : 'Higher Education (Post-Matric)'}</option>
                </select>
              </div>
            </div>
          )}

          {/* Navigation controls */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100 dark:border-gray-700">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="px-6 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 font-bold transition-all text-sm"
              >
                &larr; {lang === 'hi' ? 'पीछे' : 'Back'}
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 && !formData.age}
                className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all text-sm disabled:opacity-50"
              >
                {lang === 'hi' ? 'अगला चरण' : 'Next Step'} &rarr;
              </button>
            ) : (
              <button
                onClick={handleCalculate}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white font-bold transition-all shadow-md shadow-indigo-200 dark:shadow-none"
              >
                🎉 {lang === 'hi' ? 'योजनाएं खोजें' : 'Find Schemes'}
              </button>
            )}
          </div>

        </div>
      ) : (
        /* RESULTS DASHBOARD */
        <div className="space-y-8 animate-fade-in">
          
          {/* Top Reset Bar */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl"
            >
              🔄 {lang === 'hi' ? 'पुनः जांचें (रीसेट)' : 'Check Again (Reset)'}
            </button>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
              {eligibleSchemes.length} {lang === 'hi' ? 'योजनाएं मिलीं' : 'schemes found'}
            </span>
          </div>

          {/* ELIGIBLE SCHEMES LIST */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-6 sm:p-8 rounded-3xl shadow-sm">
            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 mb-6">
              <span className="text-xl">✅</span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                {t.calcEligibleTitle}
              </h2>
            </div>

            {eligibleSchemes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eligibleSchemes.map((s) => (
                  <div key={s.slug} className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow relative flex flex-col justify-between">
                    <div>
                      <span className="px-2 py-0.5 text-2xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 rounded-full uppercase tracking-wider">
                        {s.portal}
                      </span>
                      <h3 className="mt-2 text-sm sm:text-base font-bold text-gray-900 dark:text-white line-clamp-1">
                        {s.name}
                      </h3>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
                      <Link
                        to={`/schemes/${s.slug}`}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                      >
                        {t.knowMore} &rarr;
                      </Link>
                      {s.application_url && (
                        <a
                          href={s.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-2xs transition-colors"
                        >
                          {t.applyNow}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <span className="text-3xl">📭</span>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {t.calcResultNone}
                </p>
              </div>
            )}
          </div>

          {/* INELIGIBLE SCHEMES LIST */}
          {ineligibleSchemes.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-6 sm:p-8 rounded-3xl shadow-sm opacity-80">
              <div className="flex items-center space-x-2 text-gray-400 dark:text-gray-500 mb-6">
                <span className="text-xl">🚫</span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  {t.calcIneligibleTitle}
                </h2>
              </div>

              <div className="space-y-4">
                {ineligibleSchemes.map((s) => (
                  <div key={s.slug} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        {s.name}
                      </h3>
                      <p className="text-xs text-red-500 dark:text-red-400 font-semibold mt-1">
                        ❌ {t.calcIneligibleReason} {s.reason}
                      </p>
                    </div>
                    
                    <Link
                      to={`/schemes/${s.slug}`}
                      className="mt-2 sm:mt-0 inline-flex items-center text-xs font-semibold text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                    >
                      {t.knowMore} &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
