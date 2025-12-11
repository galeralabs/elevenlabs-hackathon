import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  elderlyProfileId: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')
    const ELEVENLABS_AGENT_ID = Deno.env.get('ELEVENLABS_AGENT_ID')
    const ELEVENLABS_PHONE_NUMBER_ID = Deno.env.get('ELEVENLABS_PHONE_NUMBER_ID')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!ELEVENLABS_API_KEY || !ELEVENLABS_AGENT_ID || !ELEVENLABS_PHONE_NUMBER_ID) {
      throw new Error('Missing ElevenLabs configuration')
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { elderlyProfileId } = await req.json() as RequestBody

    if (!elderlyProfileId) {
      throw new Error('elderlyProfileId is required')
    }

    // Fetch elderly profile
    const { data: profile, error: profileError } = await supabase
      .from('elderly_profiles')
      .select('*')
      .eq('id', elderlyProfileId)
      .single()

    if (profileError || !profile) {
      throw new Error(`Profile not found: ${profileError?.message}`)
    }

    if (!profile.phone_number) {
      throw new Error('Profile has no phone number')
    }

    // Create call record in database
    const { data: callRecord, error: callError } = await supabase
      .from('calls')
      .insert({
        elderly_profile_id: elderlyProfileId,
        status: 'scheduled',
        call_type: 'manual',
        agent_id: ELEVENLABS_AGENT_ID,
      })
      .select()
      .single()

    if (callError) {
      throw new Error(`Failed to create call record: ${callError.message}`)
    }

    // Build context with all patient details
    const contextParts: string[] = []

    contextParts.push(`Imię i nazwisko: ${profile.first_name} ${profile.last_name}`)

    if (profile.preferred_name) {
      contextParts.push(`Preferowane zwracanie się: ${profile.preferred_name}`)
    }

    if (profile.date_of_birth) {
      const birthDate = new Date(profile.date_of_birth)
      const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      contextParts.push(`Wiek: ${age} lat`)
    }

    if (profile.city) {
      contextParts.push(`Miasto: ${profile.city}`)
    }

    if (profile.medical_notes) {
      contextParts.push(`Notatki medyczne: ${profile.medical_notes}`)
    }

    if (profile.care_notes) {
      contextParts.push(`Notatki o opiece: ${profile.care_notes}`)
    }

    if (profile.emergency_contact_name) {
      contextParts.push(`Kontakt alarmowy: ${profile.emergency_contact_name} (${profile.emergency_contact_relationship || 'rodzina'})`)
    }

    const context = contextParts.join('\n')

    // Prepare dynamic variables for the agent
    const dynamicVariables: Record<string, string> = {
      name: profile.preferred_name || profile.first_name,
      first_name: profile.first_name,
      last_name: profile.last_name,
      context: context,
    }

    if (profile.medical_notes) {
      dynamicVariables.medical_notes = profile.medical_notes
    }

    if (profile.care_notes) {
      dynamicVariables.care_notes = profile.care_notes
    }

    // Initiate outbound call via ElevenLabs
    const response = await fetch('https://api.elevenlabs.io/v1/convai/twilio/outbound-call', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: ELEVENLABS_AGENT_ID,
        agent_phone_number_id: ELEVENLABS_PHONE_NUMBER_ID,
        to_number: profile.phone_number,
        conversation_initiation_client_data: {
          dynamic_variables: dynamicVariables,
        },
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      // Update call record to failed
      await supabase
        .from('calls')
        .update({ status: 'failed' })
        .eq('id', callRecord.id)

      throw new Error(`ElevenLabs API error: ${JSON.stringify(result)}`)
    }

    // Update call record with conversation ID
    await supabase
      .from('calls')
      .update({
        conversation_id: result.conversation_id,
        status: 'in_progress',
        initiated_at: new Date().toISOString(),
      })
      .eq('id', callRecord.id)

    return new Response(
      JSON.stringify({
        success: true,
        callId: callRecord.id,
        conversationId: result.conversation_id,
        message: `Call initiated to ${profile.first_name} ${profile.last_name}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error initiating call:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
