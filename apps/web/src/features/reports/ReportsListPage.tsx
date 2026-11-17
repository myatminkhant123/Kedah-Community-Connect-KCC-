import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  REPORT_STATUSES,
  type PaginatedResponse,
  type Report,
  type ReportStatus,
} from '@kcc/shared';
import { useLanguage } from '../../app/providers/LanguageProvider.js';
import { PriorityBadge, StatusBadge } from '../../components/ui/StatusBadge.js';
import { apiRequest } from '../../lib/api-client.js';

export function ReportsListPage() {
  const { t, locale } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (search.trim()) params.set('search', search.trim());

    apiRequest<PaginatedResponse<Report>>(`/reports?${params.toString()}`)
      .then((res) => {
        if (active) setReports(res.items);
      })
      .catch((err) => {
        if (active)
          setError(
            err instanceof Error
              ? err.message
              : locale === 'ms'
                ? 'Gagal memuatkan aduan'
                : 'Failed to load reports',
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [statusFilter, search, locale]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.reportsTitle}</h1>
          <p className="text-sm text-slate-600">{t.reportsSubtitle}</p>
        </div>
        <Link
          to="/reports/new"
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 transition-colors shadow-sm"
        >
          {t.reportsNewBtn}
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl bg-white p-4 border border-slate-200">
        <input
          type="search"
          aria-label={t.reportsSearchPlaceholder}
          placeholder={t.reportsSearchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none"
        />
        <select
          aria-label={t.reportsAllStatus}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReportStatus | '')}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 outline-none"
        >
          <option value="">{t.reportsAllStatus}</option>
          {REPORT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-sm text-slate-500">{t.reportsLoading}</p>}
      {error && (
        <div role="alert" className="rounded-lg bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">{t.reportsEmpty}</p>
          <Link
            to="/reports/new"
            className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline"
          >
            {t.reportsSubmitFirst}
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {reports.map((report) => (
          <Link
            key={report.id}
            to={`/reports/${report.id}`}
            className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-600 hover:shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-mono text-slate-400">{report.referenceCode}</p>
                <h2 className="font-semibold text-slate-900">{report.title}</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {report.categoryName || t.reportsUncategorized}
                  {report.locationLabel ? ` • ${report.locationLabel}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={report.priority} />
                <StatusBadge status={report.status} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
