/**
 * Proxy API for fetching data from KOI Coordinator
 * Avoids CORS issues by making server-side requests
 */

const COORDINATOR_URL = 'http://localhost:8005';

export async function fetchCoordinatorData(endpoint: string): Promise<any> {
  try {
    // In production, this would be handled by a backend API
    // For now, we'll return mock data based on the endpoint

    if (endpoint === '/api/sensors') {
      // Return mock sensor data that matches actual KOI sensor structure
      return {
        sensors: [
          {
            node_id: 'twitter-sensor',
            type: 'twitter',
            status: 'active',
            monitoring: ['@RegenNetwork', '@RegenFoundation', '@Earthbanc'],
            last_seen: new Date().toISOString(),
            event_count: 127
          },
          {
            node_id: 'github-sensor',
            type: 'github',
            status: 'active',
            monitoring: ['regen-network/regen-ledger', 'regen-network/groups-ui'],
            last_seen: new Date().toISOString(),
            event_count: 89
          },
          {
            node_id: 'notion-sensor',
            type: 'notion',
            status: 'active',
            monitoring: ['Regen Network Workspace'],
            last_seen: new Date().toISOString(),
            event_count: 249
          },
          {
            node_id: 'telegram-sensor',
            type: 'telegram',
            status: 'active',
            monitoring: ['RegenNetwork', 'RegenGovernance'],
            last_seen: new Date().toISOString(),
            event_count: 45
          },
          {
            node_id: 'discourse-sensor',
            type: 'discourse',
            status: 'active',
            monitoring: ['forum.regen.network'],
            last_seen: new Date().toISOString(),
            event_count: 67
          },
          {
            node_id: 'website-sensor',
            type: 'website',
            status: 'active',
            monitoring: [
              'regen.network',
              'docs.regen.network',
              'guides.regen.network',
              'registry.regen.network',
              'regen.foundation',
              'researchretreat.org',
              'desci.com',
              'regentokenomics.org'
            ],
            last_seen: new Date().toISOString(),
            event_count: 156
          },
          {
            node_id: 'medium-sensor',
            type: 'medium',
            status: 'active',
            monitoring: ['regen-network'],
            last_seen: new Date().toISOString(),
            event_count: 34
          },
          {
            node_id: 'podcast-sensor',
            type: 'podcast',
            status: 'active',
            monitoring: ['Regenerative Agriculture Podcast'],
            last_seen: new Date().toISOString(),
            event_count: 12
          },
          {
            node_id: 'gitlab-sensor',
            type: 'gitlab',
            status: 'active',
            monitoring: ['gitlab.com/regen-network'],
            last_seen: new Date().toISOString(),
            event_count: 23
          }
        ]
      };
    }

    if (endpoint === '/api/pipeline/status') {
      return {
        coordinator: { status: 'online', events_processed: 892 },
        event_bridge: { status: 'online', transformations: 445 },
        postgres: { status: 'online', records: 38889 },
        apache_jena: { status: 'online', triples: 3900 },
        mcp_server: { status: 'online', queries: 127 },
        agents: { status: 'online', count: 5 }
      };
    }

    // Default empty response
    return {};

  } catch (error) {
    console.error('Error fetching coordinator data:', error);
    return null;
  }
}

// Function to query database for processed sources
export async function fetchProcessedSources(sensorType: string): Promise<string[]> {
  // This would query the actual database in production
  // For now, return mock data based on sensor type

  const sourcesMap: Record<string, string[]> = {
    'notion': [
      'AI KOI Guide',
      'AIC Follow Up Guidance',
      'Analysis Of AI Alignment Narrative Versions',
      'ANSS Governance Framework',
      'Arka AI Partnership Convo',
      'Asha Regen Biocultural Meeting Summary',
      'AU Registry EcoMarkets Call',
      'Bio Citizens Assembly Vision and Integration',
      'BioFi Fund of Funds Design',
      'Carbon Landscapes',
      'Chain Agnostic REGEN Narrative Arc',
      // Add more as needed
    ],
    'website': [
      'https://docs.regen.network/ledger/',
      'https://docs.regen.network/modules/',
      'https://regen.network/mainnet/',
      'https://app.regen.network/projects',
      // Add more as needed
    ],
    'github': [
      'regen-network/regen-ledger/README.md',
      'regen-network/regen-ledger/docs/modules.md',
      'regen-network/groups-ui/src/App.tsx',
      // Add more as needed
    ],
    'twitter': [
      '@RegenNetwork: Latest updates on ecological credits',
      '@RegenFoundation: Community governance proposals',
      '@Earthbanc: Partnership announcements',
      // Add more as needed
    ]
  };

  return sourcesMap[sensorType] || [];
}