/**
 * @file src/components/ThemeToggle.tsx
 * @description Theme toggle component for switching between light and dark modes.
 */

import React from 'react';
import { useTheme } from 'next-themes';
import { Switch } from '@heroui/react';
import { Sun, Moon } from 'lucide-react';
import { useAppContext } from '@/context/hooks/useAppContext';

/**
 * ThemeToggle component.
 * Allows users to switch between light and dark themes.
 * @returns {JSX.Element} The rendered component.
 */
export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const { updateSettings } = useAppContext();

    const handleToggle = (isSelected: boolean) => {
        const newTheme = isSelected ? 'dark' : 'light';
        setTheme(newTheme);
        updateSettings({ theme: newTheme });
    };

    return (
        <Switch
            isSelected={theme === 'dark'}
            onValueChange={handleToggle}
            size="lg"
            color="primary"
            startContent={<Moon />}
            endContent={<Sun />}
        />
    );
}
