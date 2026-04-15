/**
 * @file src/pages/TestHistory/components/SessionRow.tsx
 * @description Component for rendering a session row in history.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Divider, Chip, Button } from '@heroui/react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useTexts } from '@/hooks/useTexts';
import { Session, DBAnswer, getSessionAnswers } from '@/services/dexieService';
import { AnswerDetail } from '@/pages/TestHistory/components/AnswerDetail';

/**
 * Props for the SessionRow component.
 * @interface SessionRowProps
 * @property {Session} session - The session data.
 * @property {function} [onDelete] - Optional callback to delete the session.
 */
interface SessionRowProps {
    session: Session;
    onDelete?: () => void;
}

/**
 * SessionRow component.
 * Renders a row representing a single test session in the history.
 * @param {SessionRowProps} props - Component props.
 * @returns {JSX.Element} The rendered component.
 */
export function SessionRow({ session, onDelete }: SessionRowProps) {
    const { t } = useTexts();
    const [isExpanded, setIsExpanded] = useState(false);
    const [answers, setAnswers] = useState<DBAnswer[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isExpanded && answers.length === 0) {
            setIsLoading(true);
            getSessionAnswers(session.id!)
                .then(setAnswers)
                .finally(() => setIsLoading(false));
        }
    }, [isExpanded, session.id, answers.length]);

    return (
        <Card className="w-full mb-4">
            <CardHeader className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex flex-col gap-1">
                    <p className="text-md font-bold">{new Date(session.createdAt).toLocaleString()}</p>
                    <div className="flex gap-2">
                        <Chip size="sm" variant="flat" color={session.mode === 'confidence' ? 'warning' : 'primary'}>
                            {session.mode === 'confidence' ? t('test.questions.confidence') : t('test.questions.fast')}
                        </Chip>
                        <Chip size="sm" variant="flat" color={session.status === 'completed' ? 'success' : session.status === 'error' ? 'danger' : 'default'}>
                            {t(`history.status.${session.status}` as any, { defaultValue: session.status })}
                        </Chip>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {onDelete && (
                        <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => onDelete()}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                    <Button isIconOnly variant="light" onPress={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                </div>
            </CardHeader>

            {isExpanded && (
                <>
                    <Divider />
                    <CardBody className="bg-default-50">
                        {isLoading ? (
                            <p className="text-center text-default-500 py-4">{t('common.loading')}</p>
                        ) : answers.length === 0 ? (
                            <p className="text-center text-default-500 py-4">{t('history.noAnswers')}</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {answers.map((answer) => (
                                    <AnswerDetail key={answer.dbId} answer={answer} />
                                ))}
                            </div>
                        )}
                    </CardBody>
                </>
            )}
        </Card>
    );
}
