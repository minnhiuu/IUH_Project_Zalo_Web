import type { ReactNode, ElementType } from 'react'

interface ContactPageLayoutProps {
  title: string | ReactNode
  icon?: ElementType
  categoryTitle?: string | ReactNode
  filter?: ReactNode
  children: ReactNode
  className?: string
}

export function ContactPageLayout({
  title,
  icon: Icon,
  categoryTitle,
  filter,
  children,
  className = ''
}: ContactPageLayoutProps) {
  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden bg-(--friend-page-bg) ${className}`}>
      {/* 1. Header (Always Top) - Full Width */}
      <header className='h-[64px] px-[19px] flex items-center gap-2.5 bg-layer-background border-b border-divider-bold shrink-0 z-20'>
        {Icon && <Icon className='w-6 h-6 text-text-primary font-bold' />}
        <h1 className='text-base font-bold text-text-primary leading-6'>{title}</h1>
      </header>

      {/* Wrapper for the rest of the content to provide exactly 16px padding */}
      <div className='flex-1 flex flex-col min-h-0 w-full px-4 overflow-hidden'>
        {/* 2. Category Title (Secondary Header) */}
        {categoryTitle && (
          <div className='h-16 flex items-center justify-between bg-surface-background-subtle text-[14px] font-bold text-text-primary shrink-0'>
            {categoryTitle}
          </div>
        )}

        {/* 3. Filter/Controls Area */}
        {filter && (
          <section className='shrink-0 bg-background z-10'>
            {filter}
          </section>
        )}

        {/* 4. Main Content Area */}
        <main className='flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar'>
          {children}
        </main>
      </div>
    </div>
  )
}
