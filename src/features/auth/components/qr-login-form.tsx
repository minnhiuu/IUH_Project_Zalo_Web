import { Menu, Loader2, AlertCircle } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuthText } from '@/features/auth/i18n/use-auth-text'
import { Button } from '@/components/ui/button'
import { QRCodeSVG } from 'qrcode.react'
import { useGenerateQrQuery } from '../queries/use-queries'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuthContext } from '../context/auth-context'
import { useNavigate } from 'react-router'
import { PATHS } from '@/constants/path'
import { UserAvatar } from '@/components/common/user-avatar'
import { QrSessionStatus } from '@/constants/enum'
import { cn } from '@/lib/utils'
import { authApi } from '@/features/auth/api/auth.api'
import { handleErrorApi, getErrorCode } from '@/utils/error-handler'
import { ErrorCode } from '@/constants/error-code'
import { FullScreenLoading } from '@/components/common/full-screen-loading'

interface QRLoginFormProps {
  onSwitchToPassword: () => void
}

export default function QRLoginForm({ onSwitchToPassword }: QRLoginFormProps) {
  const { text } = useAuthText()
  const navigate = useNavigate()
  const { loginSuccess } = useAuthContext()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [scannedUser, setScannedUser] = useState<{ fullName: string; avatar: string } | null>(null)
  const [prevQrId, setPrevQrId] = useState<string | null>(null)
  const [isFinishingLogin, setIsFinishingLogin] = useState(false)

  const { data: qrData, isLoading: isGenerating, isError: isGenError, refetch: refetchQr } = useGenerateQrQuery()
  const qrId = qrData?.qrId

  if (qrId && qrId !== prevQrId) {
    setPrevQrId(qrId)
    setErrorMessage(null)
    setIsExpired(false)
    setScannedUser(null)
  }

  const loginSuccessRef = useRef(loginSuccess)
  const navigateRef = useRef(navigate)
  const textRef = useRef(text)
  const expiresAtRef = useRef<string | null>(null)

  useEffect(() => {
    loginSuccessRef.current = loginSuccess
    navigateRef.current = navigate
    textRef.current = text
  })

  useEffect(() => {
    if (qrData?.expiresAt) expiresAtRef.current = qrData.expiresAt
  }, [qrData])

  const handleRefreshQr = useCallback(() => {
    setIsExpired(false)
    setErrorMessage(null)
    setScannedUser(null)
    refetchQr()
  }, [refetchQr])

  const isExpiredRef = useRef(isExpired)
  useEffect(() => {
    isExpiredRef.current = isExpired
  }, [isExpired])

  useEffect(() => {
    if (!qrId) return

    const currentQrId = qrId
    let isActive = true
    const controller = new AbortController()

    const poll = async (waitingFor: QrSessionStatus) => {
      if (!isActive || isExpiredRef.current) return

      if (expiresAtRef.current) {
        const expiryTime = new Date(expiresAtRef.current).getTime()
        if (new Date().getTime() > expiryTime) {
          if (isActive) {
            setIsExpired(true)
            setScannedUser(null)
          }
          return
        }
      }

      try {
        const res = await authApi.waitQrStatus(currentQrId, waitingFor, controller.signal)
        const data = res.data.data

        if (!isActive || isExpiredRef.current) return

        if (data.status === QrSessionStatus.Confirmed && data.accessToken) {
          setIsFinishingLogin(true)
          try {
            await loginSuccessRef.current(data.accessToken, data.refreshTokenExpirationMs)
            navigateRef.current(PATHS.HOME)
          } catch (loginError: unknown) {
            setIsFinishingLogin(false)
            handleErrorApi({ error: loginError })
            if (isActive) setErrorMessage(textRef.current.qr.loginFailed)
          }
          return
        }

        if (data.status === QrSessionStatus.Scanned) {
          setScannedUser({
            fullName: data.userFullName || '',
            avatar: data.userAvatar || ''
          })
          await poll(QrSessionStatus.Confirmed)
          return
        }

        if (data.status === QrSessionStatus.Rejected) {
          setErrorMessage(textRef.current.qr.rejected)
          setTimeout(() => {
            if (isActive) setErrorMessage(null)
          }, 3000)
          return
        }

        await poll(waitingFor)
      } catch (error: unknown) {
        if (!isActive || isExpiredRef.current || controller.signal.aborted) return

        const code = getErrorCode(error)

        if (code === ErrorCode.QR_SESSION_EXPIRED.toString()) {
          setIsExpired(true)
          setScannedUser(null)
          return
        }

        setTimeout(() => {
          if (isActive && !isExpiredRef.current && !controller.signal.aborted) poll(waitingFor)
        }, 1000)
      }
    }

    poll(QrSessionStatus.Scanned)

    return () => {
      isActive = false
    }
  }, [qrId])

  useEffect(() => {
    if (!qrData?.expiresAt) return
    const expiryTime = new Date(qrData.expiresAt).getTime()
    const now = new Date().getTime()
    const diff = expiryTime - now

    const timer = setTimeout(
      () => {
        setIsExpired(true)
        setScannedUser(null)
      },
      Math.max(0, diff)
    )

    return () => clearTimeout(timer)
  }, [qrData])

  const isScanned = !!scannedUser

  return (
    <>
      {isFinishingLogin && <FullScreenLoading message={text.qr.loggingIn} />}
      <div className='w-full max-w-[450px] bg-white dark:bg-card shadow-[0_8px_28px_rgba(0,0,0,0.06)] dark:shadow-none rounded-xl overflow-hidden border-none transition-all animate-in fade-in zoom-in-95 duration-300'>
        <div className='border-b border-border/60 py-4 relative bg-white dark:bg-card text-center'>
          <p className='text-md font-bold text-foreground tracking-wide'>{text.qr.title}</p>
          <div className='absolute right-2 top-1/2 -translate-y-1/2'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='h-8 w-8 rounded-md hover:bg-accent group mr-2'>
                  <Menu className='h-5 w-5 text-gray-500 transition-colors group-hover:text-foreground' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56 p-1'>
                <DropdownMenuItem onClick={onSwitchToPassword} className='cursor-pointer text-sm font-medium'>
                  {text.qr.loginWithPassword}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className='p-12 bg-white dark:bg-card flex flex-col items-center relative min-h-[400px] justify-center'>
          {errorMessage ? (
            <div className='flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-4'>
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
              {isScanned ? (
                <div className='w-full'>
                  <div className='flex flex-col items-center gap-4 mb-4 animate-in zoom-in-95 duration-500'>
                    <UserAvatar
                      name={scannedUser.fullName}
                      src={scannedUser.avatar}
                      className='h-24 w-24 border-4 border-background shadow-lg'
                      fallbackClassName='text-3xl'
                    />
                    <div className='text-center px-4'>
                      <p className='text-[18px] font-bold text-foreground mb-1'>{scannedUser.fullName}</p>
                      <p className='text-[14px] text-green-600 font-medium animate-pulse'>{text.qr.confirmPhone}</p>
                      <p className='text-[13px] text-muted-foreground mt-2'>{text.qr.scannedSuccess}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='flex flex-col items-center'>
                  <div className='p-4 pt-6 pb-6 border border-border/50 rounded-xl bg-white dark:bg-black/10 flex flex-col items-center relative'>
                    <div
                      className={cn(
                        'transition-all duration-300',
                        isExpired && 'opacity-20 blur-sm pointer-events-none'
                      )}
                    >
                      {isGenerating ? (
                        <div className='w-48 h-48 flex items-center justify-center'>
                          <Loader2 className='h-8 w-8 animate-spin text-primary' />
                        </div>
                      ) : qrData ? (
                        <div className='relative'>
                          <QRCodeSVG
                            value={qrData.qrContent}
                            size={192}
                            level='H'
                            imageSettings={{
                              src: '/images/logo.png',
                              height: 40,
                              width: 40,
                              excavate: true
                            }}
                          />
                        </div>
                      ) : isGenError ? (
                        <div className='w-48 h-48 flex flex-col items-center justify-center text-destructive'>
                          <AlertCircle className='w-8 h-8 mb-2' />
                          <p className='text-xs text-center'>{text.qr.generateError}</p>
                          <Button variant='link' size='sm' onClick={() => refetchQr()}>
                            {text.qr.retry}
                          </Button>
                        </div>
                      ) : (
                        <div className='w-48 h-48 bg-gray-100 rounded-lg' />
                      )}
                    </div>

                    {isExpired && !isGenerating && (
                      <div className='absolute inset-0 flex flex-col items-center justify-center z-10 animate-in fade-in'>
                        <p className='text-[13px] font-bold text-destructive mb-3'>{text.qr.expired}</p>
                        <Button
                          onClick={handleRefreshQr}
                          className='bg-primary hover:bg-primary-hover text-primary-foreground h-8 rounded-full px-6'
                        >
                          {text.qr.refresh}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className='mt-5 flex flex-col items-center text-center'>
                    <p className='text-vibrant-blue text-[15px] font-medium leading-none mb-2'>
                      {text.qr.onlyForLogin}
                    </p>
                    <p className='text-[13px] text-foreground font-medium'>{text.qr.appNameOnPC}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
