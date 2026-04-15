/**
 * @file src/components/OnboardingModal.tsx
 * @description Modal shown to new users to guide them on setting up their API key.
 */

import React, { useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import { useTexts } from '@/hooks/useTexts';
import { useAppContext } from '@/context/hooks/useAppContext';
import { Key, Settings } from 'lucide-react';

/**
 * OnboardingModal component.
 * Prompts the user to configure their Gemini API key on first use.
 * @returns {JSX.Element | null} The rendered modal.
 */
export function OnboardingModal() {
    const { settings, updateSettings } = useAppContext();
    const { t } = useTexts();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate();

    useEffect(() => {
        if (settings && !settings.hasSeenOnboarding) {
            onOpen();
        }
    }, [settings, onOpen]);

    const handleGotIt = async () => {
        await updateSettings({ hasSeenOnboarding: true });
        onClose();
    };

    const handleGoToSettings = async () => {
        await updateSettings({ hasSeenOnboarding: true });
        onClose();
        navigate('/settings');
    };

    if (!settings) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleGotIt}
            isDismissable={false}
            hideCloseButton
            placement="center"
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    {t('onboarding.title')}
                </ModalHeader>
                <ModalBody>
                    <p className="text-default-700">
                        {t('onboarding.message')}
                    </p>
                    <div className="bg-primary-100 dark:bg-primary-900/40 p-4 rounded-lg mt-2 border border-primary-200 dark:border-primary-700">
                        <p className="text-sm text-primary-900 dark:text-primary-100 mb-3 font-medium">
                            {t('onboarding.aiStudioInfo')}
                        </p>
                        <Button
                            as="a"
                            href="https://aistudio.google.com/app/api-keys"
                            target="_blank"
                            rel="noopener noreferrer"
                            color="primary"
                            variant="flat"
                            startContent={<Key className="w-4 h-4" />}
                            className="w-full"
                        >
                            {t('onboarding.getApiKey')}
                        </Button>
                    </div>
                </ModalBody>
                <ModalFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        color="default"
                        variant="light"
                        onPress={handleGotIt}
                        className="sm:flex-1"
                    >
                        {t('onboarding.gotIt')}
                    </Button>
                    <Button
                        color="primary"
                        onPress={handleGoToSettings}
                        startContent={<Settings className="w-4 h-4" />}
                        className="sm:flex-1"
                    >
                        {t('onboarding.goToSettings')}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
