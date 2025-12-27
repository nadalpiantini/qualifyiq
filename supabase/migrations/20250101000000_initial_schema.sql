-- QualifyIQ Database Schema
-- Initial migration for sujeto10 shared Supabase
-- All tables prefixed with qualifyiq_ per sujeto10 convention

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ORGANIZATIONS
-- ============================================
CREATE TABLE qualifyiq_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for slug lookups
CREATE INDEX idx_qualifyiq_organizations_slug ON qualifyiq_organizations(slug);

-- ============================================
-- USER PROFILES
-- ============================================
CREATE TABLE qualifyiq_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES qualifyiq_organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for organization lookups
CREATE INDEX idx_qualifyiq_profiles_organization ON qualifyiq_profiles(organization_id);

-- ============================================
-- LEADS
-- ============================================
CREATE TABLE qualifyiq_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES qualifyiq_organizations(id) ON DELETE CASCADE,

  -- Basic Information
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  source TEXT,
  notes TEXT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'qualified', 'disqualified', 'converted', 'lost')),
  recommendation TEXT CHECK (recommendation IN ('go', 'review', 'no_go')),
  score INTEGER CHECK (score >= 0 AND score <= 100),

  -- Outcome tracking (for feedback loop)
  outcome TEXT CHECK (outcome IN ('great', 'good', 'neutral', 'problematic', 'terrible')),
  outcome_notes TEXT,
  outcome_recorded_at TIMESTAMPTZ,

  -- Metadata
  created_by UUID REFERENCES qualifyiq_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_qualifyiq_leads_organization ON qualifyiq_leads(organization_id);
CREATE INDEX idx_qualifyiq_leads_status ON qualifyiq_leads(status);
CREATE INDEX idx_qualifyiq_leads_recommendation ON qualifyiq_leads(recommendation);
CREATE INDEX idx_qualifyiq_leads_created_at ON qualifyiq_leads(created_at DESC);

-- ============================================
-- SCORECARDS
-- ============================================
CREATE TABLE qualifyiq_scorecards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES qualifyiq_leads(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES qualifyiq_organizations(id) ON DELETE CASCADE,

  -- BANT Scores (1-5 scale)
  budget_score INTEGER CHECK (budget_score >= 1 AND budget_score <= 5),
  budget_notes TEXT,

  authority_score INTEGER CHECK (authority_score >= 1 AND authority_score <= 5),
  authority_notes TEXT,

  need_score INTEGER CHECK (need_score >= 1 AND need_score <= 5),
  need_notes TEXT,

  timeline_score INTEGER CHECK (timeline_score >= 1 AND timeline_score <= 5),
  timeline_notes TEXT,

  technical_fit_score INTEGER CHECK (technical_fit_score >= 1 AND technical_fit_score <= 5),
  technical_fit_notes TEXT,

  -- Red Flags (stored as JSON array of flag IDs)
  red_flags JSONB DEFAULT '[]'::jsonb,

  -- Calculated Values
  weighted_score INTEGER,
  recommendation TEXT CHECK (recommendation IN ('go', 'review', 'no_go')),

  -- Notes
  overall_notes TEXT,

  -- Metadata
  created_by UUID REFERENCES qualifyiq_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_qualifyiq_scorecards_lead ON qualifyiq_scorecards(lead_id);
CREATE INDEX idx_qualifyiq_scorecards_organization ON qualifyiq_scorecards(organization_id);

-- ============================================
-- SCORING CONFIGURATION
-- ============================================
CREATE TABLE qualifyiq_scoring_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID UNIQUE NOT NULL REFERENCES qualifyiq_organizations(id) ON DELETE CASCADE,

  -- Weight percentages (should sum to ~100)
  budget_weight INTEGER DEFAULT 20,
  authority_weight INTEGER DEFAULT 15,
  need_weight INTEGER DEFAULT 25,
  timeline_weight INTEGER DEFAULT 15,
  technical_fit_weight INTEGER DEFAULT 15,

  -- Penalty per red flag
  red_flag_penalty INTEGER DEFAULT 5,

  -- Thresholds
  go_threshold INTEGER DEFAULT 70,
  review_threshold INTEGER DEFAULT 50,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE qualifyiq_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualifyiq_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualifyiq_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualifyiq_scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualifyiq_scoring_configs ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "qualifyiq_users_view_org"
  ON qualifyiq_organizations FOR SELECT
  USING (id IN (SELECT organization_id FROM qualifyiq_profiles WHERE id = auth.uid()));

CREATE POLICY "qualifyiq_owners_update_org"
  ON qualifyiq_organizations FOR UPDATE
  USING (id IN (SELECT organization_id FROM qualifyiq_profiles WHERE id = auth.uid() AND role = 'owner'));

-- Profiles policies
CREATE POLICY "qualifyiq_users_view_profiles"
  ON qualifyiq_profiles FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM qualifyiq_profiles WHERE id = auth.uid()));

CREATE POLICY "qualifyiq_users_update_own_profile"
  ON qualifyiq_profiles FOR UPDATE
  USING (id = auth.uid());

-- Leads policies
CREATE POLICY "qualifyiq_users_view_leads"
  ON qualifyiq_leads FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM qualifyiq_profiles WHERE id = auth.uid()));

CREATE POLICY "qualifyiq_users_create_leads"
  ON qualifyiq_leads FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM qualifyiq_profiles WHERE id = auth.uid()));

CREATE POLICY "qualifyiq_users_update_leads"
  ON qualifyiq_leads FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM qualifyiq_profiles WHERE id = auth.uid()));

CREATE POLICY "qualifyiq_admins_delete_leads"
  ON qualifyiq_leads FOR DELETE
  USING (organization_id IN (SELECT organization_id FROM qualifyiq_profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')));

-- Scorecards policies
CREATE POLICY "qualifyiq_users_view_scorecards"
  ON qualifyiq_scorecards FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM qualifyiq_profiles WHERE id = auth.uid()));

CREATE POLICY "qualifyiq_users_create_scorecards"
  ON qualifyiq_scorecards FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM qualifyiq_profiles WHERE id = auth.uid()));

CREATE POLICY "qualifyiq_users_update_scorecards"
  ON qualifyiq_scorecards FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM qualifyiq_profiles WHERE id = auth.uid()));

CREATE POLICY "qualifyiq_admins_delete_scorecards"
  ON qualifyiq_scorecards FOR DELETE
  USING (organization_id IN (SELECT organization_id FROM qualifyiq_profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')));

-- Scoring configs policies
CREATE POLICY "qualifyiq_users_view_config"
  ON qualifyiq_scoring_configs FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM qualifyiq_profiles WHERE id = auth.uid()));

CREATE POLICY "qualifyiq_admins_update_config"
  ON qualifyiq_scoring_configs FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM qualifyiq_profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')));

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION qualifyiq_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER qualifyiq_update_organizations_updated_at
  BEFORE UPDATE ON qualifyiq_organizations
  FOR EACH ROW EXECUTE FUNCTION qualifyiq_update_updated_at_column();

CREATE TRIGGER qualifyiq_update_profiles_updated_at
  BEFORE UPDATE ON qualifyiq_profiles
  FOR EACH ROW EXECUTE FUNCTION qualifyiq_update_updated_at_column();

CREATE TRIGGER qualifyiq_update_leads_updated_at
  BEFORE UPDATE ON qualifyiq_leads
  FOR EACH ROW EXECUTE FUNCTION qualifyiq_update_updated_at_column();

CREATE TRIGGER qualifyiq_update_scorecards_updated_at
  BEFORE UPDATE ON qualifyiq_scorecards
  FOR EACH ROW EXECUTE FUNCTION qualifyiq_update_updated_at_column();

CREATE TRIGGER qualifyiq_update_scoring_configs_updated_at
  BEFORE UPDATE ON qualifyiq_scoring_configs
  FOR EACH ROW EXECUTE FUNCTION qualifyiq_update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION qualifyiq_handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  org_name TEXT;
BEGIN
  -- Extract company name from email domain or use full name
  org_name := COALESCE(
    NEW.raw_user_meta_data->>'company_name',
    split_part(NEW.email, '@', 1) || '''s Organization'
  );

  -- Create a new organization for the user
  INSERT INTO qualifyiq_organizations (name, slug)
  VALUES (org_name, lower(replace(org_name, ' ', '-')) || '-' || substr(NEW.id::text, 1, 8))
  RETURNING id INTO org_id;

  -- Create the user's profile
  INSERT INTO qualifyiq_profiles (id, organization_id, email, full_name, role)
  VALUES (
    NEW.id,
    org_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'owner'
  );

  -- Create default scoring config for the organization
  INSERT INTO qualifyiq_scoring_configs (organization_id)
  VALUES (org_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER qualifyiq_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION qualifyiq_handle_new_user();

-- ============================================
-- VIEWS
-- ============================================

-- View for leads with latest scorecard
CREATE VIEW qualifyiq_leads_with_scores AS
SELECT
  l.*,
  s.budget_score,
  s.authority_score,
  s.need_score,
  s.timeline_score,
  s.technical_fit_score,
  s.red_flags,
  s.weighted_score,
  s.created_at AS scorecard_created_at
FROM qualifyiq_leads l
LEFT JOIN LATERAL (
  SELECT *
  FROM qualifyiq_scorecards
  WHERE lead_id = l.id
  ORDER BY created_at DESC
  LIMIT 1
) s ON true;

-- ============================================
-- SEED DATA (for development)
-- ============================================

-- Insert demo data only if no organizations exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM qualifyiq_organizations LIMIT 1) THEN
    -- This will be handled by the auth trigger when users sign up
    NULL;
  END IF;
END $$;
