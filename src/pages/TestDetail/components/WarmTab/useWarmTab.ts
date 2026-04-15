/**
 * @file src/pages/TestDetail/components/WarmTab/useWarmTab.ts
 * @description Hook managing the state and logic for the WarmTab.
 */

import { useState, useCallback, useEffect } from 'react';
import { useGeminiStream } from '@/hooks/useGeminiStream';
import { useAppContext } from '@/context/hooks/useAppContext';
import { addAsset, getTestAssets, updateTest, deleteAsset, Asset, WarmContext, Test } from '@/services/dexieService';

/**
 * Hook to manage the state and logic for preparing the AI with study materials.
 * @param {Test} test - The test being prepared.
 * @param {function} onUpdate - Callback to trigger a refresh.
 * @returns {object} State and handlers for the WarmTab.
 */
export function useWarmTab(test: Test, onUpdate: () => void) {
    const { settings, updateSettings } = useAppContext();
    const { streamWarmAnalysis, countTokens, isStreaming, error } = useGeminiStream();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [partialContext, setPartialContext] = useState<Partial<WarmContext> | null>(null);
    const [isDone, setIsDone] = useState(false);
    const [tokenCount, setTokenCount] = useState<number | null>(null);

    const fetchAssets = useCallback(async () => {
        if (!test.id) return;
        const data = await getTestAssets(test.id);
        setAssets(data);
        if (settings?.preparationMode === 'full_attachments') {
            const count = await countTokens(data, settings);
            setTokenCount(count);
        }
    }, [test.id, settings, countTokens]);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    const handleFilesAdded = useCallback(async (files: File[]) => {
        if (!test.id) return;
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Data = (e.target?.result as string).split(',')[1];
                await addAsset({
                    testId: test.id!,
                    name: file.name,
                    mimeType: file.type,
                    base64Data,
                });
                fetchAssets();
            };
            reader.readAsDataURL(file);
        }
    }, [test.id, fetchAssets]);

    const handleRemoveAsset = useCallback(async (index: number, assetId?: number) => {
        if (assetId) {
            await deleteAsset(assetId);
            fetchAssets();
        }
    }, [fetchAssets]);

    const handleAnalyze = useCallback(async () => {
        if (!settings || assets.length === 0 || !test.id) return;
        setPartialContext(null);
        setIsDone(false);

        try {
            const generator = streamWarmAnalysis(assets, settings);
            let finalContext: Partial<WarmContext> = {};
            for await (const chunk of generator) {
                finalContext = chunk;
                setPartialContext(chunk);
            }

            // Save to DB
            if (finalContext.summary) {
                await updateTest(test.id, { warmContext: finalContext as WarmContext });
                setIsDone(true);
                onUpdate();
            }
        } catch (err) {
            console.error('Failed to analyze', err);
        }
    }, [assets, settings, test.id, streamWarmAnalysis, onUpdate]);

    return {
        assets,
        handleFilesAdded,
        handleRemoveAsset,
        handleAnalyze,
        isStreaming,
        partialContext,
        isDone,
        error,
        tokenCount,
        settings,
        updateSettings,
    };
}
