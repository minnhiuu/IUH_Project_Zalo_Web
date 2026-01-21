import { Outlet } from 'react-router'

export default function AuthLayout() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-secondary p-4 font-sans'>
      <Outlet />
    </div>
  )
}
