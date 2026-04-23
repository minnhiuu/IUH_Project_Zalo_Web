import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTranslation } from 'react-i18next'
import { Laptop, MapPin, Clock, AlertTriangle, ShieldCheck } from 'lucide-react'
import { format } from 'date-fns'

export interface NewDeviceLoginData {
  deviceName: string
  ipAddress: string
  loginTime: string
  sessionId: string
}

export function NewDeviceLoginModal() {
  const { t } = useTranslation('notification')
  const [data, setData] = useState<NewDeviceLoginData | null>(null)

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<NewDeviceLoginData>
      setData(customEvent.detail)
    }

    window.addEventListener('open-new-device-login-modal', handleOpen)
    return () => window.removeEventListener('open-new-device-login-modal', handleOpen)
  }, [])

  if (!data) return null

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return 'Unknown'
    try {
      const date = new Date(timeStr)
      if (isNaN(date.getTime())) return timeStr
      return format(date, 'dd/MM/yyyy HH:mm')
    } catch {
      return timeStr
    }
  }

  return (
    <Dialog open={!!data} onOpenChange={(open) => !open && setData(null)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="items-center sm:text-center pb-2">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
          <DialogTitle className="text-xl">{t('notification.newDeviceLogin.title')}</DialogTitle>
          <DialogDescription className="text-center pt-2">
            {t('notification.newDeviceLogin.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-secondary/50 p-4 rounded-xl space-y-4 mb-2 mt-2">
          <div className="flex items-start gap-3 border-b border-border/50 pb-3">
            <Laptop className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{t('notification.newDeviceLogin.device')}</p>
              <p className="font-medium text-sm">{data.deviceName || t('notification.newDeviceLogin.unknown')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 border-b border-border/50 pb-3">
            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{t('notification.newDeviceLogin.ipAddress')}</p>
              <p className="font-medium text-sm">{data.ipAddress || t('notification.newDeviceLogin.unknown')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{t('notification.newDeviceLogin.time')}</p>
              <p className="font-medium text-sm">{formatTime(data.loginTime)}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-100 dark:border-red-900/50 flex gap-2">
          <ShieldCheck className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[13px] text-red-700 dark:text-red-400 leading-relaxed">
            {t('notification.newDeviceLogin.warning')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
