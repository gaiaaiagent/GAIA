-- Create transformation_receipts table for CAT receipt persistence
-- This stores complete provenance tracking for KOI transformations

CREATE TABLE IF NOT EXISTS transformation_receipts (
    receipt_id VARCHAR(64) PRIMARY KEY,
    transformation_type VARCHAR(100) NOT NULL,
    
    -- Input identifiers
    input_rid VARCHAR(255),
    input_cid VARCHAR(255),
    
    -- Output identifiers  
    output_rid VARCHAR(255),
    output_cid VARCHAR(255),
    
    -- Processing details
    processor_name VARCHAR(100),
    processor_version VARCHAR(50),
    
    -- Metrics
    chunks_created INTEGER DEFAULT 0,
    embeddings_created INTEGER DEFAULT 0,
    entities_extracted INTEGER DEFAULT 0,
    
    -- Source information
    source_sensor VARCHAR(100),
    event_type VARCHAR(50), -- NEW, UPDATE, FORGET
    
    -- Metadata as flexible JSON
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processing_duration_ms INTEGER
);

-- Indexes for efficient queries
CREATE INDEX idx_receipts_input_rid ON transformation_receipts(input_rid);
CREATE INDEX idx_receipts_output_rid ON transformation_receipts(output_rid);
CREATE INDEX idx_receipts_source_sensor ON transformation_receipts(source_sensor);
CREATE INDEX idx_receipts_created_at ON transformation_receipts(created_at DESC);
CREATE INDEX idx_receipts_transformation_type ON transformation_receipts(transformation_type);

-- Create view for provenance chains
CREATE OR REPLACE VIEW provenance_chains AS
SELECT 
    t1.receipt_id as start_receipt,
    t1.input_rid as original_rid,
    t1.transformation_type as first_transformation,
    t2.receipt_id as next_receipt,
    t2.transformation_type as next_transformation,
    t2.output_rid as final_rid
FROM transformation_receipts t1
LEFT JOIN transformation_receipts t2 ON t1.output_rid = t2.input_rid
ORDER BY t1.created_at, t2.created_at;

-- Function to get complete provenance chain for a RID
CREATE OR REPLACE FUNCTION get_provenance_chain(target_rid VARCHAR)
RETURNS TABLE (
    receipt_id VARCHAR,
    transformation_type VARCHAR,
    input_rid VARCHAR,
    output_rid VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE chain AS (
        -- Start with transformations that output the target RID
        SELECT * FROM transformation_receipts 
        WHERE output_rid = target_rid
        
        UNION ALL
        
        -- Recursively find upstream transformations
        SELECT t.* FROM transformation_receipts t
        INNER JOIN chain c ON t.output_rid = c.input_rid
    )
    SELECT 
        chain.receipt_id,
        chain.transformation_type,
        chain.input_rid,
        chain.output_rid,
        chain.created_at,
        chain.metadata
    FROM chain
    ORDER BY chain.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON TABLE transformation_receipts IS 'CAT (Content Addressable Transformation) receipts for complete KOI provenance tracking';
COMMENT ON FUNCTION get_provenance_chain IS 'Returns the complete transformation chain for any RID, showing all upstream transformations';