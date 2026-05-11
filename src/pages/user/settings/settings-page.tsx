import { Settings } from 'lucide-react'
import { SettingsContent } from '@/features/user-settings/components/settings-dialog/settings-content'

export default function SettingsPage() {
  return (
    <div className='flex w-full h-full overflow-hidden bg-background'>
      <div className='w-full flex flex-col'>
        {/* Header */}
        <div className='px-6 py-4 border-b border-border shrink-0'>
          <div className='flex items-center gap-3'>
            <Settings className='w-6 h-6 text-primary' />
            <h1 className='text-2xl font-semibold'>Cài đặt</h1>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-hidden'>
          <SettingsContent />
        </div>
      </div>
    </div>
  )
}
