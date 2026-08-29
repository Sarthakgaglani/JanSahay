import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'jansahay_reminders';

function getReminders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveReminders(reminders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

function getTimeLeft(deadline) {
  const diff = new Date(deadline) - new Date();
  if (diff <= 0) return { text: 'Deadline passed', expired: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return { text: `${days} day${days !== 1 ? 's' : ''} left`, expired: false, urgent: days <= 3 };
  return { text: `${hours} hour${hours !== 1 ? 's' : ''} left`, expired: false, urgent: true };
}

export default function Reminders() {
  const [reminders, setReminders] = useState(getReminders());
  const [notifPermission, setNotifPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const requestNotifPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
    }
  };

  const deleteReminder = (id) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    saveReminders(updated);
  };

  const testNotification = (reminder) => {
    if (notifPermission === 'granted') {
      new Notification(`📋 JanSahay Reminder`, {
        body: `Don't forget to apply for: ${reminder.schemeName}`,
        icon: '/favicon.ico',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4 transition-colors duration-300">
      <Helmet>
        <title>My Scheme Reminders | JanSahay AI</title>
        <meta name="description" content="Track application deadlines for government schemes you saved. Get browser notifications before deadlines." />
      </Helmet>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl">🔔</span>
          <h1 className="mt-3 text-2xl font-extrabold text-gray-900 dark:text-white">
            My Scheme Reminders
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Track application deadlines. Get notified before they close.
          </p>
        </div>

        {/* Notification permission banner */}
        {notifPermission !== 'granted' && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-amber-800 dark:text-amber-300">
              <span className="text-xl">🔔</span>
              <div className="text-sm">
                <p className="font-semibold">Enable Notifications</p>
                <p className="opacity-80">Get browser alerts before scheme deadlines</p>
              </div>
            </div>
            <button
              onClick={requestNotifPermission}
              disabled={notifPermission === 'denied'}
              className="shrink-0 px-4 py-2 text-xs font-bold bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {notifPermission === 'denied' ? 'Blocked' : 'Enable'}
            </button>
          </div>
        )}

        {reminders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
            <span className="text-5xl">📭</span>
            <h2 className="mt-4 text-lg font-bold text-gray-800 dark:text-white">
              No Reminders Set
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Browse schemes and click "🔔 Set Reminder" to track application deadlines here.
            </p>
            <Link
              to="/schemes"
              className="mt-6 inline-flex items-center px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Browse Schemes →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map(reminder => {
              const timeLeft = reminder.deadline ? getTimeLeft(reminder.deadline) : null;
              return (
                <div
                  key={reminder.id}
                  className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-5 transition-all hover:shadow-md ${
                    timeLeft?.expired
                      ? 'border-gray-200 dark:border-gray-700 opacity-60'
                      : timeLeft?.urgent
                        ? 'border-red-200 dark:border-red-800'
                        : 'border-gray-100 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {timeLeft?.urgent && !timeLeft?.expired && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 rounded-full uppercase animate-pulse">
                            Urgent
                          </span>
                        )}
                        {timeLeft?.expired && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-500 dark:bg-gray-700 rounded-full uppercase">
                            Expired
                          </span>
                        )}
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full uppercase">
                          {reminder.portal || 'govt'}
                        </span>
                      </div>
                      <h3 className="mt-2 font-bold text-gray-900 dark:text-white truncate">
                        {reminder.schemeName}
                      </h3>
                      {reminder.deadline && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Deadline: {new Date(reminder.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      )}
                      {timeLeft && (
                        <p className={`mt-1 text-sm font-semibold ${timeLeft.expired ? 'text-gray-400' : timeLeft.urgent ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                          ⏰ {timeLeft.text}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      {reminder.schemeSlug && (
                        <Link
                          to={`/schemes/${reminder.schemeSlug}`}
                          className="text-xs px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                        >
                          View →
                        </Link>
                      )}
                      {notifPermission === 'granted' && (
                        <button
                          onClick={() => testNotification(reminder)}
                          className="text-xs px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-lg font-semibold hover:bg-amber-100 transition-colors"
                        >
                          Test 🔔
                        </button>
                      )}
                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        className="text-xs px-3 py-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-4">
              {reminders.length} reminder{reminders.length !== 1 ? 's' : ''} saved · Stored locally on your device · No data sent to server
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
