import { QrCode, Menu, Loader2, AlertCircle } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuthText } from '@/features/auth/i18n/use-auth-text'
import { Button } from '@/components/ui/button'
import { QRCodeSVG } from 'qrcode.react'
import { useCheckQrStatusQuery, useGenerateQrQuery } from '../queries/use-queries'
import { useEffect, useState } from 'react'
import { useAuthContext } from '../context/auth-context'
import { useNavigate } from 'react-router'
import { PATHS } from '@/constants/path'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { QrSessionStatus } from '@/constants/enum'
import { cn } from '@/lib/utils'

interface QRLoginFormProps {
  onSwitchToPassword: () => void
}

export default function QRLoginForm({ onSwitchToPassword }: QRLoginFormProps) {
  const { text } = useAuthText()
  const navigate = useNavigate()
  const { loginSuccess } = useAuthContext()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState(false)

  const { data: qrData, isLoading: isGenerating, isError: isGenError, refetch: refetchQr } = useGenerateQrQuery()

  const qrId = qrData?.qrId || ''
  const { data: statusData } = useCheckQrStatusQuery(qrId, !!qrId && !isExpired)

  useEffect(() => {
    if (!qrData?.expiresAt) return

    const expiryTime = new Date(qrData.expiresAt).getTime()
    const now = new Date().getTime()
    const diff = expiryTime - now

    if (diff <= 0) {
      setTimeout(() => setIsExpired(true), 0)
      return
    }

    setTimeout(() => setIsExpired(false), 0)
    const timer = setTimeout(() => {
      setIsExpired(true)
    }, diff)

    return () => clearTimeout(timer)
  }, [qrData])

  const handleRefreshQr = () => {
    setIsExpired(false)
    setErrorMessage(null)
    refetchQr()
  }

  useEffect(() => {
    if (!statusData) return

    if (statusData.status === QrSessionStatus.Confirmed && statusData.accessToken) {
      const handleLoginSuccess = async () => {
        try {
          await loginSuccess(statusData.accessToken!)
          toast.success(text.toast.loginSuccess)
          navigate(PATHS.HOME)
        } catch (error) {
          console.error('Login failed:', error)
          setErrorMessage(text.qr.loginFailed)
        }
      }
      handleLoginSuccess()
    } else if (statusData.status === QrSessionStatus.Rejected && !errorMessage) {
      setTimeout(() => setErrorMessage(text.qr.rejected), 0)
      const timer = setTimeout(() => {
        setErrorMessage(null)
        refetchQr()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [
    statusData,
    loginSuccess,
    navigate,
    text.toast.loginSuccess,
    refetchQr,
    errorMessage,
    text.qr.loginFailed,
    text.qr.rejected
  ])

  const isScanned = statusData?.status === QrSessionStatus.Scanned

  return (
    <div className='w-full max-w-[500px] bg-white shadow-[0_8px_28px_rgba(0,0,0,0.08)] rounded-xl overflow-hidden border border-border/40 px-6 animate-in fade-in zoom-in-95 duration-300'>
      <div className='border-b border-gray-100 py-4 relative bg-white text-center'>
        <p className='text-md font-bold text-foreground tracking-wide'>{text.qr.title}</p>
        <div className='absolute right-2 top-1/2 -translate-y-1/2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='h-8 w-8 rounded-md hover:bg-brand-gray-100 group mr-2'>
                <Menu className='h-5 w-5 text-gray-500 transition-colors group-hover:text-foreground' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56 p-1'>
              <DropdownMenuItem
                onClick={onSwitchToPassword}
                className='cursor-pointer text-sm font-medium focus:bg-brand-gray-100 transition-colors'
              >
                {text.qr.loginWithPassword}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className='p-12 bg-white flex flex-col items-center relative'>
        {isExpired && !errorMessage && !isScanned && (
          <p className='absolute top-6 left-0 right-0 text-center text-[13px] text-destructive font-medium animate-in fade-in slide-in-from-top-2 duration-300'>
            {text.qr.expiredError}
          </p>
        )}
        {errorMessage ? (
          <div className='flex flex-col items-center gap-4 py-8 animate-in fade-in slide-in-from-top-4'>
            <div className='bg-destructive/10 p-3 rounded-full'>
              <AlertCircle className='h-10 w-10 text-destructive' />
            </div>
            <p className='text-sm font-medium text-destructive'>{errorMessage}</p>
            <Button variant='link' size='sm' onClick={handleRefreshQr}>
              {text.qr.retry}
            </Button>
          </div>
        ) : (
          <>
            <div className='p-4 border border-gray-200 rounded-2xl bg-white shadow-sm mb-8 transition-all hover:shadow-md hover:border-primary/20'>
              <div className='w-48 h-48 bg-white flex items-center justify-center relative overflow-hidden group rounded-lg'>
                {isGenerating ? (
                  <div className='flex flex-col items-center gap-2'>
                    <Loader2 className='h-8 w-8 animate-spin text-primary' />
                    <p className='text-xs text-muted-foreground animate-pulse'>{text.qr.generating}</p>
                  </div>
                ) : isGenError ? (
                  <div className='flex flex-col items-center gap-2 px-4 text-center'>
                    <p className='text-xs text-destructive'>{text.qr.generateError}</p>
                    <Button variant='outline' size='sm' onClick={handleRefreshQr} className='h-7 text-[10px]'>
                      {text.qr.retry}
                    </Button>
                  </div>
                ) : isScanned ? (
                  <div className='flex flex-col items-center gap-4 animate-in zoom-in-95 duration-500'>
                    <Avatar className='h-24 w-24 border-2 border-primary/20 p-1 bg-white shadow-sm'>
                      <AvatarImage
                        src={statusData?.userAvatar}
                        alt={statusData?.userFullName}
                        className='rounded-full object-cover'
                      />
                      <AvatarFallback className='bg-primary/5 text-primary text-xl font-bold'>
                        {statusData?.userFullName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='text-center'>
                      <p className='text-md font-bold text-foreground'>{statusData?.userFullName}</p>
                      <p className='text-xs text-muted-foreground mt-1'>{text.qr.scannedSuccess}</p>
                    </div>
                  </div>
                ) : qrData ? (
                  <div className='relative'>
                    <div className={cn('transition-all duration-500', isExpired && 'filter blur-[1.5px] opacity-40')}>
                      <QRCodeSVG
                        value={qrData.qrContent}
                        size={192}
                        level='H'
                        includeMargin={false}
                        imageSettings={{
                          src: '/images/logo.png',
                          x: undefined,
                          y: undefined,
                          height: 40,
                          width: 40,
                          excavate: true
                        }}
                      />
                    </div>
                    {isExpired && (
                      <div className='absolute inset-0 flex flex-col items-center justify-center bg-white/60 rounded-lg animate-in fade-in duration-300 pointer-events-auto'>
                        <p className='text-[13px] font-medium text-foreground mb-3'>{text.qr.expired}</p>
                        <Button
                          onClick={handleRefreshQr}
                          className='bg-vibrant-blue hover:bg-vibrant-blue/90 text-white h-9 px-6 rounded-[4px] text-xs font-bold shadow-sm'
                        >
                          {text.qr.refresh}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <QrCode className='w-40 h-40 text-foreground' />
                )}
                {!isScanned && !isExpired && (
                  <div className='absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none' />
                )}
              </div>
            </div>

            <div className='text-center space-y-2'>
              {isScanned ? (
                <p className='text-sm text-foreground font-medium animate-pulse'>{text.qr.confirmPhone}</p>
              ) : (
                <div className='flex flex-col items-center'>
                  <p className='text-brand-blue text-[15px] font-medium mb-0.5'>{text.qr.onlyForLogin}</p>
                  <p className='text-[13px] text-foreground font-medium'>{text.qr.appNameOnPC}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
