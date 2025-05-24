import {
    type Action,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    type State,
    elizaLogger,
    embed,
} from "@elizaos/core";
import { getObsidian, markdownToPlaintext, processUserInput } from "../helper";
import { isSearchQuery } from "../types";
import * as rdflib from 'rdflib';
import { generateSparqlQuery, shouldUseSparql } from "../helper/sparqlGenerator";
import { getRdfManager } from '../helper/RDFmanager';
import { getTempFileSystem } from '../helper/tempFileSystem';
import { debugQueryGraph, inspectLoadedData, runFullDiagnostics } from '../helper/debugUtils';

/**
 * Logs debugging information about the runtime object
 */
const debugRuntime = (runtime: any) => {
    try {
        elizaLogger.debug("[SPARQL-DEBUG] Runtime properties:");
        
        // Check for LLM properties
        if (runtime.llm) {
            elizaLogger.debug("[SPARQL-DEBUG] runtime.llm exists");
            const llmMethods = Object.getOwnPropertyNames(runtime.llm)
                .filter(prop => typeof runtime.llm[prop] === 'function');
            elizaLogger.debug(`[SPARQL-DEBUG] runtime.llm methods: ${llmMethods.join(', ')}`);
        } else {
            elizaLogger.debug("[SPARQL-DEBUG] runtime.llm does not exist");
        }
        
        // Check for askLLM method
        if (typeof runtime.askLLM === 'function') {
            elizaLogger.debug("[SPARQL-DEBUG] runtime.askLLM exists as a function");
        } else {
            elizaLogger.debug("[SPARQL-DEBUG] runtime.askLLM does not exist as a function");
        }
        
        // Check for character and knowledgeManager
        if (runtime.character) {
            elizaLogger.debug(`[SPARQL-DEBUG] runtime.character.name: ${runtime.character.name}`);
        }
        
        if (runtime.knowledgeManager) {
            elizaLogger.debug("[SPARQL-DEBUG] runtime.knowledgeManager exists");
        }
    } catch (error) {
        elizaLogger.error("[SPARQL-DEBUG] Error debugging runtime:", error);
    }
};

/**
 * Loads the ontology content from the Obsidian vault
 */
const loadOntologyContent = async (obsidian: any): Promise<string> => {
    try {
        const ontologyFolder = "Ontology";
        elizaLogger.debug(`[SPARQL] Loading ontology content from folder: ${ontologyFolder}`);
        
        const ontologyFolderExists = await obsidian.folderExists(ontologyFolder);
        elizaLogger.debug(`[SPARQL] Ontology folder exists: ${ontologyFolderExists}`);
        
        if (!ontologyFolderExists) {
            elizaLogger.warn(`[SPARQL] Ontology folder not found: ${ontologyFolder}`);
            return "";
        }
        
        const ontologyFiles = await obsidian.listFilesInFolder(ontologyFolder, ['.md', '.ttl']);
        elizaLogger.debug(`[SPARQL] Found ${ontologyFiles.length} ontology files: ${JSON.stringify(ontologyFiles)}`);
        
        let combinedOntology = "";
        
        for (const file of ontologyFiles) {
            // Ensure we have the full path including the folder
            const filePath = file.includes('/') ? file : `${ontologyFolder}/${file}`;
            elizaLogger.debug(`[SPARQL] Reading ontology file: ${filePath}`);
            
            try {
                const content = await obsidian.readFile(filePath);
                elizaLogger.debug(`[SPARQL] Successfully read file: ${filePath}, length: ${content?.length || 0} bytes`);
                
                if (!content) {
                    elizaLogger.warn(`[SPARQL] Empty content for file: ${filePath}`);
                    continue;
                }
                
                if (file.endsWith('.md')) {
                    // Extract ttl blocks from markdown
                    const ttlBlockRegex = /```(?:turtle|ttl)\s*([\s\S]*?)```/g;
                    let match;
                    let ttlFound = false;
                    
                    while ((match = ttlBlockRegex.exec(content)) !== null) {
                        if (match[1]) {
                            combinedOntology += match[1] + "\n\n";
                            ttlFound = true;
                            elizaLogger.debug(`[SPARQL] Extracted TTL block from ${filePath} (${match[1].length} bytes)`);
                        }
                    }
                    
                    if (!ttlFound) {
                        elizaLogger.debug(`[SPARQL] No TTL blocks found in markdown file: ${filePath}`);
                    }
                } else {
                    // Direct ttl file
                    combinedOntology += content + "\n\n";
                    elizaLogger.debug(`[SPARQL] Added TTL content from direct file: ${filePath}`);
                }
            } catch (error) {
                elizaLogger.error(`[SPARQL] Error reading ontology file ${filePath}:`, error);
            }
        }
        
        elizaLogger.debug(`[SPARQL] Combined ontology size: ${combinedOntology.length} bytes`);
        
        // Log a sample of the ontology content for debugging
        if (combinedOntology.length > 0) {
            const sampleSize = Math.min(500, combinedOntology.length);
            elizaLogger.debug(`[SPARQL] Ontology sample (first ${sampleSize} bytes): ${combinedOntology.substring(0, sampleSize)}`);
        }
        
        return combinedOntology;
    } catch (error) {
        elizaLogger.error("[SPARQL] Error loading ontology content:", error);
        return "";
    }
};


const formatSparqlResults = (results: Array<Record<string, any>>): string => {
    // If no results, return a message
    if (!results || results.length === 0) {
        return "No matching results found.";
    }
    
    // Create a more user-friendly output format
    let output = `### Found ${results.length} Results\n\n`;
    
    results.forEach((workout, index) => {
        // Extract the workout ID from the URI for potential file lookup
        const workoutUri = workout.workout || "";
        const workoutId = workoutUri.split('/').pop();
        
        output += `#### Workout ${index + 1}: ${workout.name || "Unnamed Workout"}\n\n`;
        output += `- **Date**: ${formatDate(workout.startDate)}\n`;
        output += `- **Duration**: ${formatDuration(workout.duration)}\n`;
        output += `- **Type**: ${workout.exerciseType || "Not specified"}\n`;
        
        // If we have a source file reference, add a link
        if (workout.sourceFile) {
            output += `- [View full workout details](${workout.sourceFile})\n`;
        } else {
            output += `- ID: \`${workoutId}\`\n`;
        }
        
        output += "\n";
    });
    
    return output;
};

// Helper function to format dates nicely
const formatDate = (dateStr: string): string => {
    if (!dateStr) return "Not specified";
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateStr;
    }
};

// Helper function to format duration nicely
const formatDuration = (duration: string): string => {
    if (!duration) return "Not specified";
    if (duration.startsWith("PT")) {
        // Parse ISO duration format
        const hours = duration.match(/(\d+)H/)?.[1] || "0";
        const minutes = duration.match(/(\d+)M/)?.[1] || "0";
        return `${hours} hour${hours !== "1" ? "s" : ""} ${minutes} minute${minutes !== "1" ? "s" : ""}`.trim();
    }
    return duration;
};

export const searchAction: Action = {
    name: "SEARCH",
    similes: [
        "FIND", "QUERY", "LOOKUP", "QUICK_SEARCH", "SEARCH_KEYWORD",
        "SEARCH_VAULT", "FIND_NOTES", "DATAVIEW_QUERY", "DQL", "SPARQL_QUERY"
    ],
    description:
        "Search the Obsidian vault using plain text, Dataview queries, JSONLogic, or SPARQL for semantic queries.",
    validate: async (runtime: IAgentRuntime) => {
        try {
            elizaLogger.debug("Validating Obsidian connection");
            const obsidian = await getObsidian(runtime);
            await obsidian.connect();
            elizaLogger.debug("Obsidian connection validated successfully");
            return true;
        } catch (error) {
            elizaLogger.error("Failed to validate Obsidian connection:", error);
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
        elizaLogger.info("Starting enhanced search handler");
        debugRuntime(runtime);
        
        const obsidian = await getObsidian(runtime);
        
        try {
            if (!state) {
                state = (await runtime.composeState(message)) as State;
            } else {
                state = await runtime.updateRecentMessageState(state);
            }

            // Get the original query text for SPARQL processing
            const originalQuery = message.content.text || "";
            elizaLogger.debug(`[SPARQL-DEBUG] Original query: "${originalQuery}"`);

            // Process the search context for standard search
            const searchContext = await processUserInput(message.content.text as string, state, runtime);
            elizaLogger.debug("[SPARQL-DEBUG] Search context:", JSON.stringify(searchContext, null, 2));
            
            // Check if this is an explicit SPARQL query
            const isExplicitSparql = originalQuery.toLowerCase().includes("sparql");
            elizaLogger.debug(`[SPARQL] Is explicit SPARQL query: ${isExplicitSparql}`);
            
            // Get the RDF manager early to check if it's loaded
            const rdfManager = getRdfManager();

            // Add this near the beginning after getting rdfManager
        if (message.content.text?.toLowerCase().includes("debug rdf")) {
            elizaLogger.info("Running RDF debug diagnostics...");
            inspectLoadedData(rdfManager);
            
            if (callback) {
                callback({
                    text: "RDF debug diagnostics have been run. Check the logs for details.",
                });
            }
            return true;
        }
        
        // Add generic RDF debugging
        if (message.content.text?.toLowerCase().includes("debug rdf")) {
            elizaLogger.info("Running RDF graph diagnostics...");
            runFullDiagnostics(rdfManager);
            
            if (callback) {
                callback({
                    text: "RDF graph diagnostics have been run. Check the logs for details.",
                });
            }
            return true;
        }

            const isRdfLoaded = rdfManager.isLoaded();
            elizaLogger.debug(`[SPARQL] RDF graph is loaded: ${isRdfLoaded}`);
            
            // Try to get graph stats if available
            if (isRdfLoaded) {
                try {
                    const stats = rdfManager.getStats();
                    elizaLogger.debug(`[SPARQL] RDF graph stats: ${JSON.stringify(stats)}`);
                } catch (error) {
                    elizaLogger.error(`[SPARQL] Error getting RDF graph stats:`, error);
                }
            }
            
            // Check if query appears to be semantic/structured (contains domain-specific terms)
            const isSemanticQuery = 
                originalQuery.toLowerCase().includes("intensity") ||
                originalQuery.toLowerCase().includes("type") ||
                originalQuery.toLowerCase().includes("category") ||
                originalQuery.toLowerCase().includes("find all") ||
                originalQuery.toLowerCase().includes("show me") ||
                originalQuery.toLowerCase().includes("with") ||
                originalQuery.toLowerCase().includes("where");
            
            elizaLogger.debug(`[SPARQL] Is semantic query: ${isSemanticQuery}`);
            
            // Get available ontologies
            elizaLogger.debug(`[SPARQL] Loading ontology content...`);
            const ontologyContent = await loadOntologyContent(obsidian);
            const ontologyAvailable = ontologyContent.length > 0;
            elizaLogger.debug(`[SPARQL] Ontology content available: ${ontologyAvailable} (${ontologyContent.length} bytes)`);
            
            // Make an intelligent decision about whether to use SPARQL
            elizaLogger.debug(`[SPARQL] Checking if query would benefit from SPARQL: "${originalQuery}"`);
            
            let mightBenefitFromSparql = false;
            try {
                mightBenefitFromSparql = await shouldUseSparql(runtime, originalQuery, ontologyContent);
                elizaLogger.debug(`[SPARQL] Query might benefit from SPARQL: ${mightBenefitFromSparql}`);
            } catch (error) {
                elizaLogger.error(`[SPARQL] Error determining if query might benefit from SPARQL:`, error);
                // For debugging purposes, set to true if it appears semantic
                mightBenefitFromSparql = isSemanticQuery;
                elizaLogger.debug(`[SPARQL] Defaulting to mightBenefitFromSparql=${mightBenefitFromSparql} based on semantic detection`);
            }

            
            // Try SPARQL if it's explicitly requested or might be beneficial
            if ((isExplicitSparql || mightBenefitFromSparql || isSemanticQuery) && isRdfLoaded) {
                elizaLogger.info("[SPARQL] Attempting SPARQL query generation");
                
                // Generate a SPARQL query
                elizaLogger.debug(`[SPARQL] Generating SPARQL query...`);
                let sparqlQuery = null;
                
                // Generate a query using the LLM
                try {
                    sparqlQuery = await generateSparqlQuery(runtime, originalQuery, ontologyContent);
                    elizaLogger.debug(`[SPARQL] Generated query: ${sparqlQuery}`);
                } catch (error) {
                    elizaLogger.error(`[SPARQL] Error generating SPARQL query:`, error);
                }
                
                if (sparqlQuery) {
                    elizaLogger.info("[SPARQL] Using SPARQL query:", sparqlQuery);


                    // Diagnostics are disabled for normal queries to reduce noise
                    // Use "debug rdf" to run diagnostics manually when needed
                    
                    // Execute the SPARQL query
                    elizaLogger.debug(`[SPARQL] Executing SPARQL query...`);
                    let sparqlResults = [];
                    try {
                        sparqlResults = rdfManager.executeSparqlQuery(sparqlQuery);
                        elizaLogger.debug(`[SPARQL] Query execution returned ${sparqlResults.length} results`);
                        
                        // Log the first result for debugging
                        if (sparqlResults.length > 0) {
                            elizaLogger.debug(`[SPARQL] First result: ${JSON.stringify(sparqlResults[0])}`);
                        }
                    } catch (error) {
                        elizaLogger.error(`[SPARQL] Error executing SPARQL query:`, error);
                    }
                    
                    if (sparqlResults && sparqlResults.length > 0) {
                        elizaLogger.debug(`[SPARQL] Formatting ${sparqlResults.length} results`);
                        const formattedResults = formatSparqlResults(sparqlResults);
                        
                        if (callback) {
                            callback({
                                text: `### SPARQL Query Results\n\nQuery: \`\`\`sparql\n${sparqlQuery}\n\`\`\`\n\n${formattedResults}`,
                                metadata: {
                                    sparql: true,
                                    query: sparqlQuery,
                                    results: sparqlResults
                                }
                            });
                        }
                        return true;
                    } else if (isExplicitSparql || isSemanticQuery) {
                        elizaLogger.debug(`[SPARQL] No results found, but query was explicitly SPARQL or workout related`);
                        if (callback) {
                            callback({
                                text: `No results found for the SPARQL query:\n\`\`\`sparql\n${sparqlQuery}\n\`\`\`\n\nFalling back to standard search...`,
                                metadata: {
                                    sparql: true,
                                    query: sparqlQuery,
                                    results: []
                                }
                            });
                        }
                        // Fall through to standard search if explicitly requested SPARQL but got no results
                    } else {
                        // Silently fall back to standard search if SPARQL was auto-detected but got no results
                        elizaLogger.info("[SPARQL] No SPARQL results, falling back to standard search");
                    }
                } else {
                    elizaLogger.debug(`[SPARQL] Failed to generate SPARQL query`);
                }
            } else {
                if (isExplicitSparql || mightBenefitFromSparql) {
                    // Explain why SPARQL isn't being used
                    const reasons = [];
                    if (!ontologyAvailable) reasons.push("No ontology content available");
                    if (!isRdfLoaded) reasons.push("RDF graph is not loaded");
                    
                    elizaLogger.warn(`[SPARQL] Cannot use SPARQL: ${reasons.join(", ")}`);
                    
                    if (isExplicitSparql && !isRdfLoaded) {
                        if (callback) {
                            callback({
                                text: "RDF data is not loaded. Please run the LOAD_DATA action first to load ontologies and RDF data from your vault.",
                                metadata: {
                                    sparql: true,
                                    error: "Graph not loaded"
                                }
                            });
                            return false;
                        }
                    }
                } else {
                    elizaLogger.debug(`[SPARQL] Not using SPARQL for this query`);
                }
            }
            
            // Fall back to standard search if SPARQL didn't work or wasn't appropriate
            elizaLogger.debug(`[SPARQL] Falling back to standard search`);
            
            if (!isSearchQuery(searchContext)) {
                elizaLogger.error("Invalid search query:", searchContext);
                if (callback) {
                    callback({
                        text: "I couldn't understand your search query. Please try rephrasing it.",
                        error: true
                    });
                }
                return false;
            }

            const query = searchContext.query;
            const queryFormat = searchContext.queryFormat || 'plaintext';
            const searchOptions = {
                contextLength: 150,
                ignoreCase: true,
                ...searchContext.options,
            };

            if (!query) {
                throw new Error("Search query is required. Use format: 'Search QUERY' or 'Query TABLE field FROM folder'");
            }

            elizaLogger.info(`Searching vault with ${queryFormat} query: ${typeof query === 'string' ? query : JSON.stringify(query)}`);

            const results = await obsidian.search(query, queryFormat, searchOptions);

            if (results.length > 0) {
                elizaLogger.info(`Found ${results.length} matching notes`);

                const formattedResults = results.map((result: any) => {
                    const matches = result.matches?.map((item: any) =>
                        `${markdownToPlaintext(item.context.substring(item.match.start, searchOptions.contextLength || 150)).trim()}...`
                    ).join('\n') || '';
                    return `\n#### ✅ ${result.filename} (**Score:** ${result.score || "-"})\n${matches}`;
                }).join('\n\n');

                if (callback) {
                    callback({
                        text: `Found **${results.length}** matches:\n\n${formattedResults}`,
                        metadata: {
                            count: results.length,
                            results,
                            query,
                            queryFormat,
                            searchOptions,
                        },
                    });
                }
                return true;
            }

            // 🔍 No results, fallback to semantic similarity
            elizaLogger.warn("No results found, falling back to semantic similarity search");

            const queryEmbedding = await embed(runtime, message.content.text);
            const semanticResults = await runtime.knowledgeManager.searchMemoriesByEmbedding(
                queryEmbedding,
                {
                    roomId: runtime.agentId, // assuming roomId is used as the namespace
                    match_threshold: 0.65,
                    count: 5,
                    unique: true
                }
            );

            if (semanticResults.length > 0) {
                const formattedSemantic = semanticResults.map(match => {
                    return `#### 🔎 ${match.content.source}\n${markdownToPlaintext(match.content.text).slice(0, 150)}... (Score: ${match.similarity?.toFixed(2) ?? "N/A"})`;
                }).join('\n\n');

                if (callback) {
                    callback({
                        text: `**No direct matches found**, but here are some similar results:\n\n${formattedSemantic}`,
                        metadata: {
                            count: semanticResults.length,
                            query,
                            queryFormat,
                            semantic: true,
                        },
                    });
                }
                return true;
            }

            if (callback) {
                callback({
                    text: "**No matching notes found**",
                    metadata: {
                        count: 0,
                        query,
                        queryFormat,
                    },
                });
            }

            return true;
        } catch (error) {
            elizaLogger.error("Error searching vault:", error);
            if (callback) {
                callback({
                    text: `Error searching vault: ${error.message}`,
                    error: true,
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
                    text: "Search project management",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{responseData}}",
                    action: "SEARCH",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Find all workouts with high intensity",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{responseData}}",
                    action: "SEARCH",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "SPARQL query for workouts with high intensity",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{responseData}}",
                    action: "SEARCH",
                },
            },
        ]
    ],
};

export default searchAction;
