import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.tsx'
import { queryClient } from '@/lib/query-client.ts'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from '@/features/auth'
import '@/lib/i18n'
import { LocaleProvider } from '@/lib/i18n'

import { ThemeProvider } from '@/components/theme-provider'
import { STORAGE_KEYS } from '@/utils/local-storage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme='light' storageKey={STORAGE_KEYS.THEME} attribute='class'>
        <LocaleProvider>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </LocaleProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
)
