import { useCallback, useEffect, useRef, useState } from 'react'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt'
import { useAuth } from '@/features/auth'
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Settings, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/common/user-avatar'

const ZEGO_APP_ID = Number(import.meta.env.VITE_ZEGO_APP_ID)
const ZEGO_SERVER_SECRET = import.meta.env.VITE_ZEGO_SERVER_SECRET as string

// ─── Group Call State Interface ─────────────────────────────────
export interface GroupCallState {
  phase: 'idle' | 'configuring' | 'active'
  roomId: string | null
  callKind: 'voice' | 'video'
  isMicOn: boolean
  isCameraOn: boolean
}

// ─── Custom hook useGroupCall ───────────────────────────────────
export function useGroupCall() {
  const [groupCallState, setGroupCallState] = useState<GroupCallState>({
    phase: 'idle',
    roomId: null,
    callKind: 'voice',
    isMicOn: true,
    isCameraOn: true
  })

  const startGroupCall = useCallback((roomId: string, callKind: 'voice' | 'video') => {
    setGroupCallState({
      phase: 'active',
      roomId,
      callKind,
      isMicOn: true,
      isCameraOn: callKind === 'video'
    })
  }, [])

  const joinGroupCall = useCallback(() => {
    setGroupCallState((prev) => ({ ...prev, phase: 'active' }))
  }, [])

  const cancelConfig = useCallback(() => {
    setGroupCallState({
      phase: 'idle',
      roomId: null,
      callKind: 'voice',
      isMicOn: true,
      isCameraOn: true
    })
  }, [])

  const endGroupCall = useCallback(() => {
    setGroupCallState({
      phase: 'idle',
      roomId: null,
      callKind: 'voice',
      isMicOn: true,
      isCameraOn: true
    })
  }, [])

  const toggleMic = useCallback(() => {
    setGroupCallState((prev) => ({ ...prev, isMicOn: !prev.isMicOn }))
  }, [])

  const toggleCamera = useCallback(() => {
    setGroupCallState((prev) => ({ ...prev, isCameraOn: !prev.isCameraOn }))
  }, [])

  return {
    groupCallState,
    startGroupCall,
    joinGroupCall,
    cancelConfig,
    endGroupCall,
    toggleMic,
    toggleCamera
  }
}

// ─── Group Call Config Screen (Premium Pre-call) ─────────────────
interface GroupCallConfigScreenProps {
  roomId: string
  callKind: 'voice' | 'video'
  isMicOn: boolean
  isCameraOn: boolean
  groupName: string
  groupAvatar?: string | null
  onToggleMic: () => void
  onToggleCamera: () => void
  onJoin: () => void
  onCancel: () => void
}

export function GroupCallConfigScreen({
  callKind,
  isMicOn,
  isCameraOn,
  groupName,
  groupAvatar,
  onToggleMic,
  onToggleCamera,
  onJoin,
  onCancel
}: GroupCallConfigScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { user } = useAuth()

  // Camera preview handling
  useEffect(() => {
    let mounted = true
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        if (mounted && videoRef.current) {
          videoRef.current.srcObject = stream
          streamRef.current = stream
        } else {
          stream.getTracks().forEach((t) => t.stop())
        }
      } catch (err) {
        console.warn('Failed to access camera for preview:', err)
      }
    }

    if (isCameraOn && callKind === 'video') {
      void startCamera()
    } else {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      if (videoRef.current) videoRef.current.srcObject = null
    }

    return () => {
      mounted = false
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [isCameraOn, callKind])

  const handleJoin = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    onJoin()
  }

  const handleCancel = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    onCancel()
  }

  return (
    <div className='fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[#14142b] via-[#0d0d1e] to-[#05050b] text-white overflow-hidden items-center justify-center p-4'>
      {/* Background ambient lighting */}
      <div className='absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none' />
      <div className='absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none' />

      {/* Header Info */}
      <div className='text-center mb-8 relative z-10 max-w-md px-4'>
        <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3.5 border border-blue-500/20'>
          <Users className='w-3.5 h-3.5' />
          Cuộc gọi nhóm
        </div>
        <h2 className='text-2xl font-bold tracking-wide leading-tight truncate mb-1'>{groupName}</h2>
        <p className='text-white/60 text-[14px]'>Thiết lập camera và micro của bạn trước khi tham gia</p>
      </div>

      {/* Premium Preview Box */}
      <div className='relative w-full max-w-[480px] aspect-[16/10] bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md mb-8 z-10 flex flex-col items-center justify-center'>
        {callKind === 'video' && isCameraOn ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className='w-full h-full object-cover rounded-2xl'
          />
        ) : (
          <div className='flex flex-col items-center gap-4 text-center p-6'>
            {/* Pulsing Avatar Rings */}
            <div className='relative mb-2'>
              <div className='absolute -inset-4 rounded-full bg-blue-500/10 animate-pulse' />
              <div className='absolute -inset-8 rounded-full bg-blue-500/5 animate-pulse' style={{ animationDuration: '3s' }} />
              {groupAvatar ? (
                <img
                  src={groupAvatar}
                  alt={groupName}
                  className='w-24 h-24 rounded-2xl object-cover border-[3px] border-white/20 shadow-2xl relative z-10'
                />
              ) : (
                <div className='w-24 h-24 rounded-2xl bg-[#2a2a40] border-[3px] border-white/20 shadow-2xl relative z-10 flex items-center justify-center text-4xl font-semibold uppercase text-blue-300'>
                  {groupName.slice(0, 2)}
                </div>
              )}
            </div>
            <span className='text-white/40 text-xs tracking-wider flex items-center gap-1.5 mt-2 bg-white/5 px-2.5 py-1 rounded-full border border-white/5'>
              <span className='w-1.5 h-1.5 rounded-full bg-red-500' />
              Camera đang tắt
            </span>
          </div>
        )}

        {/* User Identity Overlay */}
        <div className='absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium flex items-center gap-2'>
          <UserAvatar src={user?.avatar} name={user?.fullName || 'User'} className='w-5 h-5 border border-white/20' />
          <span>{user?.fullName} (Bạn)</span>
        </div>
      </div>

      {/* Control Buttons & Device Config */}
      <div className='flex flex-col items-center gap-6 w-full max-w-sm relative z-10'>
        <div className='flex items-center gap-5 justify-center w-full'>
          {/* Mic Toggle */}
          <button
            onClick={onToggleMic}
            className='flex flex-col items-center gap-2 group'
          >
            <div
              className={cn(
                'w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all border shadow-lg active:scale-95',
                isMicOn
                  ? 'bg-white/10 border-white/10 hover:bg-white/20 hover:border-white/20 text-white'
                  : 'bg-red-500/20 border-red-500/30 text-red-500 hover:bg-red-500/30'
              )}
            >
              {isMicOn ? <Mic className='w-[22px] h-[22px]' /> : <MicOff className='w-[22px] h-[22px]' />}
            </div>
            <span className='text-white/60 text-xs font-medium group-hover:text-white transition-colors'>
              {isMicOn ? 'Tắt Mic' : 'Bật Mic'}
            </span>
          </button>

          {/* Camera Toggle */}
          <button
            onClick={onToggleCamera}
            disabled={callKind !== 'video'}
            className='flex flex-col items-center gap-2 group disabled:opacity-40 disabled:pointer-events-none'
          >
            <div
              className={cn(
                'w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all border shadow-lg active:scale-95',
                isCameraOn && callKind === 'video'
                  ? 'bg-white/10 border-white/10 hover:bg-white/20 hover:border-white/20 text-white'
                  : 'bg-red-500/20 border-red-500/30 text-red-500 hover:bg-red-500/30'
              )}
            >
              {isCameraOn && callKind === 'video' ? (
                <Video className='w-[22px] h-[22px]' />
              ) : (
                <VideoOff className='w-[22px] h-[22px]' />
              )}
            </div>
            <span className='text-white/60 text-xs font-medium group-hover:text-white transition-colors'>
              {isCameraOn && callKind === 'video' ? 'Tắt Cam' : 'Bật Cam'}
            </span>
          </button>
        </div>

        {/* Action Bottom Actions */}
        <div className='flex items-center gap-4 w-full mt-4 justify-center'>
          <button
            onClick={handleCancel}
            className='flex-1 max-w-[130px] py-3 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-all text-center active:scale-[0.98]'
          >
            Hủy bỏ
          </button>

          <button
            onClick={handleJoin}
            className='flex-1 max-w-[180px] py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-all text-center active:scale-[0.98] shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5'
          >
            Tham gia ngay
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Group Incoming Call Screen (Zalo style) ──────────────────────
interface GroupIncomingCallDialogProps {
  callerName: string
  callerAvatar: string
  groupName: string
  roomId: string
  callKind: 'voice' | 'video'
  onAccept: (roomId: string, callKind: 'voice' | 'video') => void
  onReject: () => void
}

export function GroupIncomingCallDialog({
  callerName,
  callerAvatar,
  groupName,
  roomId,
  callKind,
  onAccept,
  onReject
}: GroupIncomingCallDialogProps) {
  return (
    <div className='fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[#14142b] via-[#0d0d1e] to-[#05050b] text-white overflow-hidden items-center justify-center p-4'>
      {/* Background ambient lighting */}
      <div className='absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none' />
      <div className='absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none' />

      {/* Content */}
      <div className='flex-1 flex flex-col items-center justify-center relative z-10 max-w-md px-4 text-center'>
        <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8 border border-blue-500/20 animate-pulse'>
          <Users className='w-3.5 h-3.5' />
          Cuộc gọi nhóm đến
        </div>

        <div className='relative mb-8'>
          {/* Glowing pulse rings */}
          <div
            className='absolute -inset-4 rounded-full border-2 border-blue-500/20 animate-ping'
            style={{ animationDuration: '2s' }}
          />
          <div
            className='absolute -inset-8 rounded-full border border-blue-500/10 animate-ping'
            style={{ animationDuration: '2.5s' }}
          />
          {callerAvatar ? (
            <img
              src={callerAvatar}
              alt={callerName}
              className='relative w-24 h-24 rounded-2xl object-cover border-[3px] border-white/20 shadow-2xl'
            />
          ) : (
            <div className='relative w-24 h-24 rounded-2xl bg-[#2a2a40] border-[3px] border-white/20 shadow-2xl flex items-center justify-center text-4xl font-semibold uppercase text-blue-300'>
              {callerName.slice(0, 2)}
            </div>
          )}
        </div>

        <h2 className='text-2xl font-bold tracking-wide leading-tight mb-2'>{groupName}</h2>
        <p className='text-white/60 text-sm mb-1'>
          Bắt đầu bởi <span className='font-semibold text-white/90'>{callerName}</span>
        </p>
        <p className='text-blue-400 text-[13px] font-medium tracking-wide bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/15 inline-block mt-1'>
          BondHub — {callKind === 'video' ? 'Cuộc gọi Video nhóm' : 'Cuộc gọi Thoại nhóm'}
        </p>
      </div>

      {/* Action buttons */}
      <div className='pb-12 flex items-center justify-center gap-16 relative z-10 w-full max-w-sm'>
        <button onClick={onReject} className='flex flex-col items-center gap-2 group cursor-pointer'>
          <div className='w-[60px] h-[60px] rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all duration-300 shadow-lg shadow-red-500/25 active:scale-90 border border-red-400/20'>
            <PhoneOff className='w-6 h-6 text-white' />
          </div>
          <span className='text-white/60 text-xs font-medium group-hover:text-white transition-colors'>Từ chối</span>
        </button>

        <button onClick={() => onAccept(roomId, callKind)} className='flex flex-col items-center gap-2 group cursor-pointer'>
          <div className='w-[60px] h-[60px] rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-all duration-300 shadow-lg shadow-emerald-500/25 active:scale-90 border border-emerald-400/20 animate-bounce' style={{ animationDuration: '2s' }}>
            <Phone className='w-6 h-6 text-white' />
          </div>
          <span className='text-white/60 text-xs font-medium group-hover:text-white transition-colors'>Tham gia</span>
        </button>
      </div>
    </div>
  )
}

// ─── Group Call Room Component (Embeds Zego multiplayer) ───────────
interface GroupCallRoomProps {
  roomId: string
  callKind: 'voice' | 'video'
  isMicOn: boolean
  isCameraOn: boolean
  onCallEnd: (isLastUser: boolean) => void
}

export function GroupCallRoom({
  roomId,
  callKind,
  isMicOn,
  isCameraOn,
  onCallEnd
}: GroupCallRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const zpRef = useRef<ReturnType<typeof ZegoUIKitPrebuilt.create> | null>(null)
  const { user } = useAuth()
  const participantCountRef = useRef(1)

  useEffect(() => {
    if (!containerRef.current || !user) return

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      ZEGO_APP_ID,
      ZEGO_SERVER_SECRET,
      roomId,
      user.id,
      user.fullName || 'User'
    )

    const zp = ZegoUIKitPrebuilt.create(kitToken)
    zpRef.current = zp

    zp.joinRoom({
      container: containerRef.current,
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference
      },
      turnOnMicrophoneWhenJoining: isMicOn,
      turnOnCameraWhenJoining: callKind === 'video' && isCameraOn,
      showMyCameraToggleButton: true,
      showMyMicrophoneToggleButton: true,
      showAudioVideoSettingsButton: true,
      showScreenSharingButton: true,
      showTextChat: false,
      showUserList: true,
      showPreJoinView: false,
      showRoomDetailsButton: false,
      showLeaveRoomConfirmDialog: false,
      maxUsers: 20,
      layout: 'Auto',
      showLayoutButton: true,
      onUserJoin: (users) => {
        participantCountRef.current += users.length
      },
      onUserLeave: (users) => {
        participantCountRef.current = Math.max(1, participantCountRef.current - users.length)
      },
      onLeaveRoom: () => {
        onCallEnd(participantCountRef.current <= 1)
      }
    })

    return () => {
      try {
        zpRef.current?.destroy()
      } catch (err) {
        console.warn('Failed to destroy Zego instance during cleanup:', err)
      }
      zpRef.current = null
    }
  }, [roomId, user, isMicOn, isCameraOn, callKind, onCallEnd])

  return (
    <div className='fixed inset-0 z-50 flex flex-col bg-black overflow-hidden w-full h-full'>
      <div ref={containerRef} className='w-full h-full' />
    </div>
  )
}
