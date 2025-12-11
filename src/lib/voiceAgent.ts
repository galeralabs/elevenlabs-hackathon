import { Conversation } from '@elevenlabs/client'

export type ConversationStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'

export interface VoiceAgentCallbacks {
  onStatusChange?: (status: ConversationStatus) => void
  onMessage?: (message: { role: 'agent' | 'user'; text: string }) => void
  onError?: (message: string, context?: unknown) => void
  onModeChange?: (mode: { mode: 'speaking' | 'listening' }) => void
}

export interface ElderlyContext {
  firstName: string
  lastName: string
  preferredName?: string | null
  medicalNotes?: string | null
  careNotes?: string | null
}

export class VoiceAgent {
  private conversation: Conversation | null = null
  private status: ConversationStatus = 'idle'
  private callbacks: VoiceAgentCallbacks = {}

  constructor(callbacks?: VoiceAgentCallbacks) {
    if (callbacks) {
      this.callbacks = callbacks
    }
  }

  private setStatus(status: ConversationStatus) {
    this.status = status
    this.callbacks.onStatusChange?.(status)
  }

  getStatus(): ConversationStatus {
    return this.status
  }

  async startConversation(agentId: string, elderlyContext: ElderlyContext): Promise<void> {
    if (this.conversation) {
      console.warn('Conversation already in progress')
      return
    }

    try {
      this.setStatus('connecting')

      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true })

      // Build dynamic variables for the agent
      const dynamicVariables: Record<string, string> = {
        elderly_first_name: elderlyContext.firstName,
        elderly_last_name: elderlyContext.lastName,
        elderly_name: elderlyContext.preferredName || elderlyContext.firstName,
      }

      if (elderlyContext.medicalNotes) {
        dynamicVariables.medical_notes = elderlyContext.medicalNotes
      }

      if (elderlyContext.careNotes) {
        dynamicVariables.care_notes = elderlyContext.careNotes
      }

      this.conversation = await Conversation.startSession({
        agentId,
        connectionType: 'webrtc',
        dynamicVariables,
        onConnect: () => {
          console.log('Connected to ElevenLabs agent')
          this.setStatus('connected')
        },
        onDisconnect: () => {
          console.log('Disconnected from ElevenLabs agent')
          this.setStatus('disconnected')
          this.conversation = null
        },
        onError: (message: string, context?: unknown) => {
          console.error('Conversation error:', message, context)
          this.setStatus('error')
          this.callbacks.onError?.(message, context)
        },
        onMessage: (message: { source: string; message: string }) => {
          // Map source to role
          const role = message.source === 'ai' ? 'agent' : 'user'
          this.callbacks.onMessage?.({ role, text: message.message })
        },
        onModeChange: (mode: { mode: 'speaking' | 'listening' }) => {
          this.callbacks.onModeChange?.(mode)
        },
      })
    } catch (error) {
      console.error('Failed to start conversation:', error)
      this.setStatus('error')
      const message = error instanceof Error ? error.message : String(error)
      this.callbacks.onError?.(message, error)
      throw error
    }
  }

  async endConversation(): Promise<void> {
    if (!this.conversation) {
      return
    }

    try {
      await this.conversation.endSession()
      this.conversation = null
      this.setStatus('idle')
    } catch (error) {
      console.error('Failed to end conversation:', error)
      throw error
    }
  }

  isActive(): boolean {
    return this.conversation !== null && this.status === 'connected'
  }
}

// Singleton instance for the app
let voiceAgentInstance: VoiceAgent | null = null

export function getVoiceAgent(callbacks?: VoiceAgentCallbacks): VoiceAgent {
  if (!voiceAgentInstance) {
    voiceAgentInstance = new VoiceAgent(callbacks)
  } else if (callbacks) {
    // Update callbacks if provided
    voiceAgentInstance = new VoiceAgent(callbacks)
  }
  return voiceAgentInstance
}
