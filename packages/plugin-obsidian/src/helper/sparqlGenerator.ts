import { elizaLogger, ModelClass, generateObject } from "@elizaos/core";
import { z } from "zod";
import { PropertyNamespaceResolver } from '../helper/propertyNamespaceResolver';

// Define a schema for the SPARQL query response using Zod
const SparqlQuerySchema = z.object({
    query: z.string().describe("The generated SPARQL query")
});

// Define a schema for the SPARQL applicability response
const SparqlApplicabilitySchema = z.object({
    applicable: z.boolean().describe("Whether SPARQL would be beneficial for this query"),
    reason: z.string().describe("Reason for the decision")
});

// Types for the responses
type SparqlQueryResponse = z.infer<typeof SparqlQuerySchema>;
type SparqlApplicabilityResponse = z.infer<typeof SparqlApplicabilitySchema>;

// Type guards
const isSparqlQuery = (obj: any): obj is { query: string } => {
    return obj && typeof obj.query === 'string';
};

const isSparqlApplicability = (obj: any): obj is SparqlApplicabilityResponse => {
    return obj && typeof obj.applicable === 'boolean' && typeof obj.reason === 'string';
};

/**
 * Generates a SPARQL query prefix section from namespace prefixes
 */
function generatePrefixSection(prefixes: Record<string, string>): string {
    return Object.entries(prefixes)
        .map(([prefix, uri]) => `PREFIX ${prefix}: <${uri}>`)
        .join('\n');
}

/**
 * Creates a SPARQL property pattern that handles multiple possible namespaces
 */
function createPropertyPattern(resolver: PropertyNamespaceResolver, subject: string, property: string, object: string): string {
    return resolver.generateSparqlPropertyUnion(subject, property, object);
}

/**
 * Generates a SPARQL query from a natural language prompt using the LLM
 */
export async function generateSparqlQuery(
    runtime: any, 
    prompt: string, 
    ontologyContent: string
): Promise<string | null> {
    try {
        elizaLogger.debug("Generating SPARQL query from prompt:", prompt);
        
        // We should not filter out "_g_L" entries as they are legitimate blank nodes
        // Instead, we'll ensure the LLM understands how to handle them in SPARQL queries
        
        // Get the property namespace resolver
        const resolver = PropertyNamespaceResolver.getInstance();
        
        // If the resolver isn't initialized yet, do it now
        if (!resolver.getIsInitialized() && ontologyContent) {
            elizaLogger.debug("Initializing property namespace resolver from ontology content");
            resolver.initializeFromOntology(ontologyContent);
        }
        
        // Get namespace prefixes for the SPARQL query
        const prefixes = resolver.getNamespacePrefixes();
        const prefixSection = generatePrefixSection(prefixes);
        
        // Get a list of registered properties to help the LLM
        const registeredProperties = resolver.getRegisteredProperties();
        const propertiesSample = registeredProperties.length > 10 
            ? registeredProperties.slice(0, 10).join(", ") + "..." 
            : registeredProperties.join(", ");
        
        // Create context for the LLM with namespace guidance
        const context = `You are an AI assistant that generates SPARQL queries based on natural language prompts and a provided ontology.
Your task is to create a SPARQL query that retrieves the relevant information from the knowledge graph to answer the given prompt.

IMPORTANT INFORMATION:
- Use the following namespace prefixes in your query:
${prefixSection}

- In this knowledge graph, properties may have different namespaces. Always use FULL URI paths in angle brackets.
- Properties should use their full URIs. Registered properties include: ${propertiesSample}
- Always use the pattern <?subject> <full-uri-for-predicate> ?object .
- For RDF type, use either <${resolver.expandTerm("rdf:type")}> or the 'a' shorthand
- When comparing string literals, use FILTER with LCASE for case-insensitive matching
- Use OPTIONAL clauses for properties that might not exist on all entities
- Use DISTINCT in your SELECT to avoid duplicate results

ONTOLOGY:
${ontologyContent}

USER PROMPT:
${prompt}

ONLY return the generated SPARQL query, with no explanations or additional text.
If you don't think a SPARQL query is appropriate for this prompt, just return "NOT_APPLICABLE".`;

        // Use generateObject to call the LLM
        const MAX_RETRIES = 3;
        let retryCount = 0;
        let error = null;
        
        while (retryCount < MAX_RETRIES) {
            try {
                elizaLogger.debug(`Attempt ${retryCount + 1}/${MAX_RETRIES} to generate SPARQL query`);
                
                const result = await generateObject({
                    runtime,
                    context,
                    modelClass: ModelClass.LARGE,
                    schema: SparqlQuerySchema
                });
                
                if (!isSparqlQuery(result.object)) {
                    elizaLogger.error("Invalid SPARQL query generated.");
                    throw new Error("Invalid SPARQL query generated.");
                }
                
                const query = result.object.query.trim();
                
                // Check if the LLM determined SPARQL is not applicable
                if (query === "NOT_APPLICABLE") {
                    elizaLogger.info("LLM determined that SPARQL query is not applicable for this prompt");
                    return null;
                }
                
                // Clean up the response
                const cleanedQuery = query
                    .replace(/```sparql/gi, "")
                    .replace(/```/g, "")
                    .trim();
                
                elizaLogger.debug("Generated SPARQL query: " + cleanedQuery);
                return cleanedQuery;
            } catch (err) {
                error = err;
                elizaLogger.error(`Error generating SPARQL query (attempt ${retryCount + 1}/${MAX_RETRIES}):`, err);
                retryCount++;
                
                if (retryCount < MAX_RETRIES) {
                    // Wait before retrying
                    const delay = 1000; // 1 second
                    elizaLogger.info(`Waiting ${delay}ms before retry ${retryCount + 1}/${MAX_RETRIES}...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        // If all retries failed, return null
        elizaLogger.error(`Failed to generate SPARQL query after ${MAX_RETRIES} attempts:`, error);
        return null;
    } catch (error) {
        elizaLogger.error("Error in generateSparqlQuery:", error);
        return null;
    }
}

/**
 * Determines if a user query might benefit from a SPARQL query
 */
export async function shouldUseSparql(
    runtime: any,
    query: string, 
    ontologyContent: string
): Promise<boolean> {
    try {
        // Shortcut for explicit SPARQL mentions
        if (query.toLowerCase().includes("sparql")) {
            elizaLogger.debug("Query explicitly mentions SPARQL, so it should use SPARQL");
            return true;
        }
        
        // Shortcut for workout intensity queries
        if (query.toLowerCase().includes("workout") && 
            (query.toLowerCase().includes("intensity") || 
             query.toLowerCase().includes("high") ||
             query.toLowerCase().includes("moderate") ||
             query.toLowerCase().includes("low"))) {
            elizaLogger.debug("Query is about workout intensity, so it should use SPARQL");
            return true;
        }
        
        // Get property namespace resolver to check for relevant terms
        const resolver = PropertyNamespaceResolver.getInstance();
        if (resolver.getIsInitialized()) {
            // Check if query contains terms that match registered properties
            const registeredProperties = resolver.getRegisteredProperties();
            for (const prop of registeredProperties) {
                if (query.toLowerCase().includes(prop.toLowerCase())) {
                    elizaLogger.debug(`Query contains registered property "${prop}", should use SPARQL`);
                    return true;
                }
            }
        }
        
        elizaLogger.debug("Determining if SPARQL would be beneficial for query:", query);
        
        // If no ontology is available, we can't use SPARQL
        if (!ontologyContent || ontologyContent.trim() === '') {
            elizaLogger.debug("No ontology content available, cannot use SPARQL");
            return false;
        }
        
        // Create a context for the LLM to determine if SPARQL would be beneficial
        const context = `You are an AI assistant that determines whether a natural language query would benefit from being translated into a SPARQL query.

TASK:
Analyze the user's query and the provided ontology to determine if a SPARQL query would be appropriate and beneficial.

ONTOLOGY SAMPLE (first 1000 characters):
${ontologyContent.substring(0, 1000)}

USER QUERY:
${query}

Consider the following:
1. Does the query ask for specific structured data that exists in the ontology?
2. Is the query asking about relationships between entities?
3. Would a SPARQL query provide more precise results than a text search?
4. Does the ontology contain the types of entities and properties mentioned in the query?

Return true if a SPARQL query would be beneficial, false otherwise.`;

        // Use generateObject to call the LLM
        try {
            elizaLogger.debug("Asking LLM if SPARQL would be beneficial");
            
            const result = await generateObject({
                runtime,
                context,
                modelClass: ModelClass.SMALL, // Use a smaller model for this decision
                schema: SparqlApplicabilitySchema
            });
            
            if (result && result.object && isSparqlApplicability(result.object)) {
                const applicable = result.object.applicable;
                const reason = result.object.reason || "No reason provided";
                
                elizaLogger.debug(`LLM determined SPARQL ${applicable ? 'would' : 'would not'} be beneficial: ${reason}`);
                return applicable;
            }
            
            // If we couldn't get a clear answer from the LLM, fall back to a simple check
            elizaLogger.debug("Couldn't get a clear answer from LLM, falling back to simple check");
            return query.toLowerCase().includes("workout") || query.toLowerCase().includes("intensity");
        } catch (err) {
            // If there's an error with the LLM, fall back to a simple check
            elizaLogger.error("Error asking LLM if SPARQL would be beneficial:", err);
            return query.toLowerCase().includes("workout") || query.toLowerCase().includes("intensity");
        }
    } catch (error) {
        elizaLogger.error("Error determining SPARQL relevance:", error);
        // Fall back to a simple check
        return query.toLowerCase().includes("sparql");
    }
}
