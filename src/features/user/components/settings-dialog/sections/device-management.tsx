import { Loader2, ArrowLeft, LogOut } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getErrorMessage } from '@/utils/error-handler'
import { useMyDevices, useDeleteDevice, useLogoutOtherDevices } from '@/features/user/queries/use-devices'
import type { DeviceResponse } from '@/features/user/types/device.types'
import { DeviceItem } from './device-item'
import { motion, AnimatePresence } from 'framer-motion'

interface DeviceManagementProps {
  onBack?: () => void
}

export function DeviceManagement({ onBack }: DeviceManagementProps) {
  const { text } = useUserText()
  const { data: devices, isLoading: isLoadingDevices } = useMyDevices()
  const deleteDeviceMutation = useDeleteDevice()
  const logoutOtherDevicesMutation = useLogoutOtherDevices()

  const handleDeleteDevice = async (deviceId: string) => {
    if (!window.confirm(text.settings.accountPrivacy.deviceManagement.deleteConfirm)) {
      return
    }

    try {
      await deleteDeviceMutation.mutateAsync(deviceId)
      toast.success(text.settings.accountPrivacy.deviceManagement.deleteSuccess)
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage || text.settings.accountPrivacy.deviceManagement.deleteError)
    }
  }

  const handleLogoutOtherDevices = async () => {
    if (!window.confirm(text.settings.accountPrivacy.deviceManagement.logoutOthersConfirm || 'Are you sure you want to log out of all other devices?')) {
      return
    }

    try {
      await logoutOtherDevicesMutation.mutateAsync()
      toast.success(text.settings.accountPrivacy.deviceManagement.logoutOthersSuccess || 'Logged out of all other devices')
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage || text.settings.accountPrivacy.deviceManagement.logoutOthersError || 'Failed to log out of other devices')
    }
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <div className='flex items-center gap-3'>
          {onBack && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onBack}
              className='gap-1 px-2 h-8 text-muted-foreground hover:text-foreground shrink-0'
            >
              <ArrowLeft className='w-4 h-4' />
            </Button>
          )}
          <div className='flex-1'>
            <h2 className='text-lg font-semibold text-foreground'>
              {text.settings.accountPrivacy.deviceManagement.title}
            </h2>
          </div>
        </div>
        <p className='text-xs text-muted-foreground'>{text.settings.accountPrivacy.deviceManagement.description}</p>
      </div>

      {isLoadingDevices ? (
        <div className='flex items-center justify-center py-8'>
          <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
          <span className='ml-3 text-sm text-muted-foreground'>
            {text.settings.accountPrivacy.deviceManagement.loading}
          </span>
        </div>
      ) : devices && devices.length > 0 ? (
        <>
          <div className='space-y-4'>
            {devices.some(d => d.isActive) && (
              <div className='space-y-2'>
                <h3 className='text-sm font-medium text-muted-foreground px-1'>
                  {text.settings.accountPrivacy.deviceManagement.activeDevices}
                </h3>
                <div className='space-y-2'>
                  <AnimatePresence mode='popLayout'>
                    {devices
                      .filter(d => d.isActive)
                      .map((device: DeviceResponse) => (
                        <motion.div
                          key={device.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                        >
                          <DeviceItem
                            device={device}
                            onDelete={handleDeleteDevice}
                            isDeleting={deleteDeviceMutation.isPending}
                            text={text}
                          />
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {devices.some(d => !d.isActive) && (
              <div className='space-y-2'>
                <h3 className='text-sm font-medium text-muted-foreground px-1'>
                  {text.settings.accountPrivacy.deviceManagement.inactiveDevices}
                </h3>
                <div className='space-y-2'>
                  <AnimatePresence mode='popLayout'>
                    {devices
                      .filter(d => !d.isActive)
                      .map((device: DeviceResponse) => (
                        <motion.div
                          key={device.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <DeviceItem
                            device={device}
                            onDelete={handleDeleteDevice}
                            isDeleting={deleteDeviceMutation.isPending}
                            text={text}
                          />
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          <Separator className='my-4' />

          <div className='flex justify-center'>
            <Button
              variant='ghost'
              className='text-destructive hover:text-destructive hover:bg-destructive/10 w-full'
              onClick={handleLogoutOtherDevices}
              disabled={logoutOtherDevicesMutation.isPending || devices.length <= 1}
            >
              {logoutOtherDevicesMutation.isPending ? (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              ) : (
                <LogOut className='w-4 h-4 mr-2' />
              )}
              {text.settings.accountPrivacy.deviceManagement.logoutOthers || 'Log out of other devices'}
            </Button>
          </div>
        </>
      ) : (
        <div className='text-center py-8 text-sm text-muted-foreground'>
          {text.settings.accountPrivacy.deviceManagement.noDevices}
        </div>
      )}
    </div>
  )
}
