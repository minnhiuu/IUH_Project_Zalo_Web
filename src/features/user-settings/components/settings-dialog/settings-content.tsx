import { useState } from 'react'
import { useUserText } from '@/features/user/i18n/use-user-text'
import {
  GeneralSettings,
  SecuritySettings,
  PrivacySettings,
  SyncSettings,
  AppearanceSettings,
  MessagesSettings,
  UtilitiesSettings,
  ChangePassword,
  DeviceManagement
} from './sections'
import { SettingsSidebar, type SettingsMenuItem } from './settings-sidebar'
import { SettingsStateProvider } from './settings-state-context'

export function SettingsContent() {
  const { text } = useUserText()
  const [activeMenu, setActiveMenu] = useState<SettingsMenuItem>('general')

  const menuItems: { id: SettingsMenuItem; label: string }[] = [
    { id: 'general', label: text.settings.menu.general },
    { id: 'security', label: text.settings.menu.security },
    { id: 'privacy', label: text.settings.menu.privacy },
    { id: 'sync', label: text.settings.menu.sync },
    { id: 'appearance', label: text.settings.menu.appearance },
    { id: 'messages', label: text.settings.menu.messages },
    { id: 'utilities', label: text.settings.menu.utilities }
  ]

  const renderContent = () => {
    switch (activeMenu) {
      case 'general':
        return <GeneralSettings />
      case 'security':
        return <SecuritySettings />
      case 'privacy':
        return (
          <PrivacySettings
            onNavigateToDevices={() => setActiveMenu('devices')}
            onNavigateToChangePassword={() => setActiveMenu('changePassword')}
          />
        )
      case 'sync':
        return <SyncSettings />
      case 'appearance':
        return <AppearanceSettings />
      case 'messages':
        return <MessagesSettings />
      case 'utilities':
        return <UtilitiesSettings />
      case 'changePassword':
        return <ChangePassword onBack={() => setActiveMenu('privacy')} />
      case 'devices':
        return <DeviceManagement onBack={() => setActiveMenu('privacy')} />
      default:
        return null
    }
  }

  return (
    <SettingsStateProvider>
      <div className='flex h-full overflow-hidden'>
        <SettingsSidebar menuItems={menuItems} activeMenu={activeMenu} onSelectMenu={setActiveMenu} />

        {/* Right Content Area */}
        <div className='flex-1 overflow-y-auto min-w-0 bg-muted dark:bg-sidebar'>
          <div className='p-8 text-[15px] [&_h2]:text-xl [&_h3]:text-lg [&_h4]:text-base [&_p]:text-sm'>
            {renderContent()}
          </div>
        </div>
      </div>
    </SettingsStateProvider>
  )
}
