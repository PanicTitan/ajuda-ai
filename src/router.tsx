/**
 * @file src/router.tsx
 * @description Application router using classic React Router v6 component API.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import { useTexts } from '@/hooks/useTexts';
import { OnboardingModal } from '@/components/OnboardingModal';

const Home = lazy(() => import('@/pages/Home'));
const TestDetail = lazy(() => import('@/pages/TestDetail'));
const TestHistory = lazy(() => import('@/pages/TestHistory'));
const Settings = lazy(() => import('@/pages/Settings'));

/**
 * Simple loader component for lazy-loaded pages.
 * @returns {JSX.Element} The loader UI.
 */
function PageLoader() {
    const { t } = useTexts();
    return <div className="flex h-screen w-screen items-center justify-center">{t('common.loading')}</div>;
}

/**
 * Main application router component.
 * @returns {JSX.Element} The router configuration.
 */
export function AppRouter() {
    return (
        <BrowserRouter>
            <OnboardingModal />
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/test/:testId" element={<TestDetail />} />
                    <Route path="/test/:testId/history" element={<TestHistory />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
