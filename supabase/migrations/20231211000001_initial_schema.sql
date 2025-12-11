-- elderly_profiles: Core profiles table
CREATE TABLE elderly_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Personal info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  preferred_name TEXT,
  date_of_birth DATE,
  avatar_url TEXT,

  -- Contact
  phone_number TEXT NOT NULL UNIQUE,
  secondary_phone TEXT,
  email TEXT,

  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postal_code TEXT,

  -- Emergency contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,

  -- Care context
  medical_notes TEXT,
  care_notes TEXT,

  -- Call scheduling
  preferred_call_time TIME DEFAULT '10:00:00',
  timezone TEXT DEFAULT 'Europe/Warsaw',
  call_frequency TEXT DEFAULT 'daily',
  is_active BOOLEAN DEFAULT true,

  -- 11Labs config
  elevenlabs_agent_id TEXT,
  language TEXT DEFAULT 'pl'
);

-- calls: Maps to 11Labs conversations
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elderly_profile_id UUID REFERENCES elderly_profiles(id) ON DELETE CASCADE,

  -- 11Labs identifiers
  conversation_id TEXT UNIQUE,
  agent_id TEXT,

  -- Call metadata
  status TEXT NOT NULL DEFAULT 'scheduled',
  -- statuses: scheduled, in_progress, completed, failed, missed
  initiated_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_secs INTEGER,

  -- 11Labs metadata
  termination_reason TEXT,
  cost DECIMAL(10,4),

  call_type TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- call_transcripts: Normalized transcript entries
CREATE TABLE call_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'agent' or 'user'
  message TEXT NOT NULL,
  timestamp_ms INTEGER,
  sequence_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- call_summaries: AI-generated summaries
CREATE TABLE call_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE UNIQUE,

  transcript_summary TEXT,
  call_successful BOOLEAN,

  mood_assessment TEXT, -- happy, sad, anxious, neutral
  health_mentions JSONB DEFAULT '[]',
  needs_mentioned JSONB DEFAULT '[]',
  key_topics JSONB DEFAULT '[]',

  follow_up_required BOOLEAN DEFAULT false,
  urgency_level TEXT DEFAULT 'normal',

  raw_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- issues: Problems/requests surfaced from calls
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elderly_profile_id UUID REFERENCES elderly_profiles(id) ON DELETE CASCADE,
  call_id UUID REFERENCES calls(id) ON DELETE SET NULL,

  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- health, loneliness, practical, emergency, other

  status TEXT DEFAULT 'open', -- open, in_progress, resolved, dismissed
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent

  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,

  source TEXT DEFAULT 'auto', -- auto or manual
  confidence_score DECIMAL(3,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- schedule_overrides: Skip/reschedule calls
CREATE TABLE schedule_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elderly_profile_id UUID REFERENCES elderly_profiles(id) ON DELETE CASCADE,
  override_date DATE NOT NULL,
  skip_call BOOLEAN DEFAULT false,
  custom_time TIME,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(elderly_profile_id, override_date)
);

-- Indexes
CREATE INDEX idx_calls_elderly_profile_id ON calls(elderly_profile_id);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_calls_initiated_at ON calls(initiated_at DESC);
CREATE INDEX idx_issues_elderly_profile_id ON issues(elderly_profile_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_priority ON issues(priority);
CREATE INDEX idx_call_transcripts_call_id ON call_transcripts(call_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_elderly_profiles_updated_at
  BEFORE UPDATE ON elderly_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
