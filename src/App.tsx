import { Toaster } from 'sonner'

import AppRoutes from '@/routes'

export function App() {
  return (
    <>
      <AppRoutes />
      <Toaster
        position='bottom-left'
        richColors
        closeButton
        offset='24px'
        toastOptions={{
          classNames: {
            toast:
              'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg rounded-xl relative',
            title: 'text-zinc-800 dark:text-zinc-100 font-semibold text-sm',
            description: 'text-zinc-500 dark:text-zinc-400 text-xs',
            actionButton: 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900',
            cancelButton: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400',
            closeButton:
              'bg-transparent border-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors !absolute !top-[-3px] !right-[-15px] !left-auto'
          },
          unstyled: false
        }}
      />
    </>
  )
}

export default App
