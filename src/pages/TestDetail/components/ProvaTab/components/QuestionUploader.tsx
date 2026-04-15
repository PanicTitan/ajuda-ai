/**
 * @file src/pages/TestDetail/components/ProvaTab/components/QuestionUploader.tsx
 * @description Component for uploading question images/PDFs.
 */

import React, { useState } from 'react';
import { FileDropzone } from '@/components/FileDropzone';
import { useTexts } from '@/hooks/useTexts';
import { Asset } from '@/services/dexieService';
import { Button } from '@heroui/react';
import { Camera } from 'lucide-react';
import { CameraModal } from '@/pages/TestDetail/components/ProvaTab/components/CameraModal';
import { AssetViewer } from '@/components/AssetViewer';

/**
 * Props for the QuestionUploader component.
 * @interface QuestionUploaderProps
 * @property {function} onFilesAdded - Callback when files are added.
 * @property {function} onRemoveAsset - Callback to remove an asset.
 * @property {Asset[]} assets - List of currently uploaded assets.
 */
interface QuestionUploaderProps {
    onFilesAdded: (files: File[]) => void;
    onRemoveAsset: (index: number) => void;
    assets: Asset[];
}

/**
 * QuestionUploader component.
 * Handles file uploads and camera captures for test questions.
 * @param {QuestionUploaderProps} props - Component props.
 * @returns {JSX.Element} The rendered component.
 */
export function QuestionUploader({ onFilesAdded, onRemoveAsset, assets }: QuestionUploaderProps) {
    const { t } = useTexts();
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2">
                <Button
                    color="primary"
                    variant="flat"
                    startContent={<Camera className="w-5 h-5" />}
                    onPress={() => setIsCameraOpen(true)}
                    className="flex-1"
                >
                    {t('test.questions.takePhoto')}
                </Button>
            </div>

            <FileDropzone
                onFilesAdded={onFilesAdded}
                accept={{
                    'application/pdf': ['.pdf'],
                    'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
                    'text/plain': ['.txt'],
                }}
            />

            {assets.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold">{t('test.questions.addedQuestions')}</p>
                    <AssetViewer assets={assets} onRemoveAsset={onRemoveAsset} />
                </div>
            )}

            <CameraModal
                isOpen={isCameraOpen}
                onClose={() => setIsCameraOpen(false)}
                onCapture={(files) => {
                    onFilesAdded(files);
                    setIsCameraOpen(false);
                }}
            />
        </div>
    );
}
