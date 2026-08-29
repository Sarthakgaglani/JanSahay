import React from 'react';
import { parseDocuments } from '../utils/documentReadiness';

export default function DocumentReadinessChecklist({ documents, checkedItems, onToggle }) {
  const items = parseDocuments(documents);

  return (
    <section aria-labelledby="document-readiness-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="document-readiness-heading" className="text-xl font-extrabold text-gray-900 dark:text-white">Document readiness</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Mark only whether you have reviewed the requirement. Do not upload, type, or share any document numbers here.</p>
        </div>
        <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
          {checkedItems.filter(Boolean).length}/{items.length} checked
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item, index) => (
          <label key={`${item}-${index}`} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-indigo-300 dark:border-gray-700 dark:bg-gray-800">
            <input
              type="checkbox"
              checked={Boolean(checkedItems[index])}
              onChange={() => onToggle(index)}
              className="mt-0.5 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium leading-relaxed text-gray-700 dark:text-gray-200">{item}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
