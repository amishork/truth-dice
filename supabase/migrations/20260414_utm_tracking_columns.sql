-- Add UTM tracking columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_content text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_term text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS landing_page text;

-- Add UTM tracking columns to email_captures table
ALTER TABLE email_captures ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE email_captures ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE email_captures ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE email_captures ADD COLUMN IF NOT EXISTS utm_content text;
ALTER TABLE email_captures ADD COLUMN IF NOT EXISTS utm_term text;
ALTER TABLE email_captures ADD COLUMN IF NOT EXISTS landing_page text;

-- Index for attribution queries
CREATE INDEX IF NOT EXISTS idx_leads_utm_source ON leads (utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_utm_campaign ON leads (utm_campaign) WHERE utm_campaign IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_captures_utm_source ON email_captures (utm_source) WHERE utm_source IS NOT NULL;
