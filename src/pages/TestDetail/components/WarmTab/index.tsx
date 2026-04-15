/**
 * @file src/pages/TestDetail/components/WarmTab/index.tsx
 * @description Tab for preparing the AI with study materials.
 */

import React from 'react';
import { Button, Card, CardBody, CardHeader, Divider, Chip, Select, SelectItem, Switch } from '@heroui/react';
import { FileText, Play, CheckCircle2, AlertCircle, Coins } from 'lucide-react';
import { useTexts } from '@/hooks/useTexts';
import { FileDropzone } from '@/components/FileDropzone';
import { useWarmTab } from '@/pages/TestDetail/components/WarmTab/useWarmTab';
import { Test, updateTest } from '@/services/dexieService';
import { AssetViewer } from '@/components/AssetViewer';

interface WarmTabProps {
    test: Test;
    onUpdate: () => void;
}

export function WarmTab({ test, onUpdate }: WarmTabProps) {
    const { t } = useTexts();
    const { assets, handleFilesAdded, handleRemoveAsset, handleAnalyze, isStreaming, partialContext, isDone, error, tokenCount, settings, updateSettings } = useWarmTab(test, onUpdate);

    const contextToDisplay = partialContext || test.warmContext;

    const getTokenCostLevel = (count: number) => {
        if (count <= 50000) return { label: t('test.warm.tokenCostLevels.low'), color: 'success' as const };
        if (count <= 100000) return { label: t('test.warm.tokenCostLevels.medium'), color: 'warning' as const };
        if (count <= 150000) return { label: t('test.warm.tokenCostLevels.high'), color: 'danger' as const };
        return { label: t('test.warm.tokenCostLevels.veryHigh'), color: 'danger' as const };
    };

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:items-center">
                    <div className="flex gap-3">
                        <FileText className="w-6 h-6 text-primary" />
                        <div className="flex flex-col">
                            <p className="text-md font-bold">{t('test.warm.title')}</p>
                            <p className="text-small text-default-500">{t('test.warm.uploadHint')}</p>
                        </div>
                    </div>
                    {settings && (
                        <Select
                            className="w-full sm:w-48"
                            size="sm"
                            label={t('test.warm.preparationMode')}
                            selectedKeys={[settings.preparationMode]}
                            onChange={(e) => updateSettings({ preparationMode: e.target.value as any })}
                        >
                            <SelectItem key="summarize">{t('settings.preparationModeOptions.summarize')}</SelectItem>
                            <SelectItem key="full_attachments">{t('settings.preparationModeOptions.full_attachments')}</SelectItem>
                        </Select>
                    )}
                </CardHeader>
                <Divider />
                <CardBody className="gap-6">
                    {settings?.preparationMode === 'summarize' && settings?.enableImageGeneration && (
                        <div className="flex justify-between items-center bg-default-100 p-3 rounded-lg">
                            <span className="text-sm font-medium">{t('test.warm.generateImage')}</span>
                            <Switch
                                size="sm"
                                isSelected={settings.generateImageInPreparation}
                                onValueChange={(val) => updateSettings({ generateImageInPreparation: val })}
                                color="primary"
                            />
                        </div>
                    )}

                    <FileDropzone
                        onFilesAdded={handleFilesAdded}
                        accept={{
                            'application/pdf': ['.pdf'],
                            'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
                            'audio/*': ['.mp3', '.wav'],
                            'text/plain': ['.txt'],
                        }}
                    />

                    {assets.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-semibold">{t('test.warm.addedFiles')}</p>
                            <AssetViewer assets={assets} onRemoveAsset={handleRemoveAsset} />
                        </div>
                    )}

                    {assets.length > 0 && settings?.preparationMode === 'full_attachments' && tokenCount !== null && (
                        <div className="flex items-center gap-2 bg-default-100 p-3 rounded-lg">
                            <Coins className="w-5 h-5 text-default-500" />
                            <span className="text-sm font-medium">{t('test.warm.tokenCost')}</span>
                            <Chip size="sm" color={getTokenCostLevel(tokenCount).color} variant="flat">
                                {getTokenCostLevel(tokenCount).label} ({tokenCount.toLocaleString()})
                            </Chip>
                        </div>
                    )}

                    {settings?.preparationMode === 'summarize' && (
                        <Button
                            color="primary"
                            startContent={!isStreaming && <Play className="w-4 h-4" />}
                            isLoading={isStreaming}
                            onPress={handleAnalyze}
                            isDisabled={assets.length === 0}
                            className="w-full sm:w-auto self-end mt-4"
                        >
                            {isStreaming ? t('test.warm.analyzing') : test.warmContext ? t('test.warm.reRun') : t('test.warm.title')}
                        </Button>
                    )}
                </CardBody>
            </Card>

            {settings?.preparationMode === 'summarize' && contextToDisplay && (
                <Card className="border-success border-2">
                    <CardHeader className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="text-success w-5 h-5" />
                            <h3 className="text-lg font-bold text-success">{t('test.warm.summaryTitle')}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {isDone && <Chip color="success" variant="flat">{t('test.warm.done')}</Chip>}
                            <Button
                                size="sm"
                                color="danger"
                                variant="flat"
                                onPress={async () => {
                                    await updateTest(test.id!, { warmContext: null });
                                    onUpdate();
                                }}
                            >
                                {t('common.delete')}
                            </Button>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="gap-4">
                        {contextToDisplay.summary && (
                            <div>
                                <p className="text-default-700">{contextToDisplay.summary}</p>
                            </div>
                        )}

                        {contextToDisplay.imageBase64 && settings?.enableImageGeneration && (
                            <div className="mt-4">
                                <h4 className="font-semibold mb-2 text-primary">{t('test.warm.visualSummary')}</h4>
                                <img
                                    src={String(contextToDisplay.imageBase64).trim().startsWith('data:')
                                        ? String(contextToDisplay.imageBase64).trim()
                                        : `data:image/jpeg;base64,${String(contextToDisplay.imageBase64).trim()}`}
                                    alt={t('test.warm.visualSummaryAlt')}
                                    className="max-w-full h-auto rounded-lg border border-default-200"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            {contextToDisplay.keyConcepts && contextToDisplay.keyConcepts.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2 text-primary">{t('test.warm.keyConcepts')}</h4>
                                    <ul className="list-disc list-inside text-sm text-default-600 space-y-1">
                                        {contextToDisplay.keyConcepts.map((concept, i) => <li key={i}>{concept}</li>)}
                                    </ul>
                                </div>
                            )}

                            {contextToDisplay.formulas && contextToDisplay.formulas.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2 text-primary">{t('test.warm.formulas')}</h4>
                                    <ul className="list-disc list-inside text-sm text-default-600 space-y-1">
                                        {contextToDisplay.formulas.map((formula, i) => <li key={i}>{formula}</li>)}
                                    </ul>
                                </div>
                            )}

                            {contextToDisplay.vocabulary && contextToDisplay.vocabulary.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2 text-primary">{t('test.warm.vocabulary')}</h4>
                                    <ul className="list-disc list-inside text-sm text-default-600 space-y-1">
                                        {contextToDisplay.vocabulary.map((word, i) => <li key={i}>{word}</li>)}
                                    </ul>
                                </div>
                            )}

                            {contextToDisplay.predictedTypes && contextToDisplay.predictedTypes.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2 text-primary">{t('test.warm.predictedTypes')}</h4>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {contextToDisplay.predictedTypes.map((type, i) => (
                                            <Chip key={i} size="sm" variant="flat">{type}</Chip>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
