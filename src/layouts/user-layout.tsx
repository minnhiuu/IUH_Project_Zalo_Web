import { Outlet } from 'react-router'

export default function UserLayout() {
  return (
    <div className='flex h-screen overflow-hidden'>
      <main className='flex-1 overflow-y-auto'>
        <Outlet />
      </main>
    </div>
  )
}
