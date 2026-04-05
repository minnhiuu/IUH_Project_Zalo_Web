import {
  BellOff,
  Pin,
  UserPlus,
  Settings,
  Users,
  Clock,
  FileText,
  ChevronDown,
  ChevronRight,
  Trash2,
  LogOut,
  Pencil,
  AlertTriangle,
  Timer,
  HelpCircle,
  EyeOff,
  Link2,
  FileArchive,
  FileText as FileIcon
} from 'lucide-react'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/common/user-avatar'
import { GroupAvatar } from './group/group-avatar'
import { ActionButton } from '@/components/common/action-button'
import { ActionMenuItem } from '@/components/common/action-menu-item'
import type { ConversationResponse } from '../schemas/chat.schema'
import { useChatText } from '../i18n/use-chat-text'
import { useAuth } from '@/features/auth'
import { CustomTooltip } from '@/components/common/custom-tooltip'
import { DisappearingMessagesDialog } from '@/components/common/disappearing-messages-dialog'
import { CreateGroupDialog } from './group/create-group-dialog'
import { cn } from '@/lib/utils'

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
      <div className='h-[8px] bg-secondary' />
    </div>
  )
}

interface ChatInfoSidebarProps {
  conversation: ConversationResponse
  onRenameClick?: () => void
  onAvatarClick?: () => void
}

export function ChatInfoSidebar({ conversation, onRenameClick, onAvatarClick }: ChatInfoSidebarProps) {
  const isGroup = conversation.isGroup
  const { text: tg } = useChatText()
  const { user } = useAuth()
  const [isDisappearingDialogOpen, setIsDisappearingDialogOpen] = useState(false)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)

  const currentMember = conversation.members?.find((m) => m.userId === user?.id)
  const isMemberOnly = isGroup && currentMember?.role?.toUpperCase() === 'MEMBER'
  const otherMembers = conversation.members?.filter((m) => m.userId !== user?.id) || []
  const initialSelectedFriendIds = !isGroup ? otherMembers.map((m) => m.userId) : []

  return (
    <div className='w-[350px] border-l border-border bg-background flex flex-col h-full overflow-hidden shrink-0 z-20'>
      {/* Header */}
      <div className='h-[68px] flex items-center justify-center border-b border-border shrink-0 px-4'>
        <h2 className='font-bold text-[16px] text-foreground'>
          {isGroup ? tg.sidebarInfo.groupTitle : tg.sidebarInfo.title}
        </h2>
      </div>

      {/* Main Content */}
      <div className='flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-background'>
        {/* Profile Section */}
        <div className='bg-background p-6 flex flex-col items-center border-b border-border/50 shadow-sm'>
          <div className='relative group'>
            {isGroup && !conversation.avatar ? (
              <div
                onClick={onAvatarClick}
                className='cursor-pointer hover:ring-4 hover:ring-primary/10 rounded-full transition-all'
              >
                <GroupAvatar
                  avatars={conversation.members?.map((m) => m.avatar) || []}
                  names={conversation.members?.map((m) => m.fullName) || []}
                  count={conversation.members?.length || 0}
                  size='xl'
                />
              </div>
            ) : (
              <div
                onClick={onAvatarClick}
                className='cursor-pointer hover:ring-4 hover:ring-primary/10 rounded-full transition-all'
              >
                <UserAvatar
                  src={conversation.avatar}
                  name={conversation.name || tg.user}
                  className='w-20 h-20 shadow-md'
                />
              </div>
            )}
          </div>

          <div className='mt-4 flex items-center space-x-2 overflow-hidden w-full justify-center'>
            <h3 className='font-bold text-[18px] text-foreground truncate'>{conversation.name}</h3>
            <ActionButton icon={<Pencil />} onClick={onRenameClick} size='sm' iconSize='sm' />
          </div>

          <div className={cn('w-full mt-6 px-1 flex justify-center', isGroup ? 'gap-2' : 'gap-8')}>
            <div className='flex flex-col items-center space-y-1.5 w-[72px]'>
              <ActionButton icon={<BellOff />} size='lg' iconSize='lg' />
              <span className='text-[12px] text-foreground font-medium text-center'>
                {tg.sidebarInfo.muteNotifications}
              </span>
            </div>
            <div className='flex flex-col items-center space-y-1.5 w-[72px]'>
              <ActionButton icon={<Pin />} size='lg' iconSize='lg' />
              <span className='text-[12px] text-foreground font-medium text-center'>{tg.sidebarInfo.pin}</span>
            </div>
            {isGroup ? (
              <>
                <div className='flex flex-col items-center space-y-1.5 w-[72px]'>
                  <ActionButton icon={<UserPlus />} size='lg' iconSize='lg' />
                  <span className='text-[12px] text-foreground font-medium text-center leading-tight'>
                    {tg.sidebarInfo.addMember}
                  </span>
                </div>
                <div className='flex flex-col items-center space-y-1.5 w-[72px]'>
                  <ActionButton icon={<Settings />} size='lg' iconSize='lg' />
                  <span className='text-[12px] text-foreground font-medium text-center leading-tight'>
                    {tg.sidebarInfo.settings}
                  </span>
                </div>
              </>
            ) : (
              <div className='flex flex-col items-center space-y-1.5 w-[72px]'>
                <ActionButton icon={<UserPlus />} size='lg' iconSize='lg' onClick={() => setIsCreateGroupOpen(true)} />
                <span className='text-[12px] text-foreground font-medium text-center leading-tight'>
                  {tg.sidebarInfo.createGroup}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className='h-[8px] bg-secondary' />

        {/* Sections */}
        <div className='bg-background'>
          {isGroup && (
            <SidebarSection title={tg.sidebarInfo.members} defaultOpen={true}>
              <div className='flex flex-col w-full'>
                <ActionMenuItem icon={<Users />} label={tg.status.membersCount(conversation.members?.length || 0)} />
              </div>
            </SidebarSection>
          )}

          {isGroup ? (
            <SidebarSection title={tg.sidebarInfo.groupBoard} defaultOpen={true}>
              <div className='flex flex-col w-full'>
                <ActionMenuItem icon={<Clock />} label={tg.sidebarInfo.reminderBoard} />
                <ActionMenuItem icon={<FileText />} label={tg.sidebarInfo.notesPinsPolls} />
              </div>
            </SidebarSection>
          ) : (
            <>
              <div className='bg-background py-1'>
                <ActionMenuItem icon={<Clock />} label={tg.sidebarInfo.reminderBoard} />
                <ActionMenuItem icon={<Users />} label='14 nhóm chung' />
              </div>
              <div className='h-[8px] bg-secondary' />
            </>
          )}

          <SidebarSection title={tg.sidebarInfo.photosVideos} defaultOpen={true}>
            <div className='grid grid-cols-4 gap-1 px-4 py-3'>
              {[...Array(8)].map((_, i) => (
                <div key={i} className='aspect-square bg-muted rounded overflow-hidden cursor-pointer relative group'>
                  <img
                    src={`https://t4.ftcdn.net/jpg/04/81/13/43/360_F_481134373_0CE42TCSX9G1TOB9vA8n4wPZ88YfD55D.jpg`}
                    className='object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity'
                    alt='Mocked media'
                  />
                </div>
              ))}
            </div>
            <div className='px-4 pb-4'>
              <Button variant='secondary' className='w-full font-semibold text-[0.875rem] h-9'>
                Xem tất cả
              </Button>
            </div>
          </SidebarSection>

          <SidebarSection title={tg.sidebarInfo.files} defaultOpen={true}>
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
                Xem tất cả
              </Button>
            </div>
          </SidebarSection>

          <SidebarSection title={tg.sidebarInfo.links} defaultOpen={true}>
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
                      <span className='truncate text-primary/80 max-w-[120px]'>{link.domain}</span>
                      <span className='shrink-0'>{link.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className='px-4 pb-4 mt-2'>
              <Button variant='secondary' className='w-full font-semibold text-[0.875rem] h-9'>
                Xem tất cả
              </Button>
            </div>
          </SidebarSection>

          <SidebarSection title={tg.sidebarInfo.privacySettings} defaultOpen={true}>
            <div className='flex flex-col w-full'>
              <ActionMenuItem
                icon={<Timer />}
                label={tg.sidebarInfo.disappearingMessages}
                labelRightElement={
                  <CustomTooltip
                    content={tg.sidebarInfo.disappearingMessagesTooltip}
                    align='right'
                    tooltipClassName='max-w-[220px] whitespace-normal pt-2 pb-2 leading-[1.4] text-left'
                  >
                    <HelpCircle className='w-[14px] h-[14px] text-muted-foreground hover:text-foreground cursor-pointer outline-none relative top-px' />
                  </CustomTooltip>
                }
                onClick={() => !isMemberOnly && setIsDisappearingDialogOpen(true)}
                subLabel={isMemberOnly ? tg.sidebarInfo.disappearingMessagesWarning : tg.sidebarInfo.never}
                disabled={isMemberOnly}
              />
              <ActionMenuItem icon={<EyeOff />} label={tg.sidebarInfo.hideConversation} rightElement={<Switch />} />
            </div>
          </SidebarSection>
        </div>

        {/* Footer Actions */}
        <div className='bg-background'>
          <ActionMenuItem icon={<AlertTriangle />} label={tg.sidebarInfo.reportAction} />
          <ActionMenuItem
            icon={<Trash2 />}
            label={tg.sidebarInfo.deleteHistory}
            variant='destructive'
            showDivider={true}
          />
          {isGroup && (
            <ActionMenuItem
              icon={<LogOut />}
              label={tg.sidebarInfo.leaveGroup}
              variant='destructive'
              showDivider={true}
            />
          )}
        </div>
      </div>

      <DisappearingMessagesDialog
        open={isDisappearingDialogOpen}
        onOpenChange={setIsDisappearingDialogOpen}
        onConfirm={(duration) => {
          console.log('Set duration:', duration)
          setIsDisappearingDialogOpen(false)
        }}
      />

      {isCreateGroupOpen && (
        <CreateGroupDialog
          isOpen={isCreateGroupOpen}
          onClose={() => setIsCreateGroupOpen(false)}
          initialSelectedFriendIds={initialSelectedFriendIds}
        />
      )}
    </div>
  )
}
