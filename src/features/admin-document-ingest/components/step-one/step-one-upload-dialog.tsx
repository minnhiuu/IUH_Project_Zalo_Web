import React from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useIngestText } from '../../i18n/use-ingest-text'

interface StepOneUploadDialogProps {
  open: boolean
  pendingUploadFile: File | null
  isParsing: boolean
  formatFileSize: (sizeInBytes: number) => string
  onOpenChange: (open: boolean) => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onCancel: () => void
  onConfirmUpload: () => void
}

export function StepOneUploadDialog({
  open,
  pendingUploadFile,
  isParsing,
  formatFileSize,
  onOpenChange,
  onFileChange,
  onCancel,
  onConfirmUpload
}: StepOneUploadDialogProps) {
  const { text } = useIngestText()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-150 rounded-xl border border-border shadow-2xl p-8'>
        <DialogHeader className='mb-6'>
          <DialogTitle className='text-xl font-bold text-foreground'>{text.stepOne.upload.title}</DialogTitle>
          <DialogDescription className='text-[14px] text-muted-foreground leading-relaxed'>
            {text.stepOne.upload.description}
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-6'>
          <div className='relative border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center group hover:border-brand-blue hover:bg-brand-blue-light/10 transition-all cursor-pointer'>
            <input
              type='file'
              className='absolute inset-0 opacity-0 cursor-pointer'
              onChange={onFileChange}
              accept='.pdf,.docx,.txt,.xlsx,.xls'
            />
            <div className='w-14 h-14 rounded-xl bg-dashboard-icon-bg flex items-center justify-center mb-4 text-brand-blue group-hover:scale-105 transition-transform'>
              <Upload size={32} />
            </div>
            <h4 className='text-base font-bold text-foreground mb-1'>{text.stepOne.upload.dropTitle}</h4>
            <p className='text-[11px] text-muted-foreground font-bold uppercase tracking-widest'>
              {text.stepOne.upload.dropHint} - {text.stepOne.upload.formats}
            </p>
          </div>

          <div className='rounded-lg border border-border bg-muted/30 px-4 py-3'>
            {pendingUploadFile ? (
              <div className='flex items-center justify-between gap-4'>
                <div className='min-w-0'>
                  <p className='text-sm font-semibold text-foreground truncate'>{pendingUploadFile.name}</p>
                  <p className='text-[11px] uppercase tracking-wider text-muted-foreground'>
                    {formatFileSize(pendingUploadFile.size)}
                  </p>
                </div>
                <Badge variant='outline' className='shrink-0 text-[10px] uppercase'>
                  {text.stepOne.upload.selected}
                </Badge>
              </div>
            ) : (
              <p className='text-xs text-muted-foreground font-medium'>
                {text.stepOne.upload.noFile}
              </p>
            )}
          </div>

          <div className='flex gap-4'>
            <Button
              variant='outline'
              className='flex-1 h-10 rounded-lg border-border bg-transparent text-foreground font-bold hover:bg-muted'
              onClick={onCancel}
              disabled={isParsing}
            >
              {text.stepOne.upload.cancel}
            </Button>
            <Button
              className='flex-1 h-10 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold rounded-lg shadow-sm disabled:opacity-60'
              onClick={onConfirmUpload}
              disabled={!pendingUploadFile || isParsing}
            >
              {isParsing ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : null}
              {isParsing ? text.stepOne.upload.uploading : text.stepOne.upload.confirm}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
