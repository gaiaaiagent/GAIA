import React, { useEffect, useState } from 'react';
import { Clock, ArrowRight, Database, Hash, FileText } from 'lucide-react';

interface TransformationStep {
  receipt_id: string;
  transformation_type: string;
  input_rid: string;
  output_rid: string;
  created_at: string;
  metadata: any;
}

interface ProvenanceTimelineProps {
  rid?: string;
}

const ProvenanceTimeline: React.FC<ProvenanceTimelineProps> = ({ rid }) => {
  const [provenanceChain, setProvenanceChain] = useState<TransformationStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchRid, setSearchRid] = useState(rid || '');
  const [error, setError] = useState<string | null>(null);

  const fetchProvenance = async (targetRid: string) => {
    if (!targetRid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/koi/provenance/${encodeURIComponent(targetRid)}`);
      const data = await response.json();
      
      if (data.status === 'ok') {
        setProvenanceChain(data.transformations || []);
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

  useEffect(() => {
    if (rid) {
      fetchProvenance(rid);
    }
  }, [rid]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchRid) {
      fetchProvenance(searchRid);
    }
  };

  const getTransformationIcon = (type: string) => {
    switch (type) {
      case 'koi_to_bge_embedding':
        return <Database className="w-4 h-4" />;
      case 'sensor_capture':
        return <FileText className="w-4 h-4" />;
      default:
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
            disabled={loading || !searchRid}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
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
                        {getTransformationIcon(step.transformation_type)}
                        <span className="font-medium text-sm">
                          {step.transformation_type.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(step.created_at)}
                      </div>
                    </div>
                    
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Receipt:</span>
                        <code className="bg-gray-100 px-1 py-0.5 rounded">
                          {step.receipt_id}
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
      const response = await fetch('/api/koi/transformations?limit=5');
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