import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getSchemeDetail } from '../api';
import ApplicationFlow from '../components/ApplicationFlow';
import ApplicationStatusTimeline from '../components/ApplicationStatusTimeline';
import PrototypeDisclosure from '../components/PrototypeDisclosure';
import { getApplication, getApplications } from '../utils/applicationStore';

function ApplicationDetail({ application }) {
  const checkedCount = (application.documentChecks || []).filter((item) => item.checked).length;
  const documentCount = (application.documentChecks || []).length;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/applications" className="text-sm font-bold text-indigo-600 hover:underline dark:text-indigo-400">← My Applications</Link>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">Synthetic application</span>
      </div>
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Application ID</p>
        <h1 className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white sm:text-3xl">{application.id}</h1>
        <p className="mt-4 text-lg font-bold text-gray-800 dark:text-gray-100">{application.scheme.name}</p>
        <div className="mt-6"><PrototypeDisclosure compact /></div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-gray-50 p-5 dark:bg-gray-900">
            <h2 className="font-extrabold text-gray-900 dark:text-white">Demo details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="text-gray-500 dark:text-gray-400">Demo applicant</dt><dd className="font-bold text-gray-800 dark:text-gray-100">{application.applicant.demoName}</dd></div>
              <div><dt className="text-gray-500 dark:text-gray-400">Location</dt><dd className="font-bold text-gray-800 dark:text-gray-100">{application.applicant.district}, {application.applicant.state}</dd></div>
              <div><dt className="text-gray-500 dark:text-gray-400">Contact preference</dt><dd className="font-bold text-gray-800 dark:text-gray-100">{application.applicant.contactMethod}</dd></div>
            </dl>
          </div>
          <div className="rounded-2xl bg-gray-50 p-5 dark:bg-gray-900">
            <h2 className="font-extrabold text-gray-900 dark:text-white">Readiness summary</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{checkedCount} of {documentCount} document requirements were reviewed. No documents or sensitive data were collected.</p>
            {application.scheme.applicationUrl && <a href={application.scheme.applicationUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex text-sm font-bold text-indigo-600 hover:underline dark:text-indigo-400">Open official portal (external) ↗</a>}
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700"><ApplicationStatusTimeline status={application.status} createdAt={application.createdAt} /></div>
      </div>
    </div>
  );
}

function ApplicationsList({ applications }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">JanSahay Action Plan</span>
          <h1 className="mt-3 text-3xl font-extrabold text-gray-900 dark:text-white">My Applications</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Your synthetic application plans are saved only in this browser.</p>
        </div>
        <Link to="/schemes" className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700">Browse schemes</Link>
      </div>
      <div className="mt-6"><PrototypeDisclosure /></div>
      {applications.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
          <span className="text-4xl" aria-hidden="true">📋</span>
          <h2 className="mt-4 text-xl font-extrabold text-gray-900 dark:text-white">No synthetic applications yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-600 dark:text-gray-300">Open a scheme and select “Start Application with JanSahay” to create a local demo plan. Nothing is sent to a government system.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {applications.map((application) => (
            <Link key={application.id} to={`/applications/${application.id}`} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-start justify-between gap-3"><p className="text-xs font-bold text-gray-500">{application.id}</p><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">{application.status}</span></div>
              <h2 className="mt-3 text-lg font-extrabold text-gray-900 dark:text-white">{application.scheme.name}</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Demo applicant: {application.applicant.demoName}</p>
              <p className="mt-4 text-sm font-bold text-indigo-600 dark:text-indigo-400">Open status tracker →</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Applications() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const { applicationId } = useParams();
  const [searchParams] = useSearchParams();
  const schemeSlug = searchParams.get('scheme');
  const suppliedScheme = routerLocation.state?.scheme;
  const [scheme, setScheme] = useState(suppliedScheme || null);
  const [loading, setLoading] = useState(Boolean(schemeSlug && !suppliedScheme));
  const [error, setError] = useState('');
  const [applications, setApplications] = useState(() => getApplications(user?.id));

  useEffect(() => {
    setApplications(getApplications(user?.id));
  }, [user?.id]);

  useEffect(() => {
    if (!schemeSlug || applicationId || suppliedScheme) return undefined;
    let active = true;
    setLoading(true);
    getSchemeDetail(schemeSlug, lang)
      .then((data) => active && setScheme(data))
      .catch(() => active && setError('We could not load this scheme for a synthetic application plan.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [schemeSlug, applicationId, lang, suppliedScheme]);

  const existingApplication = applicationId ? getApplication(applicationId, user?.id) : null;

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950">
      <Helmet><title>My Applications | JanSahay</title></Helmet>
      {applicationId ? (existingApplication ? <ApplicationDetail application={existingApplication} /> : <div className="mx-auto max-w-xl px-4 py-20 text-center"><h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Application not found</h1><p className="mt-2 text-sm text-gray-600 dark:text-gray-300">This synthetic application may have been removed from this browser.</p><Link to="/applications" className="mt-6 inline-block font-bold text-indigo-600 hover:underline dark:text-indigo-400">Go to My Applications</Link></div>) : schemeSlug ? (loading ? <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-indigo-600" /></div> : error || !scheme ? <div className="mx-auto max-w-xl px-4 py-20 text-center"><h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Unable to start the Action Plan</h1><p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p><Link to="/schemes" className="mt-6 inline-block font-bold text-indigo-600 hover:underline dark:text-indigo-400">Browse schemes</Link></div> : <ApplicationFlow scheme={scheme} onComplete={(application) => { setApplications((items) => [application, ...items]); navigate(`/applications/${application.id}`); }} />) : <ApplicationsList applications={applications} />}
    </div>
  );
}
