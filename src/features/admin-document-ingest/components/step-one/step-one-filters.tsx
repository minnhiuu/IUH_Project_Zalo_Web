import { Plus, Search, FilterX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IngestDocumentStatus } from '@/constants/enum'
import type { IngestDocumentRecord } from '../../schemas/ingest-document.schema'
import { useIngestText } from '../../i18n/use-ingest-text'

interface StepOneFiltersProps {
  fileTypeFilter: string
  statusFilter: 'all' | IngestDocumentRecord['status']
  searchTerm: string
  hasActiveFilters: boolean
  onFileTypeChange: (value: string) => void
  onStatusChange: (value: 'all' | IngestDocumentRecord['status']) => void
  onSearchChange: (value: string) => void
  onResetFilters: () => void
  onUploadClick: () => void
}

export function StepOneFilters({
  fileTypeFilter,
  statusFilter,
  searchTerm,
  hasActiveFilters,
  onFileTypeChange,
  onStatusChange,
  onSearchChange,
  onResetFilters,
  onUploadClick
}: StepOneFiltersProps) {
  const { text } = useIngestText()

  return (
    <div className='mb-4 bg-dashboard-card-bg border border-border/40 rounded-xl p-4'>
      <div className='flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4'>
        <div className='flex flex-wrap items-end gap-3'>
          <div className='w-40'>
            <label className='block text-[10px] font-bold text-muted-foreground uppercase mb-2 tracking-wider'>
              {text.stepOne.filters.fileType}
            </label>
            <Select
              value={fileTypeFilter}
              onValueChange={(value) => {
                onFileTypeChange(value)
              }}
            >
              <SelectTrigger className='w-full h-10 bg-muted border-border text-sm rounded-lg'>
                <SelectValue placeholder={text.stepOne.filters.fileTypeOptions.all} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>{text.stepOne.filters.fileTypeOptions.all}</SelectItem>
                <SelectItem value='pdf'>{text.stepOne.filters.fileTypeOptions.pdf}</SelectItem>
                <SelectItem value='docx'>{text.stepOne.filters.fileTypeOptions.docx}</SelectItem>
                <SelectItem value='txt'>{text.stepOne.filters.fileTypeOptions.txt}</SelectItem>
                <SelectItem value='xlsx'>{text.stepOne.filters.fileTypeOptions.xlsx}</SelectItem>
                <SelectItem value='other'>{text.stepOne.filters.fileTypeOptions.other}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='w-40'>
            <label className='block text-[10px] font-bold text-muted-foreground uppercase mb-2 tracking-wider'>
              {text.stepOne.filters.status}
            </label>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                onStatusChange(value as 'all' | IngestDocumentRecord['status'])
              }}
            >
              <SelectTrigger className='w-full h-10 bg-muted border-border text-sm rounded-lg'>
                <SelectValue placeholder={text.stepOne.filters.statusOptions.all} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>{text.stepOne.filters.statusOptions.all}</SelectItem>
                <SelectItem value={IngestDocumentStatus.Ingesting}>
                  {text.stepOne.filters.statusOptions.ingesting}
                </SelectItem>
                <SelectItem value={IngestDocumentStatus.Completed}>
                  {text.stepOne.filters.statusOptions.completed}
                </SelectItem>
                <SelectItem value={IngestDocumentStatus.Failed}>{text.stepOne.filters.statusOptions.failed}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='w-64'>
            <label className='block text-[10px] font-bold text-muted-foreground uppercase mb-2 tracking-wider'>
              {text.stepOne.filters.search}
            </label>
            <div className='relative'>
              <Search className='h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none' />
              <Input
                value={searchTerm}
                onChange={(e) => {
                  onSearchChange(e.target.value)
                }}
                className='pl-9 h-10 bg-muted border-border rounded-lg text-sm'
                placeholder={text.stepOne.filters.searchPlaceholder}
              />
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2 xl:justify-end'>
          <Button
            variant='ghost'
            className='h-10 px-3 text-brand-blue hover:text-brand-blue-dark hover:bg-brand-blue-light/30 font-semibold'
            onClick={onResetFilters}
            disabled={!hasActiveFilters}
          >
            <FilterX className='w-4 h-4 mr-2' />
            {text.stepOne.filters.reset}
          </Button>
          <Button
            onClick={onUploadClick}
            className='h-10 px-5 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold rounded-lg shadow-sm gap-2'
          >
            <Plus size={16} /> {text.stepOne.filters.addDocument}
          </Button>
        </div>
      </div>
    </div>
  )
}
