-- Grant Applications Database Schema
-- For REGEN IRL Grant Competition

-- Create grant applications table
CREATE TABLE IF NOT EXISTS grant_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Application metadata
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Project details
    project_title VARCHAR(500) NOT NULL,
    project_summary TEXT NOT NULL,
    project_category VARCHAR(100) NOT NULL,
    other_category VARCHAR(200),
    
    -- PROI and implementation
    proi_generation TEXT NOT NULL,
    project_stage VARCHAR(50) NOT NULL,
    timeline TEXT NOT NULL,
    
    -- Supporting documents (store file paths or URLs)
    supporting_docs JSONB,
    
    -- Assessment scores
    grant_importance INTEGER CHECK (grant_importance >= 1 AND grant_importance <= 5),
    confidence INTEGER CHECK (confidence >= 1 AND confidence <= 10),
    
    -- Contact information
    email VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(42) NOT NULL,
    
    -- Application status
    status VARCHAR(50) DEFAULT 'pending',
    review_notes TEXT,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMPTZ,
    
    -- Scoring
    score DECIMAL(5,2),
    
    -- Indexes for searching
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    CONSTRAINT valid_wallet CHECK (wallet_address ~* '^0x[a-fA-F0-9]{40}$')
);

-- Create indexes for efficient querying
CREATE INDEX idx_grant_applications_submitted_at ON grant_applications(submitted_at DESC);
CREATE INDEX idx_grant_applications_status ON grant_applications(status);
CREATE INDEX idx_grant_applications_email ON grant_applications(email);
CREATE INDEX idx_grant_applications_wallet ON grant_applications(wallet_address);
CREATE INDEX idx_grant_applications_category ON grant_applications(project_category);

-- Create table for application chat logs (optional, for tracking AI assistance)
CREATE TABLE IF NOT EXISTS grant_application_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES grant_applications(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    message_type VARCHAR(20) CHECK (message_type IN ('user', 'assistant')),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_grant_chats_application ON grant_application_chats(application_id);
CREATE INDEX idx_grant_chats_session ON grant_application_chats(session_id);

-- Create view for application statistics
CREATE OR REPLACE VIEW grant_application_stats AS
SELECT 
    COUNT(*) as total_applications,
    COUNT(DISTINCT email) as unique_applicants,
    AVG(confidence)::DECIMAL(3,1) as avg_confidence,
    AVG(grant_importance)::DECIMAL(3,1) as avg_importance,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed_count,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
    COUNT(*) FILTER (WHERE project_category = 'regenerative-agriculture') as agriculture_count,
    COUNT(*) FILTER (WHERE project_category = 'carbon-sequestration') as carbon_count,
    COUNT(*) FILTER (WHERE project_category = 'biodiversity') as biodiversity_count,
    COUNT(*) FILTER (WHERE project_category = 'water-conservation') as water_count,
    COUNT(*) FILTER (WHERE project_category = 'soil-health') as soil_count,
    COUNT(*) FILTER (WHERE project_category = 'renewable-energy') as energy_count,
    COUNT(*) FILTER (WHERE project_category = 'waste-reduction') as waste_count
FROM grant_applications;

-- Add comments for documentation
COMMENT ON TABLE grant_applications IS 'REGEN IRL Grant Competition applications';
COMMENT ON COLUMN grant_applications.proi_generation IS 'Planetary Return on Investment - how the project generates environmental benefits';
COMMENT ON COLUMN grant_applications.confidence IS 'Applicant confidence in achieving PROI goals (1-10 scale)';
COMMENT ON COLUMN grant_applications.grant_importance IS 'How important the grant is to project success (1-5 scale)';