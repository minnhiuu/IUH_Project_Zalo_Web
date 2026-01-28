import { useState } from 'react'
import { LoginForm, QRLoginForm } from '@/features/auth'

export default function LoginPage() {
  const [isQR, setIsQR] = useState(true)

  return (
    <div className='w-full flex justify-center perspective-1000'>
      {isQR ? (
        <QRLoginForm onSwitchToPassword={() => setIsQR(false)} />
      ) : (
        <LoginForm onSwitchToQR={() => setIsQR(true)} />
      )}
    </div>
  )
}
