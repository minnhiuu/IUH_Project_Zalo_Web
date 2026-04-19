import { FileText, PlayCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { PaginationCustom } from '@/components/ui/pagination-custom'
import { cn } from '@/lib/utils'
import type { IngestDocumentRecord } from '../../schemas/ingest-document.schema'

interface StepOneDocumentsTableProps {
  paginatedDocuments: IngestDocumentRecord[]
  uploadedDocumentsCount: number
  allCurrentPageSelected: boolean
  selectedDocumentIds: string[]
  hasSelectedDocuments: boolean
  selectedDocumentsCount: number
  selectedFileId: string | null
  safeCurrentPage: number
  totalPages: number
  getStatusBadge: (status: IngestDocumentRecord['status']) => React.ReactNode
  onToggleSelectAllCurrentPage: (checked: boolean) => void
  onToggleSelectDocument: (documentId: string, checked: boolean) => void
  onStartParsing: (doc: IngestDocumentRecord) => void
  onDeleteDocument: (documentId: string) => void
  onDeleteSelectedDocuments: () => void
  onPageChange: (page: number) => void
}

export function StepOneDocumentsTable({
  paginatedDocuments,
  uploadedDocumentsCount,
  allCurrentPageSelected,
  selectedDocumentIds,
  hasSelectedDocuments,
  selectedDocumentsCount,
  selectedFileId,
  safeCurrentPage,
  totalPages,
  getStatusBadge,
  onToggleSelectAllCurrentPage,
  onToggleSelectDocument,
  onStartParsing,
  onDeleteDocument,
  onDeleteSelectedDocuments,
  onPageChange
}: StepOneDocumentsTableProps) {
  return (
    <div className='bg-dashboard-card-bg rounded-xl border border-border/40 shadow-sm overflow-hidden flex flex-col'>
      <div className='px-6 py-5 border-b border-section-divider flex items-center justify-between gap-4 bg-dashboard-card-header-bg'>
        <h3 className='text-lg font-bold text-dashboard-header-text uppercase tracking-tight shrink-0'>
          Danh sách tài liệu đã tải
        </h3>
        {hasSelectedDocuments ? (
          <Button
            variant='outline'
            className='h-8 px-3 rounded-lg text-destructive border-destructive/30 hover:bg-destructive-subtle hover:text-destructive font-bold text-[11px]'
            onClick={onDeleteSelectedDocuments}
          >
            <Trash2 className='w-3.5 h-3.5 mr-1.5' />
            Xóa ({selectedDocumentsCount})
          </Button>
        ) : null}
      </div>

      <div className='flex-1 overflow-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-transparent border-b border-border/40 h-10'>
              <TableHead className='w-12 pl-6'>
                <Checkbox
                  checked={allCurrentPageSelected}
                  onCheckedChange={(checked) => onToggleSelectAllCurrentPage(checked === true)}
                  aria-label='Chọn tất cả tài liệu trên trang'
                />
              </TableHead>
              <TableHead className='font-bold text-foreground text-[15px] uppercase tracking-wide pl-6'>
                Tên tệp
              </TableHead>
              <TableHead className='font-bold text-foreground text-[15px] uppercase tracking-wide text-center'>
                Trạng thái
              </TableHead>
              <TableHead className='font-bold text-foreground text-[15px] uppercase tracking-wide text-right'>
                Kích thước
              </TableHead>
              <TableHead className='font-bold text-foreground text-[15px] uppercase tracking-wide text-right pr-6'>
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDocuments.length === 0 ? (
              <TableRow className='h-14'>
                <TableCell colSpan={5} className='px-6 text-center text-muted-foreground font-medium'>
                  {uploadedDocumentsCount === 0
                    ? 'Chưa có tài liệu nào được tải lên'
                    : 'Không có tài liệu phù hợp với bộ lọc'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedDocuments.map((doc) => (
                <TableRow
                  key={doc.id}
                  className={cn(
                    'h-14 border-b border-section-divider transition-colors hover:bg-muted/10 group',
                    selectedFileId === doc.id && 'bg-brand-blue-light/40'
                  )}
                >
                  <TableCell className='pl-6'>
                    <Checkbox
                      checked={selectedDocumentIds.includes(doc.id)}
                      onCheckedChange={(checked) => onToggleSelectDocument(doc.id, checked === true)}
                      aria-label={`Chọn ${doc.fileName}`}
                    />
                  </TableCell>
                  <TableCell className='pl-6 py-4'>
                    <div className='flex items-center gap-3'>
                      <div
                        className={cn(
                          'h-7 w-7 rounded-lg shrink-0 flex items-center justify-center border',
                          doc.fileName.endsWith('.pdf')
                            ? 'bg-destructive-subtle text-destructive-text border-destructive-border/50'
                            : 'bg-dashboard-icon-bg text-brand-blue border-brand-blue-hover/30'
                        )}
                      >
                        <FileText size={14} />
                      </div>
                      <div className='flex flex-col min-w-0'>
                        <span className='text-[15px] font-bold text-foreground truncate tracking-tight'>
                          {doc.fileName}
                        </span>
                        <span className='text-[11px] uppercase tracking-wider text-muted-foreground'>
                          {doc.uploadedAt}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>{getStatusBadge(doc.status)}</TableCell>
                  <TableCell className='text-right text-[15px] font-semibold text-muted-foreground tabular-nums'>
                    {doc.displaySize}
                  </TableCell>
                  <TableCell className='text-right pr-6'>
                    <div className='flex items-center justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-brand-blue hover:text-brand-blue-dark hover:bg-brand-blue-light/50'
                        onClick={() => onStartParsing(doc)}
                        title='Trích xuất'
                      >
                        <PlayCircle size={16} />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-destructive hover:text-destructive-solid hover:bg-destructive-subtle'
                        onClick={() => onDeleteDocument(doc.id)}
                        title='Xóa'
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className='px-6 py-3 border-t border-section-divider bg-dashboard-card-header-bg flex items-center justify-between gap-4'>
        <span className='font-bold text-[10px] uppercase tracking-widest text-muted-foreground'>
          Trang {safeCurrentPage} / {totalPages}
        </span>
        <PaginationCustom currentPage={safeCurrentPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  )
}
