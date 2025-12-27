-- Migration: Add notes system and reminder fields
-- For follow-up notes and REVIEW lead reminders

-- ============================================
-- LEAD NOTES / ACTIVITY LOG
-- ============================================
CREATE TABLE qualifyiq_lead_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES qualifyiq_leads(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES qualifyiq_organizations(id) ON DELETE CASCADE,

  -- Note content
  content TEXT NOT NULL,
  note_type TEXT DEFAULT 'note' CHECK (note_type IN ('note', 'call', 'email', 'meeting', 'status_change', 'outcome')),

  -- Metadata
  created_by UUID REFERENCES qualifyiq_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_qualifyiq_lead_notes_lead ON qualifyiq_lead_notes(lead_id);
CREATE INDEX idx_qualifyiq_lead_notes_created_at ON qualifyiq_lead_notes(created_at DESC);

-- RLS
ALTER TABLE qualifyiq_lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qualifyiq_users_view_notes"
  ON qualifyiq_lead_notes FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM qualifyiq_profiles WHERE id = auth.uid()));

CREATE POLICY "qualifyiq_users_create_notes"
  ON qualifyiq_lead_notes FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM qualifyiq_profiles WHERE id = auth.uid()));

CREATE POLICY "qualifyiq_users_update_own_notes"
  ON qualifyiq_lead_notes FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "qualifyiq_users_delete_own_notes"
  ON qualifyiq_lead_notes FOR DELETE
  USING (created_by = auth.uid());

-- Updated at trigger
CREATE TRIGGER qualifyiq_update_lead_notes_updated_at
  BEFORE UPDATE ON qualifyiq_lead_notes
  FOR EACH ROW EXECUTE FUNCTION qualifyiq_update_updated_at_column();

-- ============================================
-- ADD FOLLOW-UP DATE TO LEADS
-- ============================================
ALTER TABLE qualifyiq_leads
ADD COLUMN IF NOT EXISTS follow_up_date DATE,
ADD COLUMN IF NOT EXISTS follow_up_notes TEXT;

-- Index for finding leads needing follow-up
CREATE INDEX idx_qualifyiq_leads_follow_up ON qualifyiq_leads(follow_up_date)
WHERE follow_up_date IS NOT NULL AND status = 'pending';

-- ============================================
-- VIEW: LEADS NEEDING FOLLOW-UP
-- ============================================
CREATE OR REPLACE VIEW qualifyiq_leads_needing_followup AS
SELECT
  l.*,
  CASE
    WHEN l.follow_up_date < CURRENT_DATE THEN 'overdue'
    WHEN l.follow_up_date = CURRENT_DATE THEN 'today'
    WHEN l.follow_up_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'upcoming'
    ELSE 'later'
  END as urgency
FROM qualifyiq_leads l
WHERE l.recommendation = 'review'
  AND l.status = 'pending'
  AND (l.follow_up_date IS NULL OR l.follow_up_date <= CURRENT_DATE + INTERVAL '7 days')
ORDER BY
  CASE WHEN l.follow_up_date IS NULL THEN 1 ELSE 0 END,
  l.follow_up_date ASC;
