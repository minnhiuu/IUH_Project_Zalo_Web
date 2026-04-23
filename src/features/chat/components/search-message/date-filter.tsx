import { Calendar as CalendarUI } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronDown, ChevronRight, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useChatText } from '../../i18n/use-chat-text'

interface DateFilterProps {
  fromDate: Date | undefined
  toDate: Date | undefined
  setFromDate: (date: Date | undefined) => void
  setToDate: (date: Date | undefined) => void
  sText: ReturnType<typeof useChatText>['text']['searchSidebar']
}

export function DateFilter({ fromDate, toDate, setFromDate, setToDate, sText }: DateFilterProps) {
  const [open, setOpen] = useState(false)
  const [tempFromDate, setTempFromDate] = useState<Date | undefined>(fromDate)
  const [tempToDate, setTempToDate] = useState<Date | undefined>(toDate)

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTempFromDate(fromDate)
      setTempToDate(toDate)
    }
    setOpen(newOpen)
  }

  const setQuickTime = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)
    setTempFromDate(start)
    setTempToDate(end)
  }

  const setQuickMonths = (months: number) => {
    const end = new Date()
    const start = new Date()
    start.setMonth(end.getMonth() - months)
    setTempFromDate(start)
    setTempToDate(end)
  }

  const handleConfirm = () => {
    setFromDate(tempFromDate)
    setToDate(tempToDate)
    setOpen(false)
  }

  const handleCancel = () => {
    setTempFromDate(fromDate)
    setTempToDate(toDate)
    setOpen(false)
  }

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFromDate(undefined)
    setToDate(undefined)
    setTempFromDate(undefined)
    setTempToDate(undefined)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex-1 flex h-[24px] !min-h-[24px] !max-h-[24px] px-1.5 text-[13px] font-normal leading-none rounded-[3px] transition-colors items-center justify-center gap-1 outline-none border-none cursor-pointer overflow-hidden',
            fromDate || toDate
              ? 'bg-(--button-tertiary-neutral-focus-bg) text-(--button-tertiary-neutral-focus-text)'
              : 'bg-(--button-secondary-neutral-normal) text-(--button-secondary-neutral-text) hover:opacity-80'
          )}
        >
          <CalendarIcon className={cn('w-3.5 h-3.5 shrink-0', fromDate || toDate ? 'text-current' : 'opacity-60')} />
          <span className='truncate min-w-0'>
            {fromDate || toDate
              ? `${fromDate ? format(fromDate, 'dd/MM') : '...'} - ${toDate ? format(toDate, 'dd/MM') : '...'}`
              : sText.filterDate}
          </span>
          {fromDate || toDate ? (
            <div
              onClick={handleReset}
              className='p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors shrink-0 ml-auto'
            >
              <X className='w-3 h-3 text-current' />
            </div>
          ) : (
            <ChevronDown className='w-3.5 h-3.5 opacity-60 shrink-0 ml-auto' />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        className='w-[300px] p-0 bg-background border border-border shadow-lg rounded-[8px] z-50 overflow-hidden'
      >
        <div className='flex flex-col p-4'>
          {/* Quick Suggestions */}
          <div className='flex flex-col mb-4'>
            <div
              className='flex items-center justify-between cursor-pointer group hover:opacity-80'
              onClick={(e) => {
                const target = e.currentTarget.nextElementSibling
                if (target) target.classList.toggle('hidden')
                const icon = e.currentTarget.querySelector('.chevron-icon')
                if (icon) icon.classList.toggle('rotate-90')
              }}
            >
              <span className='text-[14px] text-text-primary font-medium'>{sText.timeSuggestion}</span>
              <ChevronRight className='w-4 h-4 text-text-secondary transition-transform chevron-icon' />
            </div>
            <div className='hidden flex flex-col gap-1 mt-2 p-1 bg-muted/20 rounded-[6px]'>
              <div
                onClick={() => setQuickTime(7)}
                className='h-[32px] flex items-center px-3 hover:bg-muted/40 cursor-pointer rounded-[4px] text-[13px] text-text-primary'
              >
                {sText.last7Days}
              </div>
              <div
                onClick={() => setQuickTime(30)}
                className='h-[32px] flex items-center px-3 hover:bg-muted/40 cursor-pointer rounded-[4px] text-[13px] text-text-primary'
              >
                {sText.last30Days}
              </div>
              <div
                onClick={() => setQuickMonths(3)}
                className='h-[32px] flex items-center px-3 hover:bg-muted/40 cursor-pointer rounded-[4px] text-[13px] text-text-primary'
              >
                {sText.last3Months}
              </div>
            </div>
          </div>

          <div className='h-px bg-border/50 mb-4' />

          {/* Custom Range */}
          <div className='flex flex-col'>
            <h4 className='text-[14px] font-medium text-text-primary mb-3'>{sText.chooseTimeRange}</h4>
            <div className='grid grid-cols-2 gap-3 mb-4'>
              <Popover>
                <PopoverTrigger asChild>
                  <div className='flex flex-col gap-1.5'>
                    <div className='flex items-center h-9 border border-border rounded-[6px] px-3 hover:border-primary/50 transition-colors cursor-pointer group'>
                      <span
                        className={cn(
                          'flex-1 text-[13px] truncate',
                          tempFromDate ? 'text-text-primary font-medium' : 'text-muted-foreground'
                        )}
                      >
                        {tempFromDate ? format(tempFromDate, 'dd/MM/yyyy') : sText.fromDate}
                      </span>
                      <CalendarIcon className='w-4 h-4 text-muted-foreground opacity-60 grow-0 shrink-0' />
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <CalendarUI
                    mode='single'
                    selected={tempFromDate}
                    onSelect={setTempFromDate}
                    initialFocus
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <div className='flex flex-col gap-1.5'>
                    <div className='flex items-center h-9 border border-border rounded-[6px] px-3 hover:border-primary/50 transition-colors cursor-pointer group'>
                      <span
                        className={cn(
                          'flex-1 text-[13px] truncate',
                          tempToDate ? 'text-text-primary font-medium' : 'text-muted-foreground'
                        )}
                      >
                        {tempToDate ? format(tempToDate, 'dd/MM/yyyy') : sText.toDate}
                      </span>
                      <CalendarIcon className='w-4 h-4 text-muted-foreground opacity-60 grow-0 shrink-0' />
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <CalendarUI mode='single' selected={tempToDate} onSelect={setTempToDate} initialFocus locale={vi} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className='h-[330px]'>
            <CalendarUI
              mode='range'
              selected={{
                from: tempFromDate,
                to: tempToDate
              }}
              onSelect={(range) => {
                setTempFromDate(range?.from)
                setTempToDate(range?.to)
              }}
              locale={vi}
              className='p-0'
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className='bg-muted/10 p-3 grid grid-cols-2 gap-3 border-t border-border'>
          <Button variant='secondary' size='sm' onClick={handleCancel} className='h-9 font-semibold text-[13px]'>
            {sText.cancel || 'Hủy'}
          </Button>
          <Button
            variant='default'
            size='sm'
            onClick={handleConfirm}
            className='h-9 font-semibold text-[13px]'
            disabled={!tempFromDate || !tempToDate}
          >
            {sText.confirm || 'Xác nhận'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
