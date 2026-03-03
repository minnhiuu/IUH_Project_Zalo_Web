import { useState } from 'react'
import {
  Dialog,
  DialogContent
} from '@/components/ui/dialog'
import { X, Shield, ChevronRight, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BlockedUsersSection } from './blocked-users-section'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SETTINGS_SECTIONS = [
  { id: 'privacy', label: 'Quyền riêng tư', icon: Shield },
] as const

type SettingsSectionId = typeof SETTINGS_SECTIONS[number]['id']

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('privacy')
  const [showBlockedList, setShowBlockedList] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setShowBlockedList(false)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='!max-w-[70vw] w-[70vw] h-[90vh] p-0 gap-0 overflow-hidden' showCloseButton={false}>
        <div className='flex h-full overflow-hidden'>
          {/* Sidebar Menu */}
          <div className='w-[280px] border-r border-border bg-muted/30 overflow-y-auto'>
            <div className='p-3 space-y-1'>
              {SETTINGS_SECTIONS.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id)
                      setShowBlockedList(false)
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-md text-[15px] font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className='w-5 h-5' />
                    {section.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className='flex-1 overflow-y-auto bg-background'>
            <div className='p-8'>
              {activeSection === 'privacy' && !showBlockedList && (
                <div className='space-y-8'>
                  <div>
                    <h3 className='text-2xl font-semibold mb-2'>Quyền riêng tư</h3>
                    <p className='text-sm text-muted-foreground'>
                      Quản lý quyền riêng tư và bảo mật của bạn
                    </p>
                  </div>

                  {/* Chặn tin nhắn Section */}
                  <div className='space-y-3'>
                    <h4 className='text-base font-semibold text-foreground'>Chặn tin nhắn</h4>
                    
                    {/* Danh sách chặn - Clickable */}
                    <button
                      onClick={() => setShowBlockedList(true)}
                      className='w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left'
                    >
                      <span className='text-sm text-foreground'>Danh sách chặn</span>
                      <ChevronRight className='w-5 h-5 text-muted-foreground' />
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'privacy' && showBlockedList && (
                <div className='space-y-6'>
                  {/* Back button */}
                  <button
                    onClick={() => setShowBlockedList(false)}
                    className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
                  >
                    <ArrowLeft className='w-4 h-4' />
                    <span>Quay lại</span>
                  </button>

                  <div>
                    <h3 className='text-2xl font-semibold mb-2'>Danh sách chặn</h3>
                    <p className='text-sm text-muted-foreground'>
                      Quản lý người dùng bạn đã chặn. Bạn có thể bỏ chặn họ bất cứ lúc nào.
                    </p>
                  </div>

                  <BlockedUsersSection />
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
