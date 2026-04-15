/**
 * @file src/components/AssetViewer.tsx
 * @description Component to display and manage uploaded assets (images, PDFs, audio).
 */

import React, { useState } from 'react';
import { X, FileText, File as FileIcon, Music, Eye } from 'lucide-react';
import { Modal, ModalContent, ModalBody, ModalHeader, useDisclosure, Button } from '@heroui/react';
import { Asset } from '@/services/dexieService';

/**
 * Props for the AssetViewer component.
 * @interface AssetViewerProps
 * @property {Asset[]} assets - List of assets to display.
 * @property {function} [onRemoveAsset] - Optional callback to remove an asset.
 */
interface AssetViewerProps {
    assets: Asset[];
    onRemoveAsset?: (index: number, assetId?: number) => void;
}

/**
 * AssetViewer component for displaying uploaded files with preview capabilities.
 * @param {AssetViewerProps} props - Component props.
 * @returns {JSX.Element | null} The rendered component.
 */
export function AssetViewer({ assets, onRemoveAsset }: AssetViewerProps) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);

    if (assets.length === 0) return null;

    /**
     * Handles clicking on an image to show it in a modal.
     * @param {string} url - The data URL of the image.
     * @param {string} name - The name of the image.
     */
    const handleImageClick = (url: string, name: string) => {
        setSelectedImage({ url, name });
        onOpen();
    };

    return (
        <>
            <div className="flex flex-wrap gap-4">
                {assets.map((asset, index) => {
                    const isImage = asset.mimeType.startsWith('image/');
                    const dataUrl = isImage ? `data:${asset.mimeType};base64,${asset.base64Data}` : '';

                    return (
                        <div
                            key={asset.id || index}
                            className="relative group w-24 h-24 rounded-lg border border-default-200 overflow-hidden bg-default-100 flex flex-col items-center justify-center p-2 cursor-pointer hover:border-primary transition-colors"
                            onClick={() => isImage && handleImageClick(dataUrl, asset.name)}
                        >
                            {isImage ? (
                                <>
                                    <img
                                        src={dataUrl}
                                        alt={asset.name}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 lg:group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Eye className="text-white w-6 h-6" />
                                    </div>
                                </>
                            ) : asset.mimeType === 'application/pdf' ? (
                                <>
                                    <FileIcon className="w-8 h-8 text-danger mb-1" />
                                    <span className="text-[10px] text-center line-clamp-2 w-full">{asset.name}</span>
                                </>
                            ) : asset.mimeType.startsWith('audio/') ? (
                                <>
                                    <Music className="w-8 h-8 text-primary mb-1" />
                                    <span className="text-[10px] text-center line-clamp-2 w-full">{asset.name}</span>
                                </>
                            ) : (
                                <>
                                    <FileText className="w-8 h-8 text-default-500 mb-1" />
                                    <span className="text-[10px] text-center line-clamp-2 w-full">{asset.name}</span>
                                </>
                            )}

                            {onRemoveAsset && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveAsset(index, asset.id);
                                    }}
                                    className="absolute top-1 right-1 bg-danger text-white rounded-full p-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-20"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="3xl"
                backdrop="blur"
                scrollBehavior="inside"
                placement="center"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">{selectedImage?.name}</ModalHeader>
                            <ModalBody className="p-0 flex items-center justify-center bg-black/5">
                                {selectedImage && (
                                    <img
                                        src={selectedImage.url}
                                        alt={selectedImage.name}
                                        className="max-w-full max-h-[80vh] object-contain"
                                    />
                                )}
                            </ModalBody>
                            <div className="p-4 flex justify-end">
                                <Button color="primary" onPress={onClose}>
                                    Fechar
                                </Button>
                            </div>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
