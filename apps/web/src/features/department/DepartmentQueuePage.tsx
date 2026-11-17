import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { PaginatedResponse, Report } from '@kcc/shared';
import { useLanguage } from '../../app/providers/LanguageProvider.js';
import { PriorityBadge, StatusBadge } from '../../components/ui/StatusBadge.js';
import { ApiClientError, apiRequest } from '../../lib/api-client.js';

export function DepartmentQueuePage() {
  const { t, locale } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<PaginatedResponse<Report>>('/department/reports');
      setReports(res.items);
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : locale === 'ms'
            ? 'Gagal memuatkan giliran kerja jabatan'
            : 'Failed to load department queue',
      );
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  const startWork = async (reportId: string) => {
    try {
      await apiRequest(`/department/reports/${reportId}/status`, {
        method: 'POST',
        body: JSON.stringify({ toStatus: 'IN_PROGRESS', comment: t.deptDispatchedComment }),
      });
      await loadQueue();
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : locale === 'ms'
            ? 'Tidak dapat mengemaskini status'
            : 'Unable to update status',
      );
    }
  };

  const resolveWork = async (reportId: string) => {
    const summary = window.prompt(t.deptResolvePrompt);
    if (!summary) return;
    try {
      await apiRequest(`/department/reports/${reportId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ summary }),
      });
      await loadQueue();
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : locale === 'ms'
            ? 'Tidak dapat menyelesaikan aduan'
            : 'Unable to resolve report',
      );
    }
  };

  const addNote = async (reportId: string, visibility: 'PUBLIC' | 'INTERNAL') => {
    const body = window.prompt(t.deptNotePrompt(visibility));
    if (!body) return;
    try {
      await apiRequest(`/department/reports/${reportId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ body, visibility }),
      });
      await loadQueue();
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : locale === 'ms'
            ? 'Tidak dapat menambah nota'
            : 'Unable to add note',
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.deptQueueTitle}</h1>
        <p className="text-sm text-slate-600">{t.deptQueueSubtitle}</p>
      </div>

      {error && (
        <div role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">{t.deptLoading}</p>
      ) : reports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          {t.deptEmpty}
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-mono text-slate-500">{r.referenceCode}</p>
                  <Link
                    to={`/reports/${r.id}`}
                    className="font-semibold text-slate-900 hover:underline"
                  >
                    {r.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {r.categoryName} {r.locationLabel ? `• ${r.locationLabel}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={r.priority} />
                  <StatusBadge status={r.status} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {r.status === 'ASSIGNED' && (
                  <button
                    type="button"
                    onClick={() => startWork(r.id)}
                    className="rounded-md bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-800 transition-colors"
                  >
                    {t.deptStartWork}
                  </button>
                )}
                {r.status === 'IN_PROGRESS' && (
                  <button
                    type="button"
                    onClick={() => resolveWork(r.id)}
                    className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors"
                  >
                    {t.deptResolve}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => addNote(r.id, 'PUBLIC')}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {t.deptPublicUpdate}
                </button>
                <button
                  type="button"
                  onClick={() => addNote(r.id, 'INTERNAL')}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {t.deptInternalNote}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
