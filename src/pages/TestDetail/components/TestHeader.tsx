/**
 * @file src/pages/TestDetail/components/TestHeader.tsx
 * @description Header component for the test detail page.
 */

import React from 'react';
import { Button } from '@heroui/react';
import { ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTexts } from '@/hooks/useTexts';
import { Test } from '@/services/dexieService';
import { FullScreenToggle } from '@/components/FullScreenToggle';
import { useAppContext } from '@/context/hooks/useAppContext';

interface TestHeaderProps {
    test: Test;
}

export function TestHeader({ test }: TestHeaderProps) {
    const { t } = useTexts();
    const navigate = useNavigate();
    const { settings } = useAppContext();

    return (
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <Button isIconOnly variant="light" onPress={() => navigate('/')}>
                    <ArrowLeft />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold truncate">{test.name}</h1>
                    <p className="text-default-500 text-xs sm:text-sm">{t('test.header.createdAt')} {new Date(test.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
                {settings?.stealthMode && <FullScreenToggle />}
                <Button
                    variant="flat"
                    color="primary"
                    startContent={<Clock className="w-4 h-4" />}
                    onPress={() => navigate(`/test/${test.id}/history`)}
                >
                    {t('test.header.history')}
                </Button>
            </div>
        </header>
    );
}
