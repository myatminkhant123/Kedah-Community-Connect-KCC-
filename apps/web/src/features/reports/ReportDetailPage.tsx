import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Report, ReportAttachment, ReportNote, ReportStatusHistoryItem } from '@kcc/shared';
import { useAuth } from '../../app/providers/AuthProvider.js';
import { useLanguage } from '../../app/providers/LanguageProvider.js';
import { PriorityBadge, StatusBadge } from '../../components/ui/StatusBadge.js';
import { ApiClientError, apiRequest, getAttachmentDownloadUrl } from '../../lib/api-client.js';

interface ReportDetailPayload {
  report: Report;
  history: ReportStatusHistoryItem[];
  notes: ReportNote[];
  attachments: ReportAttachment[];
}

export function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const { user } = useAuth();
  const { t, locale } = useLanguage();
  const [data, setData] = useState<ReportDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    if (!reportId) return;
    setLoading(true);
    try {
      const res = await apiRequest<ReportDetailPayload>(`/reports/${reportId}`);
      setData(res);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t.detailNotFound);
    } finally {
      setLoading(false);
    }
  }, [reportId, t.detailNotFound]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const handleCancel = async () => {
    if (!reportId) return;
    setActionError(null);
    try {
      await apiRequest(`/reports/${reportId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: t.detailCancelConfirm }),
      });
      await loadDetail();
    } catch (err) {
      setActionError(
        err instanceof ApiClientError
          ? err.message
          : locale === 'ms'
            ? 'Tidak dapat membatalkan aduan'
            : 'Unable to cancel report',
      );
    }
  };

  if (loading) return <p className="text-sm text-slate-500">{t.detailLoading}</p>;
  if (error || !data) {
    return (
      <div role="alert" className="rounded-lg bg-rose-50 p-4 text-sm text-rose-800">
        {error || t.detailNotFound}
      </div>
    );
  }

  const { report, history, notes, attachments } = data;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="bg-brand-700 px-6 py-4 text-white">
          <p className="text-xs font-mono text-brand-200">{report.referenceCode}</p>
          <h1 className="mt-1 text-xl font-bold">{report.title}</h1>
          <p className="mt-1 text-sm text-brand-100">
            {report.categoryName || t.detailCategory}
            {report.locationLabel ? ` • ${report.locationLabel}` : ''}
            {report.departmentName ? ` • ${t.detailAssigned}: ${report.departmentName}` : ''}
          </p>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <PriorityBadge priority={report.priority} />
            <StatusBadge status={report.status} />
          </div>

          <p className="whitespace-pre-wrap text-sm text-slate-800">{report.description}</p>

          {actionError && (
            <div role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
              {actionError}
            </div>
          )}

          {user?.role === 'RESIDENT' &&
            user.id === report.reporterId &&
            report.status === 'SUBMITTED' && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg border border-rose-300 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50"
                >
                  {t.detailCancelReport}
                </button>
              </div>
            )}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">
            {t.detailTimeline}
          </h2>
          <ol className="space-y-3 border-l-2 border-brand-200 pl-4">
            {history.map((item) => (
              <li key={item.id} className="text-sm">
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.toStatus} />
                  <span className="text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleString(locale === 'ms' ? 'ms-MY' : 'en-MY')}
                  </span>
                </div>
                {item.comment && <p className="mt-1 text-slate-700">{item.comment}</p>}
                {item.actorName && (
                  <p className="text-xs text-slate-400">
                    {t.detailUpdatedBy} {item.actorName}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">
              {t.detailUpdatesNotes}
            </h2>
            {notes.length === 0 ? (
              <p className="text-sm text-slate-500">{t.detailNoNotes}</p>
            ) : (
              <ul className="space-y-2">
                {notes.map((n) => (
                  <li key={n.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{n.authorName || t.detailStaff}</span>
                      <span className="uppercase">{n.visibility}</span>
                    </div>
                    <p className="mt-1 text-slate-800">{n.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">
              {t.detailAttachments}
            </h2>
            {attachments.length === 0 ? (
              <p className="text-sm text-slate-500">{t.detailNoAttachments}</p>
            ) : (
              <ul className="space-y-2">
                {attachments.map((att) => (
                  <li
                    key={att.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <span className="truncate">{att.originalFilename}</span>
                    <a
                      href={getAttachmentDownloadUrl(report.id, att.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-brand-700 hover:underline"
                    >
                      {t.detailView}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
