import { useEffect, useState } from 'react';
import type { AnalyticsSummary } from '@kcc/shared';
import { useLanguage } from '../../app/providers/LanguageProvider.js';
import { ApiClientError, apiRequest } from '../../lib/api-client.js';

export function AdminAnalyticsPage() {
  const { t } = useLanguage();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<{ summary: AnalyticsSummary }>('/admin/analytics/summary')
      .then((res) => setSummary(res.summary))
      .catch((err) =>
        setError(err instanceof ApiClientError ? err.message : 'Failed to load analytics'),
      );
  }, []);

  if (error) {
    return (
      <div role="alert" className="rounded-lg bg-rose-50 p-4 text-sm text-rose-800">
        {error}
      </div>
    );
  }
  if (!summary) return <p className="text-sm text-slate-500">{t.analyticsLoading}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t.analyticsTitle}</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase text-slate-500">{t.analyticsTotalReports}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{summary.totalReports}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase text-slate-500">{t.analyticsResolved}</p>
          <p className="mt-1 text-3xl font-bold text-emerald-700">{summary.byStatus.RESOLVED}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase text-slate-500">{t.analyticsAvgTime}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {summary.averageResolutionHours !== null
              ? `${summary.averageResolutionHours} ${t.analyticsHours}`
              : '—'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">{t.analyticsByStatus}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.entries(summary.byStatus).map(([status, count]) => (
              <li key={status} className="flex justify-between border-b border-slate-100 pb-1">
                <span>{status.replace(/_/g, ' ')}</span>
                <span className="font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">{t.analyticsByCategory}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {summary.byCategory.map((cat) => (
              <li
                key={cat.categoryId}
                className="flex justify-between border-b border-slate-100 pb-1"
              >
                <span>{cat.categoryName}</span>
                <span className="font-semibold">{cat.count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
