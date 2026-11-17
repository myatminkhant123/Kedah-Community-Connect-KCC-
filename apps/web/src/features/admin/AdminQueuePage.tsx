import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  REPORT_PRIORITIES,
  REPORT_STATUSES,
  type Department,
  type PaginatedResponse,
  type Report,
  type ReportPriority,
  type ReportStatus,
} from '@kcc/shared';
import { useLanguage } from '../../app/providers/LanguageProvider.js';
import { PriorityBadge, StatusBadge } from '../../components/ui/StatusBadge.js';
import { ApiClientError, apiRequest } from '../../lib/api-client.js';

export function AdminQueuePage() {
  const { t, locale } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('');
  const [selectedDept, setSelectedDept] = useState<Record<string, string>>({});
  const [selectedPriority, setSelectedPriority] = useState<Record<string, ReportPriority>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const [repRes, deptRes] = await Promise.all([
        apiRequest<PaginatedResponse<Report>>(`/reports?${params.toString()}`),
        apiRequest<{ items: Department[] }>('/departments'),
      ]);
      setReports(repRes.items);
      setDepartments(deptRes.items);
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : locale === 'ms'
            ? 'Gagal memuatkan senarai aduan'
            : 'Failed to load queue',
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter, locale]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleReview = async (reportId: string) => {
    setError(null);
    try {
      await apiRequest(`/admin/reports/${reportId}/review`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      await loadData();
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : locale === 'ms'
            ? 'Tidak dapat memulakan semakan'
            : 'Unable to start review',
      );
    }
  };

  const handleReject = async (reportId: string) => {
    const reason = window.prompt(t.adminRejectPrompt);
    if (!reason) return;
    setError(null);
    try {
      await apiRequest(`/admin/reports/${reportId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      await loadData();
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : locale === 'ms'
            ? 'Tidak dapat menolak aduan'
            : 'Unable to reject report',
      );
    }
  };

  const handleAssign = async (reportId: string) => {
    const departmentId = selectedDept[reportId] || departments[0]?.id;
    if (!departmentId) return;
    setError(null);
    try {
      await apiRequest(`/admin/reports/${reportId}/assign`, {
        method: 'POST',
        body: JSON.stringify({
          departmentId,
          priority: selectedPriority[reportId] || 'NORMAL',
        }),
      });
      await loadData();
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : locale === 'ms'
            ? 'Tidak dapat mengagihkan aduan'
            : 'Unable to assign report',
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.adminQueueTitle}</h1>
          <p className="text-sm text-slate-600">{t.adminQueueSubtitle}</p>
        </div>
        <select
          aria-label={t.reportsAllStatus}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReportStatus | '')}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
        >
          <option value="">{t.reportsAllStatus}</option>
          {REPORT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">{t.reportsLoading}</p>
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

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {r.status === 'SUBMITTED' && (
                  <button
                    type="button"
                    onClick={() => handleReview(r.id)}
                    className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors"
                  >
                    {t.adminReviewBtn}
                  </button>
                )}

                {(r.status === 'UNDER_REVIEW' || r.status === 'REOPENED') && (
                  <>
                    <select
                      aria-label={`Department for ${r.referenceCode}`}
                      value={selectedDept[r.id] || departments[0]?.id || ''}
                      onChange={(e) =>
                        setSelectedDept((prev) => ({ ...prev, [r.id]: e.target.value }))
                      }
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs outline-none"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <select
                      aria-label={`Priority for ${r.referenceCode}`}
                      value={selectedPriority[r.id] || r.priority}
                      onChange={(e) =>
                        setSelectedPriority((prev) => ({
                          ...prev,
                          [r.id]: e.target.value as ReportPriority,
                        }))
                      }
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs outline-none"
                    >
                      {REPORT_PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleAssign(r.id)}
                      className="rounded-md bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-800 transition-colors"
                    >
                      {t.adminAssignBtn}
                    </button>
                  </>
                )}

                {r.status === 'UNDER_REVIEW' && (
                  <button
                    type="button"
                    onClick={() => handleReject(r.id)}
                    className="rounded-md border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors"
                  >
                    {t.adminRejectBtn}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
