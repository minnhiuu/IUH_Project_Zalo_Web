import { useState } from 'react'
import { LoginForm, QRLoginForm } from '@/features/auth'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [isQR, setIsQR] = useState(true)

  return (
    <div className='w-full flex justify-center perspective-1000'>
      <div className={cn('w-full flex justify-center', !isQR && 'hidden')}>
        <QRLoginForm onSwitchToPassword={() => setIsQR(false)} />
      </div>
      <div className={cn('w-full flex justify-center', isQR && 'hidden')}>
        <LoginForm onSwitchToQR={() => setIsQR(true)} />
      </div>
    </div>
  )
}
