/**
 * @file src/pages/Home/index.tsx
 * @description Home page displaying the list of tests.
 */

import React, { useState } from 'react';
import { Button } from '@heroui/react';
import { Plus, Settings, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTexts } from '@/hooks/useTexts';
import { useHomeTests } from '@/pages/Home/hooks/useHomeTests';
import { TestCard } from '@/pages/Home/components/TestCard';
import { NewTestModal } from '@/pages/Home/components/NewTestModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FullScreenToggle } from '@/components/FullScreenToggle';
import { useAppContext } from '@/context/hooks/useAppContext';
import { deleteTest } from '@/services/dexieService';

import { ConfirmDialog } from '@/components/ConfirmDialog';

/**
 * Home page component.
 * Displays a list of existing tests and provides a way to create new ones.
 * @returns {JSX.Element} The rendered page.
 */
export default function Home() {
    const { t } = useTexts();
    const { settings } = useAppContext();
    const { tests, isLoading, refresh } = useHomeTests();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [testToDelete, setTestToDelete] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleDeleteTest = async () => {
        if (!testToDelete) return;
        await deleteTest(testToDelete);
        setTestToDelete(null);
        refresh();
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 max-w-6xl mx-auto">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-primary">{t('home.title')}</h1>
                    <p className="text-default-500 text-base sm:text-lg">{t('home.subtitle')}</p>
                </div>
                <div className="flex gap-2 sm:gap-4 items-center w-full sm:w-auto justify-end">
                    {settings?.stealthMode ? <FullScreenToggle /> : <ThemeToggle />}
                    <Button isIconOnly variant="light" onPress={() => navigate('/settings')}>
                        <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                    </Button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto pb-24">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <p className="text-default-500">{t('common.loading')}</p>
                    </div>
                ) : tests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-24 h-24 bg-default-100 rounded-full flex items-center justify-center mb-6">
                            <FileText className="w-10 h-10 text-default-400" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">{t('home.emptyState')}</h2>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {tests.map((test) => (
                            <TestCard key={test.id} test={test} onDelete={() => setTestToDelete(test.id!)} />
                        ))}
                    </div>
                )}
            </main>

            <Button
                isIconOnly
                color="primary"
                size="lg"
                className="fixed bottom-6 right-6 z-50 shadow-lg w-14 h-14 rounded-full"
                onPress={() => setIsModalOpen(true)}
            >
                <Plus className="w-6 h-6" />
            </Button>

            <NewTestModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); refresh(); }} />

            <ConfirmDialog
                isOpen={!!testToDelete}
                onClose={() => setTestToDelete(null)}
                onConfirm={handleDeleteTest}
                title={t('home.deleteTestTitle')}
                description={
                    <p>
                        {t('home.deleteTestDesc')} <strong>{tests.find(t => t.id === testToDelete)?.name}</strong>? {t('home.deleteTestWarning')}
                    </p>
                }
                confirmText={t('common.delete')}
            />
        </div>
    );
}
