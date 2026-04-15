/**
 * @file src/App.tsx
 * @description Main application component.
 */

import { AppProvider } from '@/context';
import { AppRouter } from '@/router';
import { StealthLayer } from '@/components/StealthLayer';

/**
 * Root application component.
 * Wraps the application with necessary providers and global layers.
 * @returns {JSX.Element} The rendered application.
 */
export default function App() {
    return (
        <AppProvider>
            <AppRouter />
            <StealthLayer />
        </AppProvider>
    );
}
