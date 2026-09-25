/*
# Create leads table for Mindflex AI quiz

1. New Tables
- `leads`
- `id` (uuid, primary key)
- `name` (text, not null) — visitor's first name
- `email` (text, not null, unique) — visitor's email for early access
- `risk_score` (integer, 0-100) — calculated AI risk score
- `profession` (text) — the predicted at-risk profession
- `risk_level` (text) — low / medium / high / critical
- `created_at` (timestamptz)
2. Security
- Enable RLS on `leads`.
- Allow anon + authenticated INSERT (quiz submissions are public, no sign-in).
- Allow anon + authenticated SELECT (so results can be looked up by email).
- No UPDATE or DELETE from the frontend.
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  risk_score integer NOT NULL DEFAULT 0,
  profession text NOT NULL DEFAULT '',
  risk_level text NOT NULL DEFAULT 'low',
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS leads_email_unique_idx ON leads(email);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_leads" ON leads;
CREATE POLICY "anon_select_leads" ON leads FOR SELECT
TO anon, authenticated USING (true);
