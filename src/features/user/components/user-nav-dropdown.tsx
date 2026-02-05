import { User, Settings, Globe, Check } from 'lucide-react'
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
import { useUserText, MyProfileDialog, SettingsDialog } from '@/features/user'
import { useState } from 'react'

import { useLocale } from '@/lib/i18n'

interface UserNavDropdownProps {
  children: React.ReactNode
  dropdownWidth?: number
}

export const UserNavDropdown = ({ children, dropdownWidth = 210 }: UserNavDropdownProps) => {
  const logoutMutation = useLogoutMutation()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const { text } = useUserText()
  const { locale: language, changeLocale: setLocale, languages } = useLocale()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          side='right'
          sideOffset={8}
          style={{ width: dropdownWidth }}
          className='p-1 shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-border animate-in fade-in zoom-in-95 duration-200 bg-white'
        >
          <DropdownMenuItem
            onClick={() => setShowProfileDialog(true)}
            className='flex items-center gap-3 py-2 px-3 cursor-pointer hover:bg-muted focus:bg-muted rounded-md text-[14px] transition-colors outline-none'
          >
            <User className='w-[17px] h-[17px] text-foreground' />
            <span className='flex-1 font-medium'>{text.menu.profile}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setShowSettingsDialog(true)}
            className='flex items-center gap-3 py-2 px-3 cursor-pointer hover:bg-muted focus:bg-muted rounded-md text-[14px] transition-colors outline-none'
          >
            <Settings className='w-[17px] h-[17px] text-foreground' />
            <span className='flex-1 font-medium'>{text.menu.settings}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className='my-1.5 bg-border/40' />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className='flex items-center gap-3 py-2 px-3 cursor-pointer hover:bg-muted focus:bg-muted rounded-md text-[14px] outline-none'>
              <Globe className='w-[17px] h-[17px] text-foreground' />
              <span className='flex-1 font-medium'>{text.menu.language}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              sideOffset={5}
              className='w-44 p-1 shadow-lg border border-border animate-in slide-in-from-left-1 duration-200 bg-white'
            >
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLocale(lang.code)}
                  className='flex items-center justify-between py-1.5 px-3 cursor-pointer hover:bg-muted rounded-md group text-[13.5px] outline-none'
                >
                  <div className='flex items-center gap-3'>
                    <img src={lang.flag} alt={lang.label} className='w-4.5 h-auto object-cover' />
                    <span className='font-medium text-foreground'>{lang.label}</span>
                  </div>
                  {language === lang.code && <Check className='w-3.5 h-3.5 text-primary' />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

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
        <SettingsDialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog} />

        <LogoutConfirmDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} />
        <MyProfileDialog open={showProfileDialog} onOpenChange={setShowProfileDialog} />
      </DropdownMenu>
    </>
  )
}
