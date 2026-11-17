import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider.js';
import { useLanguage } from '../../app/providers/LanguageProvider.js';
import { ApiClientError } from '../../lib/api-client.js';

export function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'OFFICER') navigate('/department');
      else navigate('/reports');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t.authErrorLogin);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
      <div className="grid md:grid-cols-2">
        {/* Left Visual Column */}
        <div className="relative hidden md:block bg-brand-900">
          <img
            src="/images/kedah-night-town.jpg"
            alt="Kedah"
            className="h-full w-full object-cover opacity-60 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-900/60 to-transparent p-8 flex flex-col justify-end text-white">
            <span className="inline-block rounded-full bg-gold-500/20 border border-gold-400/40 px-3 py-1 text-xs font-semibold text-gold-400 w-fit mb-2">
              {t.authPortalAccess}
            </span>
            <h2 className="text-2xl font-bold leading-tight">{t.authKedahCares}</h2>
            <p className="mt-2 text-xs text-brand-100 leading-relaxed">{t.authPortalDesc}</p>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">
              {t.navSignIn}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">{t.authWelcomeBack}</h1>
            <p className="text-xs text-slate-500 mt-1">{t.authLoginSubtitle}</p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-700 uppercase"
              >
                {t.authEmail}
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder="nama@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none transition"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-slate-700 uppercase"
              >
                {t.authPassword}
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-brand-700 px-4 py-3 text-sm font-bold text-white hover:bg-brand-800 active:scale-95 disabled:opacity-60 transition shadow-sm"
            >
              {submitting ? t.authSigningIn : t.authSignInBtn}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-600">
            {t.authNewResident}{' '}
            <Link to="/register" className="font-bold text-brand-700 hover:underline">
              {t.authRegisterNow}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
