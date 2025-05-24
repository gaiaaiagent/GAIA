import { elizaLogger } from "@elizaos/core";

/**
 * Debug function to query the RDF graph for specific patterns
 * @returns Array of query results
 */
export function debugQueryGraph(rdfManager: any, queryType: string): any[] {
    let query = '';
    
    switch (queryType) {
        case 'all_types':
            query = `
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                
                SELECT DISTINCT ?type (COUNT(?s) as ?count)
                WHERE { 
                    ?s rdf:type ?type .
                }
                GROUP BY ?type
                ORDER BY DESC(?count)
            `;
            break;
            
        case 'all_predicates':
            query = `
                SELECT DISTINCT ?p (COUNT(?s) as ?count)
                WHERE { 
                    ?s ?p ?o .
                }
                GROUP BY ?p
                ORDER BY DESC(?count)
            `;
            break;
            
        case 'property_values':
            // Get a list of values for different properties
            query = `
                SELECT ?p (COUNT(?o) as ?count) (GROUP_CONCAT(DISTINCT ?o; separator=", ") as ?values)
                WHERE { 
                    ?s ?p ?o .
                    FILTER(ISBLANK(?s) = false)
                    FILTER(ISLITERAL(?o))
                }
                GROUP BY ?p
                ORDER BY DESC(?count)
                LIMIT 25
            `;
            break;
            
        default:
            query = `
                SELECT ?s ?p ?o 
                WHERE { 
                    ?s ?p ?o 
                }
                LIMIT 100
            `;
    }
    
    try {
        const results = rdfManager.executeSparqlQuery(query);
        elizaLogger.debug(`Debug query '${queryType}' returned ${results.length} results`);
        
        // Log a subset of results for debugging
        const sampleSize = Math.min(10, results.length);
        for (let i = 0; i < sampleSize; i++) {
            elizaLogger.debug(`  Result ${i+1}: ${JSON.stringify(results[i])}`);
        }
        
        return results;
    } catch (error) {
        elizaLogger.error(`Error executing debug query '${queryType}':`, error);
        return [];
    }
}

/**
 * Function to inspect loaded data in the RDF graph
 * @returns Object with inspection results
 */
export function inspectLoadedData(rdfManager: any): Record<string, any> {
    const results: Record<string, any> = {};
    
    // First, get basic stats
    const stats = rdfManager.getStats();
    elizaLogger.info(`RDF Graph Stats: ${JSON.stringify(stats)}`);
    results.stats = stats;
    
    // Run diagnostic queries
    results.types = debugQueryGraph(rdfManager, 'all_types');
    results.predicates = debugQueryGraph(rdfManager, 'all_predicates');
    results.propertyValues = debugQueryGraph(rdfManager, 'property_values');
    
    return results;
}

/**
 * Helper to run all available debug diagnostics on the RDF store
 */
export function runFullDiagnostics(rdfManager: any): Record<string, any> {
    elizaLogger.info("Running full RDF diagnostics...");
    
    const diagnosticResults: Record<string, any> = {
        graphData: inspectLoadedData(rdfManager)
    };
    
    // Check for common issues
    const issues = [];
    
    if (diagnosticResults.graphData.stats.statements === 0) {
        issues.push("No RDF statements found in the graph");
    }
    
    if (diagnosticResults.graphData.stats.subjects === 0) {
        issues.push("No subjects found in the graph");
    }
    
    if (diagnosticResults.graphData.types.length === 0) {
        issues.push("No typed entities found in the graph");
    }
    
    if (diagnosticResults.graphData.predicates.length === 0) {
        issues.push("No predicates found in the graph");
    }
    
    diagnosticResults.issues = issues;
    
    elizaLogger.info(`Diagnostics complete. Found ${issues.length} potential issues.`);
    if (issues.length > 0) {
        issues.forEach((issue: string) => elizaLogger.warn(`Issue: ${issue}`));
    }
    
    return diagnosticResults;
}