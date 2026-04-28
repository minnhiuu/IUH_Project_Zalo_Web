import { Calendar as CalendarUI } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { format, isToday } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronDown, ChevronRight, X, CircleX } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export interface DateFilterText {
  filterDate: string
  timeSuggestion: string
  last7Days: string
  last30Days: string
  last3Months: string
  chooseTimeRange: string
  fromDate: string
  toDate: string
  cancel: string
  confirm: string
}

interface DateFilterProps {
  fromDate: Date | undefined
  toDate: Date | undefined
  setFromDate: (date: Date | undefined) => void
  setToDate: (date: Date | undefined) => void
  text: DateFilterText
}

export function DateFilter({ fromDate, toDate, setFromDate, setToDate, text }: DateFilterProps) {
  const [open, setOpen] = useState(false)
  const [tempFromDate, setTempFromDate] = useState<Date | undefined>(fromDate)
  const [tempToDate, setTempToDate] = useState<Date | undefined>(toDate)
  const [activeField, setActiveField] = useState<'from' | 'to' | undefined>(undefined)

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTempFromDate(fromDate)
      setTempToDate(toDate)
      setActiveField(undefined)
    }
    setOpen(newOpen)
  }

  const applyQuickRange = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)
    setFromDate(start)
    setToDate(end)
    setOpen(false)
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

  const formatDateDisplay = (date: Date | undefined, placeholder: string) => {
    if (!date) return placeholder
    if (isToday(date)) return 'Today'
    return format(date, 'dd/MM/yyyy')
  }

  return (
    <div
      className={cn(
        'flex-1 flex h-[24px] !min-h-[24px] !max-h-[24px] text-[13px] font-normal leading-none rounded-none transition-all items-center outline-none border-none overflow-hidden w-full',
        fromDate || toDate
          ? 'bg-(--button-tertiary-neutral-focus-bg) text-(--button-tertiary-neutral-focus-text)'
          : 'bg-(--button-secondary-neutral-normal) text-(--button-secondary-neutral-text) hover:bg-black/5 dark:hover:bg-white/5'
      )}
    >
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button className='flex-1 flex items-center justify-center gap-1.5 px-2 min-w-0 h-full border-none bg-transparent cursor-pointer outline-none'>
            <CalendarIcon className={cn('w-3.5 h-3.5 shrink-0', fromDate || toDate ? 'text-current' : 'opacity-60')} />
            <span className='truncate min-w-0 text-center'>
              {fromDate || toDate
                ? `${fromDate ? (isToday(fromDate) ? 'Today' : format(fromDate, 'dd/MM')) : '...'} - ${toDate ? (isToday(toDate) ? 'Today' : format(toDate, 'dd/MM')) : '...'}`
                : text.filterDate}
            </span>
            {!fromDate && !toDate && <ChevronDown className='w-3.5 h-3.5 opacity-60 shrink-0' />}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          className='w-[300px] p-0 bg-background border border-border shadow-lg rounded-[8px] z-50 overflow-hidden'
        >
          <div className='flex flex-col p-4'>
            {/* Quick Suggestions Submenu */}
            <div className='flex flex-col'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className='flex items-center justify-between h-[40px] px-3 hover:bg-muted/40 cursor-pointer rounded-[4px] group transition-colors'>
                    <span className='text-[14px] font-medium text-text-primary'>{text.timeSuggestion}</span>
                    <ChevronRight className='w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors' />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side='right'
                  align='start'
                  className='w-48 p-1.5 bg-background border border-border shadow-lg rounded-[8px] z-[60] ml-1 animate-in fade-in slide-in-from-left-2'
                >
                  <DropdownMenuItem
                    onClick={() => applyQuickRange(7)}
                    className='h-9 px-3 text-[13px] font-medium rounded-[4px] focus:bg-(--layer-background-hover) cursor-pointer'
                  >
                    {text.last7Days}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => applyQuickRange(30)}
                    className='h-9 px-3 text-[13px] font-medium rounded-[4px] focus:bg-(--layer-background-hover) cursor-pointer'
                  >
                    {text.last30Days}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => applyQuickRange(90)}
                    className='h-9 px-3 text-[13px] font-medium rounded-[4px] focus:bg-(--layer-background-hover) cursor-pointer'
                  >
                    {text.last3Months}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className='h-px bg-border/50 my-2' />

              {/* Custom Range Section */}
              <h4 className='text-[14px] font-medium text-text-primary mb-3 px-1'>{text.chooseTimeRange}</h4>
              <div className='grid grid-cols-2 gap-3 mb-4'>
                {/* From Date Field */}
                <div className='flex flex-col' onClick={() => setActiveField('from')}>
                  <div
                    className={cn(
                      'flex items-center h-9 border rounded-none px-3 transition-all group relative cursor-pointer',
                      activeField === 'from' ? 'border-(--brand-blue) ring-1 ring-(--brand-blue)' : 'border-border hover:border-primary/30'
                    )}
                  >
                    <span
                      className={cn(
                        'flex-1 text-[13px] truncate',
                        tempFromDate ? 'text-text-primary font-medium' : 'text-muted-foreground'
                      )}
                    >
                      {formatDateDisplay(tempFromDate, text.fromDate)}
                    </span>
                    <div className='relative w-5 h-5 flex items-center justify-center shrink-0'>
                      <CalendarIcon
                        className={cn('w-4 h-4 text-muted-foreground opacity-60 transition-opacity', tempFromDate && 'group-hover:opacity-0')}
                      />
                      {tempFromDate && (
                        <button
                          type='button'
                          onClick={(e) => {
                            e.stopPropagation()
                            setTempFromDate(undefined)
                          }}
                          className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/5 rounded-full'
                        >
                          <CircleX className='w-4 h-4 text-slate-500 fill-slate-200' />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* To Date Field */}
                <div className='flex flex-col' onClick={() => setActiveField('to')}>
                  <div
                    className={cn(
                      'flex items-center h-9 border rounded-none px-3 transition-all group relative cursor-pointer',
                      activeField === 'to' ? 'border-(--brand-blue) ring-1 ring-(--brand-blue)' : 'border-border hover:border-primary/30'
                    )}
                  >
                    <span
                      className={cn(
                        'flex-1 text-[13px] truncate',
                        tempToDate ? 'text-text-primary font-medium' : 'text-muted-foreground'
                      )}
                    >
                      {formatDateDisplay(tempToDate, text.toDate)}
                    </span>
                    <div className='relative w-5 h-5 flex items-center justify-center shrink-0'>
                      <CalendarIcon
                        className={cn('w-4 h-4 text-muted-foreground opacity-60 transition-opacity', tempToDate && 'group-hover:opacity-0')}
                      />
                      {tempToDate && (
                        <button
                          type='button'
                          onClick={(e) => {
                            e.stopPropagation()
                            setTempToDate(undefined)
                          }}
                          className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/5 rounded-full'
                        >
                          <CircleX className='w-4 h-4 text-slate-500 fill-slate-200' />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {activeField && (
              <div className='animate-in fade-in slide-in-from-top-2 duration-200'>
                <div className='flex justify-center border-t border-border/50 pt-2'>
                  <CalendarUI
                    mode='range'
                    selected={{
                      from: tempFromDate,
                      to: tempToDate
                    }}
                    onSelect={(_, selectedDay) => {
                      if (!selectedDay) return

                      if (activeField === 'from') {
                        const isFirstSelection = !tempFromDate
                        setTempFromDate(selectedDay)
                        if (isFirstSelection) {
                          setActiveField('to')
                        }
                      } else {
                        setTempToDate(selectedDay)
                      }
                    }}
                    locale={vi}
                    className='p-0'
                    captionLayout='dropdown'
                    startMonth={new Date(1900, 0)}
                    endMonth={new Date()}
                    disabled={{ after: new Date() }}
                  />
                </div>

                {/* Footer Actions - Only visible when calendar is shown */}
                <div className='bg-muted/10 p-3 grid grid-cols-2 gap-3 border-t border-border mt-2'>
                  <Button
                    variant='secondary'
                    size='sm'
                    onClick={() => {
                      handleCancel()
                      setActiveField(undefined)
                    }}
                    className='h-9 font-semibold text-[13px]'
                  >
                    {text.cancel}
                  </Button>
                  <Button
                    variant='default'
                    size='sm'
                    onClick={handleConfirm}
                    className='h-9 font-semibold text-[13px]'
                    disabled={!tempFromDate || !tempToDate}
                  >
                    {text.confirm}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {(fromDate || toDate) && (
        <button
          type='button'
          onClick={(e) => handleReset(e)}
          className='h-full px-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center justify-center border-l border-white/10 bg-transparent cursor-pointer'
        >
          <X className='w-3 h-3 text-current' />
        </button>
      )}
    </div>
  )
}
