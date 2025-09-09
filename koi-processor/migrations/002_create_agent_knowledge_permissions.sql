-- Migration: Create agent_knowledge_permissions table
-- Purpose: Control which data sources each agent can access in the KOI system
-- Date: 2025-09-09

-- Create the permissions table
CREATE TABLE IF NOT EXISTS agent_knowledge_permissions (
    id SERIAL PRIMARY KEY,
    agent_id UUID NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- 'website', 'document', 'sensor', etc.
    source_identifier VARCHAR(500) NOT NULL, -- RID pattern or URL
    permission VARCHAR(10) NOT NULL DEFAULT 'allow', -- 'allow' or 'deny'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique permission per agent and source
    UNIQUE(agent_id, source_identifier),
    
    -- Validate permission values
    CHECK (permission IN ('allow', 'deny')),
    
    -- Validate source types
    CHECK (source_type IN ('website', 'document', 'sensor', 'all'))
);

-- Create indexes for efficient querying
CREATE INDEX idx_agent_permissions_agent_id ON agent_knowledge_permissions(agent_id);
CREATE INDEX idx_agent_permissions_source_type ON agent_knowledge_permissions(source_type);
CREATE INDEX idx_agent_permissions_identifier ON agent_knowledge_permissions(source_identifier);

-- Create a view to easily see agent permissions with agent names
CREATE OR REPLACE VIEW agent_permissions_view AS
SELECT 
    a.id as agent_id,
    a.name as agent_name,
    akp.source_type,
    akp.source_identifier,
    akp.permission,
    akp.metadata,
    akp.created_at,
    akp.updated_at
FROM agents a
LEFT JOIN agent_knowledge_permissions akp ON a.id = akp.agent_id
ORDER BY a.name, akp.source_type, akp.source_identifier;

-- Function to get allowed RID patterns for an agent
CREATE OR REPLACE FUNCTION get_agent_allowed_patterns(p_agent_id UUID)
RETURNS TEXT[] AS $$
DECLARE
    allowed_patterns TEXT[];
BEGIN
    SELECT ARRAY_AGG(source_identifier)
    INTO allowed_patterns
    FROM agent_knowledge_permissions
    WHERE agent_id = p_agent_id
    AND permission = 'allow';
    
    -- If no specific permissions, return wildcard (allow all)
    IF allowed_patterns IS NULL OR array_length(allowed_patterns, 1) IS NULL THEN
        RETURN ARRAY['%'];
    END IF;
    
    RETURN allowed_patterns;
END;
$$ LANGUAGE plpgsql;

-- Function to check if an agent has access to a specific RID
CREATE OR REPLACE FUNCTION agent_has_access(p_agent_id UUID, p_rid TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN;
    allowed_patterns TEXT[];
BEGIN
    -- Get allowed patterns for the agent
    allowed_patterns := get_agent_allowed_patterns(p_agent_id);
    
    -- Check if RID matches any allowed pattern
    SELECT EXISTS (
        SELECT 1 
        FROM unnest(allowed_patterns) AS pattern
        WHERE p_rid LIKE pattern
    ) INTO has_access;
    
    RETURN has_access;
END;
$$ LANGUAGE plpgsql;

-- Insert default permissions for test agent (restrict to website sensor only)
INSERT INTO agent_knowledge_permissions (agent_id, source_type, source_identifier, permission)
SELECT 
    id,
    'website',
    'sensor.website.%',
    'allow'
FROM agents 
WHERE name = 'TestMCPBGETypeScript'
ON CONFLICT (agent_id, source_identifier) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE agent_knowledge_permissions IS 'Controls which data sources each agent can access in the KOI system';
COMMENT ON COLUMN agent_knowledge_permissions.agent_id IS 'Reference to the agent in the agents table';
COMMENT ON COLUMN agent_knowledge_permissions.source_type IS 'Type of data source: website, document, sensor, or all';
COMMENT ON COLUMN agent_knowledge_permissions.source_identifier IS 'RID pattern (using % wildcard) or specific URL/identifier';
COMMENT ON COLUMN agent_knowledge_permissions.permission IS 'Whether to allow or deny access to this source';
COMMENT ON FUNCTION get_agent_allowed_patterns IS 'Returns array of allowed RID patterns for an agent';
COMMENT ON FUNCTION agent_has_access IS 'Checks if an agent has access to a specific RID';