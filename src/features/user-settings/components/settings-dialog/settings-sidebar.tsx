import {
  Settings as SettingsIcon,
  Shield,
  Lock,
  KeyRound,
  RefreshCw,
  Palette,
  MessageCircle,
  Bell,
  Wrench,
  Smartphone
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type SettingsMenuItem =
  | 'general'
  | 'security'
  | 'privacy'
  | 'sync'
  | 'appearance'
  | 'notification'
  | 'messages'
  | 'utilities'
  | 'changePassword'
  | 'devices'

interface MenuItemConfig {
  id: SettingsMenuItem
  label: string
}

interface SettingsSidebarProps {
  menuItems: MenuItemConfig[]
  activeMenu: SettingsMenuItem
  onSelectMenu: (menu: SettingsMenuItem) => void
}

const menuIcons: Record<SettingsMenuItem, React.ReactNode> = {
  general: <SettingsIcon className='w-4 h-4' />,
  security: <Shield className='w-4 h-4' />,
  privacy: <Lock className='w-4 h-4' />,
  sync: <RefreshCw className='w-4 h-4' />,
  appearance: <Palette className='w-4 h-4' />,
  notification: <Bell className='w-4 h-4' />,
  messages: <MessageCircle className='w-4 h-4' />,
  utilities: <Wrench className='w-4 h-4' />,
  changePassword: <KeyRound className='w-4 h-4' />,
  devices: <Smartphone className='w-4 h-4' />
}

export function SettingsSidebar({ menuItems, activeMenu, onSelectMenu }: SettingsSidebarProps) {
  return (
    <div className='w-64 border-r border-border bg-card dark:bg-muted shrink-0 overflow-y-auto'>
      <div className='p-2 space-y-0.5'>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectMenu(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors text-left',
              activeMenu === item.id
                ? 'bg-primary/10 text-primary font-medium dark:bg-sidebar-accent dark:text-sidebar-foreground'
                : 'hover:bg-muted/50 text-foreground dark:hover:bg-sidebar-accent dark:text-sidebar-foreground'
            )}
          >
            <span
              className={cn(
                activeMenu === item.id
                  ? 'text-primary dark:text-sidebar-foreground'
                  : 'text-muted-foreground dark:text-sidebar-foreground/80'
              )}
            >
              {menuIcons[item.id]}
            </span>
            <span className='flex-1'>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
