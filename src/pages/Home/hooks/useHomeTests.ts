/**
 * @file src/pages/Home/hooks/useHomeTests.ts
 * @description Hook to manage tests on the Home page.
 */

import { useState, useEffect, useCallback } from 'react';
import { getAllTests, Test } from '@/services/dexieService';

/**
 * Hook to manage the list of tests for the home page.
 * @returns {object} Tests data, loading state, and refresh function.
 */
export function useHomeTests() {
    const [tests, setTests] = useState<Test[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTests = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAllTests();
            setTests(data);
        } catch (error) {
            console.error('Failed to fetch tests', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTests();
    }, [fetchTests]);

    return { tests, isLoading, refresh: fetchTests };
}
