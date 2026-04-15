/**
 * @file src/pages/Settings.tsx
 * @description Settings page for configuring the application.
 */

import React, { useState, useEffect } from 'react';
import { Input, Select, SelectItem, Switch, Button, Card, CardBody, CardHeader, Divider } from '@heroui/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/hooks/useAppContext';
import { useTexts } from '@/hooks/useTexts';
import { AppSettings } from '@/services/dexieService';
import { usePWA } from '@/hooks/usePWA';
import { Download } from 'lucide-react';

/**
 * Settings page component.
 * Allows users to configure API keys, models, language, and other application preferences.
 * @returns {JSX.Element} The rendered page.
 */
export default function Settings() {
    const { settings, updateSettings } = useAppContext();
    const { t } = useTexts();
    const navigate = useNavigate();
    const { isInstallable, isInstalled, install } = usePWA();
    const [localSettings, setLocalSettings] = useState<AppSettings | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (settings) {
            setLocalSettings(settings);
        }
    }, [settings]);

    if (!localSettings) return <div className="p-8 text-center">{t('common.loading')}</div>;

    const handleSave = async () => {
        setIsSaving(true);
        await updateSettings(localSettings);
        setIsSaving(false);
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-6">
            <div className="max-w-3xl mx-auto">
                <header className="flex items-center gap-4 mb-8">
                    <Button isIconOnly variant="light" onPress={() => navigate(-1)}>
                        <ArrowLeft />
                    </Button>
                    <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
                </header>

                <div className="bg-warning-50 dark:bg-warning-900/20 p-4 rounded-lg mb-8 border border-warning-200 dark:border-warning-800">
                    <h3 className="text-warning-800 dark:text-warning-200 font-bold mb-1">
                        {t('security.warningTitle')}
                    </h3>
                    <p className="text-sm text-warning-700 dark:text-warning-300">
                        {t('security.warningMessage')}
                    </p>
                </div>

                <Card className="mb-8">
                    <CardHeader className="font-semibold text-lg">{t('settings.general')}</CardHeader>
                    <Divider />
                    <CardBody className="gap-6">
                        <Input
                            label={t('settings.apiKey')}
                            placeholder="AIzaSy..."
                            type="password"
                            variant="bordered"
                            value={localSettings.apiKey}
                            onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                        />

                        <Select
                            label={t('settings.language')}
                            selectedKeys={[localSettings.language]}
                            onChange={(e) => setLocalSettings({ ...localSettings, language: e.target.value as any })}
                        >
                            <SelectItem key="pt">{t('settings.languageOptions.pt')}</SelectItem>
                            <SelectItem key="en">{t('settings.languageOptions.en')}</SelectItem>
                        </Select>

                        <Select
                            label={t('settings.model')}
                            selectedKeys={[localSettings.model]}
                            onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value as any })}
                        >
                            <SelectItem key="gemini-3.1-pro-preview">{t('settings.modelOptions.pro')}</SelectItem>
                            <SelectItem key="gemini-3.1-flash-lite-preview">{t('settings.modelOptions.flash')}</SelectItem>
                            <SelectItem key="gemini-3-flash-preview">{t('settings.modelOptions.flashOld')}</SelectItem>
                        </Select>

                        <Select
                            label={t('settings.imageModel')}
                            selectedKeys={[localSettings.imageGenModel]}
                            onChange={(e) => setLocalSettings({ ...localSettings, imageGenModel: e.target.value as any })}
                        >
                            <SelectItem key="gemini-3.1-flash-image-preview">{t('settings.imageModelOptions.flash')}</SelectItem>
                            <SelectItem key="gemini-3-pro-image-preview">{t('settings.imageModelOptions.pro')}</SelectItem>
                        </Select>

                        <Select
                            label={t('settings.defaultMode')}
                            selectedKeys={[localSettings.defaultTestMode]}
                            onChange={(e) => setLocalSettings({ ...localSettings, defaultTestMode: e.target.value as any })}
                        >
                            <SelectItem key="creative">{t('settings.modeOptions.creative')}</SelectItem>
                            <SelectItem key="structured">{t('settings.modeOptions.structured')}</SelectItem>
                        </Select>

                        <Select
                            label={t('settings.preparationMode')}
                            selectedKeys={[localSettings.preparationMode]}
                            onChange={(e) => setLocalSettings({ ...localSettings, preparationMode: e.target.value as any })}
                        >
                            <SelectItem key="summarize">{t('settings.preparationModeOptions.summarize')}</SelectItem>
                            <SelectItem key="full_attachments">{t('settings.preparationModeOptions.full_attachments')}</SelectItem>
                        </Select>

                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{t('settings.enableImageGeneration')}</span>
                                <Switch
                                    isSelected={localSettings.enableImageGeneration}
                                    onValueChange={(val) => {
                                        const updates: Partial<AppSettings> = { enableImageGeneration: val };
                                        if (!val) {
                                            updates.generateImageInPreparation = false;
                                        }
                                        setLocalSettings({ ...localSettings, ...updates });
                                    }}
                                    color="primary"
                                />
                            </div>
                            <p className="text-xs text-default-500">{t('settings.enableImageGenerationDesc')}</p>
                        </div>

                        {localSettings.preparationMode === 'summarize' && localSettings.enableImageGeneration && (
                            <div className="flex justify-between items-center">
                                <span>{t('settings.generateImageInPreparation')}</span>
                                <Switch
                                    isSelected={localSettings.generateImageInPreparation}
                                    onValueChange={(val) => setLocalSettings({ ...localSettings, generateImageInPreparation: val })}
                                    color="primary"
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{t('settings.enableModelDowngrade')}</span>
                                <Switch
                                    isSelected={localSettings.enableModelDowngrade}
                                    onValueChange={(val) => setLocalSettings({ ...localSettings, enableModelDowngrade: val })}
                                    color="primary"
                                />
                            </div>
                            <p className="text-xs text-default-500">{t('settings.enableModelDowngradeDesc')}</p>
                        </div>

                        <div className="flex flex-col gap-1">
                            <Select
                                label={t('settings.recitationHandling')}
                                selectedKeys={[localSettings.recitationHandlingMode]}
                                onChange={(e) => setLocalSettings({ ...localSettings, recitationHandlingMode: e.target.value as any })}
                            >
                                <SelectItem key="paraphrase">{t('settings.recitationParaphrase')}</SelectItem>
                                <SelectItem key="token_injection">{t('settings.recitationToken')}</SelectItem>
                            </Select>
                            <p className="text-xs text-default-500 mt-1">{t('settings.recitationDesc')}</p>
                        </div>

                        <Input
                            label={t('settings.thinkingBudget')}
                            type="number"
                            variant="bordered"
                            value={localSettings.thinkingBudget.toString()}
                            onChange={(e) => setLocalSettings({ ...localSettings, thinkingBudget: parseInt(e.target.value, 10) || 8192 })}
                        />
                    </CardBody>
                </Card>

                <Card className="mb-8">
                    <CardHeader className="font-semibold text-lg">{t('settings.pwa')}</CardHeader>
                    <Divider />
                    <CardBody className="gap-4">
                        <p className="text-sm text-default-500">
                            {t('settings.installAppDesc')}
                        </p>
                        <Button
                            color={isInstalled ? "success" : "primary"}
                            variant="bordered"
                            startContent={<Download className="w-4 h-4" />}
                            onPress={install}
                            isDisabled={!isInstallable || isInstalled}
                        >
                            {isInstalled
                                ? "Aplicativo Instalado ✓"
                                : isInstallable
                                    ? t('settings.installApp')
                                    : t('settings.alreadyInstalled')}
                        </Button>
                    </CardBody>
                </Card>

                <Card className="mb-8">
                    <CardHeader className="font-semibold text-lg text-danger">{t('settings.stealth')}</CardHeader>
                    <Divider />
                    <CardBody className="gap-6">
                        <div className="flex justify-between items-center">
                            <span>{t('settings.stealth')}</span>
                            <Switch
                                isSelected={localSettings.stealthMode}
                                onValueChange={(val) => setLocalSettings({ ...localSettings, stealthMode: val })}
                                color="danger"
                            />
                        </div>

                        <div className="flex justify-between items-center">
                            <span>{t('settings.vibration')}</span>
                            <Switch
                                isSelected={localSettings.vibrationEnabled}
                                onValueChange={(val) => setLocalSettings({ ...localSettings, vibrationEnabled: val })}
                                color="primary"
                            />
                        </div>
                    </CardBody>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="flat" onPress={() => navigate(-1)}>
                        {t('common.cancel')}
                    </Button>
                    <Button color="primary" onPress={handleSave} isLoading={isSaving} startContent={<Save className="w-4 h-4" />}>
                        {t('common.save')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
