/**
 * @file src/components/StreamingText.tsx
 * @description Component for rendering streaming text progressively.
 */

import React, { useEffect, useState } from 'react';

/**
 * Props for the StreamingText component.
 * @interface StreamingTextProps
 * @property {string} text - The full text to be displayed.
 * @property {number} [speed=20] - The speed of the streaming effect in milliseconds.
 */
interface StreamingTextProps {
    text: string;
    speed?: number;
}

/**
 * StreamingText component.
 * Progressively displays text character by character to simulate a streaming effect.
 * @param {StreamingTextProps} props - Component props.
 * @returns {JSX.Element} The rendered component.
 */
export function StreamingText({ text, speed = 20 }: StreamingTextProps) {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                setDisplayedText((prev) => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(interval);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    return <span>{displayedText}</span>;
}
