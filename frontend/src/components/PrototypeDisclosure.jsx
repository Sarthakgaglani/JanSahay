import React from 'react';

export const PROTOTYPE_DISCLOSURE = 'Prototype data: This demo uses synthetic data and simulated government-service responses. It is not an official government website and does not submit applications to government systems.';

export default function PrototypeDisclosure({ compact = false }) {
  return (
    <div className={`rounded-2xl border border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100 ${compact ? 'p-3 text-xs' : 'p-4 text-sm'}`} role="note">
      <div className="flex gap-2">
        <span aria-hidden="true">ℹ️</span>
        <p className="leading-relaxed"><span className="font-bold">Prototype notice.</span> {PROTOTYPE_DISCLOSURE}</p>
      </div>
    </div>
  );
}
