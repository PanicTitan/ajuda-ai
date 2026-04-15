/**
 * @file src/components/ConfirmDialog.tsx
 * @description Reusable confirmation dialog component.
 */

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { AlertTriangle } from 'lucide-react';
import { useTexts } from '@/hooks/useTexts';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText,
    cancelText,
    isLoading = false,
}: ConfirmDialogProps) {
    const { t } = useTexts();

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm" placement="center">
            <ModalContent>
                <ModalHeader className="flex gap-2 items-center text-danger">
                    <AlertTriangle className="w-5 h-5" />
                    {title}
                </ModalHeader>
                <ModalBody>
                    <div className="text-default-600 text-sm">
                        {description}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose} isDisabled={isLoading}>
                        {cancelText || t('common.cancel')}
                    </Button>
                    <Button color="danger" onPress={onConfirm} isLoading={isLoading}>
                        {confirmText || t('common.confirm')}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
