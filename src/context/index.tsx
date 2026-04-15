/**
 * @file src/context/index.tsx
 * @description Global application context provider for settings, texts, and theme.
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { HeroUIProvider, ToastProvider } from '@heroui/react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { AppSettings, getSettings, updateSettings as dbUpdateSettings } from '@/services/dexieService';
import { texts } from '@/texts';

interface AppContextType {
    settings: AppSettings | null;
    updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
    t: (keyPath: string, replacements?: Record<string, string | number>) => string;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
    const [settings, setSettings] = useState<AppSettings | null>(null);

    useEffect(() => {
        getSettings().then(setSettings);
    }, []);

    const updateSettings = async (partial: Partial<AppSettings>) => {
        if (!settings) return;
        const updated = await dbUpdateSettings(partial);
        setSettings(updated);
    };

    const t = (keyPath: string, replacements?: Record<string, string | number>): string => {
        const keys = keyPath.split('.');
        const lang = settings?.language || 'pt';
        let current: any = texts[lang];
        for (const key of keys) {
            if (!current || current[key] === undefined) {
                console.warn(`Translation key not found: ${keyPath} in ${lang}`);
                return keyPath;
            }
            current = current[key];
        }

        let result = current as string;
        if (replacements) {
            Object.entries(replacements).forEach(([key, value]) => {
                result = result.replace(`{${key}}`, String(value));
            });
        }
        return result;
    };

    if (!settings) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <AppContext.Provider value={{ settings, updateSettings, t }}>
            <HeroUIProvider>
                <NextThemesProvider
                    attribute="class"
                    defaultTheme={settings.theme}
                    enableSystem={false}
                    forcedTheme={settings.stealthMode ? 'dark' : undefined}
                >
                    <ToastProvider />
                    {children}
                </NextThemesProvider>
            </HeroUIProvider>
        </AppContext.Provider>
    );
}
