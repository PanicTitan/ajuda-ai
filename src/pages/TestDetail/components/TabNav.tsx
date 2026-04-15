/**
 * @file src/pages/TestDetail/components/TabNav.tsx
 * @description Tab navigation component for the test detail page.
 */

import React from 'react';
import { Tabs, Tab } from '@heroui/react';
import { useTexts } from '@/hooks/useTexts';

/**
 * Props for the TabNav component.
 * @interface TabNavProps
 * @property {'warm' | 'prova'} activeTab - The currently active tab.
 * @property {function} setActiveTab - Callback to change the active tab.
 */
interface TabNavProps {
    activeTab: 'warm' | 'prova';
    setActiveTab: (tab: 'warm' | 'prova') => void;
}

/**
 * TabNav component.
 * Renders the navigation tabs for the test detail page.
 * @param {TabNavProps} props - Component props.
 * @returns {JSX.Element} The rendered component.
 */
export function TabNav({ activeTab, setActiveTab }: TabNavProps) {
    const { t } = useTexts();

    return (
        <div className="flex w-full flex-col mb-6">
            <Tabs
                aria-label="Options"
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as 'warm' | 'prova')}
                color="primary"
                variant="underlined"
                classNames={{
                    tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                    cursor: "w-full bg-primary",
                    tab: "max-w-fit px-0 h-12",
                    tabContent: "group-data-[selected=true]:text-primary"
                }}
            >
                <Tab key="warm" title={t('test.tabs.warm')} />
                <Tab key="prova" title={t('test.tabs.questions')} />
            </Tabs>
        </div>
    );
}
