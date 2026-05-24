import { User, Settings, Globe, Check, Newspaper, Database, CircleHelp } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu'
import { useLogoutMutation, LogoutConfirmDialog } from '@/features/auth'
import { useUserText, OwnerProfileDialog, SettingsDialog } from '@/features/user'
import { useMySettings, useUpdateGeneralSettings } from '@/features/user-settings'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { PATHS } from '@/constants/path'
import { useLocale } from '@/lib/i18n'

interface UserNavDropdownProps {
  children: React.ReactNode
  dropdownWidth?: number
  isSettings?: boolean
}

export const UserNavDropdown = ({ children, dropdownWidth = 240, isSettings = false }: UserNavDropdownProps) => {
  const logoutMutation = useLogoutMutation()
  const updateGeneralSettings = useUpdateGeneralSettings()
  const { data: settings } = useMySettings()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const { text } = useUserText()
  const { locale: language, changeLocale: setLocale, languages } = useLocale()
  const navigate = useNavigate()

  useEffect(() => {
    if (settings?.generalSettings.languageEn === undefined) return

    const settingsLang = settings.generalSettings.languageEn ? 'en' : 'vi'
    if (settingsLang !== language) {
      setLocale(settingsLang)
    }
  }, [settings?.generalSettings.languageEn, language, setLocale])

  const handleLanguageChange = (nextLang: (typeof languages)[number]['code']) => {
    if (nextLang === language || updateGeneralSettings.isPending) return

    setLocale(nextLang)
    updateGeneralSettings.mutate({
      showAllFriends: settings?.generalSettings.showAllFriends ?? false,
      languageEn: nextLang === 'en'
    })
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          side='right'
          sideOffset={8}
          style={{ width: dropdownWidth }}
          className='p-1 shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-border animate-in fade-in zoom-in-95 duration-200 bg-popover text-popover-foreground'
        >
          <DropdownMenuItem
            onClick={() => setShowProfileDialog(true)}
            className='flex items-center gap-3 py-2 px-3 cursor-pointer hover:bg-muted focus:bg-muted rounded-md text-[14px] transition-colors outline-none'
          >
            <User className='w-[17px] h-[17px]' />
            <span className='flex-1 font-medium'>{text.menu.profile}</span>
          </DropdownMenuItem>

          {!isSettings && (
            <DropdownMenuItem
              onClick={() => navigate(PATHS.USER.PROFILE)}
              className='flex items-center gap-3 py-2 px-3 cursor-pointer hover:bg-muted focus:bg-muted rounded-md text-[14px] transition-colors outline-none'
            >
              <Newspaper className='w-[17px] h-[17px]' />
              <span className='flex-1 font-medium'>My Profile</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() => setShowSettingsDialog(true)}
            className='flex items-center gap-3 py-2 px-3 cursor-pointer hover:bg-muted focus:bg-muted rounded-md text-[14px] transition-colors outline-none'
          >
            <Settings className='w-[17px] h-[17px]' />
            <span className='flex-1 font-medium'>{text.menu.settings}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className='my-1.5 bg-border/40' />

          {isSettings && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className='flex items-center gap-3 py-2 px-3 cursor-pointer hover:bg-muted focus:bg-muted rounded-md text-[14px] outline-none group'>
                <Database className='w-[17px] h-[17px]' />
                <span className='flex-1 font-medium'>{text.menu.data}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent
                sideOffset={5}
                className='w-44 p-1 shadow-lg border border-border animate-in slide-in-from-left-1 duration-200 bg-popover text-popover-foreground'
              >
                <DropdownMenuItem className='py-1.5 px-3 cursor-pointer hover:bg-muted rounded-md text-[13.5px] outline-none'>
                  Quản lý dữ liệu
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className='flex items-center gap-3 py-2 px-3 cursor-pointer hover:bg-muted focus:bg-muted rounded-md text-[14px] outline-none'>
              <Globe className='w-[17px] h-[17px]' />
              <span className='flex-1 font-medium'>{text.menu.language}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              sideOffset={5}
              className='w-44 p-1 shadow-lg border border-border animate-in slide-in-from-left-1 duration-200 bg-popover text-popover-foreground'
            >
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  disabled={updateGeneralSettings.isPending}
                  className='flex items-center justify-between py-1.5 px-3 cursor-pointer hover:bg-muted rounded-md group text-[13.5px] outline-none'
                >
                  <div className='flex items-center gap-3'>
                    <img src={lang.flag} alt={lang.label} className='w-4.5 h-auto object-cover' />
                    <span className='font-medium'>{lang.label}</span>
                  </div>
                  {language === lang.code && <Check className='w-3.5 h-3.5 text-primary' />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {isSettings && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className='flex items-center gap-3 py-2 px-3 cursor-pointer hover:bg-muted focus:bg-muted rounded-md text-[14px] outline-none'>
                <CircleHelp className='w-[17px] h-[17px]' />
                <span className='flex-1 font-medium'>{text.menu.support}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent
                sideOffset={5}
                className='w-44 p-1 shadow-lg border border-border animate-in slide-in-from-left-1 duration-200 bg-popover text-popover-foreground'
              >
                <DropdownMenuItem className='py-1.5 px-3 cursor-pointer hover:bg-muted rounded-md text-[13.5px] outline-none'>
                  Trung tâm hỗ trợ
                </DropdownMenuItem>
                <DropdownMenuItem className='py-1.5 px-3 cursor-pointer hover:bg-muted rounded-md text-[13.5px] outline-none'>
                  Về BondHub
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}

          <DropdownMenuSeparator className='my-1.5 bg-border/40' />

          <DropdownMenuItem
            onClick={() => setShowLogoutDialog(true)}
            disabled={logoutMutation.isPending}
            className='flex items-center gap-3 py-2 px-3 cursor-pointer hover:bg-muted focus:bg-muted rounded-md text-[14px] outline-none group'
          >
            <div className='w-[17px] h-[17px]' />
            <span className='text-destructive group-hover:text-destructive! group-focus:text-destructive! font-medium'>
              {text.menu.logout}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LogoutConfirmDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} />
      <OwnerProfileDialog open={showProfileDialog} onOpenChange={setShowProfileDialog} />
      <SettingsDialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog} />
    </>
  )
}
