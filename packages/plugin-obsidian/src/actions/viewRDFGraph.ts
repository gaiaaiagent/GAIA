import {
    type Action,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    type State,
    elizaLogger,
} from "@elizaos/core";
import { getObsidian } from "../helper";
import { getRdfManager } from '../helper/RDFmanager';
import * as path from 'path';

/**
 * Action to view the contents of the RDF graph
 */
export const viewRdfAction: Action = {
    name: "VIEW_RDF_GRAPH",
    similes: [
        "SHOW_RDF", "INSPECT_GRAPH", "VIEW_GRAPH", "SHOW_RDF_DATA", 
        "LIST_RDF_TRIPLES", "DUMP_RDF_GRAPH"
    ],
    description:
        "Display the contents of the RDF graph, showing triples and statistics",
    validate: async (runtime: IAgentRuntime) => {
        try {
            elizaLogger.debug("Validating Obsidian connection for RDF viewer");
            const obsidian = await getObsidian(runtime);
            await obsidian.connect();
            elizaLogger.debug("Obsidian connection validated successfully");
            return true;
        } catch (error) {
            elizaLogger.error("Failed to validate Obsidian connection for RDF viewer:", error);
            return false;
        }
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: any,
        callback?: HandlerCallback
    ) => {
        elizaLogger.info("Starting RDF graph viewer");
        const rdfManager = getRdfManager();
        
        try {
            // Define persistent storage path - at the project root
            const persistentStoragePath = path.join(process.cwd(), "rdf-graph-storage.ttl");
            elizaLogger.info(`Using persistent storage path: ${persistentStoragePath}`);
            
            // Check if RDF graph is loaded, if not try to load from persistent storage
            if (!rdfManager.isLoaded()) {
                elizaLogger.info("RDF graph not loaded, attempting to load from persistent storage");
                
                if (rdfManager.loadGraphFromFile(persistentStoragePath)) {
                    elizaLogger.info("Successfully loaded RDF graph from persistent storage");
                    
                    if (callback) {
                        callback({
                            text: "Loaded RDF graph from persistent storage.",
                            partial: true
                        });
                    }
                } else {
                    if (callback) {
                        callback({
                            text: "The RDF graph has not been loaded yet and could not be loaded from persistent storage. Please run the LOAD_DATA action first.",
                            error: true
                        });
                    }
                    return false;
                }
            }
            
            // Get the graph stats
            const graphStats = rdfManager.getStats();
            
            // Get a sample of triples (up to 50)
            const sampleTriples = rdfManager.getSampleTriples(50);
            
            // Format the triples for display
            const formattedTriples = sampleTriples.map(triple => 
                `${formatIri(triple.subject)} → ${formatIri(triple.predicate)} → ${formatValue(triple.object)}`
            ).join('\n');
            
            // Get subject types
            const subjectTypes = rdfManager.getSubjectTypes();
            const formattedTypes = Object.entries(subjectTypes)
                .map(([type, count]) => `- ${formatIri(type)}: ${count} instances`)
                .join('\n');
            
            // Format the response
            const responseText = `
# RDF Graph Contents

## Statistics
- **Total statements**: ${graphStats.statements}
- **Unique subjects**: ${graphStats.subjects}
- **Unique predicates**: ${graphStats.predicates}
- **Unique objects**: ${graphStats.objects}

## Subject Types
${formattedTypes}

## Sample Triples (up to 50)
\`\`\`
${formattedTriples}
\`\`\`

## Running SPARQL Queries
You can now run SPARQL queries using the normal SEARCH action. For example:
- "Find all workouts with high intensity"
- "List all people mentioned in my notes"
`;
            
            if (callback) {
                callback({
                    text: responseText,
                    metadata: {
                        graphStats,
                        sampleCount: sampleTriples.length,
                        subjectTypes
                    }
                });
            }
            
            return true;
        } catch (error) {
            elizaLogger.error("Error viewing RDF graph:", error);
            if (callback) {
                callback({
                    text: `Error viewing RDF graph: ${error.message}`,
                    error: true
                });
            }
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show me what's in the RDF graph",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{responseData}}",
                    action: "VIEW_RDF_GRAPH",
                },
            },
        ]
    ],
};

// Helper functions to format IRI and values
function formatIri(iri: string): string {
    // Extract the local name from an IRI
    if (iri.startsWith('http://') || iri.startsWith('https://')) {
        const parts = iri.split(/[/#]/);
        return parts[parts.length - 1];
    }
    return iri;
}

function formatValue(value: any): string {
    if (typeof value === 'string') {
        if (value.startsWith('http://') || value.startsWith('https://')) {
            return formatIri(value);
        }
        // Truncate long string values
        if (value.length > 50) {
            return `"${value.substring(0, 47)}..."`;
        }
        return `"${value}"`;
    }
    return String(value);
}

export default viewRdfAction;
