import { createContext, useContext, ReactNode } from 'react'
import { useGlobalSearchText } from '../i18n/use-global-search-text'

interface GlobalSearchContextType {
  keyword: string
  text: ReturnType<typeof useGlobalSearchText>['text']
  onClose: () => void
}

const GlobalSearchContext = createContext<GlobalSearchContextType | undefined>(undefined)

export const GlobalSearchProvider = ({ 
  children, 
  keyword, 
  text, 
  onClose 
}: { 
  children: ReactNode; 
  keyword: string; 
  text: ReturnType<typeof useGlobalSearchText>['text']; 
  onClose: () => void 
}) => {
  return (
    <GlobalSearchContext.Provider value={{ keyword, text, onClose }}>
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
