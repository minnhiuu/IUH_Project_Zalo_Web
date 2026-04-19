import { useMemo } from 'react'
import { Button } from './button'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function PaginationCustom({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const paginationItems = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: (number | string)[] = []

    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages)
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
    }

    return pages
  }, [currentPage, totalPages])

  if (totalPages <= 1) return null

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Button
        variant='ghost'
        size='icon'
        className='h-8 w-8 rounded-md border border-section-divider bg-background text-muted-foreground disabled:opacity-30 shadow-none'
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className='h-4 w-4' />
      </Button>

      {paginationItems.map((page, i) => (
        <Button
          key={i}
          variant={page === currentPage ? 'default' : 'ghost'}
          className={cn(
            'h-8 w-8 rounded-md p-0 shadow-none',
            page === currentPage
              ? 'bg-brand-blue text-white'
              : typeof page === 'number'
                ? 'text-muted-foreground hover:bg-muted border border-transparent'
                : 'cursor-default hover:bg-transparent text-muted-foreground/50 border-transparent'
          )}
          disabled={typeof page !== 'number'}
          onClick={() => typeof page === 'number' && onPageChange(page)}
        >
          {page}
        </Button>
      ))}

      <Button
        variant='ghost'
        size='icon'
        className='h-8 w-8 rounded-md border border-section-divider bg-background text-muted-foreground disabled:opacity-30 shadow-none'
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  )
}
