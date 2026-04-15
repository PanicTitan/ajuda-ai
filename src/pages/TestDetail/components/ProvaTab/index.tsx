/**
 * @file src/pages/TestDetail/components/ProvaTab/index.tsx
 * @description Tab for uploading questions and generating answers.
 */

import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Divider, Chip } from '@heroui/react';
import { FileQuestion, Play, AlertCircle } from 'lucide-react';
import { useTexts } from '@/hooks/useTexts';
import { useProvaSession } from '@/pages/TestDetail/components/ProvaTab/hooks/useProvaSession';
import { QuestionUploader } from '@/pages/TestDetail/components/ProvaTab/components/QuestionUploader';
import { ModeSelector } from '@/pages/TestDetail/components/ProvaTab/components/ModeSelector';
import { AnswerCard } from '@/pages/TestDetail/components/ProvaTab/components/AnswerCard';
import { Test } from '@/services/dexieService';

interface ProvaTabProps {
    test: Test;
}

export function ProvaTab({ test }: ProvaTabProps) {
    const { t } = useTexts();
    const {
        questionAssets,
        handleFilesAdded,
        handleRemoveAsset,
        mode,
        setMode,
        handleSolve,
        answers,
        isStreaming,
        isVerifying,
        error,
    } = useProvaSession(test);

    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const header = document.getElementById('answers-header');
            if (!header) {
                setShowScrollTop(false);
                return;
            }

            const headerRect = header.getBoundingClientRect();
            const isBelowHeader = headerRect.top < 0;

            const scrollPosition = window.scrollY + window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const isNearBottom = documentHeight - scrollPosition < 100; // Hide when within 100px of bottom

            setShowScrollTop(isBelowHeader && !isNearBottom);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check
        return () => window.removeEventListener('scroll', handleScroll);
    }, [answers.length]);

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="flex gap-3">
                    <FileQuestion className="w-6 h-6 text-primary" />
                    <div className="flex flex-col">
                        <p className="text-md font-bold">{t('test.questions.upload')}</p>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody className="gap-6">
                    <QuestionUploader onFilesAdded={handleFilesAdded} onRemoveAsset={handleRemoveAsset} assets={questionAssets} />

                    <ModeSelector mode={mode} setMode={setMode} />

                    <Button
                        color="primary"
                        startContent={!isStreaming && !isVerifying && <Play className="w-4 h-4" />}
                        isLoading={isStreaming || isVerifying}
                        onPress={handleSolve}
                        isDisabled={questionAssets.length === 0}
                        className="w-full sm:w-auto self-end mt-4"
                    >
                        {isStreaming ? t('test.questions.generating') : isVerifying ? t('test.questions.checking') : t('test.questions.generateBtn')}
                    </Button>
                </CardBody>
            </Card>

            {answers.length > 0 && (
                <div className="flex flex-col gap-6 mt-6">
                    <div className="flex flex-col gap-4" id="answers-header">
                        <h2 className="text-2xl font-bold">{t('test.answers.title')}</h2>

                        {/* Navigable Header */}
                        <div className="flex flex-wrap gap-2">
                            {[...answers].sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0)).map((answer, index) => (
                                <Button
                                    key={`nav-${answer.id || index}`}
                                    size="sm"
                                    variant="flat"
                                    onPress={() => {
                                        document.getElementById(`question-${answer.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                >
                                    {t('test.answers.questionPrefix', { defaultValue: 'Q' })}{answer.questionNumber || index + 1}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {[...answers].sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0)).map((answer, index) => (
                        <AnswerCard key={`ans-${answer.id || index}-${index}`} answer={answer} isVerifying={isVerifying && !answer.doubleChecked} />
                    ))}

                    {/* Final Summary */}
                    {!isStreaming && !isVerifying && answers.length > 0 && (
                        <Card className="mt-8 bg-default-50">
                            <CardHeader>
                                <h3 className="text-lg font-bold">{t('test.answers.summary')}</h3>
                            </CardHeader>
                            <Divider />
                            <CardBody>
                                <ul className="flex flex-col gap-2">
                                    {[...answers].sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0)).map((answer, index) => {
                                        let summaryText = '';
                                        if (answer.type === 'multiple_choice') summaryText = (answer as any).multipleChoiceAnswer?.correctOption || '';
                                        else if (answer.type === 'writing') summaryText = (answer as any).writingAnswer?.shortAnswer || '';
                                        else if (answer.type === 'math') summaryText = (answer as any).mathAnswer?.finalAnswer || '';
                                        else if (answer.type === 'draw') summaryText = t('test.answers.generatedDraw');

                                        return (
                                            <li key={`sum-${answer.id || index}`} className="flex justify-between items-center border-b border-default-200 pb-2 last:border-0">
                                                <span className="font-semibold">{t('test.answers.questionLabel')} {answer.questionNumber || index + 1}</span>
                                                <span className="text-primary font-medium">{summaryText}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </CardBody>
                        </Card>
                    )}

                    {/* Return to Top Button */}
                    {showScrollTop && (
                        <Button
                            isIconOnly
                            color="primary"
                            variant="shadow"
                            className="fixed bottom-6 right-6 z-50 rounded-full"
                            onPress={() => {
                                document.getElementById('answers-header')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
