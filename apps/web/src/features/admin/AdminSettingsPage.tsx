import React, { useCallback, useEffect, useState } from 'react';
import type { Category, Department } from '@kcc/shared';
import { useLanguage } from '../../app/providers/LanguageProvider.js';
import { ApiClientError, apiRequest } from '../../lib/api-client.js';

export function AdminSettingsPage() {
  const { t, locale } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [cRes, dRes] = await Promise.all([
        apiRequest<{ items: Category[] }>('/admin/categories'),
        apiRequest<{ items: Department[] }>('/admin/departments'),
      ]);
      setCategories(cRes.items);
      setDepartments(dRes.items);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : locale === 'ms'
            ? 'Gagal memuatkan tetapan'
            : 'Failed to load settings',
      );
    }
  }, [locale]);

  useEffect(() => {
    void load();
  }, [load]);

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    await apiRequest('/admin/categories', {
      method: 'POST',
      body: JSON.stringify({ name: newCategory.trim() }),
    });
    setNewCategory('');
    await load();
  };

  const addDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartment.trim()) return;
    await apiRequest('/admin/departments', {
      method: 'POST',
      body: JSON.stringify({ name: newDepartment.trim() }),
    });
    setNewDepartment('');
    await load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t.settingsTitle}</h1>
      {error && (
        <div role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
          {error}
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
          <h2 className="font-semibold text-slate-900">{t.settingsCategories}</h2>
          <form onSubmit={addCategory} className="flex gap-2">
            <input
              type="text"
              placeholder={t.settingsNewCategoryPlaceholder}
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-brand-600"
            />
            <button
              type="submit"
              className="rounded-lg bg-brand-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-800 transition-colors"
            >
              {t.settingsAddBtn}
            </button>
          </form>
          <ul className="space-y-1 text-sm">
            {categories.map((c) => (
              <li key={c.id} className="flex justify-between py-1 border-b border-slate-100">
                <span>{c.name}</span>
                <span className="text-xs text-slate-500">
                  {c.isActive ? t.settingsActive : t.settingsInactive}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
          <h2 className="font-semibold text-slate-900">{t.settingsDepartments}</h2>
          <form onSubmit={addDepartment} className="flex gap-2">
            <input
              type="text"
              placeholder={t.settingsNewDeptPlaceholder}
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-brand-600"
            />
            <button
              type="submit"
              className="rounded-lg bg-brand-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-800 transition-colors"
            >
              {t.settingsAddBtn}
            </button>
          </form>
          <ul className="space-y-1 text-sm">
            {departments.map((d) => (
              <li key={d.id} className="flex justify-between py-1 border-b border-slate-100">
                <span>{d.name}</span>
                <span className="text-xs text-slate-500">
                  {d.isActive ? t.settingsActive : t.settingsInactive}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
