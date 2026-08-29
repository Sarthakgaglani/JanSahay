import React from 'react';

const STATUSES = ['Submitted', 'Documents checked', 'Verification pending', 'Decision pending'];

export default function ApplicationStatusTimeline({ status = 'Submitted', createdAt }) {
  const currentIndex = Math.max(0, STATUSES.indexOf(status));
  const submittedDate = createdAt ? new Date(createdAt).toLocaleDateString() : null;

  return (
    <section aria-labelledby="application-status-heading">
      <h2 id="application-status-heading" className="text-lg font-extrabold text-gray-900 dark:text-white">Synthetic status tracker</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">This is a demo timeline, not a response from a government service.</p>
      <ol className="mt-6 space-y-5">
        {STATUSES.map((item, index) => {
          const complete = index <= currentIndex;
          const active = index === currentIndex;
          return (
            <li key={item} className="relative flex gap-4">
              {index < STATUSES.length - 1 && <span className={`absolute left-4 top-8 h-8 w-0.5 ${complete ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`} aria-hidden="true" />}
              <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${complete ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'}`}>
                {complete ? '✓' : index + 1}
              </span>
              <div className="pb-3">
                <p className={`font-bold ${active ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200'}`}>{item}</p>
                {index === 0 && submittedDate && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Synthetic submission recorded on {submittedDate}</p>}
                {active && index > 0 && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">This simulated stage has no government-service connection.</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
