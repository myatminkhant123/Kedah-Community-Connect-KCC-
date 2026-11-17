import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider.js';
import { useLanguage } from '../../app/providers/LanguageProvider.js';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { locale, setLocale, toggleLocale, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-700 text-white'
        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top state utility banner */}
      <div className="bg-brand-900 px-4 py-1.5 text-xs text-gold-400 font-medium tracking-wide">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-gold-400"></span>
            <span>{t.stateBanner}</span>
          </div>

          {/* Quick Language Toggle in Top Banner */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-brand-200 hidden sm:inline">Bahasa / Language:</span>
            <div className="inline-flex rounded-md bg-brand-800 p-0.5 border border-brand-700">
              <button
                type="button"
                onClick={() => setLocale('ms')}
                className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-all ${
                  locale === 'ms'
                    ? 'bg-gold-400 text-brand-950 shadow-sm'
                    : 'text-brand-200 hover:text-white'
                }`}
                title="Tukar bahasa ke Bahasa Melayu"
              >
                Bahasa Melayu
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-all ${
                  locale === 'en'
                    ? 'bg-gold-400 text-brand-950 shadow-sm'
                    : 'text-brand-200 hover:text-white'
                }`}
                title="Switch language to English"
              >
                English
              </button>
            </div>
          </div>
        </div>
      </div>

      <header className="bg-white border-b-4 border-brand-700 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            {/* Kedah-coloured logo mark */}
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-700 text-white text-xs font-bold leading-tight text-center shadow-sm">
              KDH
            </span>
            <div>
              <p className="font-bold text-brand-800 leading-tight">{t.appName}</p>
              <p className="text-xs text-slate-500 leading-tight">{t.appSubtitle}</p>
            </div>
          </Link>

          <nav aria-label="Navigasi Utama" className="flex flex-wrap items-center gap-2">
            {!user ? (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  {t.navSignIn}
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-md bg-brand-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-800"
                >
                  {t.navRegister}
                </NavLink>
              </>
            ) : (
              <>
                {user.role === 'RESIDENT' && (
                  <>
                    <NavLink to="/reports" end className={navLinkClass}>
                      {t.navMyReports}
                    </NavLink>
                    <NavLink to="/reports/new" className={navLinkClass}>
                      {t.navNewReport}
                    </NavLink>
                  </>
                )}
                {user.role === 'ADMIN' && (
                  <>
                    <NavLink to="/admin" end className={navLinkClass}>
                      {t.navAdminQueue}
                    </NavLink>
                    <NavLink to="/admin/analytics" className={navLinkClass}>
                      {t.navAnalytics}
                    </NavLink>
                    <NavLink to="/admin/settings" className={navLinkClass}>
                      {t.navSettings}
                    </NavLink>
                  </>
                )}
                {user.role === 'OFFICER' && (
                  <NavLink to="/department" className={navLinkClass}>
                    {t.navDeptQueue}
                  </NavLink>
                )}
                <NavLink to="/notifications" className={navLinkClass}>
                  {t.navNotifications}
                </NavLink>
                <span className="ml-2 text-xs text-slate-500 hidden sm:inline">
                  {user.displayName} ({user.role})
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="ml-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {t.navSignOut}
                </button>
              </>
            )}

            {/* Prominent Language Switcher Button in Header Nav */}
            <button
              type="button"
              onClick={toggleLocale}
              className="ml-2 inline-flex items-center gap-1.5 rounded-md border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-100 transition-colors shadow-xs"
              aria-label="Tukar bahasa / Change language"
              title={locale === 'ms' ? 'Switch to English' : 'Tukar ke Bahasa Melayu'}
            >
              <svg
                className="w-4 h-4 text-brand-700"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{locale === 'ms' ? 'English (EN)' : 'Bahasa Melayu (BM)'}</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>

      <footer className="border-t-2 border-brand-700 bg-brand-800 py-6 text-center text-xs text-gold-400">
        <p className="font-semibold">{t.footerCopyright}</p>
        <p className="mt-1 text-brand-200">{t.footerRights}</p>
      </footer>
    </div>
  );
}
