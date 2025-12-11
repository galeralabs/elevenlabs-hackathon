-- Seed data for TeaTime elderly care application

-- Insert elderly profiles
INSERT INTO elderly_profiles (
  first_name, last_name, preferred_name, phone_number, date_of_birth,
  preferred_call_time, is_active, city, address_line1,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
  medical_notes, care_notes
) VALUES
  ('Maria', 'Kowalska', 'Pani Maria', '+48123456789', '1945-03-15', '09:00', true,
   'Warszawa', 'ul. Kwiatowa 15/3',
   'Anna Kowalska', '+48111222333', 'córka',
   'Cukrzyca typu 2, nadciśnienie', 'Lubi rozmawiać o wnukach'),

  ('Jan', 'Nowak', NULL, '+48987654321', '1940-07-22', '10:30', true,
   'Kraków', 'ul. Słoneczna 8',
   'Piotr Nowak', '+48444555666', 'syn',
   'Problemy z sercem, przyjmuje leki na rozrzedzenie krwi', 'Były nauczyciel, lubi rozmawiać o historii'),

  ('Anna', 'Wiśniewska', 'Babcia Ania', '+48555666777', '1938-11-08', '11:00', true,
   'Gdańsk', 'ul. Morska 42/10',
   'Katarzyna Wiśniewska', '+48777888999', 'córka',
   'Astma, alergie sezonowe', 'Samotna, potrzebuje więcej kontaktu społecznego'),

  ('Stanisław', 'Wójcik', 'Pan Staszek', '+48111222333', '1942-05-30', '09:30', true,
   'Poznań', 'ul. Parkowa 5',
   'Marek Wójcik', '+48222333444', 'syn',
   NULL, 'Były wojskowy, lubi poranne rozmowy'),

  ('Helena', 'Kamińska', NULL, '+48444555666', '1935-09-12', '10:00', false,
   'Wrocław', 'ul. Ogrodowa 22',
   'Ewa Kamińska', '+48333444555', 'córka',
   'Demencja w początkowym stadium', 'Obecnie w szpitalu - przerwa w rozmowach');

-- Insert some sample calls for Maria Kowalska
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
FROM elderly_profiles WHERE phone_number = '+48123456789';

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
FROM elderly_profiles WHERE phone_number = '+48123456789';

-- Insert call summary for the most recent call
INSERT INTO call_summaries (call_id, transcript_summary, call_successful, mood_assessment, health_mentions, needs_mentioned, follow_up_required, urgency_level)
SELECT
  c.id,
  'Pani Maria była w dobrym nastroju. Opowiadała o wizycie wnuków w weekend. Wspomniała, że czuje się trochę zmęczona, ale ogólnie dobrze. Przypomniała o wizytę u lekarza w przyszłym tygodniu.',
  true,
  'positive',
  '["zmęczenie", "wizyta u lekarza"]'::jsonb,
  '["przypomnienie o wizycie lekarskiej"]'::jsonb,
  false,
  'normal'
FROM calls c
JOIN elderly_profiles ep ON c.elderly_profile_id = ep.id
WHERE ep.phone_number = '+48123456789'
ORDER BY c.initiated_at DESC
LIMIT 1;

-- Insert a sample issue
INSERT INTO issues (elderly_profile_id, call_id, title, description, category, status, priority, source)
SELECT
  ep.id,
  c.id,
  'Wizyta u lekarza',
  'Pani Maria potrzebuje przypomnienia o wizycie u lekarza w przyszłym tygodniu (kardiolog)',
  'health',
  'open',
  'normal',
  'auto'
FROM elderly_profiles ep
JOIN calls c ON c.elderly_profile_id = ep.id
WHERE ep.phone_number = '+48123456789'
ORDER BY c.initiated_at DESC
LIMIT 1;

-- Insert a call for Jan Nowak
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
FROM elderly_profiles WHERE phone_number = '+48987654321';

-- Insert call summary for Jan's call
INSERT INTO call_summaries (call_id, transcript_summary, call_successful, mood_assessment, health_mentions, needs_mentioned, follow_up_required, urgency_level)
SELECT
  c.id,
  'Pan Jan był dziś nieco przygnębiony. Wspomniał, że brakuje mu kontaktu z rodziną. Skarżył się na ból w klatce piersiowej, który pojawia się przy wysiłku. Zalecono kontakt z rodziną.',
  true,
  'concerned',
  '["ból w klatce piersiowej", "duszności przy wysiłku"]'::jsonb,
  '["kontakt z rodziną", "wizyta lekarska"]'::jsonb,
  true,
  'high'
FROM calls c
JOIN elderly_profiles ep ON c.elderly_profile_id = ep.id
WHERE ep.phone_number = '+48987654321'
ORDER BY c.initiated_at DESC
LIMIT 1;

-- Insert urgent issue for Jan
INSERT INTO issues (elderly_profile_id, call_id, title, description, category, status, priority, source)
SELECT
  ep.id,
  c.id,
  'Ból w klatce piersiowej',
  'Pan Jan zgłosił ból w klatce piersiowej przy wysiłku. Wymaga pilnej konsultacji kardiologicznej.',
  'health',
  'open',
  'high',
  'auto'
FROM elderly_profiles ep
JOIN calls c ON c.elderly_profile_id = ep.id
WHERE ep.phone_number = '+48987654321'
ORDER BY c.initiated_at DESC
LIMIT 1;

-- Insert loneliness issue for Jan
INSERT INTO issues (elderly_profile_id, call_id, title, description, category, status, priority, source)
SELECT
  ep.id,
  c.id,
  'Samotność - brak kontaktu z rodziną',
  'Pan Jan wspomniał o braku kontaktu z rodziną i uczuciu osamotnienia. Zalecany kontakt z synem.',
  'loneliness',
  'open',
  'normal',
  'auto'
FROM elderly_profiles ep
JOIN calls c ON c.elderly_profile_id = ep.id
WHERE ep.phone_number = '+48987654321'
ORDER BY c.initiated_at DESC
LIMIT 1;

-- Insert a missed call for Anna Wiśniewska
INSERT INTO calls (elderly_profile_id, conversation_id, status, initiated_at, call_type)
SELECT
  id,
  'conv_' || gen_random_uuid()::text,
  'missed',
  NOW() - INTERVAL '1 day',
  'scheduled'
FROM elderly_profiles WHERE phone_number = '+48555666777';
