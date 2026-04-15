/**
 * @file src/components/FileDropzone.tsx
 * @description Reusable file dropzone component with paste support.
 */

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTexts } from '@/hooks/useTexts';
import { UploadCloud } from 'lucide-react';

/**
 * Props for the FileDropzone component.
 * @interface FileDropzoneProps
 * @property {function} onFilesAdded - Callback when files are added (via drop or paste).
 * @property {Record<string, string[]>} [accept] - Accepted file types.
 * @property {number} [maxFiles] - Maximum number of files allowed.
 */
interface FileDropzoneProps {
    onFilesAdded: (files: File[]) => void;
    accept?: Record<string, string[]>;
    maxFiles?: number;
}

/**
 * FileDropzone component for uploading files.
 * Supports drag and drop, file selection, and clipboard pasting.
 * @param {FileDropzoneProps} props - Component props.
 * @returns {JSX.Element} The rendered component.
 */
export function FileDropzone({ onFilesAdded, accept, maxFiles }: FileDropzoneProps) {
    const { t } = useTexts();
    const [isDragActive, setIsDragActive] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        onFilesAdded(acceptedFiles);
    }, [onFilesAdded]);

    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            const clipboardData = event.clipboardData;
            if (!clipboardData) return;

            // Check for files first (images, etc.)
            const files: File[] = [];
            if (clipboardData.files && clipboardData.files.length > 0) {
                for (let i = 0; i < clipboardData.files.length; i++) {
                    files.push(clipboardData.files[i]);
                }
                onFilesAdded(files);
                return;
            }

            // If no files, check for text
            const text = clipboardData.getData('text/plain');
            if (text && text.trim()) {
                const blob = new Blob([text], { type: 'text/plain' });
                const file = new File([blob], `pasted-text-${Date.now()}.txt`, { type: 'text/plain' });
                onFilesAdded([file]);
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [onFilesAdded]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept,
        maxFiles,
        onDragEnter: () => setIsDragActive(true),
        onDragLeave: () => setIsDragActive(false),
        onDropAccepted: () => setIsDragActive(false),
        onDropRejected: () => setIsDragActive(false),
    });

    return (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-default-300 hover:border-primary'
                }`}
        >
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-12 w-12 text-default-400 mb-4" />
            <p className="text-default-600">
                {t('test.questions.dropzone')}
            </p>
        </div>
    );
}
