import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// Removed table import - using native HTML table instead
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  Globe, 
  FileText, 
  Loader2,
  Save,
  RefreshCw,
  Shield,
  ShieldOff,
  ShieldCheck,
  Filter
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  permission_count: number;
  allow_count: number;
  deny_count: number;
}

interface Permission {
  id?: string;
  source_type: string;
  source_identifier: string;
  permission: 'allow' | 'deny';
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

interface DataSource {
  rid: string;
  source_type: string;
  source_file?: string;
  url?: string;
  memory_count: number;
}

const API_BASE = 'http://localhost:8300/api/koi/permissions';

export default function KnowledgeManager() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [availableSources, setAvailableSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load agents on mount
  useEffect(() => {
    loadAgents();
    loadDataSources();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/agents`);
      const data = await response.json();
      if (data.success) {
        setAgents(data.agents);
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDataSources = async () => {
    try {
      const response = await fetch(`${API_BASE}/sources`);
      const data = await response.json();
      if (data.success) {
        setAvailableSources(data.sources || []);
      }
    } catch (error) {
      console.error('Failed to load data sources:', error);
    }
  };

  const loadAgentPermissions = async (agentId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/agent/${agentId}`);
      const data = await response.json();
      if (data.success) {
        setPermissions(data.permissions || []);
      }
    } catch (error) {
      console.error('Failed to load agent permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentSelect = async (agent: Agent) => {
    setSelectedAgent(agent);
    await loadAgentPermissions(agent.id);
  };

  const toggleSourcePermission = (rid: string, sourceType: string) => {
    const existingPerm = permissions.find(p => p.source_identifier === rid);
    
    if (existingPerm) {
      // Remove permission (toggle off)
      setPermissions(permissions.filter(p => p.source_identifier !== rid));
    } else {
      // Add allow permission
      setPermissions([
        ...permissions,
        {
          source_type: sourceType,
          source_identifier: rid,
          permission: 'allow'
        }
      ]);
    }
  };

  const savePermissions = async () => {
    if (!selectedAgent) return;
    
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE}/agent/${selectedAgent.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions }),
      });
      
      const data = await response.json();
      if (data.success) {
        // Reload agents to update permission counts
        await loadAgents();
      }
    } catch (error) {
      console.error('Failed to save permissions:', error);
    } finally {
      setSaving(false);
    }
  };

  // Filter sources based on search and type
  const filteredSources = availableSources.filter(source => {
    const matchesType = filterType === 'all' || source.source_type === filterType;
    const matchesSearch = !searchTerm || 
      source.rid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.source_file?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.url?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Get unique source types
  const sourceTypes = [...new Set(availableSources.map(s => s.source_type).filter(Boolean))];

  return (
    <div className="h-full flex gap-6">
      {/* Agent List */}
      <Card className="w-1/3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Agents
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && !agents.length ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="divide-y">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => handleAgentSelect(agent)}
                  className={`w-full px-4 py-3 text-left hover:bg-accent transition-colors ${
                    selectedAgent?.id === agent.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {agent.id.slice(0, 8)}...
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent.permission_count > 0 ? (
                        <Badge variant="secondary" className="gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          {agent.permission_count}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Shield className="h-3 w-3" />
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permission Manager */}
      <Card className="flex-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {selectedAgent ? `${selectedAgent.name} - Knowledge Access` : 'Select an Agent'}
            </CardTitle>
            {selectedAgent && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadAgentPermissions(selectedAgent.id)}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
                <Button
                  size="sm"
                  onClick={savePermissions}
                  disabled={saving || !selectedAgent}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!selectedAgent ? (
            <div className="text-center py-12 text-muted-foreground">
              Select an agent from the list to manage its knowledge access permissions
            </div>
          ) : (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search sources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {sourceTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Permission Summary */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Access Mode</div>
                  <div className="font-medium">
                    {permissions.length === 0 
                      ? 'Full Access (No Restrictions)'
                      : `Restricted Access (${permissions.length} rules)`}
                  </div>
                </div>
                {permissions.length > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    {permissions.filter(p => p.permission === 'allow').length} Allowed
                  </Badge>
                )}
              </div>

              {/* Data Sources Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Source</th>
                      <th className="px-4 py-3 text-left font-medium">Type</th>
                      <th className="px-4 py-3 text-left font-medium">Documents</th>
                      <th className="px-4 py-3 text-right font-medium">Access</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                        </td>
                      </tr>
                    ) : filteredSources.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-muted-foreground">
                          No data sources found
                        </td>
                      </tr>
                    ) : (
                      filteredSources.map((source) => {
                        const hasPermission = permissions.some(
                          p => p.source_identifier === source.rid
                        );
                        return (
                          <tr key={source.rid} className="hover:bg-accent/50">
                            <td className="px-4 py-3 font-mono text-sm">
                              {source.url || source.source_file || source.rid.slice(0, 20)}...
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline">
                                {source.source_type === 'website' && <Globe className="h-3 w-3 mr-1" />}
                                {source.source_type === 'document' && <FileText className="h-3 w-3 mr-1" />}
                                {source.source_type}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">{source.memory_count}</td>
                            <td className="px-4 py-3 text-right">
                              <Switch
                                checked={hasPermission}
                                onCheckedChange={() => toggleSourcePermission(source.rid, source.source_type)}
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}