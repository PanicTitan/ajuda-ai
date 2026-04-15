/**
 * @file src/pages/TestDetail/components/ProvaTab/components/AnswerCard/useAnswerCard.ts
 * @description Hook managing the state and logic for an AnswerCard.
 */

import { useState, useEffect } from 'react';
import { Answer, DrawAnswer } from '@/services/dexieService';
import { geminiService } from '@/services/geminiService';
import { useAppContext } from '@/context/hooks/useAppContext';

/**
 * Hook to manage the state of an individual answer card.
 * Handles image generation for 'draw' type answers.
 * @param {Partial<Answer>} answer - The answer data.
 * @returns {object} Generated image and loading state.
 */
export function useAnswerCard(answer: Partial<Answer>) {
    const { settings } = useAppContext();
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    useEffect(() => {
        if (!settings?.enableImageGeneration) return;

        const dr = answer as Partial<DrawAnswer>;
        const data = dr.drawAnswer || {} as any;
        if (answer.type === 'draw' && data.asciiArt && !generatedImage && !isGeneratingImage && settings) {
            setIsGeneratingImage(true);
            geminiService.generateQuestionImage(`Generate an image based on this description and ASCII art: ${data.explanation}\n${data.asciiArt}`, settings)
                .then(img => {
                    if (img) setGeneratedImage(img);
                })
                .finally(() => setIsGeneratingImage(false));
        }
    }, [answer, generatedImage, isGeneratingImage, settings]);

    return { generatedImage, isGeneratingImage };
}
