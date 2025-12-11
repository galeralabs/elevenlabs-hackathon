-- Seed data for TeaTime elderly care application

-- Insert elderly profiles
INSERT INTO elderly_profiles (
  first_name, last_name, preferred_name, phone_number, date_of_birth,
  preferred_call_time, is_active, city, address_line1,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
  medical_notes, care_notes
) VALUES
  ('Mary', 'Smith', 'Mrs. Mary', '+12025551234', '1945-03-15', '09:00', true,
   'New York', '123 Oak Street, Apt 3B',
   'Sarah Smith', '+12025552345', 'daughter',
   'Type 2 diabetes, hypertension', 'Likes talking about grandchildren'),

  ('John', 'Davis', NULL, '+12025553456', '1940-07-22', '10:30', true,
   'Chicago', '456 Maple Avenue',
   'Peter Davis', '+12025554567', 'son',
   'Heart problems, takes blood thinning medication', 'Retired teacher, enjoys discussing history'),

  ('Anna', 'Wilson', 'Grandma Anna', '+12025555678', '1938-11-08', '11:00', true,
   'Los Angeles', '789 Palm Drive, Unit 10',
   'Katherine Wilson', '+12025556789', 'daughter',
   'Asthma, seasonal allergies', 'Lives alone, needs more social contact'),

  ('Stanley', 'Brown', 'Mr. Stan', '+12025557890', '1942-05-30', '09:30', true,
   'Houston', '321 Pine Road',
   'Mark Brown', '+12025558901', 'son',
   NULL, 'Retired military, likes morning conversations'),

  ('Helen', 'Miller', NULL, '+12025559012', '1935-09-12', '10:00', false,
   'Phoenix', '654 Elm Street',
   'Eva Miller', '+12025550123', 'daughter',
   'Early-stage dementia', 'Currently in hospital - break from calls');

-- Insert some sample calls for Mary Smith
INSERT INTO calls (elderly_profile_id, conversation_id, status, initiated_at, started_at, ended_at, duration_secs, call_type)
SELECT
  id,
  'conv_' || gen_random_uuid()::text,
  'completed',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day' + INTERVAL '30 seconds',
  NOW() - INTERVAL '1 day' + INTERVAL '5 minutes 30 seconds',
  300,
  'scheduled'
FROM elderly_profiles WHERE phone_number = '+12025551234';

INSERT INTO calls (elderly_profile_id, conversation_id, status, initiated_at, started_at, ended_at, duration_secs, call_type)
SELECT
  id,
  'conv_' || gen_random_uuid()::text,
  'completed',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days' + INTERVAL '45 seconds',
  NOW() - INTERVAL '2 days' + INTERVAL '7 minutes',
  375,
  'scheduled'
FROM elderly_profiles WHERE phone_number = '+12025551234';

-- Insert call summary for the most recent call
INSERT INTO call_summaries (call_id, transcript_summary, call_successful, mood_assessment, health_mentions, needs_mentioned, follow_up_required, urgency_level)
SELECT
  c.id,
  'Mrs. Mary was in a good mood. She talked about her grandchildren visiting over the weekend. She mentioned feeling a bit tired but otherwise fine. She reminded about a doctor appointment next week.',
  true,
  'positive',
  '["fatigue", "doctor visit"]'::jsonb,
  '["reminder about doctor appointment"]'::jsonb,
  false,
  'normal'
FROM calls c
JOIN elderly_profiles ep ON c.elderly_profile_id = ep.id
WHERE ep.phone_number = '+12025551234'
ORDER BY c.initiated_at DESC
LIMIT 1;

-- Insert a sample issue
INSERT INTO issues (elderly_profile_id, call_id, title, description, category, status, priority, source)
SELECT
  ep.id,
  c.id,
  'Doctor appointment',
  'Mrs. Mary needs a reminder about her doctor appointment next week (cardiologist)',
  'health',
  'open',
  'normal',
  'auto'
FROM elderly_profiles ep
JOIN calls c ON c.elderly_profile_id = ep.id
WHERE ep.phone_number = '+12025551234'
ORDER BY c.initiated_at DESC
LIMIT 1;

-- Insert a call for John Davis
INSERT INTO calls (elderly_profile_id, conversation_id, status, initiated_at, started_at, ended_at, duration_secs, call_type)
SELECT
  id,
  'conv_' || gen_random_uuid()::text,
  'completed',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day' + INTERVAL '20 seconds',
  NOW() - INTERVAL '1 day' + INTERVAL '8 minutes 20 seconds',
  480,
  'scheduled'
FROM elderly_profiles WHERE phone_number = '+12025553456';

-- Insert call summary for John's call
INSERT INTO call_summaries (call_id, transcript_summary, call_successful, mood_assessment, health_mentions, needs_mentioned, follow_up_required, urgency_level)
SELECT
  c.id,
  'Mr. John was somewhat down today. He mentioned missing contact with his family. He complained about chest pain that occurs with exertion. Family contact was recommended.',
  true,
  'concerned',
  '["chest pain", "shortness of breath with exertion"]'::jsonb,
  '["family contact", "doctor visit"]'::jsonb,
  true,
  'high'
FROM calls c
JOIN elderly_profiles ep ON c.elderly_profile_id = ep.id
WHERE ep.phone_number = '+12025553456'
ORDER BY c.initiated_at DESC
LIMIT 1;

-- Insert urgent issue for John
INSERT INTO issues (elderly_profile_id, call_id, title, description, category, status, priority, source)
SELECT
  ep.id,
  c.id,
  'Chest pain',
  'Mr. John reported chest pain with exertion. Requires urgent cardiology consultation.',
  'health',
  'open',
  'high',
  'auto'
FROM elderly_profiles ep
JOIN calls c ON c.elderly_profile_id = ep.id
WHERE ep.phone_number = '+12025553456'
ORDER BY c.initiated_at DESC
LIMIT 1;

-- Insert loneliness issue for John
INSERT INTO issues (elderly_profile_id, call_id, title, description, category, status, priority, source)
SELECT
  ep.id,
  c.id,
  'Loneliness - lack of family contact',
  'Mr. John mentioned lack of family contact and feeling lonely. Contact with son recommended.',
  'loneliness',
  'open',
  'normal',
  'auto'
FROM elderly_profiles ep
JOIN calls c ON c.elderly_profile_id = ep.id
WHERE ep.phone_number = '+12025553456'
ORDER BY c.initiated_at DESC
LIMIT 1;

-- Insert a missed call for Anna Wilson
INSERT INTO calls (elderly_profile_id, conversation_id, status, initiated_at, call_type)
SELECT
  id,
  'conv_' || gen_random_uuid()::text,
  'missed',
  NOW() - INTERVAL '1 day',
  'scheduled'
FROM elderly_profiles WHERE phone_number = '+12025555678';
