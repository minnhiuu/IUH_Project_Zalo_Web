import { useState } from 'react'
import {
  Settings as SettingsIcon,
  Shield,
  Lock,
  RefreshCw,
  Palette,
  MessageCircle,
  Wrench,
  KeyRound,
  Smartphone
} from 'lucide-react'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { cn } from '@/lib/utils'
import {
  GeneralSettings,
  SecuritySettings,
  PrivacySettings,
  SyncSettings,
  AppearanceSettings,
  MessagesSettings,
  UtilitiesSettings,
  AccountPrivacySettings,
  DeviceManagement
} from './sections'

type MenuItem =
  | 'general'
  | 'security'
  | 'privacy'
  | 'sync'
  | 'appearance'
  | 'messages'
  | 'utilities'
  | 'accountPrivacy'
  | 'devices'

const menuIcons: Record<MenuItem, React.ReactNode> = {
  general: <SettingsIcon className='w-4 h-4' />,
  security: <Shield className='w-4 h-4' />,
  privacy: <Lock className='w-4 h-4' />,
  sync: <RefreshCw className='w-4 h-4' />,
  appearance: <Palette className='w-4 h-4' />,
  messages: <MessageCircle className='w-4 h-4' />,
  utilities: <Wrench className='w-4 h-4' />,
  accountPrivacy: <KeyRound className='w-4 h-4' />,
  devices: <Smartphone className='w-4 h-4' />
}

export function SettingsContent() {
  const { text } = useUserText()
  const [activeMenu, setActiveMenu] = useState<MenuItem>('general')

  const menuItems: { id: MenuItem; label: string }[] = [
    { id: 'general', label: text.settings.menu.general },
    { id: 'accountPrivacy', label: text.settings.menu.accountPrivacy },
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
        return <PrivacySettings />
      case 'sync':
        return <SyncSettings />
      case 'appearance':
        return <AppearanceSettings />
      case 'messages':
        return <MessagesSettings />
      case 'utilities':
        return <UtilitiesSettings />
      case 'accountPrivacy':
        return <AccountPrivacySettings onNavigateToDevices={() => setActiveMenu('devices')} />
      case 'devices':
        return <DeviceManagement onBack={() => setActiveMenu('accountPrivacy')} />
      default:
        return null
    }
  }

  return (
    <div className='flex h-full overflow-hidden'>
      {/* Left Sidebar Menu */}
      <div className='w-56 border-r border-border bg-muted/20 shrink-0 overflow-y-auto'>
        <div className='p-2 space-y-0.5'>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors text-left',
                activeMenu === item.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-foreground'
              )}
            >
              <span className={cn(activeMenu === item.id ? 'text-primary' : 'text-muted-foreground')}>
                {menuIcons[item.id]}
              </span>
              <span className='flex-1'>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right Content Area */}
      <div className='flex-1 overflow-y-auto min-w-0'>
        <div className='p-6'>{renderContent()}</div>
      </div>
    </div>
  )
}
