/**
 * @file src/hooks/useTexts.ts
 * @description Hook to access translated UI strings.
 */

import { useAppContext } from '@/context/hooks/useAppContext';

/**
 * Custom hook for internationalization.
 * @returns {object} Object containing the translation function `t`.
 */
export function useTexts() {
    const { t } = useAppContext();
    return { t };
}
