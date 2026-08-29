import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { checkEligibility } from '../api';

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh'
];

const STEPS = [
  { id: 1, title: 'Your Age', icon: '🎂' },
  { id: 2, title: 'Gender', icon: '👤' },
  { id: 3, title: 'State', icon: '📍' },
  { id: 4, title: 'Occupation', icon: '💼' },
  { id: 5, title: 'Annual Income', icon: '💰' },
  { id: 6, title: 'Caste Category', icon: '🏛️' },
];

const CONFIDENCE_STYLE = {
  high: 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200',
  medium: 'border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200',
  low: 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200',
};

const PORTAL_BADGE = {
  myscheme: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
  pmkisan: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  pmjay: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  scholarships: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
};

export default function EligibilityChecker() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    age: '',
    gender: '',
    state: '',
    occupation: '',
    annual_income: '',
    caste_category: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleNext = () => {
    const current = STEPS[step - 1];
    const fieldMap = { 1: 'age', 2: 'gender', 3: 'state', 4: 'occupation', 5: 'annual_income', 6: 'caste_category' };
    const field = fieldMap[step];
    const val = String(form[field] ?? '').trim();
    if (!val) {
      setError(`Please fill in your ${current.title.toLowerCase()} before continuing.`);
      return;
    }
    setError('');
    if (step < 6) setStep(s => s + 1);
    else handleSubmit();
  };

  useEffect(() => {
    if (result) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !loading) {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, form, result, loading]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        age: parseInt(form.age),
        gender: form.gender,
        state: form.state,
        occupation: form.occupation,
        annual_income: parseInt(form.annual_income),
        caste_category: form.caste_category,
      };
      const data = await checkEligibility(payload);
      setResult(data);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to check eligibility. Please try again.';
      setError(typeof msg === 'string' ? msg : 'Failed to check eligibility. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setForm({ age: '', gender: '', state: '', occupation: '', annual_income: '', caste_category: '' });
    setResult(null);
    setError('');
  };

  const progressPct = ((step - 1) / 5) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-10 px-4">
      <Helmet>
        <title>AI Eligibility Checker — Find Your Government Schemes | JanSahay</title>
        <meta name="description" content="Answer 6 simple questions and our AI will instantly show all government schemes you are eligible for — in your language, for free." />
      </Helmet>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl">🧠</span>
          <h1 className="mt-3 text-3xl font-extrabold text-gray-900 dark:text-white">
            AI Eligibility Checker
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Answer 6 simple questions — our AI finds all schemes you qualify for instantly.
          </p>
        </div>

        {!result ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            {/* Progress bar */}
            <div className="h-1.5 bg-gray-100 dark:bg-gray-700">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              {STEPS.map((s) => (
                <div key={s.id} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    s.id < step ? 'bg-indigo-600 text-white' :
                    s.id === step ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 ring-2 ring-indigo-500' :
                    'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                  }`}>
                    {s.id < step ? '✓' : s.id}
                  </div>
                  <span className="hidden sm:block text-[10px] mt-1 text-gray-400">{s.title}</span>
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="px-8 py-8">
              <div className="text-2xl text-center mb-1">{STEPS[step - 1].icon}</div>
              <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-6">
                {STEPS[step - 1].title}
              </h2>

              {/* Step 1: Age */}
              {step === 1 && (
                <div className="flex flex-col items-center gap-4">
                  <input
                    type="number"
                    min="1" max="100"
                    placeholder="Enter your age (e.g. 28)"
                    value={form.age}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    className="w-full max-w-xs text-center text-2xl font-bold py-4 px-6 border-2 border-indigo-200 dark:border-indigo-700 rounded-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              )}

              {/* Step 2: Gender */}
              {step === 2 && (
                <div className="grid grid-cols-3 gap-4">
                  {[{ v: 'male', label: 'Male', icon: '👨' }, { v: 'female', label: 'Female', icon: '👩' }, { v: 'other', label: 'Other', icon: '🧑' }].map(opt => (
                    <button type="button" key={opt.v} onClick={() => setForm(f => ({ ...f, gender: opt.v }))}
                      className={`flex flex-col items-center py-6 rounded-2xl border-2 transition-all font-semibold ${
                        form.gender === opt.v
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-700 dark:text-gray-300'
                      }`}>
                      <span className="text-3xl mb-2">{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Step 3: State */}
              {step === 3 && (
                <select
                  value={form.state}
                  onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                  className="w-full py-4 px-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 text-base"
                >
                  <option value="">Select your state...</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}

              {/* Step 4: Occupation */}
              {step === 4 && (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { v: 'farmer', label: 'Farmer', icon: '🌾' },
                    { v: 'student', label: 'Student', icon: '🎓' },
                    { v: 'worker', label: 'Unorganised Worker', icon: '👷' },
                    { v: 'unemployed', label: 'Unemployed', icon: '🔍' },
                    { v: 'salaried', label: 'Salaried Employee', icon: '💼' },
                    { v: 'self_employed', label: 'Self Employed', icon: '🏪' },
                  ].map(opt => (
                    <button type="button" key={opt.v} onClick={() => setForm(f => ({ ...f, occupation: opt.v }))}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all font-medium text-left ${
                        form.occupation === opt.v
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-700 dark:text-gray-300'
                      }`}>
                      <span className="text-2xl">{opt.icon}</span>
                      <span className="text-sm">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 5: Income */}
              {step === 5 && (
                <div className="flex flex-col gap-4">
                  <input
                    type="number"
                    min="0"
                    placeholder="Annual income in ₹ (e.g. 120000)"
                    value={form.annual_income}
                    onChange={e => setForm(f => ({ ...f, annual_income: e.target.value }))}
                    className="w-full py-4 px-5 border-2 border-indigo-200 dark:border-indigo-700 rounded-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 text-lg"
                  />
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      { label: 'Below ₹1 Lakh', val: '80000' },
                      { label: '₹1–2.5 Lakh', val: '175000' },
                      { label: '₹2.5–5 Lakh', val: '375000' },
                      { label: 'Above ₹5 Lakh', val: '600000' },
                    ].map(opt => (
                      <button type="button" key={opt.val} onClick={() => setForm(f => ({ ...f, annual_income: opt.val }))}
                        className={`py-2 px-3 rounded-xl border transition-all ${
                          form.annual_income === opt.val
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6: Caste Category */}
              {step === 6 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { v: 'general', label: 'General', desc: 'Open category' },
                    { v: 'obc', label: 'OBC', desc: 'Other Backward Class' },
                    { v: 'sc', label: 'SC', desc: 'Scheduled Caste' },
                    { v: 'st', label: 'ST', desc: 'Scheduled Tribe' },
                    { v: 'ews', label: 'EWS', desc: 'Economically Weaker Section' },
                  ].map(opt => (
                    <button type="button" key={opt.v} onClick={() => setForm(f => ({ ...f, caste_category: opt.v }))}
                      className={`flex flex-col p-4 rounded-xl border-2 transition-all text-left ${
                        form.caste_category === opt.v
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-700 dark:text-gray-300'
                      }`}>
                      <span className="font-bold text-base">{opt.label}</span>
                      <span className="text-xs mt-0.5 opacity-70">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              )}

              {error && (
                <p className="mt-4 text-sm text-red-500 text-center font-medium">{error}</p>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={() => { setStep(s => Math.max(1, s - 1)); setError(''); }}
                  disabled={step === 1}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-60 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Checking...
                    </>
                  ) : step === 6 ? 'Find My Schemes 🚀' : 'Next →'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Results */
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                    🎉 Found {result.total_matched} Matching Scheme{result.total_matched !== 1 ? 's' : ''}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Based on: {result.profile}
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  🔄 Check Again
                </button>
              </div>
            </div>

            {result.total_matched === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-10 text-center">
                <span className="text-5xl">🔍</span>
                <h3 className="mt-4 text-lg font-bold text-gray-800 dark:text-white">
                  No exact matches found
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  Try browsing all schemes or use the AI chat to ask directly about specific schemes for your profile.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {result.matched_schemes.map((scheme, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl border-2 p-5 shadow-sm transition-all hover:shadow-md ${CONFIDENCE_STYLE[scheme.confidence] || CONFIDENCE_STYLE.medium}`}
                  >
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${PORTAL_BADGE[scheme.portal] || 'bg-gray-100 text-gray-600'}`}>
                            {scheme.portal || 'govt'}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border border-current uppercase`}>
                            {scheme.confidence} confidence
                          </span>
                        </div>
                        <h3 className="mt-2 font-bold text-base">{scheme.scheme_name}</h3>
                        <div className="flex items-start gap-2 mt-2">
                          <span className="text-green-500 text-sm font-bold mt-0.5">✅</span>
                          <p className="text-sm leading-relaxed">{scheme.reason}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4 flex-wrap items-center">
                      <Link
                        to="/applications"
                        className="text-xs font-bold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm"
                      >
                        Start Demo Application 📋
                      </Link>
                      {scheme.source_url && (
                        <a href={scheme.source_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-current hover:opacity-80 transition-opacity">
                          Learn More →
                        </a>
                      )}
                      {scheme.apply_url && (
                        <a href={scheme.apply_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-semibold px-3 py-1.5 bg-white dark:bg-gray-900 border border-current rounded-lg hover:scale-105 transition-all shadow-sm">
                          Apply Now 🚀
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-700 dark:text-amber-300 text-center">
              ⚠️ This is an AI-powered estimate. Always verify eligibility on the official government portal before applying.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
