import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { NotificationItem, PaginatedResponse } from '@kcc/shared';
import { useLanguage } from '../../app/providers/LanguageProvider.js';
import { apiRequest } from '../../lib/api-client.js';

export function NotificationsPage() {
  const { t, locale } = useLanguage();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<PaginatedResponse<NotificationItem>>('/notifications');
      setItems(res.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = async (id: string) => {
    await apiRequest(`/notifications/${id}/read`, { method: 'POST' });
    await load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">{t.notifTitle}</h1>
      {loading ? (
        <p className="text-sm text-slate-500">{t.notifLoading}</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          {t.notifEmpty}
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl border p-4 ${
                n.readAt ? 'border-slate-200 bg-white' : 'border-brand-600 bg-brand-50/40'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-slate-900">{n.title}</h2>
                  <p className="mt-1 text-sm text-slate-700">{n.body}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <span>
                      {new Date(n.createdAt).toLocaleString(locale === 'ms' ? 'ms-MY' : 'en-MY')}
                    </span>
                    {n.reportId && (
                      <Link
                        to={`/reports/${n.reportId}`}
                        className="font-medium text-brand-700 hover:underline"
                      >
                        {t.notifViewReport}
                      </Link>
                    )}
                  </div>
                </div>
                {!n.readAt && (
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {t.notifMarkRead}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
