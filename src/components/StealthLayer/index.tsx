/**
 * @file src/components/StealthLayer/index.tsx
 * @description Global stealth layer component (blackout).
 */

import { useStealthLayer } from '@/components/StealthLayer/hooks/useStealthLayer';

/**
 * StealthLayer component.
 * Handles the blackout screen for discreet use.
 * @returns {JSX.Element | null} The rendered component.
 */
export function StealthLayer() {
    const { isBlackout, settings } = useStealthLayer();

    if (!settings?.stealthMode) return null;

    return (
        <>
            {/* Full Screen Blackout */}
            {isBlackout && (
                <div
                    className="fixed inset-0 bg-black z-[9999] select-none touch-none"
                />
            )}
        </>
    );
}
