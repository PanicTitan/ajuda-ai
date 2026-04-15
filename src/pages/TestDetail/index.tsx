/**
 * @file src/pages/TestDetail/index.tsx
 * @description Test detail page containing Preparação and Prova tabs.
 */

import React from 'react';
import { useTexts } from '@/hooks/useTexts';
import { useTestDetail } from '@/pages/TestDetail/hooks/useTestDetail';
import { TestHeader } from '@/pages/TestDetail/components/TestHeader';
import { TabNav } from '@/pages/TestDetail/components/TabNav';
import { WarmTab } from '@/pages/TestDetail/components/WarmTab';
import { ProvaTab } from '@/pages/TestDetail/components/ProvaTab';

/**
 * TestDetail page component.
 * Manages the tabs for test preparation and solving.
 * @returns {JSX.Element} The rendered page.
 */
export default function TestDetail() {
    const { t } = useTexts();
    const { test, isLoading, activeTab, setActiveTab, refresh } = useTestDetail();

    if (isLoading) {
        return <div className="flex justify-center py-20 text-default-500">{t('common.loading')}</div>;
    }

    if (!test) {
        return <div className="flex justify-center py-20 text-danger">{t('common.error')}</div>;
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-6">
            <div className="max-w-4xl mx-auto">
                <TestHeader test={test} />
                <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />

                {activeTab === 'warm' && <WarmTab test={test} onUpdate={refresh} />}
                {activeTab === 'prova' && <ProvaTab test={test} />}
            </div>
        </div>
    );
}
