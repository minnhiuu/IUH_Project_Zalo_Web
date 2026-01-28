import { Outlet } from 'react-router'

export default function AdminLayout() {
  return (
    <div className='flex h-screen overflow-hidden'>
      <div className='bg-primary/5 w-64 border-r'>Admin Sidebar</div>
      <main className='flex-1 overflow-y-auto px-6 py-8'>
        <Outlet />
      </main>
    </div>
  )
}
