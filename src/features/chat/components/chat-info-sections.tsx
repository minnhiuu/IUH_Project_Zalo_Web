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
  FileArchive,
  FileText as FileIcon,
  LogOut,
  Trash2,
  Copy,
  Forward,
  Link
} from 'lucide-react'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { ActionMenuItem } from '@/components/common/action-menu-item'
import { ActionButton } from '@/components/common/action-button'
import { CustomTooltip } from '@/components/common/custom-tooltip'
import { showSimpleToast } from '@/utils/toast'

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
  onOpenMembers: () => void
  onOpenDisappearingDialog: () => void
  onLeaveGroup: () => void
  joinLinkToken?: string | null
  joinByLinkEnabled?: boolean
  isReadOnly?: boolean
  isGenerating?: boolean
  onGenerateJoinLink?: () => void
  onShareLink?: () => void
}

export function ChatInfoSections({
  isGroup,
  isMemberOnly,
  text,
  membersCountLabel,
  onOpenMembers,
  onOpenDisappearingDialog,
  onLeaveGroup,
  joinLinkToken,
  joinByLinkEnabled,
  isReadOnly,
  isGenerating,
  onShareLink,
  onGenerateJoinLink
}: ChatInfoSectionsProps) {
  return (
    <>
      <div className='bg-background'>
        {isGroup && (
          <SidebarSection title={text.members} defaultOpen={true}>
            <div className='flex flex-col w-full'>
              <ActionMenuItem icon={<Users />} label={membersCountLabel} onClick={onOpenMembers} />
              {joinLinkToken ? (
                <ActionMenuItem
                  icon={<Link />}
                  label='Link tham gia nhóm'
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
                          showSimpleToast('Đã sao chép')
                        }}
                      />
                      <ActionButton
                        icon={<Forward />}
                        onClick={onShareLink}
                      />
                    </div>
                  }
                />
              ) : (
                joinByLinkEnabled && onGenerateJoinLink && (
                  <button
                    type='button'
                    disabled={isReadOnly || isGenerating}
                    className='px-4 py-2 flex items-center gap-2 text-[13px] text-primary font-medium cursor-pointer disabled:opacity-30 hover:bg-muted/30 transition-colors border-t border-border/40'
                    onClick={onGenerateJoinLink}
                  >
                    <Link className='w-4 h-4' />
                    {isGenerating ? 'Đang tạo...' : 'Tạo link mời'}
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
          <div className='grid grid-cols-4 gap-1 px-4 py-3'>
            {[...Array(8)].map((_, i) => (
              <div key={i} className='aspect-square bg-muted rounded overflow-hidden cursor-pointer relative group'>
                <img
                  src='https://t4.ftcdn.net/jpg/04/81/13/43/360_F_481134373_0CE42TCSX9G1TOB9vA8n4wPZ88YfD55D.jpg'
                  className='object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity'
                  alt='Mocked media'
                />
              </div>
            ))}
          </div>
          <div className='px-4 pb-4'>
            <Button variant='secondary' className='w-full font-semibold text-[0.875rem] h-9'>
              {text.viewAll}
            </Button>
          </div>
        </SidebarSection>

        <SidebarSection title={text.files} defaultOpen={true}>
          <div className='flex flex-col px-4 py-2 space-y-3'>
            {[
              { type: 'word', name: 'Desach-cnm.docx', size: '16.47 KB', date: '29/03/2026' },
              { type: 'zip', name: 'ontapcnm.rar', size: '23.12 KB', date: '26/03/2026' },
              { type: 'zip', name: 'NguyenXuanHo_DeThiThu.rar', size: '23.75 KB', date: '25/03/2026' }
            ].map((file, i) => (
              <div key={i} className='flex items-start gap-3 cursor-pointer group'>
                <div
                  className={`w-10 h-10 shrink-0 rounded flex items-center justify-center text-white ${file.type === 'word' ? 'bg-blue-500' : 'bg-purple-500'}`}
                >
                  {file.type === 'word' ? <FileIcon className='w-5 h-5' /> : <FileArchive className='w-5 h-5' />}
                </div>
                <div className='flex-1 min-w-0 flex flex-col justify-center h-10'>
                  <p className='text-[0.875rem] text-foreground font-medium truncate group-hover:text-primary transition-colors'>
                    {file.name}
                  </p>
                  <div className='flex items-center justify-between text-[0.75rem] text-muted-foreground mt-0.5'>
                    <div className='flex items-center gap-1'>
                      <span>{file.size}</span>
                    </div>
                    <span>{file.date}</span>
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
    </>
  )
}
