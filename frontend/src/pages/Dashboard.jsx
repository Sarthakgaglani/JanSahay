import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { getAnalytics } from '../api';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
const LANG_LABELS = { en: 'English', hi: 'Hindi', gu: 'Gujarati', ta: 'Tamil', te: 'Telugu', bn: 'Bengali', mr: 'Marathi' };

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: 'rgba(17,24,39,0.95)',
  border: '1px solid rgba(99,102,241,0.3)',
  borderRadius: '12px',
  color: '#f9fafb',
  fontSize: '13px',
  padding: '10px 14px',
};

// Animated number counter — pure React, no external dependency
function AnimatedCount({ end, duration = 2 }) {
  const [count, setCount] = React.useState(0);
  const frameRef = React.useRef(null);
  React.useEffect(() => {
    if (!end || end === 0) { setCount(0); return; }
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = (now - startTime) / (duration * 1000);
      const progress = Math.min(elapsed, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration]);
  return <span>{count.toLocaleString('en-IN')}</span>;
}

function StatCard({ icon, label, value, suffix = '', color = 'indigo' }) {
  const colorMap = {
    indigo: 'from-indigo-500 to-violet-600',
    green: 'from-green-500 to-emerald-600',
    amber: 'from-amber-500 to-orange-600',
    rose: 'from-rose-500 to-pink-600',
  };
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} text-white text-2xl mb-4`}>
        {icon}
      </div>
      <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
        <AnimatedCount end={safeValue} duration={2} />
        {suffix}
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getAnalytics();
        setData(result ?? {});
      } catch (err) {
        console.error('Dashboard analytics error:', err);
        setError('Could not load analytics. Backend may be starting up — please refresh in a moment.');
        setData({});
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare chart data
  const langData = (data?.language_distribution || []).map(item => ({
    name: LANG_LABELS[item.language] || item.language,
    value: item.count,
  }));

  const portalData = (data?.portal_usage || []).map(item => ({
    name: item.portal?.toUpperCase() || 'Other',
    queries: item.count,
  }));

  const dailyData = (data?.queries_by_day || []).map(item => ({
    date: item.date?.slice(5) || '', // Show MM-DD
    queries: item.queries,
  }));

  // Fallback demo data if no queries yet
  const demoPortal = [
    { name: 'PMKISAN', queries: 0 },
    { name: 'PMJAY', queries: 0 },
    { name: 'SCHOLARSHIPS', queries: 0 },
    { name: 'ESHRAM', queries: 0 },
    { name: 'PMJDY', queries: 0 },
  ];

  const demoLang = [
    { name: 'English', value: 0 },
    { name: 'Hindi', value: 0 },
    { name: 'Gujarati', value: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4 transition-colors duration-300">
      <Helmet>
        <title>Impact Analytics Dashboard | JanSahay AI</title>
        <meta name="description" content="Live analytics dashboard showing JanSahay AI's real-world impact — queries answered, languages used, portal usage, and more." />
      </Helmet>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">📊</span>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                Impact Analytics Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Real-time insights on how JanSahay AI is helping citizens across India
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Live Data</span>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="flex space-x-2">
                {[0, 150, 300].map(delay => (
                  <div key={delay} className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading analytics...</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 text-amber-700 dark:text-amber-300 text-sm mb-6">
            ⚠️ {error}
          </div>
        )}

        {!loading && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon="💬" label="Total Queries Answered" value={data?.total_queries || 0} color="indigo" />
              <StatCard icon="📋" label="Schemes Indexed" value={data?.schemes_count || 0} color="green" />
              <StatCard icon="🏛️" label="Portals Covered" value={data?.portals_count || 6} color="amber" />
              <StatCard icon="👍" label="Helpful Response Rate" value={data?.helpful_ratio || 0} suffix="%" color="rose" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* Daily Queries Line Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                  📈 Queries — Last 7 Days
                </h2>
                {dailyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} allowDecimals={false} />
                      <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                      <Line type="monotone" dataKey="queries" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                    <span className="text-3xl mb-2">📭</span>
                    No query data yet — start chatting!
                  </div>
                )}
              </div>

              {/* Language Pie Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                  🌐 Language Distribution
                </h2>
                {langData.length > 0 && langData.some(d => d.value > 0) ? (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={langData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {langData.map((_, idx) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 mt-2 justify-center">
                      {langData.map((item, idx) => (
                        <span key={idx} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[180px] flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                    <span className="text-3xl mb-2">🌐</span>
                    No language data yet
                  </div>
                )}
              </div>
            </div>

            {/* Portal Usage Bar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm mb-6">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                🏛️ Portal Usage — Most Queried Sources
              </h2>
              {portalData.length > 0 && portalData.some(d => d.queries > 0) ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={portalData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#9ca3af' }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} width={100} />
                    <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                    <Bar dataKey="queries" fill="#6366f1" radius={[0, 6, 6, 0]}>
                      {portalData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                  <span className="text-3xl mb-2">🏛️</span>
                  No portal usage data yet — query the AI chat to populate this chart!
                </div>
              )}
            </div>

            {/* Info Banner */}
            <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-5 text-sm text-indigo-700 dark:text-indigo-300 flex items-start gap-3">
              <span className="text-xl mt-0.5">🔒</span>
              <div>
                <p className="font-semibold">Privacy-First Analytics</p>
                <p className="mt-1 opacity-80">
                  No personal data is stored. Queries are SHA-256 hashed before logging. No user tracking, no cookies, no accounts required.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
