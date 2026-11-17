import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Category, Report } from '@kcc/shared';
import { useLanguage } from '../../app/providers/LanguageProvider.js';
import { ApiClientError, apiRequest } from '../../lib/api-client.js';

export function NewReportPage() {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiRequest<{ items: Category[] }>('/categories')
      .then((res) => {
        setCategories(res.items);
        if (res.items[0]) setCategoryId(res.items[0].id);
      })
      .catch(() =>
        setError(
          locale === 'ms'
            ? 'Tidak dapat memuatkan kategori isu'
            : 'Unable to load issue categories',
        ),
      );
  }, [locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const hasCoords = latitude.trim() !== '' && longitude.trim() !== '';
      const payload = {
        categoryId,
        title,
        description,
        locationLabel: locationLabel.trim() || null,
        latitude: hasCoords ? Number(latitude) : null,
        longitude: hasCoords ? Number(longitude) : null,
      };

      const { report } = await apiRequest<{ report: Report }>('/reports', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (files && files.length > 0) {
        for (const file of Array.from(files).slice(0, 5)) {
          const form = new FormData();
          form.append('file', file);
          await apiRequest(`/reports/${report.id}/attachments`, {
            method: 'POST',
            body: form,
          });
        }
      }

      navigate(`/reports/${report.id}`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t.newReportError);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none transition';
  const labelClass = 'block text-xs font-semibold text-slate-700 uppercase';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Banner with Local Context */}
      <div className="relative overflow-hidden rounded-2xl bg-brand-900 text-white shadow-md">
        <img
          src="/images/kedah-community-center.jpg"
          alt="Kedah"
          className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="relative z-10 p-6 sm:p-8">
          <span className="inline-block rounded-full bg-gold-500/20 border border-gold-400/40 px-3 py-1 text-xs font-semibold text-gold-400 mb-2">
            {t.newReportOfficialBanner}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold">{t.newReportTitle}</h1>
          <p className="mt-1 text-xs sm:text-sm text-brand-100 max-w-xl">{t.newReportSubtitle}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg bg-rose-50 p-4 text-sm text-rose-800 border border-rose-200"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="report-category" className={labelClass}>
                {t.newReportCategory}
              </label>
              <select
                id="report-category"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={inputClass}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="report-location" className={labelClass}>
                {t.newReportLocation}
              </label>
              <input
                id="report-location"
                type="text"
                maxLength={160}
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                placeholder={t.newReportLocationPlaceholder}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="report-title" className={labelClass}>
              {t.newReportTitleField}
            </label>
            <input
              id="report-title"
              type="text"
              required
              minLength={5}
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.newReportTitlePlaceholder}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="report-description" className={labelClass}>
              {t.newReportDescField}
            </label>
            <textarea
              id="report-description"
              required
              minLength={20}
              maxLength={3000}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.newReportDescPlaceholder}
              className={inputClass}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <span className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {t.newReportGpsTitle}
            </span>
            <p className="text-xs text-slate-500 mb-3">{t.newReportGpsDesc}</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="report-lat" className="block text-xs text-slate-600 mb-1">
                  {t.newReportLat}
                </label>
                <input
                  id="report-lat"
                  type="number"
                  step="any"
                  min={-90}
                  max={90}
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="6.1248"
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none"
                />
              </div>
              <div>
                <label htmlFor="report-lon" className="block text-xs text-slate-600 mb-1">
                  {t.newReportLon}
                </label>
                <input
                  id="report-lon"
                  type="number"
                  step="any"
                  min={-180}
                  max={180}
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="100.3678"
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="report-files" className={labelClass}>
              {t.newReportPhotos}
            </label>
            <input
              id="report-files"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="mt-1 block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              {t.newReportCancel}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-brand-700 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-800 disabled:opacity-60 transition shadow-sm"
            >
              {submitting ? t.newReportSubmitting : t.newReportSubmitBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
