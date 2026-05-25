import { cn } from '@/lib/utils'
import type { MessageResponse } from '../schemas/chat.schema'
import { useChatText } from '../i18n/use-chat-text'
import { Download, X } from 'lucide-react'
import { useState } from 'react'

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function getExtColor(ext: string): string {
  if (['PDF'].includes(ext)) return 'bg-red-500'
  if (['DOC', 'DOCX'].includes(ext)) return 'bg-blue-600'
  if (['XLS', 'XLSX'].includes(ext)) return 'bg-green-600'
  if (['PPT', 'PPTX'].includes(ext)) return 'bg-orange-500'
  if (['ZIP', 'RAR', '7Z'].includes(ext)) return 'bg-blue-700'
  return 'bg-primary'
}

export function getExtLabel(ext: string): string {
  if (ext === 'PDF') return 'PDF'
  if (['DOC', 'DOCX'].includes(ext)) return 'WORD'
  if (['XLS', 'XLSX'].includes(ext)) return 'EXCEL'
  if (['PPT', 'PPTX'].includes(ext)) return 'PPT'
  if (['ZIP', 'RAR', '7Z'].includes(ext)) return ext.slice(0, 3)
  return ext.slice(0, 3) || '?'
}

export function MessageFileContent({ message }: { message: MessageResponse }) {
  const { text } = useChatText()
  const mb = text.messageBubble
  const att = message.attachments?.[0]
  const fileUrl = att?.url
  const fileName = att?.originalFileName || att?.fileName || 'File'
  const fileSize = att?.size
  const contentType = att?.contentType || ''
  const [previewOpen, setPreviewOpen] = useState(false)

  const ext = fileName.split('.').pop()?.toUpperCase() || ''
  const canPreview = !!fileUrl && !['ZIP', 'RAR', '7Z'].includes(ext)
  const previewUrl = canPreview
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl!)}&embedded=true`
    : null

  return (
    <>
      <div
        className={cn('flex items-center gap-3 min-w-[200px]', canPreview && 'cursor-pointer')}
        onClick={() => canPreview && setPreviewOpen(true)}
      >
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white', getExtColor(ext))}>
          <span className='text-[9px] font-bold leading-none tracking-tight'>{getExtLabel(ext)}</span>
        </div>
        <div className='flex flex-col min-w-0 flex-1'>
          <span className='text-[14px] font-medium truncate max-w-[200px]'>{fileName}</span>
          <span className='text-[12px] text-muted-foreground'>
            {fileSize ? formatFileSize(fileSize) : ''}
            {contentType ? ` · ${ext}` : ''}
          </span>
        </div>
        {fileUrl && (
          <a
            href={fileUrl}
            download={fileName}
            className='p-1.5 hover:bg-muted rounded-full transition-colors shrink-0'
            title={mb.download}
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={18} className='text-muted-foreground' />
          </a>
        )}
      </div>
      {previewOpen && previewUrl && (
        <FilePreviewModal
          url={previewUrl}
          fileName={fileName}
          fileUrl={fileUrl!}
          fileSize={fileSize}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </>
  )
}

export function FilePreviewModal({
  url,
  fileName,
  fileUrl,
  fileSize,
  onClose
}: {
  url: string
  fileName: string
  fileUrl: string
  fileSize?: number
  onClose: () => void
}) {
  const ext = fileName.split('.').pop()?.toUpperCase() || ''
  return (
    <div className='fixed inset-0 z-[9999] bg-white dark:bg-zinc-900 flex flex-col'>
      <iframe
        src={url}
        className='flex-1 w-full border-0'
        title={fileName}
        sandbox='allow-scripts allow-same-origin allow-forms allow-popups'
      />
      <div className='shrink-0 flex items-center gap-3 px-4 py-2.5 border-t bg-white dark:bg-zinc-900 shadow-[0_-1px_4px_rgba(0,0,0,0.08)]'>
        <div className='flex-1 min-w-0'>
          <p className='text-[14px] font-semibold truncate'>{fileName}</p>
          {fileSize && (
            <p className='text-[12px] text-muted-foreground'>
              {formatFileSize(fileSize)} · {ext}
            </p>
          )}
        </div>
        <a
          href={fileUrl}
          download={fileName}
          className='p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground'
          title='Tải về'
          onClick={(e) => e.stopPropagation()}
        >
          <Download size={18} />
        </a>
        <button
          type='button'
          onClick={onClose}
          className='p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground'
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
