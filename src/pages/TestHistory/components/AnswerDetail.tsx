/**
 * @file src/pages/TestHistory/components/AnswerDetail.tsx
 * @description Component for rendering a read-only answer detail in history.
 */

import React from 'react';
import { Card, CardBody, CardHeader, Divider, Chip, Accordion, AccordionItem } from '@heroui/react';
import { CheckCircle2 } from 'lucide-react';
import { useTexts } from '@/hooks/useTexts';
import { DBAnswer, MultipleChoiceAnswer, WritingAnswer, MathAnswer, DrawAnswer } from '@/services/dexieService';

/**
 * Props for the AnswerDetail component.
 * @interface AnswerDetailProps
 * @property {DBAnswer} answer - The answer data from the database.
 */
interface AnswerDetailProps {
    answer: DBAnswer;
}

/**
 * AnswerDetail component.
 * Renders a read-only view of an answer stored in the history.
 * @param {AnswerDetailProps} props - Component props.
 * @returns {JSX.Element} The rendered component.
 */
export function AnswerDetail({ answer }: AnswerDetailProps) {
    const { t } = useTexts();

    const renderContent = () => {
        switch (answer.type) {
            case 'multiple_choice': {
                const mc = answer as MultipleChoiceAnswer;
                const data = mc.multipleChoiceAnswer || {} as any;
                return (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-success/20 text-success rounded-full flex items-center justify-center text-2xl font-bold">
                                {data.correctOption}
                            </div>
                            <p className="text-lg font-semibold">{data.correctOptionText}</p>
                        </div>
                        {data.explanation && (
                            <div className="bg-default-100 p-4 rounded-lg">
                                <p className="text-sm font-semibold mb-1">{t('test.questions.explanation')}:</p>
                                <p className="text-default-700">{data.explanation}</p>
                            </div>
                        )}
                    </div>
                );
            }
            case 'writing': {
                const wr = answer as WritingAnswer;
                const data = wr.writingAnswer || {} as any;
                return (
                    <div className="flex flex-col gap-4">
                        <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                            <p className="text-sm font-semibold text-primary mb-1">{t('test.questions.shortAnswer')}:</p>
                            <p className="text-lg whitespace-pre-wrap">{data.shortAnswer}</p>
                        </div>
                        {data.detailedAnswer && (
                            <Accordion>
                                <AccordionItem key="1" aria-label={t('test.questions.detailedAnswer')} title={t('test.questions.detailedAnswer')}>
                                    <p className="text-default-700 whitespace-pre-wrap">{data.detailedAnswer}</p>
                                </AccordionItem>
                            </Accordion>
                        )}
                    </div>
                );
            }
            case 'math': {
                const ma = answer as MathAnswer;
                const data = ma.mathAnswer || {} as any;
                return (
                    <div className="flex flex-col gap-4">
                        <div className="bg-secondary/10 p-4 rounded-lg border border-secondary/20 flex flex-col items-center justify-center">
                            <p className="text-sm font-semibold text-secondary mb-1">{t('test.questions.finalAnswer')}:</p>
                            <p className="text-2xl font-bold text-secondary">{data.finalAnswer}</p>
                        </div>
                        {data.solutionSteps && data.solutionSteps.length > 0 && (
                            <Accordion>
                                <AccordionItem key="1" aria-label={t('test.questions.solutionSteps')} title={t('test.questions.solutionSteps')}>
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
                const dr = answer as DrawAnswer;
                const data = dr.drawAnswer || {} as any;
                return (
                    <div className="flex flex-col gap-4">
                        {data.explanation && (
                            <div className="bg-default-100 p-4 rounded-lg">
                                <p className="text-default-700">{data.explanation}</p>
                            </div>
                        )}
                        {data.asciiArt && (
                            <div className="bg-black text-green-500 p-4 rounded-lg overflow-x-auto font-mono text-xs whitespace-pre">
                                {data.asciiArt}
                            </div>
                        )}
                        {dr.generatedImageBase64 && (
                            <img src={`data:image/png;base64,${dr.generatedImageBase64}`} alt="Generated visual" className="rounded-lg w-full max-w-md mx-auto" />
                        )}
                    </div>
                );
            }
            default:
                return <p className="text-default-500">{t('test.answers.unsupportedFormat')}</p>;
        }
    };

    return (
        <Card className="w-full mb-4 shadow-sm border border-default-200">
            <CardHeader className="flex justify-between items-start pb-2">
                <div className="flex flex-col gap-1">
                    <h4 className="text-md font-semibold">{answer.question || t('test.answers.questionLabel')}</h4>
                    <div className="flex gap-2">
                        <Chip size="sm" variant="flat" color="default">{answer.type}</Chip>
                        {answer.language && <Chip size="sm" variant="flat" color="secondary">{answer.language}</Chip>}
                    </div>
                </div>
                <div>
                    {answer.doubleChecked && (
                        <Chip color="success" variant="flat" size="sm" startContent={<CheckCircle2 className="w-3 h-3" />}>
                            {t('test.questions.checked')}
                        </Chip>
                    )}
                </div>
            </CardHeader>
            <Divider />
            <CardBody className="pt-4">
                {renderContent()}
            </CardBody>
        </Card>
    );
}
