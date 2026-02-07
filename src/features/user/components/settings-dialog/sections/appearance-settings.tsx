import { Check, Loader2, Sun, Moon, Laptop } from 'lucide-react'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

export function AppearanceSettings() {
  const { text } = useUserText()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
  }

  if (!mounted) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-semibold text-foreground'>{text.settings.appearance.title}</h2>

      <div className='space-y-3'>
        <h3 className='text-sm font-medium text-foreground'>{text.settings.appearance.theme.title}</h3>
        <div className='rounded-lg border p-4'>
          <p className='text-xs text-muted-foreground'>{text.settings.appearance.theme.description}</p>

          <div className='grid grid-cols-3 gap-3 mt-3'>
            {/* Light Mode Option */}
            <button
              onClick={() => handleThemeChange('light')}
              className={cn(
                'relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all hover:border-primary/50',
                theme === 'light' ? 'border-primary bg-primary/5' : 'border-border bg-background'
              )}
            >
              {/* Light Mode Visual Demo */}
              <div className='w-full aspect-video rounded-md overflow-hidden border border-border bg-white shadow-sm'>
                <div className='h-full flex flex-col'>
                  <div className='h-8 bg-gray-100 border-b border-gray-200 flex items-center px-2 gap-1'>
                    <div className='w-2 h-2 rounded-full bg-red-400'></div>
                    <div className='w-2 h-2 rounded-full bg-yellow-400'></div>
                    <div className='w-2 h-2 rounded-full bg-green-400'></div>
                  </div>
                  <div className='flex-1 p-2 space-y-1.5'>
                    <div className='h-2 bg-gray-300 rounded w-3/4'></div>
                    <div className='h-2 bg-gray-300 rounded w-full'></div>
                    <div className='h-2 bg-gray-300 rounded w-5/6'></div>
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <Sun className='w-4 h-4 text-yellow-600' />
                <span className='text-sm font-medium'>{text.settings.appearance.theme.light}</span>
              </div>

              {theme === 'light' && (
                <div className='absolute top-2 right-2 bg-primary rounded-full p-1'>
                  <Check className='w-3 h-3 text-primary-foreground' />
                </div>
              )}
            </button>

            {/* Dark Mode Option */}
            <button
              onClick={() => handleThemeChange('dark')}
              className={cn(
                'relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all hover:border-primary/50',
                theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border bg-background'
              )}
            >
              {/* Dark Mode Visual Demo */}
              <div className='w-full aspect-video rounded-md overflow-hidden border border-gray-700 bg-gray-900 shadow-sm'>
                <div className='h-full flex flex-col'>
                  <div className='h-8 bg-gray-800 border-b border-gray-700 flex items-center px-2 gap-1'>
                    <div className='w-2 h-2 rounded-full bg-red-400'></div>
                    <div className='w-2 h-2 rounded-full bg-yellow-400'></div>
                    <div className='w-2 h-2 rounded-full bg-green-400'></div>
                  </div>
                  <div className='flex-1 p-2 space-y-1.5'>
                    <div className='h-2 bg-gray-700 rounded w-3/4'></div>
                    <div className='h-2 bg-gray-700 rounded w-full'></div>
                    <div className='h-2 bg-gray-700 rounded w-5/6'></div>
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <Moon className='w-4 h-4 text-blue-400' />
                <span className='text-sm font-medium'>{text.settings.appearance.theme.dark}</span>
              </div>

              {theme === 'dark' && (
                <div className='absolute top-2 right-2 bg-primary rounded-full p-1'>
                  <Check className='w-3 h-3 text-primary-foreground' />
                </div>
              )}
            </button>

            {/* System Mode Option */}
            <button
              onClick={() => handleThemeChange('system')}
              className={cn(
                'relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all hover:border-primary/50',
                theme === 'system' ? 'border-primary bg-primary/5' : 'border-border bg-background'
              )}
            >
              {/* System Mode Visual Demo */}
              <div className='w-full aspect-video rounded-md overflow-hidden border border-border bg-linear-to-r from-white to-gray-900 shadow-sm'>
                <div className='h-full flex'>
                  <div className='flex-1 flex flex-col bg-white'>
                    <div className='h-8 bg-gray-100 border-b border-gray-200 flex items-center px-1 gap-0.5'>
                      <div className='w-1.5 h-1.5 rounded-full bg-red-400'></div>
                      <div className='w-1.5 h-1.5 rounded-full bg-yellow-400'></div>
                    </div>
                    <div className='flex-1 p-1 space-y-1'>
                      <div className='h-1.5 bg-gray-300 rounded w-3/4'></div>
                      <div className='h-1.5 bg-gray-300 rounded w-full'></div>
                    </div>
                  </div>
                  <div className='flex-1 flex flex-col bg-gray-900'>
                    <div className='h-8 bg-gray-800 border-b border-gray-700 flex items-center px-1 gap-0.5'>
                      <div className='w-1.5 h-1.5 rounded-full bg-red-400'></div>
                      <div className='w-1.5 h-1.5 rounded-full bg-yellow-400'></div>
                    </div>
                    <div className='flex-1 p-1 space-y-1'>
                      <div className='h-1.5 bg-gray-700 rounded w-3/4'></div>
                      <div className='h-1.5 bg-gray-700 rounded w-full'></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <Laptop className='w-4 h-4 text-muted-foreground' />
                <span className='text-sm font-medium'>{text.settings.appearance.theme.system}</span>
              </div>

              {theme === 'system' && (
                <div className='absolute top-2 right-2 bg-primary rounded-full p-1'>
                  <Check className='w-3 h-3 text-primary-foreground' />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
