import { supabase } from './supabase'

interface InitiateCallResponse {
  success: boolean
  callId?: string
  conversationId?: string
  message?: string
  error?: string
}

export async function initiateOutboundCall(elderlyProfileId: string): Promise<InitiateCallResponse> {
  const { data, error } = await supabase.functions.invoke('initiate-call', {
    body: { elderlyProfileId },
  })

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return data as InitiateCallResponse
}
