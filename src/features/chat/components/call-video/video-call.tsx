import { useCallback, useEffect, useRef, useState } from 'react'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt'
import { initiateCallApi, acceptCallApi, endCallApi, cancelCallApi, getCallTokenApi, type CallResponse } from '../../api/call.api'
import { useAuth } from '@/features/auth'
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/common/user-avatar'

const ZEGO_APP_ID = Number(import.meta.env.VITE_ZEGO_APP_ID)
const ZEGO_SERVER_SECRET = import.meta.env.VITE_ZEGO_SERVER_SECRET as string

// ─── Outgoing Call (Ringing) Screen — Zalo style ────────────────
type CallKind = 'voice' | 'video'
interface OutgoingCallProps {
  callData: CallResponse
  onCancel: () => void
  onConnect: () => void
  callKind?: CallKind
}

export function OutgoingCallScreen({ callData, onCancel, onConnect, callKind = 'voice' }: OutgoingCallProps) {
  const [dots, setDots] = useState('')
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Camera preview
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
      } catch {
        // Camera not available
      }
    }
    if (isCameraOn && callKind === 'video') {
      startCamera()
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

  const handleCancel = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    onCancel()
  }

  const handleConnect = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    onConnect()
  }

  return (
    <div className='fixed inset-0 z-50 flex flex-col bg-[#1a1a2e] overflow-hidden'>
      {/* Camera preview / dark background */}
      {callKind === 'video' && isCameraOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className='absolute inset-0 w-full h-full object-cover blur-sm opacity-40'
        />
      ) : (
        <div className='absolute inset-0 bg-[#1a1a2e]' />
      )}

      {/* Content overlay */}
      <div className='relative z-10 flex-1 flex flex-col items-center justify-center'>
        {/* Avatar */}
        <div className='relative mb-5'>
          <img
            src={callData.receiverAvatar || '/images/default-avatar.png'}
            alt={callData.receiverName}
            className='w-24 h-24 rounded-full object-cover border-[3px] border-white/30 shadow-2xl'
          />
        </div>

        {/* Status text */}
        <p className='text-white/80 text-[15px]'>
          {callKind === 'voice' ? 'Đang gọi thoại đến' : 'Đang gọi video đến'} {callData.receiverName}
          {dots}
        </p>
      </div>

      {/* Bottom controls bar — matches Zalo layout */}
      <div className='relative z-10 pb-8 pt-4'>
        <div className='flex items-center justify-center gap-6'>
          {/* Camera toggle (video call only) */}
          <button
            onClick={() => setIsCameraOn((prev) => !prev)}
            className='flex flex-col items-center gap-1.5'
            disabled={callKind !== 'video'}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isCameraOn && callKind === 'video' ? 'bg-white/20' : 'bg-white/10'
              } ${callKind !== 'video' ? 'opacity-40' : ''}`}
            >
              {isCameraOn && callKind === 'video' ? (
                <Video className='w-5 h-5 text-white' />
              ) : (
                <VideoOff className='w-5 h-5 text-white/50' />
              )}
            </div>
          </button>

          {/* Hangup */}
          <button onClick={handleCancel} className='mx-3'>
            <div className='w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-lg shadow-red-500/40'>
              <PhoneOff className='w-6 h-6 text-white' />
            </div>
          </button>

          {/* Mic toggle */}
          <button onClick={() => setIsMicOn((prev) => !prev)} className='flex flex-col items-center gap-1.5'>
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isMicOn ? 'bg-white/20' : 'bg-white/10'
              }`}
            >
              {isMicOn ? <Mic className='w-5 h-5 text-white' /> : <MicOff className='w-5 h-5 text-white/50' />}
            </div>
          </button>
        </div>

        {/* Debug: Connect directly (for testing) */}
        <button
          onClick={handleConnect}
          className='mt-4 mx-auto block text-white/40 text-xs hover:text-white/70 transition-colors'
        >
          [Vào phòng trực tiếp]
        </button>
      </div>
    </div>
  )
}

// ─── In-Call Screen (Zego embedded) ─────────────────────────────
interface VideoCallRoomProps {
  callData: CallResponse
  onCallEnd: () => void
  callKind?: CallKind
}

export function VideoCallRoom({ callData, onCallEnd, callKind = 'voice' }: VideoCallRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const zpRef = useRef<ReturnType<typeof ZegoUIKitPrebuilt.create> | null>(null)
  const { user } = useAuth()
  const [localCallKind, setLocalCallKind] = useState<CallKind>(callKind)
  const [isMicOn, setIsMicOn] = useState(true)
  const [seconds, setSeconds] = useState(0)

  // Use ref to synchronize closures with latest localCallKind without re-running useEffect
  const localCallKindRef = useRef<CallKind>(localCallKind)
  useEffect(() => {
    localCallKindRef.current = localCallKind
  }, [localCallKind])

  // Timer for voice calls
  useEffect(() => {
    if (localCallKind !== 'voice') return
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [localCallKind])

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`
  }

  // Resolve local and remote user identities and avatars
  const isCaller = user?.id === callData.callerId
  const localName = isCaller 
    ? (callData.callerName || user?.fullName || 'Bạn') 
    : (callData.receiverName || user?.fullName || 'Bạn')
  const localAvatar = isCaller 
    ? (callData.callerAvatar || user?.avatar) 
    : (callData.receiverAvatar || user?.avatar)
  const remoteName = isCaller ? callData.receiverName : callData.callerName
  const remoteAvatar = isCaller ? callData.receiverAvatar : callData.callerAvatar

  const handleEndCall = useCallback(async () => {
    try {
      await endCallApi(callData.sessionId)
    } catch {
      // ignore
    } finally {
      try {
        zpRef.current?.destroy()
      } catch {
        /* ignore */
      }
      zpRef.current = null
      onCallEnd()
    }
  }, [callData.sessionId, onCallEnd])

  const enableVideo = useCallback(() => {
    setLocalCallKind('video')
    
    if (zpRef.current) {
      // 1. Enable standard MediaStream video tracks
      if (zpRef.current.localStream) {
        zpRef.current.localStream.getVideoTracks().forEach((track) => {
          track.enabled = true
        })
      }
      // 2. Enable Zego Express video publishing
      try {
        ;(zpRef.current.express as any).mutePublishStreamVideo(false)
      } catch (err) {
        console.warn('Failed to unmute publish stream video:', err)
      }

      // 3. Inform the other party to enable their video too
      const remoteUserId = isCaller ? callData.receiverId : callData.callerId
      if (remoteUserId) {
        zpRef.current.sendInRoomCommand('ENABLE_VIDEO', [remoteUserId]).catch(() => {})
      }
    }
  }, [callData, isCaller])

  const toggleMic = useCallback(() => {
    const nextState = !isMicOn
    setIsMicOn(nextState)
    if (zpRef.current) {
      // 1. Enable/disable local stream audio tracks
      if (zpRef.current.localStream) {
        zpRef.current.localStream.getAudioTracks().forEach((track) => {
          track.enabled = nextState
        })
      }
      // 2. Mute/unmute Zego Express audio publishing
      try {
        ;(zpRef.current.express as any).mutePublishStreamAudio(!nextState)
      } catch (err) {
        console.warn('Failed to mute publish stream audio:', err)
      }
    }
  }, [isMicOn])

  // Synchronize mode signals immediately upon active connection
  useEffect(() => {
    if (zpRef.current && isCaller) {
      const remoteUserId = callData.receiverId
      const timer = setTimeout(() => {
        if (localCallKind === 'video') {
          zpRef.current?.sendInRoomCommand('ENABLE_VIDEO', [remoteUserId]).catch(() => {})
        } else if (localCallKind === 'voice') {
          zpRef.current?.sendInRoomCommand('SET_VOICE_MODE', [remoteUserId]).catch(() => {})
        }
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [localCallKind, isCaller, callData.receiverId])

  useEffect(() => {
    if (!containerRef.current || !user) return

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      ZEGO_APP_ID,
      ZEGO_SERVER_SECRET,
      callData.roomId,
      user.id,
      user.fullName || 'User'
    )

    const zp = ZegoUIKitPrebuilt.create(kitToken)
    zpRef.current = zp

    zp.joinRoom({
      container: containerRef.current,
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall
      },
      turnOnMicrophoneWhenJoining: true,
      turnOnCameraWhenJoining: true, // Always capture camera track so it exists and can be toggled dynamically
      showMyCameraToggleButton: true,
      showMyMicrophoneToggleButton: true,
      showAudioVideoSettingsButton: false,
      showScreenSharingButton: false,
      showTextChat: false,
      showUserList: false,
      showPreJoinView: false,
      showRoomDetailsButton: false,
      showLeaveRoomConfirmDialog: false,
      maxUsers: 2,
      layout: 'Auto',
      showLayoutButton: false,
      onJoinRoom: () => {
        // If voice call, immediately mute video track and stop video publish
        if (localCallKindRef.current === 'voice') {
          if (zp.localStream) {
            zp.localStream.getVideoTracks().forEach((track) => {
              track.enabled = false
            })
          }
          try {
            ;(zp.express as any).mutePublishStreamVideo(true)
          } catch (err) {
            console.warn('Failed to mute video publishing on join:', err)
          }
        }
      },
      onLocalStreamUpdated: (_state, _streamId, stream) => {
        // Double check on local stream updates
        if (localCallKindRef.current === 'voice') {
          const s = stream || zp.localStream
          if (s) {
            s.getVideoTracks().forEach((track: any) => {
              track.enabled = false
            })
          }
          try {
            ;(zp.express as any).mutePublishStreamVideo(true)
          } catch (err) {
            console.warn('Failed to mute video publishing on stream update:', err)
          }
        }
      },
      onLeaveRoom: () => {
        handleEndCall()
      },
      onInRoomCommandReceived: (_fromUser: any, command: string) => {
        if (command === 'ENABLE_VIDEO') {
          setLocalCallKind('video')
          if (zpRef.current?.localStream) {
            zpRef.current.localStream.getVideoTracks().forEach((track) => {
              track.enabled = true
            })
          }
          try {
            ;(zpRef.current?.express as any)?.mutePublishStreamVideo(false)
          } catch (err) {
            console.warn('Failed to unmute video publishing on command:', err)
          }
        } else if (command === 'SET_VOICE_MODE') {
          setLocalCallKind('voice')
          if (zpRef.current?.localStream) {
            zpRef.current.localStream.getVideoTracks().forEach((track) => {
              track.enabled = false
            })
          }
          try {
            ;(zpRef.current?.express as any)?.mutePublishStreamVideo(true)
          } catch (err) {
            console.warn('Failed to mute video publishing on command:', err)
          }
        }
      },
      onUserJoin: (users: any[]) => {
        if (localCallKindRef.current === 'video' && isCaller) {
          const remoteUser = users[0]
          if (remoteUser && zpRef.current) {
            zpRef.current.sendInRoomCommand('ENABLE_VIDEO', [remoteUser.userID]).catch(() => {})
          }
        }
        if (localCallKindRef.current === 'voice' && isCaller) {
          const remoteUser = users[0]
          if (remoteUser && zpRef.current) {
            zpRef.current.sendInRoomCommand('SET_VOICE_MODE', [remoteUser.userID]).catch(() => {})
          }
        }
      }
    })

    // If initial kind is voice call, periodically ensure localStream video tracks are muted at the very start
    if (localCallKindRef.current === 'voice') {
      const checkInterval = setInterval(() => {
        if (zp.localStream) {
          zp.localStream.getVideoTracks().forEach((track) => {
            track.enabled = false
          })
          try {
            ;(zp.express as any).mutePublishStreamVideo(true)
          } catch (err) {
            // ignore
          }
          clearInterval(checkInterval)
        }
      }, 100)
      setTimeout(() => clearInterval(checkInterval), 5000)
    }

    return () => {
      zpRef.current?.destroy()
      zpRef.current = null
    }
  }, [callData, user, handleEndCall, isCaller])

  // Listen for ENDED signal from other party
  useEffect(() => {
    const handler = (e: Event) => {
      const signal = (e as CustomEvent).detail as { sessionId: string; signal: string }
      if (signal.signal === 'ENDED' && signal.sessionId === callData.sessionId) {
        try {
          zpRef.current?.destroy()
        } catch {
          /* ignore */
        }
        zpRef.current = null
        onCallEnd()
      }
    }
    window.addEventListener('call-signal', handler)
    return () => window.removeEventListener('call-signal', handler)
  }, [callData.sessionId, onCallEnd])

  return (
    <div className='fixed inset-0 z-50 flex flex-col bg-[#1a1a2e] overflow-hidden'>
      {/* Voice call visual interface */}
      {localCallKind === 'voice' && (
        <div className='absolute inset-0 z-10 flex flex-col justify-between bg-gradient-to-b from-[#1c1c3a] via-[#121224] to-[#0a0a14] p-6'>
          {/* Header Info */}
          <div className='flex flex-col items-center mt-12 text-center'>
            <span className='px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-3 flex items-center gap-1.5'>
              <span className='w-2 h-2 rounded-full bg-emerald-500 animate-ping' />
              Đang kết nối thoại
            </span>
            <h2 className='text-white text-2xl font-bold tracking-wide mb-1'>{remoteName}</h2>
            <span className='text-white/60 text-sm font-medium mt-1'>{formatTime(seconds)}</span>
          </div>

          {/* Avatars Display */}
          <div className='flex items-center justify-center gap-16 my-8'>
            {/* Local Avatar */}
            <div className='flex flex-col items-center gap-3'>
              <div className='relative'>
                <div className='absolute -inset-4 rounded-full bg-white/5 animate-pulse' />
                <UserAvatar
                  src={localAvatar}
                  name={localName}
                  className='w-24 h-24 border-[3px] border-white/20 shadow-2xl relative z-10'
                  fallbackClassName='text-2xl'
                />
              </div>
              <span className='text-white/80 text-[13px] font-medium mt-1.5'>{localName} (Bạn)</span>
            </div>

            {/* Remote Avatar */}
            <div className='flex flex-col items-center gap-3'>
              <div className='relative'>
                <div className='absolute -inset-4 rounded-full bg-blue-500/15 animate-pulse' style={{ animationDuration: '3s' }} />
                <UserAvatar
                  src={remoteAvatar}
                  name={remoteName}
                  className='w-24 h-24 border-[3px] border-blue-500/30 shadow-2xl relative z-10'
                  fallbackClassName='text-2xl'
                />
              </div>
              <span className='text-white/80 text-[13px] font-medium mt-1.5'>{remoteName}</span>
            </div>
          </div>

          {/* Controller Bar */}
          <div className='pb-10 pt-4'>
            <div className='flex items-center justify-center gap-12'>
              {/* Toggle Mic Button */}
              <button onClick={toggleMic} className='group flex flex-col items-center gap-2'>
                <div className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center transition-all border active:scale-95',
                  isMicOn 
                    ? 'bg-white/10 hover:bg-white/20 border-white/15' 
                    : 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30'
                )}>
                  {isMicOn ? (
                    <Mic className='w-6 h-6 text-white' />
                  ) : (
                    <MicOff className='w-6 h-6 text-red-500' />
                  )}
                </div>
                <span className='text-white/70 text-xs font-medium'>
                  {isMicOn ? 'Tắt Mic' : 'Bật Mic'}
                </span>
              </button>

              {/* Hangup Button */}
              <button onClick={handleEndCall} className='group flex flex-col items-center gap-2'>
                <div className='w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-lg shadow-red-500/40 active:scale-95'>
                  <PhoneOff className='w-6 h-6 text-white' />
                </div>
                <span className='text-white/70 text-xs font-medium'>Gác máy</span>
              </button>

              {/* Turn on Video Button */}
              <button onClick={enableVideo} className='group flex flex-col items-center gap-2'>
                <div className='w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/15 active:scale-95'>
                  <Video className='w-6 h-6 text-white' />
                </div>
                <span className='text-white/70 text-xs font-medium'>Bật Video</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Zego container (always rendered so audio stream functions in background, hidden during voice call) */}
      <div
        ref={containerRef}
        className={cn(
          'bg-black transition-opacity duration-300',
          localCallKind === 'voice'
            ? 'w-px h-px absolute top-0 left-0 opacity-0 pointer-events-none'
            : 'w-full h-full opacity-100 z-20'
        )}
      />
    </div>
  )
}

// ─── Incoming Call Screen (Zalo style) ──────────────────────────
interface IncomingCallDialogProps {
  callerName: string
  callerAvatar: string
  sessionId: string
  onAccept: (callData: CallResponse, callKind?: CallKind) => void
  onReject: () => void
  callKind?: CallKind
}

export function IncomingCallDialog({
  callerName,
  callerAvatar,
  sessionId,
  onAccept,
  onReject,
  callKind = 'voice'
}: IncomingCallDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      const callData = await acceptCallApi(sessionId)
      onAccept(callData, callKind)
    } catch {
      onReject()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex flex-col bg-[#1a1a2e]'>
      {/* Content */}
      <div className='flex-1 flex flex-col items-center justify-center'>
        <div className='relative mb-5'>
          <div
            className='absolute -inset-3 rounded-full border-2 border-white/15 animate-ping'
            style={{ animationDuration: '2s' }}
          />
          <div
            className='absolute -inset-6 rounded-full border border-white/8 animate-ping'
            style={{ animationDuration: '2.5s' }}
          />
          <img
            src={callerAvatar || '/images/default-avatar.png'}
            alt={callerName}
            className='relative w-24 h-24 rounded-full object-cover border-[3px] border-white/30 shadow-2xl'
          />
        </div>

        <h2 className='text-white text-xl font-semibold mb-1'>{callerName}</h2>
        <p className='text-white/50 text-sm'>
          BondHub — {callKind === 'voice' ? 'Cuộc gọi thoại đến' : 'Cuộc gọi video đến'}
        </p>
      </div>

      {/* Bottom action buttons */}
      <div className='pb-10 flex items-center justify-center gap-16'>
        <button onClick={onReject} disabled={isLoading} className='flex flex-col items-center gap-2 group'>
          <div className='w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-lg shadow-red-500/30 group-active:scale-95'>
            <PhoneOff className='w-6 h-6 text-white' />
          </div>
          <span className='text-white/70 text-xs'>Từ chối</span>
        </button>

        <button onClick={handleAccept} disabled={isLoading} className='flex flex-col items-center gap-2 group'>
          <div className='w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-all shadow-lg shadow-green-500/30 group-active:scale-95'>
            <Phone className='w-6 h-6 text-white' />
          </div>
          <span className='text-white/70 text-xs'>Trả lời</span>
        </button>
      </div>
    </div>
  )
}

// ─── useVideoCall Hook ──────────────────────────────────────────
export function useVideoCall() {
  const [callState, setCallState] = useState<{
    phase: 'idle' | 'ringing' | 'active'
    callData: CallResponse | null
    callKind: CallKind
    incoming: {
      sessionId: string
      callerName: string
      callerAvatar: string
      callKind?: CallKind
    } | null
  }>({
    phase: 'idle',
    callData: null,
    callKind: 'voice',
    incoming: null
  })

  const ringingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTokenFetchSessionRef = useRef<string | null>(null)

  const clearRingingTimer = useCallback(() => {
    if (ringingTimerRef.current) {
      clearTimeout(ringingTimerRef.current)
      ringingTimerRef.current = null
    }
  }, [])

  // Listen for call signals from backend via WebSocket
  useEffect(() => {
    const handler = (e: Event) => {
      const signal = (e as CustomEvent).detail as { sessionId: string; signal: string; roomId?: string }

      setCallState((prev) => {
        // ACCEPTED: receiver accepted → caller joins room
        if (signal.signal === 'ACCEPTED' && prev.phase === 'ringing' && prev.callData?.sessionId === signal.sessionId) {
          clearRingingTimer()
          if (lastTokenFetchSessionRef.current !== signal.sessionId) {
            lastTokenFetchSessionRef.current = signal.sessionId
            void getCallTokenApi(signal.sessionId)
              .then((fresh) => {
                setCallState((current) => ({ ...current, phase: 'active', callData: fresh, incoming: null }))
              })
              .catch(() => {
                setCallState((current) => ({ ...current, phase: 'active' }))
              })
          }
          return prev
        }
        // REJECTED: receiver rejected → caller returns to idle
        if (signal.signal === 'REJECTED' && prev.phase === 'ringing' && prev.callData?.sessionId === signal.sessionId) {
          clearRingingTimer()
          return { phase: 'idle', callData: null, callKind: prev.callKind, incoming: null }
        }
        // ENDED: other party ended call → return to idle
        if (signal.signal === 'ENDED' && prev.phase === 'active' && prev.callData?.sessionId === signal.sessionId) {
          return { phase: 'idle', callData: null, callKind: prev.callKind, incoming: null }
        }
        // CANCELLED: caller cancelled → dismiss incoming dialog
        if (signal.signal === 'CANCELLED' && prev.incoming?.sessionId === signal.sessionId) {
          return { ...prev, incoming: null }
        }
        return prev
      })
    }

    window.addEventListener('call-signal', handler)
    return () => window.removeEventListener('call-signal', handler)
  }, [clearRingingTimer])

  const startCall = useCallback(async (receiverId: string, callKind: CallKind = 'video') => {
    const callData = await initiateCallApi({ receiverId, callKind })
    // Caller waits in ringing phase until receiver accepts
    setCallState({ phase: 'ringing', callData, callKind, incoming: null })

    // Auto-cancel after 30 seconds if no answer
    ringingTimerRef.current = setTimeout(async () => {
      try {
        await cancelCallApi(callData.sessionId)
      } catch {
        /* ignore */
      }
      setCallState((prev) => ({ ...prev, phase: 'idle', callData: null, incoming: null }))
    }, 30_000)
  }, [])

  const connectCall = useCallback(() => {
    clearRingingTimer()
    setCallState((prev) => ({ ...prev, phase: 'active' }))
  }, [clearRingingTimer])

  const cancelOutgoing = useCallback(async () => {
    clearRingingTimer()
    const data = callState.callData
    if (data) {
      try {
        await cancelCallApi(data.sessionId)
      } catch {
        /* ignore */
      }
    }
    setCallState((prev) => ({ ...prev, phase: 'idle', callData: null, incoming: null }))
  }, [callState.callData, clearRingingTimer])

  const handleIncomingCall = useCallback((data: { sessionId: string; callerName: string; callerAvatar: string; callKind?: CallKind }) => {
    setCallState((prev) => ({ ...prev, incoming: data }))
  }, [])

  const acceptIncoming = useCallback((callData: CallResponse, callKind?: CallKind) => {
    setCallState((prev) => ({ phase: 'active', callData, callKind: callKind || prev.incoming?.callKind || prev.callKind, incoming: null }))
  }, [])

  const rejectIncoming = useCallback(() => {
    setCallState((prev) => ({ ...prev, incoming: null }))
  }, [])

  const endCall = useCallback(() => {
    clearRingingTimer()
    setCallState((prev) => ({ ...prev, phase: 'idle', callData: null, incoming: null }))
  }, [clearRingingTimer])

  useEffect(() => {
    return () => clearRingingTimer()
  }, [clearRingingTimer])

  return {
    callState,
    startCall,
    connectCall,
    cancelOutgoing,
    handleIncomingCall,
    acceptIncoming,
    rejectIncoming,
    endCall
  }
}
