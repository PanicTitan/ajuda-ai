/**
 * @file src/pages/TestDetail/components/ProvaTab/components/AnswerCard/index.tsx
 * @description Component for rendering a single answer card.
 */

import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Divider, Chip, Accordion, AccordionItem, Button } from '@heroui/react';
import { CheckCircle2, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useTexts } from '@/hooks/useTexts';
import { Answer, MultipleChoiceAnswer, WritingAnswer, MathAnswer, DrawAnswer } from '@/services/dexieService';
import { useAnswerCard } from '@/pages/TestDetail/components/ProvaTab/components/AnswerCard/useAnswerCard';

/**
 * Props for the AnswerCard component.
 * @interface AnswerCardProps
 * @property {Partial<Answer>} answer - The answer data to display.
 * @property {boolean} isVerifying - Whether the answer is currently being verified.
 */
interface AnswerCardProps {
    answer: Partial<Answer>;
    isVerifying: boolean;
}

/**
 * AnswerCard component.
 * Displays the question, the generated answer, and its status.
 * @param {AnswerCardProps} props - Component props.
 * @returns {JSX.Element} The rendered component.
 */
export function AnswerCard({ answer, isVerifying }: AnswerCardProps) {
    const { t } = useTexts();
    const { generatedImage, isGeneratingImage } = useAnswerCard(answer);
    const [isQuestionExpanded, setIsQuestionExpanded] = useState(false);

    const questionText = answer.question || t('test.answers.questionLabel');
    const shouldTruncate = questionText.length > 150;
    const displayQuestion = shouldTruncate && !isQuestionExpanded
        ? questionText.substring(0, 150) + '...'
        : questionText;

    const renderContent = () => {
        switch (answer.type) {
            case 'multiple_choice': {
                const mc = answer as Partial<MultipleChoiceAnswer>;
                const data = mc.multipleChoiceAnswer || {} as any;
                return (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            {data.correctOption && (
                                <div className="w-10 h-10 shrink-0 bg-success/20 text-success rounded-full flex items-center justify-center text-xl font-bold">
                                    {data.correctOption}
                                </div>
                            )}
                            <p className="text-base font-medium">{data.correctOptionText}</p>
                        </div>
                        {data.explanation && (
                            <Accordion className="px-0">
                                <AccordionItem key="1" aria-label={t('test.questions.explanation')} title={t('test.questions.explanation')} className="text-sm">
                                    <p className="text-default-700">{data.explanation}</p>
                                </AccordionItem>
                            </Accordion>
                        )}
                    </div>
                );
            }
            case 'writing': {
                const wr = answer as Partial<WritingAnswer>;
                const data = wr.writingAnswer || {} as any;
                return (
                    <div className="flex flex-col gap-4">
                        <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                            <p className="text-xs font-semibold text-primary mb-1">{t('test.questions.shortAnswer')}:</p>
                            <p className="text-base font-medium whitespace-pre-wrap">{data.shortAnswer}</p>
                        </div>
                        {data.detailedAnswer && (
                            <Accordion className="px-0">
                                <AccordionItem key="1" aria-label={t('test.questions.detailedAnswer')} title={t('test.questions.detailedAnswer')} className="text-sm">
                                    <p className="text-default-700 whitespace-pre-wrap">{data.detailedAnswer}</p>
                                </AccordionItem>
                            </Accordion>
                        )}
                    </div>
                );
            }
            case 'math': {
                const ma = answer as Partial<MathAnswer>;
                const data = ma.mathAnswer || {} as any;
                return (
                    <div className="flex flex-col gap-4">
                        <div className="bg-secondary/10 p-4 rounded-lg border border-secondary/20 flex flex-col items-center justify-center">
                            <p className="text-xs font-semibold text-secondary mb-1">{t('test.questions.finalAnswer')}:</p>
                            <p className="text-xl font-bold text-secondary">{data.finalAnswer}</p>
                        </div>
                        {data.solutionSteps && data.solutionSteps.length > 0 && (
                            <Accordion className="px-0">
                                <AccordionItem key="1" aria-label={t('test.questions.solutionSteps')} title={t('test.questions.solutionSteps')} className="text-sm">
                                    <ol className="list-decimal list-inside space-y-2 text-default-700">
                                        {data.solutionSteps.map((step: string, i: number) => <li key={i}>{step}</li>)}
                                    </ol>
                                </AccordionItem>
                            </Accordion>
                        )}
                    </div>
                );
            }
            case 'draw': {
                const dr = answer as Partial<DrawAnswer>;
                const data = dr.drawAnswer || {} as any;
                return (
                    <div className="flex flex-col gap-4">
                        {data.explanation && (
                            <Accordion className="px-0">
                                <AccordionItem key="1" aria-label={t('test.questions.explanation')} title={t('test.questions.explanation')} className="text-sm">
                                    <p className="text-default-700">{data.explanation}</p>
                                </AccordionItem>
                            </Accordion>
                        )}
                        {data.asciiArt && (
                            <div className="bg-black text-green-500 p-4 rounded-lg overflow-x-auto font-mono text-xs whitespace-pre">
                                {data.asciiArt}
                            </div>
                        )}
                        {isGeneratingImage ? (
                            <div className="flex items-center justify-center p-8 bg-default-100 rounded-lg">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <span className="ml-2">{t('test.answers.generatingImage')}</span>
                            </div>
                        ) : generatedImage ? (
                            <img
                                src={String(generatedImage).trim().startsWith('data:')
                                    ? String(generatedImage).trim()
                                    : `data:image/png;base64,${String(generatedImage).trim()}`}
                                alt={t('test.answers.generatedVisualAlt') || 'Generated visual'}
                                className="rounded-lg w-full max-w-md mx-auto"
                            />
                        ) : null}
                    </div>
                );
            }
            default:
                return <p className="text-default-500">{t('test.answers.unsupportedFormat')}</p>;
        }
    };

    return (
        <Card className="w-full mb-6" id={`question-${answer.id}`}>
            <CardHeader className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-1 flex-1">
                    <h3 className="text-base font-medium leading-snug">
                        {answer.questionNumber ? <span className="font-bold mr-2">{t('test.answers.questionPrefix', { defaultValue: 'Q' })}{answer.questionNumber}.</span> : null}
                        {displayQuestion}
                    </h3>
                    {shouldTruncate && (
                        <Button
                            size="sm"
                            variant="light"
                            className="w-fit h-6 min-h-6 px-2 text-xs text-primary"
                            onPress={() => setIsQuestionExpanded(!isQuestionExpanded)}
                            endContent={isQuestionExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        >
                            {isQuestionExpanded ? t('common.seeLess') : t('common.seeMore')}
                        </Button>
                    )}
                    <div className="flex gap-2 flex-wrap mt-1">
                        <Chip size="sm" variant="flat" color="default">{answer.type}</Chip>
                        {answer.language && <Chip size="sm" variant="flat" color="secondary">{answer.language}</Chip>}
                        {answer.meta?.modifiedForSafety === true && (
                            <Chip size="sm" variant="flat" color="warning" startContent={<AlertCircle className="w-3 h-3" />}>
                                {t('test.answers.modifiedForSafety')}
                            </Chip>
                        )}
                    </div>
                </div>
                <div className="shrink-0">
                    {isVerifying ? (
                        <Chip color="warning" variant="flat" startContent={<Loader2 className="w-3 h-3 animate-spin" />}>
                            {t('test.questions.checking')}
                        </Chip>
                    ) : answer.doubleChecked ? (
                        <Chip color="success" variant="flat" startContent={<CheckCircle2 className="w-3 h-3" />}>
                            {t('test.questions.checked')}
                        </Chip>
                    ) : null}
                </div>
            </CardHeader>
            <Divider />
            <CardBody>
                {renderContent()}
            </CardBody>
        </Card>
    );
}
