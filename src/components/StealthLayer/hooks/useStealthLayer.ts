/**
 * @file src/components/StealthLayer/hooks/useStealthLayer.ts
 * @description Hook managing stealth mode interactions (blackout).
 */

import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/hooks/useAppContext';

/**
 * Hook to manage stealth mode state and interactions.
 * Listens for triple-taps to toggle blackout mode.
 * @returns {object} Stealth state and settings.
 */
export function useStealthLayer() {
    const { settings } = useAppContext();
    const [isBlackout, setIsBlackout] = useState(false);

    const tapCount = useRef(0);
    const tapTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!settings?.stealthMode) {
            setIsBlackout(false);
            return;
        }

        const handlePointerDown = (e: PointerEvent) => {
            // Ignore multi-touch or secondary buttons
            if (!e.isPrimary) return;

            tapCount.current += 1;
            if (tapTimer.current) clearTimeout(tapTimer.current);

            tapTimer.current = setTimeout(() => {
                tapCount.current = 0;
            }, 400); // 400ms window for 3 taps to be very forgiving on mobile

            if (tapCount.current >= 3) {
                setIsBlackout(prev => !prev);
                tapCount.current = 0;
                if (tapTimer.current) clearTimeout(tapTimer.current);
                if (settings.vibrationEnabled && navigator.vibrate) {
                    navigator.vibrate([100, 50, 100]);
                }
            }
        };

        window.addEventListener('pointerdown', handlePointerDown as EventListener, { passive: true });

        return () => {
            window.removeEventListener('pointerdown', handlePointerDown as EventListener);
            if (tapTimer.current) clearTimeout(tapTimer.current);
        };
    }, [settings?.stealthMode, settings?.vibrationEnabled]);

    return {
        isBlackout,
        settings,
    };
}
