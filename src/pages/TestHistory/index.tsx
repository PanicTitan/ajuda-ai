/**
 * @file src/pages/TestHistory/index.tsx
 * @description Test history page displaying past sessions.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@heroui/react';
import { ArrowLeft, History } from 'lucide-react';
import { useTexts } from '@/hooks/useTexts';
import { getTest, getTestSessions, Test, Session, deleteSession } from '@/services/dexieService';
import { SessionRow } from '@/pages/TestHistory/components/SessionRow';
import { FullScreenToggle } from '@/components/FullScreenToggle';
import { useAppContext } from '@/context/hooks/useAppContext';
import { ConfirmDialog } from '@/components/ConfirmDialog';

/**
 * TestHistory page component.
 * Displays a list of past sessions for a specific test.
 * @returns {JSX.Element} The rendered page.
 */
export default function TestHistory() {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();
    const { t } = useTexts();
    const { settings } = useAppContext();

    const [test, setTest] = useState<Test | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);

    const fetchData = useCallback(async () => {
        if (!testId) return;
        setIsLoading(true);
        try {
            const tData = await getTest(testId);
            if (tData) {
                setTest(tData);
                const sData = await getTestSessions(tData.id!);
                setSessions(sData);
            }
        } catch (error) {
            console.error('Failed to fetch history', error);
        } finally {
            setIsLoading(false);
        }
    }, [testId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteSession = async () => {
        if (!sessionToDelete) return;
        await deleteSession(sessionToDelete);
        setSessionToDelete(null);
        fetchData();
    };

    if (isLoading) {
        return <div className="flex justify-center py-20 text-default-500">{t('common.loading')}</div>;
    }

    if (!test) {
        return <div className="flex justify-center py-20 text-danger">{t('common.error')}</div>;
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-6">
            <div className="max-w-4xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                        <Button isIconOnly variant="light" onPress={() => navigate(`/test/${test.id}`)}>
                            <ArrowLeft />
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                                <History className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                                {t('history.title')}
                            </h1>
                            <p className="text-default-500 text-xs sm:text-sm truncate">{test.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        {settings?.stealthMode && <FullScreenToggle />}
                        <Button color="primary" variant="flat" onPress={() => navigate(`/test/${test.id}`)}>
                            {t('history.backToTest')}
                        </Button>
                    </div>
                </header>

                <main>
                    {sessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <History className="w-16 h-16 text-default-300 mb-4" />
                            <h2 className="text-xl font-semibold text-default-600">{t('history.empty')}</h2>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {sessions.map((session) => (
                                <SessionRow key={session.id} session={session} onDelete={() => setSessionToDelete(session.id!)} />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            <ConfirmDialog
                isOpen={sessionToDelete !== null}
                onClose={() => setSessionToDelete(null)}
                onConfirm={handleDeleteSession}
                title={t('history.deleteSessionTitle')}
                description={t('history.deleteSessionDesc')}
                confirmText={t('common.delete')}
            />
        </div>
    );
}
