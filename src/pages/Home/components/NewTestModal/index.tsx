/**
 * @file src/pages/Home/components/NewTestModal/index.tsx
 * @description Modal component for creating a new test.
 */

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from '@heroui/react';
import { useTexts } from '@/hooks/useTexts';
import { useNewTestModal } from '@/pages/Home/components/NewTestModal/useNewTestModal';

/**
 * Props for the NewTestModal component.
 * @interface NewTestModalProps
 * @property {boolean} isOpen - Whether the modal is open.
 * @property {function} onClose - Callback to close the modal.
 */
interface NewTestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * NewTestModal component.
 * Provides a form to enter a name and create a new test.
 * @param {NewTestModalProps} props - Component props.
 * @returns {JSX.Element} The rendered component.
 */
export function NewTestModal({ isOpen, onClose }: NewTestModalProps) {
    const { t } = useTexts();
    const { testName, setTestName, isCreating, handleCreate } = useNewTestModal(onClose);

    return (
        <Modal isOpen={isOpen} onClose={onClose} placement="center">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{t('home.newTest')}</ModalHeader>
                        <ModalBody>
                            <Input
                                autoFocus
                                label={t('home.testNamePlaceholder')}
                                placeholder={t('home.testNamePlaceholder')}
                                variant="bordered"
                                value={testName}
                                onChange={(e) => setTestName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleCreate();
                                    }
                                }}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                {t('common.cancel')}
                            </Button>
                            <Button color="primary" onPress={handleCreate} isLoading={isCreating}>
                                {t('home.createTest')}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
