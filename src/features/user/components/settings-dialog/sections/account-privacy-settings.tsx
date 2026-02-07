import { useState } from 'react'
import { Smartphone, ChevronRight, KeyRound } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { Button } from '@/components/ui/button'
import { ChangePassword } from './change-password'
import { motion, AnimatePresence } from 'framer-motion'

interface AccountPrivacySettingsProps {
  onNavigateToDevices?: () => void
}

export function AccountPrivacySettings({ onNavigateToDevices }: AccountPrivacySettingsProps) {
  const { text } = useUserText()
  const [view, setView] = useState<'main' | 'change-password'>('main')

  return (
    <div className='overflow-hidden relative min-h-[400px]'>
      <AnimatePresence mode='wait' initial={false}>
        {view === 'change-password' ? (
          <motion.div
            key='change-password'
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className='absolute inset-0'
          >
            <ChangePassword onBack={() => setView('main')} />
          </motion.div>
        ) : (
          <motion.div
            key='main'
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
          >
            <div className='space-y-4'>
              <h2 className='text-lg font-semibold text-foreground'>{text.settings.accountPrivacy.title}</h2>

              {/* Change Password Section */}
              <div className='space-y-3'>
                <h3 className='text-base font-medium text-foreground'>{text.settings.accountPrivacy.changePassword.title}</h3>
                <div className='rounded-lg border p-4 space-y-4'>
                  <p className='text-xs text-muted-foreground'>{text.settings.accountPrivacy.changePassword.description}</p>
                  <Button onClick={() => setView('change-password')} variant='outline' className='w-full'>
                    <KeyRound className='w-4 h-4 mr-2' />
                    {text.settings.accountPrivacy.changePassword.changeButton}
                    <ChevronRight className='w-4 h-4 ml-auto' />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Device Management Section */}
              <div className='space-y-3'>
                <h3 className='text-base font-medium text-foreground'>{text.settings.accountPrivacy.deviceManagement.title}</h3>
                <div className='rounded-lg border p-4 space-y-4'>
                  <p className='text-xs text-muted-foreground'>{text.settings.accountPrivacy.deviceManagement.description}</p>
                  <Button onClick={onNavigateToDevices} variant='outline' className='w-full'>
                    <Smartphone className='w-4 h-4 mr-2' />
                    {text.settings.accountPrivacy.deviceManagement.showAllButton}
                    <ChevronRight className='w-4 h-4 ml-auto' />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
