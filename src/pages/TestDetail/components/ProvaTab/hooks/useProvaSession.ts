/**
 * @file src/pages/TestDetail/components/ProvaTab/hooks/useProvaSession.ts
 * @description Hook managing the state and logic for the ProvaTab session.
 */

import { useState, useCallback } from 'react';
import { useGeminiStream } from '@/hooks/useGeminiStream';
import { useAppContext } from '@/context/hooks/useAppContext';
import { createSession, addQuestion, saveAnswers, Asset, Answer, Test, updateSessionStatus, getTestAssets } from '@/services/dexieService';

/**
 * Hook to manage a test solving session.
 * Handles question uploads, AI generation, and verification.
 * @param {Test} test - The test being solved.
 * @returns {object} Session state and handlers.
 */
export function useProvaSession(test: Test) {
    const { settings } = useAppContext();
    const { streamSolveTest, verifyAnswers, isStreaming, error } = useGeminiStream();

    const [questionAssets, setQuestionAssets] = useState<Asset[]>([]);
    const [mode, setMode] = useState<'structured' | 'creative'>(
        (settings?.defaultTestMode === 'fast' || settings?.defaultTestMode === 'confidence') ? 'creative' : (settings?.defaultTestMode as 'structured' | 'creative' || 'creative')
    );
    const [answers, setAnswers] = useState<Partial<Answer>[]>([]);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleFilesAdded = useCallback((files: File[]) => {
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Data = (e.target?.result as string).split(',')[1];
                const newAsset = {
                    testId: test.id!,
                    name: file.name,
                    mimeType: file.type,
                    base64Data,
                };
                setQuestionAssets((prev) => {
                    if (prev.some(a => a.name === newAsset.name && a.base64Data === newAsset.base64Data)) return prev;
                    return [...prev, newAsset];
                });
            };
            reader.readAsDataURL(file);
        }
    }, [test.id]);

    const handleRemoveAsset = useCallback((index: number) => {
        setQuestionAssets(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleSolve = useCallback(async () => {
        if (!settings || questionAssets.length === 0 || !test.id) return;
        setAnswers([]);
        setIsVerifying(false);

        let currentSessionId: number | null = null;

        try {
            // Fetch warm assets if in full_attachments mode
            let warmAssets: Asset[] = [];
            if (settings.preparationMode === 'full_attachments') {
                warmAssets = await getTestAssets(test.id);
            }

            // Create session
            const sessionId = await createSession(test.id, mode);
            currentSessionId = sessionId;

            // Add a single question record for all uploaded assets in this session
            const questionId = await addQuestion({
                sessionId,
                type: 'multiple_choice', // default, actual types are in answers
                rawImageBase64: questionAssets.map(a => a.base64Data),
            });

            // Stream answers
            const generator = streamSolveTest(questionAssets, test.warmContext, mode, settings, 0, warmAssets);
            let finalAnswers: Partial<Answer>[] = [];

            for await (const chunk of generator) {
                // Force doubleChecked to false on initial generation, as the model might hallucinate it to true
                finalAnswers = chunk.map(a => ({ ...a, doubleChecked: false }));
                setAnswers([...finalAnswers]);
            }

            console.log("Final AI Generation Output (Initial Pass):", finalAnswers);

            // Save initial answers
            await saveAnswers(questionId, finalAnswers as Answer[]);

            // Verification pass (always run for both modes)
            if (finalAnswers.length > 0) {
                setIsVerifying(true);
                const verified = await verifyAnswers(questionAssets, finalAnswers as Answer[], settings, 0, warmAssets, test.warmContext);
                console.log("Final AI Generation Output (Verification Pass):", verified);
                setAnswers(verified);
                await saveAnswers(questionId, verified);
                setIsVerifying(false);
            }

            await updateSessionStatus(sessionId, 'completed');

            // Vibrate if enabled
            if (settings.vibrationEnabled && 'vibrate' in navigator) {
                navigator.vibrate([200, 100, 200]);
            }

        } catch (err) {
            console.error('Failed to solve test', err);
            if (currentSessionId) {
                await updateSessionStatus(currentSessionId, 'error');
            }
            setIsVerifying(false);
        }
    }, [questionAssets, test.id, test.warmContext, mode, settings, streamSolveTest, verifyAnswers]);

    return {
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
    };
}
