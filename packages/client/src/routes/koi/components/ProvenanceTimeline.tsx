import React, { useEffect, useState } from 'react';
import { Clock, ArrowRight, Database, Hash, FileText } from 'lucide-react';

interface TransformationStep {
  receipt_id: string;
  type: string;
  transformation_type?: string;
  input_rid: string;
  output_rid: string;
  timestamp?: string;
  created_at?: string;
  details?: {
    processor?: string;
    chunks_created?: number;
    embeddings_created?: number;
    entities_extracted?: number;
  };
  metadata?: any;
}

interface ProvenanceData {
  rid: string;
  found: boolean;
  document?: {
    title?: string;
    source_sensor?: string;
    created_at?: string;
    content_hash?: string;
  };
  provenance?: {
    sensed_by: string[];
    processed_by: string[];
    stored_in: string[];
    transformation_count: number;
    first_seen?: string;
    last_updated?: string;
  };
  timeline: TransformationStep[];
  error?: string;
}

interface ProvenanceTimelineProps {
  rid?: string;
}

const ProvenanceTimeline: React.FC<ProvenanceTimelineProps> = ({ rid }) => {
  const [provenanceData, setProvenanceData] = useState<ProvenanceData | null>(null);
  const [provenanceChain, setProvenanceChain] = useState<TransformationStep[]>([]);
  const [availableRids, setAvailableRids] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchRid, setSearchRid] = useState(rid || '');
  const [error, setError] = useState<string | null>(null);

  // Example RIDs from the real system
  const exampleRids = [
    { rid: 'orn:notion:demo:1758839966', title: 'Notion Demo Document' },
    { rid: 'orn:web.page:registry.regen.network/953dfe65ada6b059', title: 'Regen Registry Page' },
    { rid: 'orn:discourse.post:forum.regen.network/19/20', title: 'Discourse Forum Post' },
    { rid: 'orn:web.page:forum.regen.network/e97430973a074f8f', title: 'Forum Discussion' },
    { rid: 'orn:document:test:doc001', title: 'Test Document with Full Chain' }
  ];

  const fetchProvenance = async (targetRid: string) => {
    if (!targetRid) return;

    setLoading(true);
    setError(null);

    try {
      // Use relative URL to work through nginx proxy
      // Strip credentials from current URL to avoid fetch API errors
      const baseUrl = window.location.origin.replace(/\/\/[^@]+@/, '//');
      const response = await fetch(`${baseUrl}/api/koi/graph/provenance/${encodeURIComponent(targetRid)}`);
      const data: ProvenanceData = await response.json();

      if (data.found) {
        setProvenanceData(data);
        setProvenanceChain(data.timeline || []);
        setError(null);
      } else if (data.error) {
        setError(data.error);
        setProvenanceChain([]);
      } else {
        setError('No provenance found for this RID');
        setProvenanceChain([]);
      }
    } catch (error) {
      console.error('Error fetching provenance:', error);
      setError('Failed to fetch provenance data');
      setProvenanceChain([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRids = async () => {
    try {
      const baseUrl = window.location.origin.replace(/\/\/[^@]+@/, '//');
      const response = await fetch(`${baseUrl}/api/koi/rids?limit=10`);
      const data = await response.json();
      if (data.rids) {
        setAvailableRids(data.rids);
      }
    } catch (error) {
      console.error('Error fetching RIDs:', error);
    }
  };

  useEffect(() => {
    if (rid) {
      fetchProvenance(rid);
    }
    fetchAvailableRids();
  }, [rid]);

  const handleTrace = () => {
    if (searchRid.trim()) {
      fetchProvenance(searchRid.trim());
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchRid) {
      fetchProvenance(searchRid);
    }
  };

  const getTransformationIcon = (type: string) => {
    if (type.includes('embedding')) {
      return <Database className="w-4 h-4" />;
    } else if (type.includes('sensor') || type.includes('collection')) {
      return <FileText className="w-4 h-4" />;
    } else if (type.includes('memory')) {
      return <Database className="w-4 h-4" />;
    } else if (type.includes('processing') || type.includes('event')) {
      return <ArrowRight className="w-4 h-4" />;
    } else {
      return <Hash className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'Unknown time';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="provenance-timeline">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Transformation Provenance Timeline</h3>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchRid}
            onChange={(e) => setSearchRid(e.target.value)}
            placeholder="Enter RID to trace provenance..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            onClick={handleTrace}
            disabled={loading || !searchRid}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Loading...' : 'Trace'}
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      {/* Document Information */}
      {provenanceData?.document && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Document Information</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {provenanceData.document.title && (
              <div><span className="text-gray-600">Title:</span> {provenanceData.document.title}</div>
            )}
            {provenanceData.document.source_sensor && (
              <div><span className="text-gray-600">Source:</span> {provenanceData.document.source_sensor}</div>
            )}
            {provenanceData.document.created_at && (
              <div><span className="text-gray-600">Created:</span> {formatTimestamp(provenanceData.document.created_at)}</div>
            )}
            {provenanceData.document.content_hash && (
              <div><span className="text-gray-600">Hash:</span> {provenanceData.document.content_hash.substring(0, 16)}...</div>
            )}
          </div>
        </div>
      )}

      {/* Provenance Summary */}
      {provenanceData?.provenance && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Provenance Summary</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {provenanceData.provenance.sensed_by.length > 0 && (
              <div>
                <span className="text-gray-600">Sensed by:</span>
                <div className="mt-1">{provenanceData.provenance.sensed_by.join(', ')}</div>
              </div>
            )}
            {provenanceData.provenance.processed_by.length > 0 && (
              <div>
                <span className="text-gray-600">Processed by:</span>
                <div className="mt-1">{provenanceData.provenance.processed_by.join(', ')}</div>
              </div>
            )}
            {provenanceData.provenance.stored_in.length > 0 && (
              <div>
                <span className="text-gray-600">Stored in:</span>
                <div className="mt-1">{provenanceData.provenance.stored_in.join(', ')}</div>
              </div>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-600">
            Total transformations: {provenanceData.provenance.transformation_count}
          </div>
        </div>
      )}

      {/* Example RIDs or Available RIDs */}
      {!provenanceData && !loading && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">
            {availableRids.length > 0 ? 'Available RIDs' : 'Example RIDs'} (click to trace)
          </h4>
          <div className="space-y-1">
            {(availableRids.length > 0 ? availableRids.slice(0, 5) : exampleRids).map((ridItem) => (
              <button
                key={ridItem.rid}
                onClick={() => {
                  setSearchRid(ridItem.rid);
                  fetchProvenance(ridItem.rid);
                }}
                className="block w-full text-left p-2 hover:bg-gray-100 rounded text-xs transition-colors"
              >
                <div className="font-mono text-blue-600">{ridItem.rid}</div>
                {ridItem.title && <div className="text-gray-600">{ridItem.title}</div>}
              </button>
            ))}
          </div>
        </div>
      )}

      {provenanceChain.length > 0 && (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          
          {/* Timeline events */}
          <div className="space-y-6">
            {provenanceChain.map((step, index) => (
              <div key={step.receipt_id} className="relative flex items-start">
                {/* Timeline dot */}
                <div className="absolute left-4 w-4 h-4 bg-white border-2 border-blue-500 rounded-full z-10"></div>
                
                {/* Content card */}
                <div className="ml-12 flex-1">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTransformationIcon(step.type || step.transformation_type || '')}
                        <span className="font-medium text-sm">
                          {(step.type || step.transformation_type || '').replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(step.timestamp || step.created_at || '')}
                      </div>
                    </div>
                    
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Receipt:</span>
                        <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                          {step.receipt_id?.substring(0, 16)}...
                        </code>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Input RID:</span>
                        <code className="bg-gray-100 px-1 py-0.5 rounded text-xs truncate max-w-xs">
                          {step.input_rid}
                        </code>
                      </div>
                      
                      {index < provenanceChain.length - 1 && (
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-500">Output RID:</span>
                          <code className="bg-gray-100 px-1 py-0.5 rounded text-xs truncate max-w-xs">
                            {step.output_rid}
                          </code>
                        </div>
                      )}
                      
                      {/* Show transformation details if available */}
                      {step.details && (
                        <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                          {step.details.processor && (
                            <div>Processor: {step.details.processor}</div>
                          )}
                          {step.details.chunks_created > 0 && (
                            <div>Chunks created: {step.details.chunks_created}</div>
                          )}
                          {step.details.embeddings_created > 0 && (
                            <div>Embeddings created: {step.details.embeddings_created}</div>
                          )}
                          {step.details.entities_extracted > 0 && (
                            <div>Entities extracted: {step.details.entities_extracted}</div>
                          )}
                        </div>
                      )}

                      {step.metadata && Object.keys(step.metadata).length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                            Metadata
                          </summary>
                          <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                            {JSON.stringify(step.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && provenanceChain.length === 0 && !error && searchRid && (
        <div className="text-center py-8 text-gray-500">
          <p>No provenance chain found for this RID.</p>
          <p className="text-sm mt-2">Try searching for a different RID.</p>
        </div>
      )}

      {/* Recent Transformations */}
      <div className="mt-8">
        <h4 className="text-md font-semibold mb-3">Recent Transformations</h4>
        <RecentTransformations onSelectRid={setSearchRid} />
      </div>
    </div>
  );
};

// Sub-component for recent transformations
const RecentTransformations: React.FC<{ onSelectRid: (rid: string) => void }> = ({ onSelectRid }) => {
  const [transformations, setTransformations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentTransformations();
  }, []);

  const fetchRecentTransformations = async () => {
    try {
      const baseUrl = window.location.origin.replace(/\/\/[^@]+@/, '//');
      const response = await fetch(`${baseUrl}/api/koi/transformations?limit=5`);
      const data = await response.json();
      
      if (data.status === 'ok') {
        setTransformations(data.transformations || []);
      }
    } catch (error) {
      console.error('Error fetching recent transformations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading recent transformations...</div>;
  }

  if (transformations.length === 0) {
    return <div className="text-sm text-gray-500">No recent transformations</div>;
  }

  return (
    <div className="space-y-2">
      {transformations.map((t) => (
        <div 
          key={t.receipt_id}
          className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
          onClick={() => onSelectRid(t.output_rid)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="text-sm font-medium">{t.transformation_type}</div>
              <div className="text-xs text-gray-500 mt-1">
                From: {t.source_sensor} | 
                {t.chunks_created} chunks, {t.embeddings_created} embeddings
              </div>
              <div className="text-xs text-gray-400 mt-1">
                RID: {t.input_rid?.substring(0, 30)}...
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(t.created_at).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProvenanceTimeline;