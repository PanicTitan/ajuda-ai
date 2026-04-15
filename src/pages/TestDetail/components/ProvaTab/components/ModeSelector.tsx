/**
 * @file src/pages/TestDetail/components/ProvaTab/components/ModeSelector.tsx
 * @description Mode selector component (Structured vs Creative).
 */

import React from 'react';
import { RadioGroup, Radio } from '@heroui/react';
import { useTexts } from '@/hooks/useTexts';

/**
 * Props for the ModeSelector component.
 * @interface ModeSelectorProps
 * @property {'structured' | 'creative'} mode - The currently selected mode.
 * @property {function} setMode - Callback to change the mode.
 */
interface ModeSelectorProps {
    mode: 'structured' | 'creative';
    setMode: (mode: 'structured' | 'creative') => void;
}

/**
 * ModeSelector component.
 * Allows the user to choose between 'Structured' and 'Creative' resolution modes.
 * @param {ModeSelectorProps} props - Component props.
 * @returns {JSX.Element} The rendered component.
 */
export function ModeSelector({ mode, setMode }: ModeSelectorProps) {
    const { t } = useTexts();

    return (
        <RadioGroup
            label={t('test.questions.resolutionMode')}
            orientation="horizontal"
            value={mode}
            onValueChange={(val) => setMode(val as 'structured' | 'creative')}
            className="mb-4"
        >
            <Radio value="creative">{t('test.questions.creative')}</Radio>
            <Radio value="structured">{t('test.questions.structured')}</Radio>
        </RadioGroup>
    );
}
