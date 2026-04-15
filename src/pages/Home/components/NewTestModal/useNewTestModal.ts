/**
 * @file src/pages/Home/components/NewTestModal/useNewTestModal.ts
 * @description Hook managing the new test modal state and creation logic.
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTest } from '@/services/dexieService';

/**
 * Hook to manage the state and logic for creating a new test.
 * @param {function} onClose - Callback to close the modal after creation.
 * @returns {object} Modal state and creation handler.
 */
export function useNewTestModal(onClose: () => void) {
    const [testName, setTestName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const navigate = useNavigate();

    const handleCreate = useCallback(async () => {
        if (!testName.trim()) return;
        setIsCreating(true);
        try {
            const testId = await createTest(testName.trim());
            onClose();
            navigate(`/test/${testId}`);
        } catch (error) {
            console.error('Failed to create test', error);
            setIsCreating(false);
        }
    }, [testName, navigate, onClose]);

    return { testName, setTestName, isCreating, handleCreate };
}
