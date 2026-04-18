import { useCallback, useEffect, useRef, useState } from 'react'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt'
import { initiateCallApi, acceptCallApi, endCallApi, cancelCallApi, type CallResponse } from '../../api/call.api'
import { useAuth } from '@/features/auth'
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react'

const ZEGO_APP_ID = Number(import.meta.env.VITE_ZEGO_APP_ID)
const ZEGO_SERVER_SECRET = import.meta.env.VITE_ZEGO_SERVER_SECRET as string

// ─── Outgoing Call (Ringing) Screen — Zalo style ────────────────
interface OutgoingCallProps {
  callData: CallResponse
  onCancel: () => void
  onConnect: () => void
}

export function OutgoingCallScreen({ callData, onCancel, onConnect }: OutgoingCallProps) {
  const [dots, setDots] = useState('')
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'))
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
          stream.getTracks().forEach(t => t.stop())
        }
      } catch {
        // Camera not available
      }
    }
    if (isCameraOn) {
      startCamera()
    } else {
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
      if (videoRef.current) videoRef.current.srcObject = null
    }
    return () => {
      mounted = false
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [isCameraOn])

  const handleCancel = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    onCancel()
  }

  const handleConnect = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    onConnect()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1a1a2e] overflow-hidden">
      {/* Camera preview / dark background */}
      {isCameraOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover blur-sm opacity-40"
        />
      ) : (
        <div className="absolute inset-0 bg-[#1a1a2e]" />
      )}

      {/* Content overlay */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        {/* Avatar */}
        <div className="relative mb-5">
          <img
            src={callData.receiverAvatar || '/images/default-avatar.png'}
            alt={callData.receiverName}
            className="w-24 h-24 rounded-full object-cover border-[3px] border-white/30 shadow-2xl"
          />
        </div>

        {/* Status text */}
        <p className="text-white/80 text-[15px]">
          Đang nối máy đến {callData.receiverName}{dots}
        </p>
      </div>

      {/* Bottom controls bar — matches Zalo layout */}
      <div className="relative z-10 pb-8 pt-4">
        <div className="flex items-center justify-center gap-6">
          {/* Camera toggle */}
          <button
            onClick={() => setIsCameraOn(prev => !prev)}
            className="flex flex-col items-center gap-1.5"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isCameraOn ? 'bg-white/20' : 'bg-white/10'
            }`}>
              {isCameraOn ? (
                <Video className="w-5 h-5 text-white" />
              ) : (
                <VideoOff className="w-5 h-5 text-white/50" />
              )}
            </div>
          </button>

          {/* Hangup */}
          <button onClick={handleCancel} className="mx-3">
            <div className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-lg shadow-red-500/40">
              <PhoneOff className="w-6 h-6 text-white" />
            </div>
          </button>

          {/* Mic toggle */}
          <button
            onClick={() => setIsMicOn(prev => !prev)}
            className="flex flex-col items-center gap-1.5"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isMicOn ? 'bg-white/20' : 'bg-white/10'
            }`}>
              {isMicOn ? (
                <Mic className="w-5 h-5 text-white" />
              ) : (
                <MicOff className="w-5 h-5 text-white/50" />
              )}
            </div>
          </button>
        </div>

        {/* Debug: Connect directly (for testing) */}
        <button
          onClick={handleConnect}
          className="mt-4 mx-auto block text-white/40 text-xs hover:text-white/70 transition-colors"
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
}

export function VideoCallRoom({ callData, onCallEnd }: VideoCallRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const zpRef = useRef<ReturnType<typeof ZegoUIKitPrebuilt.create> | null>(null)
  const { user } = useAuth()

  const handleEndCall = useCallback(async () => {
    try {
      await endCallApi(callData.sessionId)
    } catch {
      // ignore
    } finally {
      try { zpRef.current?.destroy() } catch { /* ignore */ }
      zpRef.current = null
      onCallEnd()
    }
  }, [callData.sessionId, onCallEnd])

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
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      turnOnMicrophoneWhenJoining: true,
      turnOnCameraWhenJoining: true,
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
      onLeaveRoom: () => {
        handleEndCall()
      },
    })

    return () => {
      zpRef.current?.destroy()
    }
  }, [callData, user, handleEndCall])

  // Listen for ENDED signal from other party
  useEffect(() => {
    const handler = (e: Event) => {
      const signal = (e as CustomEvent).detail as { sessionId: string; signal: string }
      if (signal.signal === 'ENDED' && signal.sessionId === callData.sessionId) {
        try { zpRef.current?.destroy() } catch { /* ignore */ }
        zpRef.current = null
        onCallEnd()
      }
    }
    window.addEventListener('call-signal', handler)
    return () => window.removeEventListener('call-signal', handler)
  }, [callData.sessionId, onCallEnd])

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}

// ─── Incoming Call Screen (Zalo style) ──────────────────────────
interface IncomingCallDialogProps {
  callerName: string
  callerAvatar: string
  sessionId: string
  onAccept: (callData: CallResponse) => void
  onReject: () => void
}

export function IncomingCallDialog({
  callerName,
  callerAvatar,
  sessionId,
  onAccept,
  onReject,
}: IncomingCallDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      const callData = await acceptCallApi(sessionId)
      onAccept(callData)
    } catch {
      onReject()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1a1a2e]">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative mb-5">
          <div className="absolute -inset-3 rounded-full border-2 border-white/15 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute -inset-6 rounded-full border border-white/8 animate-ping" style={{ animationDuration: '2.5s' }} />
          <img
            src={callerAvatar || '/images/default-avatar.png'}
            alt={callerName}
            className="relative w-24 h-24 rounded-full object-cover border-[3px] border-white/30 shadow-2xl"
          />
        </div>

        <h2 className="text-white text-xl font-semibold mb-1">{callerName}</h2>
        <p className="text-white/50 text-sm">BondHub — Cuộc gọi video đến</p>
      </div>

      {/* Bottom action buttons */}
      <div className="pb-10 flex items-center justify-center gap-16">
        <button
          onClick={onReject}
          disabled={isLoading}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-lg shadow-red-500/30 group-active:scale-95">
            <PhoneOff className="w-6 h-6 text-white" />
          </div>
          <span className="text-white/70 text-xs">Từ chối</span>
        </button>

        <button
          onClick={handleAccept}
          disabled={isLoading}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-all shadow-lg shadow-green-500/30 group-active:scale-95">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <span className="text-white/70 text-xs">Trả lời</span>
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
    incoming: {
      sessionId: string
      callerName: string
      callerAvatar: string
    } | null
  }>({
    phase: 'idle',
    callData: null,
    incoming: null,
  })

  const ringingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

      setCallState(prev => {
        // ACCEPTED: receiver accepted → caller joins room
        if (signal.signal === 'ACCEPTED' && prev.phase === 'ringing' && prev.callData?.sessionId === signal.sessionId) {
          clearRingingTimer()
          return { ...prev, phase: 'active' }
        }
        // REJECTED: receiver rejected → caller returns to idle
        if (signal.signal === 'REJECTED' && prev.phase === 'ringing' && prev.callData?.sessionId === signal.sessionId) {
          clearRingingTimer()
          return { phase: 'idle', callData: null, incoming: null }
        }
        // ENDED: other party ended call → return to idle
        if (signal.signal === 'ENDED' && prev.phase === 'active' && prev.callData?.sessionId === signal.sessionId) {
          return { phase: 'idle', callData: null, incoming: null }
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

  const startCall = useCallback(async (receiverId: string) => {
    const callData = await initiateCallApi({ receiverId })
    // Caller waits in ringing phase until receiver accepts
    setCallState({ phase: 'ringing', callData, incoming: null })

    // Auto-cancel after 30 seconds if no answer
    ringingTimerRef.current = setTimeout(async () => {
      try { await cancelCallApi(callData.sessionId) } catch { /* ignore */ }
      setCallState({ phase: 'idle', callData: null, incoming: null })
    }, 30_000)
  }, [])

  const connectCall = useCallback(() => {
    clearRingingTimer()
    setCallState(prev => ({ ...prev, phase: 'active' }))
  }, [clearRingingTimer])

  const cancelOutgoing = useCallback(async () => {
    clearRingingTimer()
    const data = callState.callData
    if (data) {
      try { await cancelCallApi(data.sessionId) } catch { /* ignore */ }
    }
    setCallState({ phase: 'idle', callData: null, incoming: null })
  }, [callState.callData, clearRingingTimer])

  const handleIncomingCall = useCallback((data: { sessionId: string; callerName: string; callerAvatar: string }) => {
    setCallState(prev => ({ ...prev, incoming: data }))
  }, [])

  const acceptIncoming = useCallback((callData: CallResponse) => {
    setCallState({ phase: 'active', callData, incoming: null })
  }, [])

  const rejectIncoming = useCallback(() => {
    setCallState(prev => ({ ...prev, incoming: null }))
  }, [])

  const endCall = useCallback(() => {
    clearRingingTimer()
    setCallState({ phase: 'idle', callData: null, incoming: null })
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
    endCall,
  }
}
