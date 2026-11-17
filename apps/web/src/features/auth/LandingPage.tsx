import { Link } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider.js';
import { useLanguage } from '../../app/providers/LanguageProvider.js';

export function LandingPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="space-y-10">
      {/* Hero Banner with Kedah Landmark Illustration */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700 shadow-xl text-white">
        {/* Background artwork with soft gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/kedah-hero.jpg"
            alt="Kedah Darul Aman"
            className="h-full w-full object-cover object-center opacity-30 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-900/70 to-brand-900/40" />
        </div>

        <div className="relative z-10 max-w-3xl p-8 sm:p-12 space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold-500/20 border border-gold-400/40 px-3.5 py-1 text-xs font-semibold text-gold-400 tracking-wide uppercase">
            <span className="inline-block h-2 w-2 rounded-full bg-gold-400 animate-pulse" />
            {t.landingStateBadge}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            {t.landingHeroTitle}
          </h1>

          <p className="text-base sm:text-lg text-brand-100 max-w-2xl leading-relaxed">
            {t.landingHeroDesc}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="rounded-lg bg-gold-500 px-6 py-3 text-sm font-bold text-brand-950 hover:bg-gold-400 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  {t.landingCreateAcc}
                </Link>
                <Link
                  to="/login"
                  className="rounded-lg border border-white/50 bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-all active:scale-95"
                >
                  {t.landingSignIn}
                </Link>
              </>
            ) : (
              <Link
                to={
                  user.role === 'ADMIN'
                    ? '/admin'
                    : user.role === 'OFFICER'
                      ? '/department'
                      : '/reports'
                }
                className="rounded-lg bg-gold-500 px-6 py-3 text-sm font-bold text-brand-950 hover:bg-gold-400 transition-all shadow-md active:scale-95"
              >
                {t.landingDashboard}
              </Link>
            )}
            <a
              href="#panduan"
              className="px-4 py-3 text-sm font-medium text-brand-200 hover:text-white transition-colors"
            >
              {t.landingLearnMore}
            </a>
          </div>
        </div>
      </section>

      {/* Quick Stats or Community Focus Highlights */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-brand-800">{t.statDistricts}</p>
          <p className="text-xs text-slate-500 mt-0.5">{t.statDistrictsSub}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-brand-800">{t.statHours}</p>
          <p className="text-xs text-slate-500 mt-0.5">{t.statHoursSub}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-brand-800">{t.statTransparent}</p>
          <p className="text-xs text-slate-500 mt-0.5">{t.statTransparentSub}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-brand-800">{t.statAgencies}</p>
          <p className="text-xs text-slate-500 mt-0.5">{t.statAgenciesSub}</p>
        </div>
      </section>

      {/* How it works with visual feature cards */}
      <section id="panduan" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t.workflowTitle}</h2>
            <p className="text-sm text-slate-600">{t.workflowDesc}</p>
          </div>
          <Link
            to="/reports/new"
            className="text-sm font-semibold text-brand-700 hover:text-brand-800 hover:underline"
          >
            {t.workflowSubmitNow}
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Community Submission */}
          <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
            <div className="relative h-44 overflow-hidden bg-slate-100">
              <img
                src="/images/kedah-community-center.jpg"
                alt="Kedah Community Center"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white shadow">
                1
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-slate-900">{t.step1Title}</h3>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{t.step1Desc}</p>
            </div>
          </div>

          {/* Card 2: Field Investigation & Routing */}
          <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
            <div className="relative h-44 overflow-hidden bg-slate-100">
              <img
                src="/images/kedah-urban-canal.jpg"
                alt="Kedah Infrastructure"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white shadow">
                2
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-slate-900">{t.step2Title}</h3>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{t.step2Desc}</p>
            </div>
          </div>

          {/* Card 3: Resolution & Community Welfare */}
          <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
            <div className="relative h-44 overflow-hidden bg-slate-100">
              <img
                src="/images/kedah-gunung-jerai.jpg"
                alt="Gunung Jerai, Kedah"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white shadow">
                3
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-slate-900">{t.step3Title}</h3>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{t.step3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase of Focus Municipal Sectors */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
              {t.showcaseBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.showcaseTitle}</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{t.showcaseDesc}</p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="font-semibold text-slate-800 text-sm">{t.showcaseRoads}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t.showcaseRoadsSub}</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="font-semibold text-slate-800 text-sm">{t.showcaseLights}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t.showcaseLightsSub}</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="font-semibold text-slate-800 text-sm">{t.showcaseDrainage}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t.showcaseDrainageSub}</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="font-semibold text-slate-800 text-sm">{t.showcaseWaste}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t.showcaseWasteSub}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-3">
              <img
                src="/images/kedah-night-town.jpg"
                alt="Kedah Town"
                className="h-44 sm:h-52 w-full rounded-xl object-cover shadow-sm"
              />
              <div className="rounded-xl bg-brand-50 border border-brand-100 p-3 text-xs text-brand-900">
                <span className="font-bold block">{t.showcaseNightTitle}</span>
                {t.showcaseNightDesc}
              </div>
            </div>
            <div className="space-y-3 pt-4 sm:pt-6">
              <img
                src="/images/kedah-langkawi-coastal.jpg"
                alt="Kedah Langkawi"
                className="h-44 sm:h-52 w-full rounded-xl object-cover shadow-sm"
              />
              <div className="rounded-xl bg-gold-50 border border-gold-200 p-3 text-xs text-gold-900">
                <span className="font-bold block">{t.showcaseCoastalTitle}</span>
                {t.showcaseCoastalDesc}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
