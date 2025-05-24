import {
    type Action,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    type State,
    elizaLogger,
} from "@elizaos/core";
import { getObsidian } from "../helper";
import { generateOntologyFromGraph } from '../helper/generateOntologyTtl.ts';

export const generateOntologyAction: Action = {
    name: "GENERATE_ONTOLOGY",
    similes: [
        "EXTRACT_SCHEMA", "CREATE_ONTOLOGY", "SCHEMA_EXTRACTION", 
        "GENERATE_TTL", "EXPORT_SCHEMA", "CONVERT_TO_TTL"
    ],
    description:
        "Generate an ontology TTL file from the RDF graph data",
    validate: async (runtime: IAgentRuntime) => {
        try {
            elizaLogger.debug("Validating Obsidian connection for ontology generation");
            const obsidian = await getObsidian(runtime);
            await obsidian.connect();
            elizaLogger.debug("Obsidian connection validated successfully");
            return true;
        } catch (error) {
            elizaLogger.error("Failed to validate Obsidian connection for ontology generation:", error);
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
        elizaLogger.info("Starting ontology generation");
        
        try {
            // Generate the ontology TTL from the RDF graph
            const success = await generateOntologyFromGraph(runtime);
            
            if (success) {
                if (callback) {
                    callback({
                        text: "Successfully generated ontology TTL files from your RDF graph. The files have been saved to your Ontology folder:\n\n- `Ontology/generated-schema.ttl` - Direct TTL file\n- `Ontology/generated-schema.md` - Markdown file with embedded TTL code block\n\nYou can now run SPARQL queries against your graph with improved schema understanding.",
                        metadata: {
                            success: true,
                            files: [
                                "Ontology/generated-schema.ttl",
                                "Ontology/generated-schema.md"
                            ]
                        }
                    });
                }
                return true;
            } else {
                if (callback) {
                    callback({
                        text: "Failed to generate ontology TTL from your RDF graph. Please ensure the RDF data is loaded and contains schema information. Try running the LOAD_DATA action first.",
                        error: true
                    });
                }
                return false;
            }
        } catch (error) {
            elizaLogger.error("Error generating ontology:", error);
            if (callback) {
                callback({
                    text: `Error generating ontology: ${error.message}`,
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
                    text: "Generate ontology from my RDF data",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{responseData}}",
                    action: "GENERATE_ONTOLOGY",
                },
            },
        ]
    ],
};

export default generateOntologyAction;