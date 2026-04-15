/**
 * @file src/pages/TestDetail/hooks/useTestDetail.ts
 * @description Hook managing the test detail page state.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getTest, Test } from '@/services/dexieService';

/**
 * Hook to manage the state of a specific test detail page.
 * @returns {object} Test data, loading state, active tab, and refresh function.
 */
export function useTestDetail() {
    const { testId } = useParams<{ testId: string }>();
    const [test, setTest] = useState<Test | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'warm' | 'prova'>('warm');

    const fetchTest = useCallback(async () => {
        if (!testId) return;
        setIsLoading(true);
        try {
            const data = await getTest(testId);
            if (data) setTest(data);
        } catch (error) {
            console.error('Failed to fetch test', error);
        } finally {
            setIsLoading(false);
        }
    }, [testId]);

    useEffect(() => {
        fetchTest();
    }, [fetchTest]);

    return { test, isLoading, activeTab, setActiveTab, refresh: fetchTest };
}
