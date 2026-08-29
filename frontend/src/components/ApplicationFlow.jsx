import React, { useMemo, useState } from 'react';
import { useLocationContext } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { createSyntheticApplication, saveApplication } from '../utils/applicationStore';
import DocumentReadinessChecklist from './DocumentReadinessChecklist';
import PrototypeDisclosure from './PrototypeDisclosure';
import { parseDocuments } from '../utils/documentReadiness';

const FLOW_STEPS = ['Confirm', 'Documents', 'Demo details', 'Review'];

export default function ApplicationFlow({ scheme, onComplete }) {
  const { user } = useAuth();
  const { location, statesList } = useLocationContext();
  const documentItems = useMemo(() => parseDocuments(scheme.documents), [scheme.documents]);
  const [step, setStep] = useState(0);
  const [eligibilityConfirmed, setEligibilityConfirmed] = useState(false);
  const [checkedItems, setCheckedItems] = useState(() => documentItems.map(() => false));
  const [form, setForm] = useState({
    demoName: user?.full_name || 'Rahul Sharma',
    state: location.state || 'Gujarat',
    district: location.district || 'Ahmedabad',
    contactMethod: 'Demo email preference (no email collected)',
  });
  const [error, setError] = useState('');

  const districts = statesList.find((state) => state.name === form.state)?.districts || [];
  const allDocumentsChecked = documentItems.length === 0 || checkedItems.every(Boolean);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const handleStateChange = (state) => {
    const firstDistrict = statesList.find((item) => item.name === state)?.districts?.[0] || '';
    setForm((current) => ({ ...current, state, district: firstDistrict }));
  };

  const continueFlow = () => {
    if (step === 0 && !eligibilityConfirmed) {
      setError('Please confirm that you understand this is only an eligibility planning step.');
      return;
    }
    if (step === 1 && !allDocumentsChecked) {
      setError('Please review every listed document requirement before continuing.');
      return;
    }
    if (step === 2 && (!form.demoName.trim() || !form.state || !form.district || !form.contactMethod)) {
      setError('Please complete the demo details to continue.');
      return;
    }
    setError('');
    setStep((current) => current + 1);
  };

  const submit = () => {
    const application = createSyntheticApplication({
      scheme,
      applicant: { ...form, demoName: form.demoName.trim() },
      documentChecks: documentItems.map((label, index) => ({ label, checked: Boolean(checkedItems[index]) })),
    });
    saveApplication(application, user?.id);
    onComplete(application);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-indigo-900/60 dark:bg-gray-800 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">JanSahay Action Plan</span>
            <h1 className="mt-3 text-2xl font-extrabold text-gray-900 dark:text-white sm:text-3xl">Prepare a demo application for {scheme.name}</h1>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">Synthetic flow</span>
        </div>

        <div className="mt-6"><PrototypeDisclosure /></div>

        <ol className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Application progress">
          {FLOW_STEPS.map((label, index) => (
            <li key={label} className={`rounded-xl px-3 py-2 text-center text-xs font-bold ${index === step ? 'bg-indigo-600 text-white' : index < step ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
              {index + 1}. {label}
            </li>
          ))}
        </ol>

        <div className="mt-8">
          {step === 0 && (
            <section>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Eligibility confirmation</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-600 dark:text-gray-300">{scheme.eligibility || 'Please verify the official eligibility requirements.'}</p>
              <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-950 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-100">
                <input type="checkbox" checked={eligibilityConfirmed} onChange={(event) => setEligibilityConfirmed(event.target.checked)} className="mt-0.5 h-5 w-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500" />
                <span>I understand JanSahay does not determine eligibility or verify records. I will confirm eligibility with the official scheme source before a real application.</span>
              </label>
            </section>
          )}

          {step === 1 && <DocumentReadinessChecklist documents={scheme.documents} checkedItems={checkedItems} onToggle={(index) => setCheckedItems((items) => items.map((item, itemIndex) => itemIndex === index ? !item : item))} />}

          {step === 2 && (
            <section>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Demo applicant details</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Use synthetic information only. No identity number, bank information, OTP, payment, health, or other sensitive data is requested.</p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-200 sm:col-span-2">Demo applicant name (synthetic only)
                  <input value={form.demoName} maxLength={60} autoComplete="off" onChange={(event) => updateForm('demoName', event.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 font-normal text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white" />
                </label>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-200">State
                  <select value={form.state} onChange={(event) => handleStateChange(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 font-normal text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white">
                    {statesList.map((state) => <option key={state.name} value={state.name}>{state.name}</option>)}
                  </select>
                </label>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-200">District
                  <select value={form.district} onChange={(event) => updateForm('district', event.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 font-normal text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white">
                    {districts.map((district) => <option key={district} value={district}>{district}</option>)}
                  </select>
                </label>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-200 sm:col-span-2">Preferred contact method
                  <select value={form.contactMethod} onChange={(event) => updateForm('contactMethod', event.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 font-normal text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white">
                    <option>In-app only</option>
                    <option>Demo email preference (no email collected)</option>
                    <option>Demo phone preference (no phone collected)</option>
                  </select>
                </label>
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Review your synthetic application</h2>
              <div className="mt-5 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                <div className="p-4"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">Scheme</p><p className="mt-1 font-bold text-gray-900 dark:text-white">{scheme.name}</p></div>
                <div className="grid gap-4 p-4 sm:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-wide text-gray-500">Demo applicant</p><p className="mt-1 font-bold text-gray-900 dark:text-white">{form.demoName}</p></div><div><p className="text-xs font-bold uppercase tracking-wide text-gray-500">Location</p><p className="mt-1 font-bold text-gray-900 dark:text-white">{form.district}, {form.state}</p></div></div>
                <div className="p-4"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">Document readiness</p><p className="mt-1 font-bold text-gray-900 dark:text-white">{checkedItems.filter(Boolean).length} of {documentItems.length} requirements reviewed</p></div>
                <div className="p-4"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">Contact preference</p><p className="mt-1 font-bold text-gray-900 dark:text-white">{form.contactMethod}</p></div>
              </div>
            </section>
          )}
        </div>

        {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700 dark:bg-red-950/30 dark:text-red-300" role="alert">{error}</p>}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button type="button" onClick={() => { setError(''); setStep((current) => Math.max(0, current - 1)); }} disabled={step === 0} className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200">Back</button>
          {step < FLOW_STEPS.length - 1 ? (
            <button type="button" onClick={continueFlow} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700">Continue</button>
          ) : (
            <button type="button" onClick={submit} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700">Create synthetic application</button>
          )}
        </div>
      </div>
    </div>
  );
}
