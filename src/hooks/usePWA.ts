import { useState, useEffect } from 'react';

/**
 * Hook to handle PWA installation prompt.
 */
export function usePWA() {
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed or running in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        if (isStandalone) {
            setIsInstalled(true);
        }

        // Check if the event was already captured by main.tsx
        if ((window as any).deferredPrompt) {
            console.log('PWA: Using globally captured prompt');
            setInstallPrompt((window as any).deferredPrompt);
            setIsInstallable(true);
        }

        const handler = (e: any) => {
            console.log('PWA: beforeinstallprompt event caught!');
            e.preventDefault();
            setInstallPrompt(e);
            setIsInstallable(true);
            (window as any).deferredPrompt = e;
        };

        const capturedHandler = () => {
            console.log('PWA: Prompt captured by global listener');
            setInstallPrompt((window as any).deferredPrompt);
            setIsInstallable(true);
        };

        const installedHandler = () => {
            console.log('PWA: App was installed successfully');
            setIsInstalled(true);
            setIsInstallable(false);
            (window as any).deferredPrompt = null;
        };

        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('pwa-prompt-captured', capturedHandler);
        window.addEventListener('appinstalled', installedHandler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('pwa-prompt-captured', capturedHandler);
            window.removeEventListener('appinstalled', installedHandler);
        };
    }, []);

    const install = async () => {
        if (!installPrompt) {
            console.warn('PWA: Install prompt called but no event stashed.');
            return;
        }

        // Show the install prompt
        installPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await installPrompt.userChoice;
        console.log(`PWA: User response to install prompt: ${outcome}`);

        if (outcome === 'accepted') {
            setIsInstallable(false);
            setInstallPrompt(null);
        }
    };

    return { isInstallable, isInstalled, install };
}
