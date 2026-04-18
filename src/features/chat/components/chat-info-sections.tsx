import {
  Users,
  Clock,
  FileText,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Timer,
  HelpCircle,
  EyeOff,
  Link2,
  LogOut,
  Trash2,
  Copy,
  Forward,
  Link,
  Play,
  X,
  Archive
} from 'lucide-react'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { ActionMenuItem } from '@/components/common/action-menu-item'
import { ActionButton } from '@/components/common/action-button'
import { CustomTooltip } from '@/components/common/custom-tooltip'
import { showSimpleToast } from '@/utils/toast'
import { useMediaMessagesQuery } from '../queries/use-queries'
import { MediaStorageView } from './media-storage-view'
import type { ConversationMemberResponse } from '../schemas/chat.schema'
import { cn } from '@/lib/utils'
import { useChatText } from '../i18n/use-chat-text'

interface SidebarSectionProps {
  title: string
  icon?: React.ReactNode
  children?: React.ReactNode
  badge?: string | number
  defaultOpen?: boolean
}

function SidebarSection({ title, icon, children, badge, defaultOpen = true }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className='bg-background'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors group cursor-pointer'
      >
        <div className='flex items-center text-[15px] font-semibold text-foreground'>
          {icon && <span className='mr-3 text-icon-menu group-hover:opacity-80 transition-opacity'>{icon}</span>}
          <span className='truncate'>{title}</span>
        </div>
        <div className='flex items-center space-x-2 text-icon-menu'>
          {badge !== undefined && !!badge && (
            <span className='text-[12px] bg-muted px-2 py-0.5 rounded-full font-semibold'>{badge}</span>
          )}
          {isOpen ? <ChevronDown className='w-4 h-4' /> : <ChevronRight className='w-4 h-4' />}
        </div>
      </button>
      {isOpen && <div className='px-0 animate-in fade-in slide-in-from-top-1 duration-200'>{children}</div>}
      <div className='h-2 bg-secondary' />
    </div>
  )
}

interface ChatInfoSectionsText {
  members: string
  pendingJoinRequestsLabel: (count: number) => string
  groupBoard: string
  reminderBoard: string
  notesPinsPolls: string
  commonGroupsCount: (count: number) => string
  photosVideos: string
  files: string
  links: string
  privacySettings: string
  disappearingMessages: string
  disappearingMessagesTooltip: string
  disappearingMessagesWarning: string
  never: string
  hideConversation: string
  reportAction: string
  deleteHistory: string
  leaveGroup: string
  viewAll: string
}

interface ChatInfoSectionsProps {
  isGroup: boolean
  isMemberOnly: boolean
  text: ChatInfoSectionsText
  membersCountLabel: string
  pendingRequestsCount?: number
  conversationId?: string
  members?: ConversationMemberResponse[] | null
  onOpenMembers: () => void
  onOpenDisappearingDialog: () => void
  onLeaveGroup: () => void
  joinLinkToken?: string | null
  joinByLinkEnabled?: boolean
  isReadOnly?: boolean
  isGenerating?: boolean
  onGenerateJoinLink?: () => void
  onShareLink?: () => void
  onOpenStorage?: (tab: 'media' | 'files' | 'links') => void
}

export function ChatInfoSections({
  isGroup,
  isMemberOnly,
  text,
  membersCountLabel,
  pendingRequestsCount = 0,
  conversationId,
  members,
  onOpenMembers,
  onOpenDisappearingDialog,
  onLeaveGroup,
  joinLinkToken,
  joinByLinkEnabled,
  isReadOnly,
  isGenerating,
  onShareLink,
  onGenerateJoinLink,
  onOpenStorage
}: ChatInfoSectionsProps) {
  const [storageOpen, setStorageOpen] = useState(false)
  const [storageTab, setStorageTab] = useState<'media' | 'files' | 'links'>('media')
  const [viewingMedia, setViewingMedia] = useState<{ url: string; isVideo: boolean } | null>(null)
  const { text: chatText } = useChatText()

  // Fetch preview data for sidebar
  const { data: mediaData } = useMediaMessagesQuery(conversationId, ['IMAGE', 'VIDEO'], 0, 8)
  const { data: fileData } = useMediaMessagesQuery(conversationId, ['FILE'], 0, 3)

  const mediaItems = mediaData?.data || []
  const fileItems = fileData?.data || []

  const openStorage = (tab: 'media' | 'files' | 'links') => {
    if (onOpenStorage) {
      onOpenStorage(tab)
    } else {
      setStorageTab(tab)
      setStorageOpen(true)
    }
  }

  if (storageOpen && conversationId) {
    return (
      <MediaStorageView
        conversationId={conversationId}
        members={members}
        defaultTab={storageTab}
        onClose={() => setStorageOpen(false)}
      />
    )
  }

  return (
    <>
      <div className='bg-background'>
        {isGroup && (
          <SidebarSection title={text.members} defaultOpen={true}>
            <div className='flex flex-col w-full'>
              <ActionMenuItem
                icon={<Users />}
                label={membersCountLabel}
                onClick={onOpenMembers}
                subLabel={
                  !isMemberOnly && pendingRequestsCount > 0 ? (
                    <div className='flex items-center gap-1 text-[13px] text-primary font-medium'>
                      <span className='scale-150'>•</span>
                      <span>{text.pendingJoinRequestsLabel(pendingRequestsCount)}</span>
                    </div>
                  ) : undefined
                }
              />
              {joinLinkToken ? (
                <ActionMenuItem
                  icon={<Link />}
                  label={chatText.sidebarInfo.groupJoinLink}
                  showDivider={true}
                  as='div'
                  subLabel={
                    <span className='text-[13px] font-medium truncate' style={{ color: 'var(--cta-link)' }}>
                      {`${window.location.origin}/g/${joinLinkToken}`}
                    </span>
                  }
                  rightElement={
                    <div className='flex items-center gap-2'>
                      <ActionButton
                        icon={<Copy />}
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/g/${joinLinkToken}`)
                          showSimpleToast(chatText.sidebarInfo.copied)
                        }}
                      />
                      <ActionButton icon={<Forward />} onClick={onShareLink} />
                    </div>
                  }
                />
              ) : (
                joinByLinkEnabled &&
                onGenerateJoinLink && (
                  <button
                    type='button'
                    disabled={isReadOnly || isGenerating}
                    className='px-4 py-2 flex items-center gap-2 text-[13px] text-primary font-medium cursor-pointer disabled:opacity-30 hover:bg-muted/30 transition-colors border-t border-border/40'
                    onClick={onGenerateJoinLink}
                  >
                    <Link className='w-4 h-4' />
                    {isGenerating ? chatText.sidebarInfo.generating : chatText.sidebarInfo.createInviteLink}
                  </button>
                )
              )}
            </div>
          </SidebarSection>
        )}

        {isGroup ? (
          <SidebarSection title={text.groupBoard} defaultOpen={true}>
            <div className='flex flex-col w-full'>
              <ActionMenuItem icon={<Clock />} label={text.reminderBoard} />
              <ActionMenuItem icon={<FileText />} label={text.notesPinsPolls} />
            </div>
          </SidebarSection>
        ) : (
          <>
            <div className='bg-background py-1'>
              <ActionMenuItem icon={<Clock />} label={text.reminderBoard} />
              <ActionMenuItem icon={<Users />} label={text.commonGroupsCount(14)} />
            </div>
            <div className='h-2 bg-secondary' />
          </>
        )}

        <SidebarSection title={text.photosVideos} defaultOpen={true}>
          {mediaItems.length === 0 ? (
            <p className='text-[12px] text-muted-foreground text-center py-4'>{chatText.mediaStorage.noPhotosVideos}</p>
          ) : (
            <div className='grid grid-cols-4 gap-1 px-4 py-3'>
              {mediaItems.flatMap((m) =>
                (m.attachments || []).map((att, attIdx) => ({ m, att, attIdx }))
              ).slice(0, 8).map(({ m, att, attIdx }) => {
                const isVideo = att?.contentType?.startsWith('video/')
                return (
                  <div
                    key={`${m.id}-${attIdx}`}
                    className='aspect-square bg-muted rounded overflow-hidden cursor-pointer relative group'
                    onClick={() => setViewingMedia({ url: att?.url || '', isVideo: !!isVideo })}
                  >
                    {isVideo ? (
                      <div className='w-full h-full relative'>
                        <video src={att?.url} className='w-full h-full object-cover' preload='metadata' muted />
                        <div className='absolute inset-0 flex items-center justify-center bg-black/30'>
                          <Play size={16} className='text-white fill-white' />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={att?.url}
                        alt={att?.originalFileName || 'image'}
                        className='object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity'
                        loading='lazy'
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}
          <div className='px-4 pb-4'>
            <Button
              variant='secondary'
              className='w-full font-semibold text-[0.875rem] h-9'
              onClick={() => openStorage('media')}
            >
              {text.viewAll}
            </Button>
          </div>
        </SidebarSection>

        <SidebarSection title={text.files} defaultOpen={true}>
          {fileItems.length === 0 ? (
            <p className='text-[12px] text-muted-foreground text-center py-4'>{chatText.mediaStorage.noFiles}</p>
          ) : (
            <div className='flex flex-col px-4 py-2 space-y-3'>
              {fileItems.slice(0, 3).map((m) => {
                const att = m.attachments?.[0]
                const fileName = att?.originalFileName || att?.fileName || 'File'
                const ext = fileName.split('.').pop()?.toUpperCase() || ''
                const fileSize = att?.size
                const getBadge = (ext: string): { bg: string; label: string } => {
                  if (['PDF'].includes(ext)) return { bg: 'bg-red-500', label: 'PDF' }
                  if (['DOC', 'DOCX'].includes(ext)) return { bg: 'bg-blue-600', label: 'WORD' }
                  if (['XLS', 'XLSX'].includes(ext)) return { bg: 'bg-green-600', label: 'EXCEL' }
                  if (['PPT', 'PPTX'].includes(ext)) return { bg: 'bg-orange-500', label: 'PPT' }
                  if (['ZIP', 'RAR', '7Z'].includes(ext)) return { bg: 'bg-purple-600', label: ext }
                  return { bg: 'bg-primary', label: ext || 'FILE' }
                }
                const { bg, label } = getBadge(ext)
                const sentAt = m.createdAt
                  ? new Date(m.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })
                  : ''
                return (
                  <div key={m.id} className='flex items-start gap-3 cursor-pointer group'>
                    <div
                      className={cn(
                        'w-10 h-10 shrink-0 rounded flex items-center justify-center text-white',
                        bg
                      )}
                    >
                      {['ZIP', 'RAR', '7Z'].includes(ext) ? (
                        <Archive size={18} className='text-white' />
                      ) : (
                        <span className='text-[9px] font-bold tracking-tight leading-none text-center px-0.5'>{label}</span>
                      )}
                    </div>
                    <div className='flex-1 min-w-0 flex flex-col justify-center h-10'>
                      <p className='text-[0.875rem] text-foreground font-medium truncate group-hover:text-primary transition-colors'>
                        {fileName}
                      </p>
                      <div className='flex items-center justify-between text-[0.75rem] text-muted-foreground mt-0.5'>
                        <span>{fileSize ? `${(fileSize / 1024).toFixed(2)} KB` : ''}</span>
                        <span>{sentAt}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div className='px-4 pb-4 mt-2'>
            <Button
              variant='secondary'
              className='w-full font-semibold text-[0.875rem] h-9'
              onClick={() => openStorage('files')}
            >
              {text.viewAll}
            </Button>
          </div>
        </SidebarSection>

        <SidebarSection title={text.links} defaultOpen={true}>
          <div className='flex flex-col px-4 py-2 space-y-3'>
            {[
              { url: 'https://youtu.be/rRA9NVIKhjQ', domain: 'youtu.be', date: 'Hôm qua' },
              { url: 'Pollinations API Reference', domain: 'enter.pollinations.ai', date: '28/03' },
              { url: 'Unknown', domain: 'youtu.be', date: '28/03' }
            ].map((link, i) => (
              <div key={i} className='flex items-start gap-3 cursor-pointer group'>
                <div className='w-10 h-10 shrink-0 bg-muted rounded-md flex items-center justify-center text-icon-menu'>
                  <Link2 className='w-5 h-5' />
                </div>
                <div className='flex-1 min-w-0 flex flex-col justify-center h-10'>
                  <p className='text-[0.875rem] text-foreground font-medium truncate group-hover:text-primary transition-colors'>
                    {link.url}
                  </p>
                  <div className='flex items-center justify-between text-[0.75rem] text-muted-foreground mt-0.5'>
                    <span className='truncate text-primary/80 max-w-30'>{link.domain}</span>
                    <span className='shrink-0'>{link.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className='px-4 pb-4 mt-2'>
            <Button variant='secondary' className='w-full font-semibold text-[0.875rem] h-9'>
              {text.viewAll}
            </Button>
          </div>
        </SidebarSection>

        <SidebarSection title={text.privacySettings} defaultOpen={true}>
          <div className='flex flex-col w-full'>
            <ActionMenuItem
              icon={<Timer />}
              label={text.disappearingMessages}
              labelRightElement={
                <CustomTooltip
                  content={text.disappearingMessagesTooltip}
                  align='right'
                  tooltipClassName='max-w-[220px] whitespace-normal pt-2 pb-2 leading-[1.4] text-left'
                >
                  <HelpCircle className='w-3.5 h-3.5 text-muted-foreground hover:text-foreground cursor-pointer outline-none relative top-px' />
                </CustomTooltip>
              }
              onClick={() => !isMemberOnly && onOpenDisappearingDialog()}
              subLabel={isMemberOnly ? text.disappearingMessagesWarning : text.never}
              disabled={isMemberOnly}
            />
            <ActionMenuItem as="div" icon={<EyeOff />} label={text.hideConversation} rightElement={<Switch />} />
          </div>
        </SidebarSection>
      </div>

      <div className='bg-background'>
        <ActionMenuItem icon={<AlertTriangle />} label={text.reportAction} />
        <ActionMenuItem icon={<Trash2 />} label={text.deleteHistory} variant='destructive' showDivider={true} />
        {isGroup && (
          <ActionMenuItem
            icon={<LogOut />}
            label={text.leaveGroup}
            variant='destructive'
            showDivider={true}
            onClick={onLeaveGroup}
          />
        )}
      </div>

      {viewingMedia && (
        <div
          className='fixed inset-0 z-50 bg-black/90 flex items-center justify-center'
          onClick={() => setViewingMedia(null)}
        >
          <button
            type='button'
            onClick={() => setViewingMedia(null)}
            className='absolute top-4 right-4 text-white hover:text-white/70 transition-colors'
          >
            <X size={28} />
          </button>
          {viewingMedia.isVideo ? (
            <video
              src={viewingMedia.url}
              controls
              autoPlay
              className='max-w-[90vw] max-h-[90vh] rounded-lg'
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={viewingMedia.url}
              alt='preview'
              className='max-w-[90vw] max-h-[90vh] object-contain rounded-lg'
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </>
  )
}
