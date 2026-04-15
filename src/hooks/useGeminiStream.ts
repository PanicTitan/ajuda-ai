/**
 * @file src/hooks/useGeminiStream.ts
 * @description Custom hook for handling Gemini streaming operations.
 */

import { useState, useCallback } from 'react';
import { addToast } from '@heroui/react';
import { geminiService } from '@/services/geminiService';
import { Asset, WarmContext, Answer, AppSettings } from '@/services/dexieService';
import { useTexts } from '@/hooks/useTexts';

/**
 * Hook to manage Gemini streaming operations.
 * @returns {object} Streaming state and methods.
 */
export function useGeminiStream() {
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const { t } = useTexts();

    const handleError = (err: unknown) => {
        let errorMessage = String(err);
        if (err instanceof Error) {
            errorMessage = err.message;
        }

        // Check for quota exceeded error
        if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            const customError = new Error(t('common.quotaExceeded'));
            setError(customError);
            addToast({ title: t('common.quotaExceeded'), color: 'danger' });
            throw customError;
        }

        const finalError = err instanceof Error ? err : new Error(errorMessage);
        setError(finalError);
        addToast({ title: finalError.message, color: 'danger' });
        throw finalError;
    };

    const streamWarmAnalysis = useCallback(async function* (assets: Asset[], settings: AppSettings) {
        setIsStreaming(true);
        setError(null);
        try {
            const generator = geminiService.warmAnalysis(assets, settings);
            for await (const chunk of generator) {
                yield chunk;
            }
        } catch (err) {
            handleError(err);
        } finally {
            setIsStreaming(false);
        }
    }, [t]);

    const streamSolveTest = useCallback(async function* (questionAssets: Asset[], warmContext: WarmContext | null, mode: 'structured' | 'creative', settings: AppSettings, totalQuestions: number, warmAssets: Asset[] = []) {
        setIsStreaming(true);
        setError(null);
        try {
            const generator = geminiService.solveTest(questionAssets, warmContext, mode, settings, totalQuestions, warmAssets);
            for await (const chunk of generator) {
                yield chunk;
            }
        } catch (err) {
            handleError(err);
        } finally {
            setIsStreaming(false);
        }
    }, [t]);

    const verifyAnswers = useCallback(async (questionAssets: Asset[], answers: Answer[], settings: AppSettings, totalQuestions: number, warmAssets: Asset[] = [], warmContext: WarmContext | null = null) => {
        setError(null);
        try {
            return await geminiService.verifyAnswers(questionAssets, answers, settings, totalQuestions, warmAssets, warmContext);
        } catch (err) {
            handleError(err);
            return answers; // Fallback
        }
    }, [t]);

    const countTokens = useCallback(async (assets: Asset[], settings: AppSettings) => {
        try {
            return await geminiService.countTokens(assets, settings);
        } catch (err) {
            console.error(err);
            return 0;
        }
    }, []);

    return { streamWarmAnalysis, streamSolveTest, verifyAnswers, countTokens, isStreaming, error };
}
