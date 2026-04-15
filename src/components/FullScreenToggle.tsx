/**
 * @file src/components/FullScreenToggle.tsx
 * @description Button to toggle full screen mode.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@heroui/react';
import { Maximize, Minimize } from 'lucide-react';

/**
 * FullScreenToggle component.
 * Provides a button to toggle the browser's full-screen mode.
 * @returns {JSX.Element} The rendered component.
 */
export function FullScreenToggle() {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                }
            }
        } catch (err) {
            console.error("Error attempting to enable full-screen mode:", err);
        }
    };

    return (
        <Button
            isIconOnly
            variant="light"
            onPress={toggleFullscreen}
            aria-label="Toggle Full Screen"
        >
            {isFullscreen ? <Minimize className="w-5 h-5 sm:w-6 sm:h-6" /> : <Maximize className="w-5 h-5 sm:w-6 sm:h-6" />}
        </Button>
    );
}
