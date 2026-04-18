import { useState, useMemo, useRef, useEffect, useCallback, type RefObject } from 'react'
import { Search, Download, Play, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaMessagesQuery } from '../queries/use-queries'
import { MessageType } from '@/constants/enum'
import type { MessageResponse, ConversationMemberResponse } from '../schemas/chat.schema'
import { useChatText } from '../i18n/use-chat-text'
import { UserAvatar } from '@/components/common/user-avatar'

// ── helpers ─────────────────────────────────────────────────────
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function groupByDate(
  messages: MessageResponse[],
  dateLabelFn: (day: number, month: number) => string
): { dateLabel: string; items: MessageResponse[] }[] {
  const map = new Map<string, MessageResponse[]>()
  for (const m of messages) {
    if (!m.createdAt) continue
    const d = new Date(m.createdAt)
    const label = dateLabelFn(d.getDate(), d.getMonth() + 1)
    if (!map.has(label)) map.set(label, [])
    map.get(label)!.push(m)
  }
  return [...map.entries()].map(([dateLabel, items]) => ({ dateLabel, items }))
}

function getExtColor(ext: string) {
  if (['PDF'].includes(ext)) return 'bg-red-500'
  if (['DOC', 'DOCX'].includes(ext)) return 'bg-blue-600'
  if (['XLS', 'XLSX'].includes(ext)) return 'bg-green-600'
  if (['PPT', 'PPTX'].includes(ext)) return 'bg-orange-500'
  if (['ZIP', 'RAR', '7Z'].includes(ext)) return 'bg-purple-600'
  if (['M4A', 'MP3', 'WAV', 'OGG'].includes(ext)) return 'bg-purple-600'
  if (['MP4', 'MOV', 'AVI', 'MKV'].includes(ext)) return 'bg-indigo-600'
  return 'bg-primary'
}

function getExtLabel(ext: string) {
  if (ext === 'PDF') return 'PDF'
  if (['DOC', 'DOCX'].includes(ext)) return 'WORD'
  if (['XLS', 'XLSX'].includes(ext)) return 'EXCEL'
  if (['PPT', 'PPTX'].includes(ext)) return 'PPT'
  if (['ZIP', 'RAR', '7Z'].includes(ext)) return ext.slice(0, 3)
  return ext.slice(0, 3) || '?'
}

const FILE_TYPE_FILTERS = [
  { label: 'PDF', ext: ['PDF'] },
  { label: 'Word', ext: ['DOC', 'DOCX'] },
  { label: 'PowerPoint', ext: ['PPT', 'PPTX'] },
  { label: 'Excel', ext: ['XLS', 'XLSX'] },
  { label: 'ZIP/RAR', ext: ['ZIP', 'RAR', '7Z'] }
]

// ── MediaStorageView ─────────────────────────────────────────────
interface MediaStorageViewProps {
  conversationId: string
  members?: ConversationMemberResponse[] | null
  defaultTab?: Tab
  onClose: () => void
}

type Tab = 'media' | 'files' | 'links'

export function MediaStorageView({ conversationId, members, defaultTab = 'media', onClose }: MediaStorageViewProps) {
  const [tab, setTab] = useState<Tab>(defaultTab)
  const [fileTypeFilter, setFileTypeFilter] = useState<string | null>(null)
  const [fileTypeMenuOpen, setFileTypeMenuOpen] = useState(false)
  const [senderFilter, setSenderFilter] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string } | null>(null)
  const [fileSearch, setFileSearch] = useState('')
  const { text } = useChatText()

  // ── Fetch media ──
  const { data: mediaData, isLoading: mediaLoading } = useMediaMessagesQuery(
    conversationId,
    ['IMAGE', 'VIDEO'],
    0,
    50,
    tab === 'media'
  )
  const { data: fileData, isLoading: fileLoading } = useMediaMessagesQuery(
    conversationId,
    ['FILE'],
    0,
    100,
    tab === 'files'
  )
  const { data: linkData, isLoading: linkLoading } = useMediaMessagesQuery(
    conversationId,
    ['LINK'],
    0,
    50,
    tab === 'links'
  )

  // ── Filter: files ──
  const filteredFiles = useMemo(() => {
    let items = fileData?.data || []
    if (fileTypeFilter) {
      items = items.filter((m) => {
        const att = m.attachments?.[0]
        const ext = (att?.originalFileName || att?.fileName || '').split('.').pop()?.toUpperCase() || ''
        return FILE_TYPE_FILTERS.find((f) => f.label === fileTypeFilter)?.ext.includes(ext)
      })
    }
    if (senderFilter) {
      items = items.filter((m) => m.senderId === senderFilter)
    }
    if (dateFilter) {
      const from = dateFilter.from ? new Date(dateFilter.from).setHours(0, 0, 0, 0) : null
      const to = dateFilter.to ? new Date(dateFilter.to).setHours(23, 59, 59, 999) : null
      items = items.filter((m) => {
        if (!m.createdAt) return false
        const t = new Date(m.createdAt).getTime()
        if (from && t < from) return false
        if (to && t > to) return false
        return true
      })
    }
    if (fileSearch.trim()) {
      const q = fileSearch.toLowerCase()
      items = items.filter((m) => {
        const att = m.attachments?.[0]
        return (att?.originalFileName || att?.fileName || '').toLowerCase().includes(q)
      })
    }
    return items
  }, [fileData, fileTypeFilter, senderFilter, dateFilter, fileSearch])

  const groupedFiles = useMemo(
    () => groupByDate(filteredFiles, text.mediaStorage.dateLabel),
    [filteredFiles, text.mediaStorage.dateLabel]
  )

  // ── Filter: media ──
  const groupedMedia = useMemo(() => {
    let items = mediaData?.data || []
    if (senderFilter) {
      items = items.filter((m) => m.senderId === senderFilter)
    }
    if (dateFilter) {
      const from = dateFilter.from ? new Date(dateFilter.from).setHours(0, 0, 0, 0) : null
      const to = dateFilter.to ? new Date(dateFilter.to).setHours(23, 59, 59, 999) : null
      items = items.filter((m) => {
        if (!m.createdAt) return false
        const t = new Date(m.createdAt).getTime()
        if (from && t < from) return false
        if (to && t > to) return false
        return true
      })
    }
    return groupByDate(items, text.mediaStorage.dateLabel)
  }, [mediaData, senderFilter, dateFilter, text.mediaStorage.dateLabel])

  // ── Lightbox (media tab) ──
  type LightboxItem = { url: string; contentType: string; originalFileName?: string | null }
  const lightboxItems = useMemo<LightboxItem[]>(() => {
    const items: LightboxItem[] = []
    for (const { items: msgs } of groupedMedia) {
      for (const m of msgs) {
        const att = m.attachments?.[0]
        if (att?.url) items.push({ url: att.url, contentType: att.contentType || '', originalFileName: att.originalFileName })
      }
    }
    return items
  }, [groupedMedia])
  const urlToLightboxIndex = useMemo(() => {
    const map = new Map<string, number>()
    lightboxItems.forEach((item, i) => map.set(item.url, i))
    return map
  }, [lightboxItems])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const prevImage = useCallback(() => setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i)), [])
  const nextImage = useCallback(
    () => setLightboxIndex((i) => (i !== null && i < lightboxItems.length - 1 ? i + 1 : i)),
    [lightboxItems.length]
  )
  const handleMediaClick = useCallback(
    (url: string) => {
      const idx = urlToLightboxIndex.get(url)
      if (idx !== undefined) setLightboxIndex(idx)
    },
    [urlToLightboxIndex]
  )
  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      else if (e.key === 'ArrowLeft') prevImage()
      else if (e.key === 'ArrowRight') nextImage()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex, closeLightbox, prevImage, nextImage])

  // ── Filter: links ──
  const filteredLinks = useMemo(() => linkData?.data || [], [linkData])

  const TABS: { key: Tab; label: string }[] = [
    { key: 'media', label: text.mediaStorage.tabMedia },
    { key: 'files', label: text.mediaStorage.tabFiles },
    { key: 'links', label: text.mediaStorage.tabLinks }
  ]

  return (
    <div className='flex flex-col h-full bg-background'>
      {/* Header */}
      <div className='h-[68px] flex items-center border-b border-border shrink-0 px-4 relative'>
        <button
          type='button'
          onClick={onClose}
          className='rounded-full p-1.5 hover:bg-muted transition-colors text-muted-foreground'
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className='absolute left-1/2 -translate-x-1/2 font-bold text-[16px] text-foreground'>
          {text.mediaStorage.title}
        </h2>
      </div>

      {/* Tabs */}
      <div className='flex border-b shrink-0'>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type='button'
            onClick={() => setTab(key)}
            className={cn(
              'flex-1 py-2 text-[13px] font-medium transition-colors relative',
              tab === key ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
            {tab === key && <span className='absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full' />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto custom-scrollbar'>
        {/* ── Ảnh/Video ── */}
        {tab === 'media' && (
          <div className='p-4'>
            {/* Filters */}
            <div className='flex gap-2 mb-4 flex-wrap'>
              <SenderFilter
                members={members || []}
                value={senderFilter}
                onChange={setSenderFilter}
                label={text.mediaStorage.filterSender}
              />
              <DateFilter value={dateFilter} onChange={setDateFilter} label={text.mediaStorage.filterDate} />
            </div>

            {mediaLoading ? (
              <MediaSkeleton />
            ) : groupedMedia.length === 0 ? (
              <EmptyState label={text.mediaStorage.noPhotosVideos} />
            ) : (
              groupedMedia.map(({ dateLabel, items }) => (
                <div key={dateLabel} className='mb-5'>
                  <p className='text-[13px] font-semibold text-muted-foreground mb-2'>{dateLabel}</p>
                  <div className='grid grid-cols-3 gap-1'>
                    {items.map((m) => {
                      const att = m.attachments?.[0]
                      const isVideo = m.type === MessageType.Video || att?.contentType?.startsWith('video/')
                      return (
                        <div
                          key={m.id}
                          className='aspect-square bg-muted rounded overflow-hidden relative group cursor-pointer'
                        >
                          {isVideo ? (
                            <div
                              className='w-full h-full relative'
                              onClick={() => att?.url && handleMediaClick(att.url)}
                            >
                              <video src={att?.url} className='w-full h-full object-cover' preload='metadata' muted />
                              <div className='absolute inset-0 flex items-center justify-center bg-black/30'>
                                <Play size={24} className='text-white fill-white' />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={att?.url}
                              alt={att?.originalFileName || 'image'}
                              className='w-full h-full object-cover group-hover:opacity-90 transition-opacity'
                              loading='lazy'
                              onClick={() => att?.url && handleMediaClick(att.url)}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Files ── */}
        {tab === 'files' && (
          <div className='p-4'>
            {/* Search */}
            <div className='relative mb-3'>
              <Search size={14} className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
              <input
                className='w-full pl-8 pr-3 py-2 text-[13px] bg-muted rounded-lg border-0 outline-none placeholder:text-muted-foreground'
                placeholder={text.mediaStorage.searchFilePlaceholder}
                value={fileSearch}
                onChange={(e) => setFileSearch(e.target.value)}
              />
            </div>

            {/* Filters row */}
            <div className='flex gap-2 mb-4'>
              {/* Loại file dropdown */}
              <div className='relative'>
                <button
                  type='button'
                  onClick={() => setFileTypeMenuOpen(!fileTypeMenuOpen)}
                  className='flex items-center gap-1 px-3 py-1.5 text-[13px] border rounded-full hover:bg-muted transition-colors'
                >
                  <span>{fileTypeFilter || text.mediaStorage.filterType}</span>
                  <ChevronDown size={13} />
                </button>
                {fileTypeMenuOpen && (
                  <div className='absolute top-full left-0 mt-1 w-40 bg-background border rounded-xl shadow-xl z-10 py-1'>
                    {FILE_TYPE_FILTERS.map(({ label }) => (
                      <button
                        key={label}
                        type='button'
                        onClick={() => {
                          setFileTypeFilter(fileTypeFilter === label ? null : label)
                          setFileTypeMenuOpen(false)
                        }}
                        className={cn(
                          'w-full text-left px-4 py-2.5 text-[13px] hover:bg-muted transition-colors flex items-center gap-2',
                          fileTypeFilter === label && 'text-primary font-medium'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <SenderFilter
                members={members || []}
                value={senderFilter}
                onChange={setSenderFilter}
                label={text.mediaStorage.filterSender}
              />
              <DateFilter value={dateFilter} onChange={setDateFilter} label={text.mediaStorage.filterDate} />
            </div>

            {fileLoading ? (
              <FileSkeleton />
            ) : groupedFiles.length === 0 ? (
              <EmptyState label={text.mediaStorage.noFiles} />
            ) : (
              groupedFiles.map(({ dateLabel, items }) => (
                <div key={dateLabel} className='mb-5'>
                  <p className='text-[13px] font-semibold text-muted-foreground mb-2'>{dateLabel}</p>
                  <div className='flex flex-col gap-3'>
                    {items.map((m) => {
                      const att = m.attachments?.[0]
                      const fileName = att?.originalFileName || att?.fileName || 'File'
                      const ext = fileName.split('.').pop()?.toUpperCase() || ''
                      const fileSize = att?.size
                      return (
                        <div key={m.id} className='flex items-center gap-3 group cursor-pointer'>
                          <div
                            className={cn(
                              'w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-white',
                              getExtColor(ext)
                            )}
                          >
                            <span className='text-[10px] font-bold leading-none tracking-tight'>{getExtLabel(ext)}</span>
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='text-[13px] font-medium truncate group-hover:text-primary transition-colors'>
                              {fileName}
                            </p>
                            <p className='text-[11px] text-muted-foreground flex items-center gap-1'>
                              {fileSize ? formatFileSize(fileSize) : ''}
                            </p>
                          </div>
                          {att?.url && (
                            <a
                              href={att.url}
                              download={fileName}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='p-1.5 hover:bg-muted rounded-full transition-colors shrink-0 opacity-0 group-hover:opacity-100'
                            >
                              <Download size={16} className='text-muted-foreground' />
                            </a>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Links ── */}
        {tab === 'links' && (
          <div className='p-4'>
            <div className='flex gap-2 mb-4 flex-wrap'>
              <SenderFilter
                members={members || []}
                value={senderFilter}
                onChange={setSenderFilter}
                label={text.mediaStorage.filterSender}
              />
              <DateFilter value={dateFilter} onChange={setDateFilter} label={text.mediaStorage.filterDate} />
            </div>
            {linkLoading ? (
              <FileSkeleton />
            ) : filteredLinks.length === 0 ? (
              <EmptyState label={text.mediaStorage.noLinks} />
            ) : (
              <div className='flex flex-col gap-3'>
                {filteredLinks.map((m) => {
                  const preview = m.linkPreview
                  const url = preview?.url || m.content || ''
                  const domain = url
                    ? (() => {
                        try {
                          return new URL(url).hostname
                        } catch {
                          return url
                        }
                      })()
                    : ''
                  return (
                    <a
                      key={m.id}
                      href={url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-start gap-3 group cursor-pointer hover:bg-muted/50 rounded-lg p-2 -mx-2'
                    >
                      <div className='w-10 h-10 shrink-0 bg-muted rounded-lg flex items-center justify-center text-primary font-bold text-[14px]'>
                        {domain.charAt(0).toUpperCase()}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-[13px] font-medium truncate group-hover:text-primary transition-colors'>
                          {preview?.groupName || url}
                        </p>
                        <p className='text-[11px] text-primary/70 truncate'>{domain}</p>
                        <p className='text-[11px] text-muted-foreground mt-0.5'>
                          {m.createdAt ? formatDate(m.createdAt) : ''}
                        </p>
                      </div>
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox overlay */}
      {lightboxIndex !== null && (
        <StorageLightbox
          items={lightboxItems}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
    </div>
  )
}

// ── StorageLightbox ──────────────────────────────────────────────
type LightboxItemDef = { url: string; contentType: string; originalFileName?: string | null }
function StorageLightbox({
  items,
  index,
  onClose,
  onPrev,
  onNext
}: {
  items: LightboxItemDef[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const item = items[index]
  const isVideo = item?.contentType?.startsWith('video/')
  return (
    <div
      className='fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center'
      onClick={onClose}
    >
      <button
        className='absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors'
        onClick={onClose}
      >
        <X size={22} />
      </button>
      {index > 0 && (
        <button
          className='absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors'
          onClick={(e) => { e.stopPropagation(); onPrev() }}
        >
          <ChevronLeft size={28} />
        </button>
      )}
      <div
        className='max-w-[90vw] max-h-[90vh] flex items-center justify-center'
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <video src={item.url} controls autoPlay className='max-w-full max-h-[90vh] rounded-md' />
        ) : (
          <img
            src={item.url}
            alt={item.originalFileName || 'image'}
            className='max-w-full max-h-[90vh] object-contain rounded-md select-none'
            draggable={false}
          />
        )}
      </div>
      {index < items.length - 1 && (
        <button
          className='absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors'
          onClick={(e) => { e.stopPropagation(); onNext() }}
        >
          <ChevronRight size={28} />
        </button>
      )}
    </div>
  )
}

// ── Small helper components ──────────────────────────────────────
function useOutsideClick(ref: RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onClose])
}

interface SenderFilterProps {
  members: ConversationMemberResponse[]
  value: string | null
  onChange: (v: string | null) => void
  label: string
}
function SenderFilter({ members, value, onChange, label }: SenderFilterProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOutsideClick(ref, () => setOpen(false))
  const selected = members.find((m) => m.userId === value)
  return (
    <div ref={ref} className='relative'>
      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1 px-3 py-1.5 text-[13px] border rounded-full transition-colors',
          value ? 'bg-primary/10 border-primary text-primary' : 'hover:bg-muted'
        )}
      >
        {selected && (
          <UserAvatar
            src={selected.avatar ?? undefined}
            name={selected.fullName}
            className='w-4 h-4 text-[8px] shrink-0'
          />
        )}
        <span className='max-w-[80px] truncate'>{selected?.fullName ?? label}</span>
        {value ? (
          <X
            size={12}
            onClick={(e) => {
              e.stopPropagation()
              onChange(null)
            }}
            className='cursor-pointer'
          />
        ) : (
          <ChevronDown size={13} />
        )}
      </button>
      {open && (
        <div className='absolute top-full left-0 mt-1 w-48 bg-background border rounded-xl shadow-xl z-20 py-1 max-h-48 overflow-y-auto'>
          {members.map((m) => (
            <button
              key={m.userId}
              type='button'
              onClick={() => {
                onChange(value === m.userId ? null : m.userId)
                setOpen(false)
              }}
              className={cn(
                'w-full text-left px-3 py-2 text-[13px] hover:bg-muted transition-colors flex items-center gap-2',
                value === m.userId && 'text-primary font-medium'
              )}
            >
              <UserAvatar src={m.avatar ?? undefined} name={m.fullName} className='w-6 h-6 text-[10px] shrink-0' />
              <span className='truncate'>{m.fullName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface DateRange {
  from: string
  to: string
}
interface DateFilterProps {
  value: DateRange | null
  onChange: (v: DateRange | null) => void
  label: string
}
function DateFilter({ value, onChange, label }: DateFilterProps) {
  const { text } = useChatText()
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState(value?.from ?? '')
  const [to, setTo] = useState(value?.to ?? '')
  const ref = useRef<HTMLDivElement>(null)
  useOutsideClick(ref, () => setOpen(false))
  const isActive = !!value
  const today = new Date().toISOString().split('T')[0]

  const apply = () => {
    if (from || to) onChange({ from, to })
    setOpen(false)
  }
  const clear = () => {
    onChange(null)
    setFrom('')
    setTo('')
    setOpen(false)
  }

  return (
    <div ref={ref} className='relative'>
      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1 px-3 py-1.5 text-[13px] border rounded-full transition-colors',
          isActive ? 'bg-primary/10 border-primary text-primary' : 'hover:bg-muted'
        )}
      >
        <span>{isActive ? `${value!.from || '...'} → ${value!.to || '...'}` : label}</span>
        {isActive ? (
          <X
            size={12}
            onClick={(e) => {
              e.stopPropagation()
              clear()
            }}
            className='cursor-pointer'
          />
        ) : (
          <ChevronDown size={13} />
        )}
      </button>
      {open && (
        <div className='absolute top-full left-0 mt-1 w-56 bg-background border rounded-xl shadow-xl z-20 p-3 flex flex-col gap-2'>
          <div className='flex flex-col gap-1'>
            <label className='text-[11px] text-muted-foreground'>{text.mediaStorage.fromDate}</label>
            <input
              type='date'
              value={from}
              max={to || today}
              onChange={(e) => setFrom(e.target.value)}
              className='w-full text-[13px] border rounded-lg px-2 py-1.5 bg-background outline-none'
            />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-[11px] text-muted-foreground'>{text.mediaStorage.toDate}</label>
            <input
              type='date'
              value={to}
              min={from || undefined}
              max={today}
              onChange={(e) => setTo(e.target.value)}
              className='w-full text-[13px] border rounded-lg px-2 py-1.5 bg-background outline-none'
            />
          </div>
          <div className='flex gap-2 pt-1'>
            <button
              type='button'
              onClick={clear}
              className='flex-1 text-[13px] py-1.5 rounded-lg border hover:bg-muted transition-colors'
            >
              {text.mediaStorage.clear}
            </button>
            <button
              type='button'
              onClick={apply}
              className='flex-1 text-[13px] py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors'
            >
              {text.mediaStorage.apply}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
      <p className='text-[13px]'>{label}</p>
    </div>
  )
}

function MediaSkeleton() {
  return (
    <div className='grid grid-cols-3 gap-1'>
      {[...Array(9)].map((_, i) => (
        <div key={i} className='aspect-square bg-muted rounded animate-pulse' />
      ))}
    </div>
  )
}

function FileSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      {[...Array(4)].map((_, i) => (
        <div key={i} className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-lg bg-muted animate-pulse shrink-0' />
          <div className='flex-1'>
            <div className='h-3 bg-muted rounded animate-pulse mb-2 w-3/4' />
            <div className='h-2.5 bg-muted rounded animate-pulse w-1/2' />
          </div>
        </div>
      ))}
    </div>
  )
}
