import { useState, useCallback, useRef, useEffect } from 'react'
import { VoiceAgent } from '@/lib/voiceAgent'
import type { ConversationStatus, ElderlyContext, VoiceAgentCallbacks } from '@/lib/voiceAgent'

export interface Message {
  role: 'agent' | 'user'
  text: string
  timestamp: Date
}

export interface UseVoiceAgentReturn {
  status: ConversationStatus
  mode: 'speaking' | 'listening' | null
  messages: Message[]
  error: string | null
  startCall: (agentId: string, elderlyContext: ElderlyContext) => Promise<void>
  endCall: () => Promise<void>
  isActive: boolean
}

export function useVoiceAgent(): UseVoiceAgentReturn {
  const [status, setStatus] = useState<ConversationStatus>('idle')
  const [mode, setMode] = useState<'speaking' | 'listening' | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)

  const agentRef = useRef<VoiceAgent | null>(null)

  // Create callbacks
  const callbacks: VoiceAgentCallbacks = {
    onStatusChange: (newStatus) => {
      setStatus(newStatus)
      if (newStatus === 'disconnected' || newStatus === 'error') {
        setMode(null)
      }
    },
    onMessage: (message) => {
      setMessages((prev) => [
        ...prev,
        { ...message, timestamp: new Date() }
      ])
    },
    onError: (message) => {
      setError(message)
    },
    onModeChange: (modeInfo) => {
      setMode(modeInfo.mode)
    },
  }

  // Initialize agent
  useEffect(() => {
    agentRef.current = new VoiceAgent(callbacks)
    return () => {
      // Cleanup on unmount
      agentRef.current?.endConversation()
    }
  }, [])

  const startCall = useCallback(async (agentId: string, elderlyContext: ElderlyContext) => {
    setError(null)
    setMessages([])
    setMode(null)

    if (!agentRef.current) {
      agentRef.current = new VoiceAgent(callbacks)
    }

    await agentRef.current.startConversation(agentId, elderlyContext)
  }, [])

  const endCall = useCallback(async () => {
    await agentRef.current?.endConversation()
    setMode(null)
  }, [])

  return {
    status,
    mode,
    messages,
    error,
    startCall,
    endCall,
    isActive: status === 'connected',
  }
}
