import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { FileText, FileSpreadsheet, FilePieChart, FileCode, ChevronDown, Check, X } from 'lucide-react'
import { useState } from 'react'

export type FileType = 'PDF' | 'WORD' | 'EXCEL' | 'POWERPOINT'

interface FileTypeOption {
  id: FileType
  label: string
  icon: React.ElementType
  color: string
}

const FILE_TYPE_OPTIONS: FileTypeOption[] = [
  { id: 'PDF', label: 'PDF', icon: FileText, color: 'text-red-500' },
  { id: 'WORD', label: 'Word', icon: FileText, color: 'text-blue-600' },
  { id: 'POWERPOINT', label: 'PowerPoint', icon: FilePieChart, color: 'text-orange-500' },
  { id: 'EXCEL', label: 'Excel', icon: FileSpreadsheet, color: 'text-green-600' }
]

interface FileTypeFilterProps {
  value: FileType | null
  onChange: (value: FileType | null) => void
  text: {
    filterType: string
  }
}

export const FileTypeFilter = ({ value, onChange, text }: FileTypeFilterProps) => {
  const [open, setOpen] = useState(false)
  const selectedOption = FILE_TYPE_OPTIONS.find((opt) => opt.id === value)

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <div
      className={cn(
        'flex flex-1 h-[24px] !min-h-[24px] !max-h-[24px] text-[13px] font-normal leading-none rounded-none transition-all items-center outline-none border-none overflow-hidden min-w-0 w-full',
        value
          ? 'bg-(--button-tertiary-neutral-focus-bg) text-(--button-tertiary-neutral-focus-text)'
          : 'bg-(--button-secondary-neutral-normal) text-(--button-secondary-neutral-text) hover:bg-black/5 dark:hover:bg-white/5'
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className='flex flex-1 items-center justify-between gap-1.5 px-2 h-full border-none bg-transparent cursor-pointer outline-none min-w-0'>
            <div className='flex items-center gap-1.5 min-w-0'>
              {selectedOption ? (
                <selectedOption.icon className={cn('w-3.5 h-3.5 shrink-0', selectedOption.color)} />
              ) : (
                <FileCode className='w-3.5 h-3.5 shrink-0 opacity-60' />
              )}
              <span className='truncate'>{selectedOption?.label || text.filterType}</span>
            </div>
            {!value && <ChevronDown className='w-3 h-3 opacity-60 shrink-0' />}
          </button>
        </PopoverTrigger>
        <PopoverContent className='w-[180px] p-1' align='start' sideOffset={8}>
          <div className='flex flex-col'>
            {FILE_TYPE_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onChange(option.id)
                  setOpen(false)
                }}
                className={cn(
                  'flex items-center justify-between h-[36px] px-[10px] my-[2px] rounded-[4px] text-[14px] font-normal transition-colors outline-none border-none bg-transparent cursor-pointer hover:bg-muted/80 text-foreground',
                  value === option.id && 'bg-muted text-primary font-medium'
                )}
              >
                <div className='flex items-center gap-2.5 min-w-0'>
                  <option.icon className={cn('w-4 h-4 shrink-0', option.color)} />
                  <span className='truncate'>{option.label}</span>
                </div>
                {value === option.id && <Check className='w-3.5 h-3.5 shrink-0 text-primary' />}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {value && (
        <button
          onClick={handleReset}
          className='flex items-center justify-center w-[24px] h-full border-none border-l border-border/20 bg-transparent cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors outline-none shrink-0'
        >
          <X className='w-3 h-3 opacity-60' />
        </button>
      )}
    </div>
  )
}
