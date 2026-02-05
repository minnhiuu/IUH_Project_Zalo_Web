import { useTranslation } from 'react-i18next'
import { Check, Loader2 } from 'lucide-react'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMySettings, useUpdateGeneralSettings } from '@/features/user/queries/use-settings'
import { useEffect } from 'react'

export function GeneralSettings() {
  const { text } = useUserText()
  const { i18n } = useTranslation()
  const { data: settings, isLoading } = useMySettings()
  const updateSettings = useUpdateGeneralSettings()

  const currentLanguage = i18n.language
  const showAllFriends = settings?.generalSettings.showAllFriends ?? false

  // Sync language from settings
  useEffect(() => {
    if (settings?.generalSettings.languageEn !== undefined) {
      const settingsLang = settings.generalSettings.languageEn ? 'en' : 'vi'
      if (i18n.language !== settingsLang) {
        i18n.changeLanguage(settingsLang)
      }
    }
  }, [settings?.generalSettings.languageEn, i18n])

  const handleShowAllFriendsChange = (value: boolean) => {
    updateSettings.mutate({
      showAllFriends: value,
      languageEn: settings?.generalSettings.languageEn ?? false
    })
  }

  const handleLanguageChange = (lang: 'en' | 'vi') => {
    const languageEn = lang === 'en'
    i18n.changeLanguage(lang)
    updateSettings.mutate({
      showAllFriends: settings?.generalSettings.showAllFriends ?? false,
      languageEn
    })
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-semibold text-foreground'>{text.settings.general.title}</h2>

      {/* Show All Friends Setting */}
      <div className='space-y-2'>
        <h3 className='text-sm font-medium text-foreground'>{text.settings.general.showAllFriends.title}</h3>
        <p className='text-xs text-muted-foreground'>{text.settings.general.showAllFriends.description}</p>
        <div className='space-y-1 mt-2'>
          <button
            onClick={() => handleShowAllFriendsChange(false)}
            disabled={updateSettings.isPending}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed',
              !showAllFriends && 'bg-muted'
            )}
          >
            <span>{text.settings.general.showAllFriends.onlyBondhub}</span>
            {!showAllFriends && <Check className='w-4 h-4 text-primary' />}
          </button>
          <button
            onClick={() => handleShowAllFriendsChange(true)}
            disabled={updateSettings.isPending}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed',
              showAllFriends && 'bg-muted'
            )}
          >
            <span>{text.settings.general.showAllFriends.all}</span>
            {showAllFriends && <Check className='w-4 h-4 text-primary' />}
          </button>
        </div>
      </div>

      <Separator />

      {/* Language Setting */}
      <div className='space-y-2'>
        <h3 className='text-sm font-medium text-foreground'>{text.settings.general.language.title}</h3>
        <p className='text-xs text-muted-foreground'>{text.settings.general.language.description}</p>
        <Select
          value={currentLanguage}
          onValueChange={(value) => handleLanguageChange(value as 'en' | 'vi')}
          disabled={updateSettings.isPending}
        >
          <SelectTrigger className='w-full'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent side='bottom' align='start' position='popper' sideOffset={4} className='bg-popover'>
            <SelectItem value='en'>{text.settings.general.language.english}</SelectItem>
            <SelectItem value='vi'>{text.settings.general.language.vietnamese}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
