import { createContext, useContext, useState, type ReactNode } from 'react'
import type { SearchTexts } from '../../i18n/search.texts'

interface GlobalSearchContextType {
  keyword: string
  text: SearchTexts['globalSearch']
  activeItemId: string | null
  setActiveItemId: (id: string | null) => void
}

const GlobalSearchContext = createContext<GlobalSearchContextType | undefined>(undefined)

export const GlobalSearchProvider = ({
  children,
  keyword,
  text
}: {
  children: ReactNode
  keyword: string
  text: SearchTexts['globalSearch']
}) => {
  const [activeItemId, setActiveItemId] = useState<string | null>(null)

  return (
    <GlobalSearchContext.Provider value={{ keyword, text, activeItemId, setActiveItemId }}>
      {children}
    </GlobalSearchContext.Provider>
  )
}

export const useGlobalSearchContext = () => {
  const context = useContext(GlobalSearchContext)
  if (context === undefined) {
    throw new Error('useGlobalSearchContext must be used within a GlobalSearchProvider')
  }
  return context
}
