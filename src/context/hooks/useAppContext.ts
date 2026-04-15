/**
 * @file src/context/hooks/useAppContext.ts
 * @description Hook to access the global application context.
 */

import { useContext } from 'react';
import { AppContext } from '@/context';

/**
 * Custom hook to access the AppContext.
 * @returns {import('@/context').AppContextType} The application context.
 */
export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
