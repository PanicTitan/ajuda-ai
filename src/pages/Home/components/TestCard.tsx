/**
 * @file src/pages/Home/components/TestCard.tsx
 * @description Card component displaying a single test.
 */

import React from 'react';
import { Card, CardHeader, CardBody, Divider } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import { Test } from '@/services/dexieService';
import { useTexts } from '@/hooks/useTexts';
import { Trash2 } from 'lucide-react';

/**
 * Props for the TestCard component.
 * @interface TestCardProps
 * @property {Test} test - The test object to display.
 * @property {function} [onDelete] - Optional callback when the delete button is clicked.
 */
interface TestCardProps {
    test: Test;
    onDelete?: () => void;
}

/**
 * TestCard component.
 * Displays a summary of a test and allows navigation or deletion.
 * @param {TestCardProps} props - Component props.
 * @returns {JSX.Element} The rendered component.
 */
export function TestCard({ test, onDelete }: TestCardProps) {
    const navigate = useNavigate();
    const { t } = useTexts();

    return (
        <Card
            className="max-w-[400px] cursor-pointer hover:scale-105 transition-transform group"
            isPressable
            onPress={() => navigate(`/test/${test.id}`)}
        >
            <CardHeader className="flex justify-between items-start gap-3">
                <div className="flex flex-col">
                    <p className="text-md font-bold">{test.name}</p>
                    <p className="text-small text-default-500">{new Date(test.createdAt).toLocaleDateString()}</p>
                </div>
                {onDelete && (
                    <div
                        role="button"
                        tabIndex={0}
                        className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10 p-2 hover:bg-danger/20 rounded-full text-danger cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation();
                                onDelete();
                            }
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                    </div>
                )}
            </CardHeader>
            <Divider />
            <CardBody>
                <div className="flex items-center gap-2">
                    {test.warmContext && (
                        <div className="w-3 h-3 rounded-full bg-success" title={t('test.card.preparedTooltip')} />
                    )}
                    <p className="text-default-600">
                        {test.warmContext ? t('test.prepared') : t('test.notPrepared')}
                    </p>
                </div>
            </CardBody>
        </Card>
    );
}
