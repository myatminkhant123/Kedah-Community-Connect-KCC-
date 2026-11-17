import React from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import type { UserRole } from '@kcc/shared';
import { AppLayout } from '../../components/layout/AppLayout.js';
import { AdminAnalyticsPage } from '../../features/admin/AdminAnalyticsPage.js';
import { AdminQueuePage } from '../../features/admin/AdminQueuePage.js';
import { AdminSettingsPage } from '../../features/admin/AdminSettingsPage.js';
import { LandingPage } from '../../features/auth/LandingPage.js';
import { LoginPage } from '../../features/auth/LoginPage.js';
import { RegisterPage } from '../../features/auth/RegisterPage.js';
import { DepartmentQueuePage } from '../../features/department/DepartmentQueuePage.js';
import { NotificationsPage } from '../../features/notifications/NotificationsPage.js';
import { NewReportPage } from '../../features/reports/NewReportPage.js';
import { ReportDetailPage } from '../../features/reports/ReportDetailPage.js';
import { ReportsListPage } from '../../features/reports/ReportsListPage.js';
import { useAuth } from '../providers/AuthProvider.js';
import { useLanguage } from '../providers/LanguageProvider.js';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: UserRole[] }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="text-sm text-slate-500">Checking session...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function NotFoundPage() {
  const { locale } = useLanguage();
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-3 shadow-sm">
      <h1 className="text-xl font-bold text-slate-900">
        {locale === 'ms' ? 'Halaman Tidak Dijumpai (404)' : 'Page Not Found (404)'}
      </h1>
      <p className="text-sm text-slate-600">
        {locale === 'ms'
          ? 'Halaman yang anda cari tidak wujud atau telah dialihkan.'
          : 'The requested page does not exist or has been moved.'}
      </p>
      <Link
        to="/"
        className="inline-block rounded-md bg-brand-700 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-800 transition-colors"
      >
        {locale === 'ms' ? 'Kembali ke Laman Utama' : 'Back to Home'}
      </Link>
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/new"
            element={
              <ProtectedRoute roles={['RESIDENT', 'ADMIN']}>
                <NewReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/:reportId"
            element={
              <ProtectedRoute>
                <ReportDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminQueuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/department"
            element={
              <ProtectedRoute roles={['OFFICER', 'ADMIN']}>
                <DepartmentQueuePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
