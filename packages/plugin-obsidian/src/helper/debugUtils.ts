import { elizaLogger } from "@elizaos/core";
import { PropertyNamespaceResolver } from './propertyNamespaceResolver';

/**
 * Debug function to query the RDF graph for specific patterns
 * @returns Array of query results
 */
export function debugQueryGraph(rdfManager: any, queryType: string): any[] {
    let query = '';
    
    switch (queryType) {
        case 'workouts':
            query = `
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX schema: <http://schema.org/>
                
                SELECT ?s ?p ?o 
                WHERE { 
                    ?s rdf:type ?typeO .
                    FILTER(CONTAINS(STR(?typeO), "Workout"))
                    ?s ?p ?o 
                }
                LIMIT 100
            `;
            break;
            
        case 'intensity':
            query = `
                SELECT ?s ?p ?o 
                WHERE { 
                    ?s ?p ?o .
                    FILTER(CONTAINS(STR(?p), "intensity"))
                }
                LIMIT 100
            `;
            break;
            
        case 'high_intensity_workouts':
            query = `
                SELECT ?s ?p ?o 
                WHERE { 
                    ?s ?p ?o .
                    ?s ?intensityPred ?intensity .
                    FILTER(CONTAINS(STR(?intensityPred), "intensity"))
                    FILTER(LCASE(STR(?intensity)) = "high")
                }
                LIMIT 100
            `;
            break;
            
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
    results.workouts = debugQueryGraph(rdfManager, 'workouts');
    results.intensity = debugQueryGraph(rdfManager, 'intensity');
    results.highIntensityWorkouts = debugQueryGraph(rdfManager, 'high_intensity_workouts');
    
    return results;
}

/**
 * Diagnostic function to evaluate a workout query
 * @returns Object with diagnosis results
 */
export function diagnoseWorkoutQuery(rdfManager: any): Record<string, any> {
    elizaLogger.info("Diagnosing workout intensity query issues...");
    const results: Record<string, any> = {};
    
    // First check if we have any workouts at all
    const workoutTypes = debugQueryGraph(rdfManager, 'workouts');
    results.workoutCount = workoutTypes.length;
    
    if (workoutTypes.length === 0) {
        elizaLogger.warn("No workouts found in the graph");
        return results;
    }
    
    // Then check if we have any intensity properties
    const intensityProps = debugQueryGraph(rdfManager, 'intensity');
    results.intensityPropsCount = intensityProps.length;
    
    if (intensityProps.length === 0) {
        elizaLogger.warn("No intensity properties found in the graph");
        return results;
    }
    
    // Check for workouts with high intensity
    const highIntensityWorkouts = debugQueryGraph(rdfManager, 'high_intensity_workouts');
    results.highIntensityCount = highIntensityWorkouts.length;
    
    if (highIntensityWorkouts.length === 0) {
        elizaLogger.warn("No high intensity workouts found");
        
        // If no high intensity workouts, check what intensity values we do have
        const query = `
            SELECT ?workout ?intensity ?intensityPred
            WHERE { 
                ?workout ?typePred ?type .
                FILTER(CONTAINS(STR(?type), "Workout"))
                ?workout ?intensityPred ?intensity .
                FILTER(CONTAINS(STR(?intensityPred), "intensity"))
            }
            LIMIT 10
        `;
        
        try {
            const actualIntensities = rdfManager.executeSparqlQuery(query);
            elizaLogger.info(`Found ${actualIntensities.length} workouts with intensity values:`);
            results.actualIntensities = actualIntensities;
            
            actualIntensities.forEach(result => {
                elizaLogger.info(`  Workout: ${result.workout}, Intensity: ${result.intensity}, Predicate: ${result.intensityPred}`);
            });
        } catch (error) {
            elizaLogger.error("Error querying actual intensities:", error);
            results.error = error.message;
        }
    } else {
        elizaLogger.info(`Found ${highIntensityWorkouts.length} high intensity workouts`);
    }
    
    // Test specific queries that should match high intensity workouts
    const resolver = PropertyNamespaceResolver.getInstance();
    const prefixes = resolver.getNamespacePrefixes();
    results.prefixes = prefixes;
    
    // Generate alternative query patterns for testing
    const queryPatterns = [
        // Pattern 1: Direct schema:intensity property
        `
            PREFIX rdf: <${prefixes.rdf}>
            PREFIX schema: <${prefixes.schema}>
            
            SELECT ?workout ?intensity
            WHERE {
                ?workout rdf:type schema:Workout .
                ?workout schema:intensity ?intensity .
                FILTER(LCASE(STR(?intensity)) = "high")
            }
        `,
        
        // Pattern 2: Any property containing "intensity"
        `
            PREFIX rdf: <${prefixes.rdf}>
            PREFIX schema: <${prefixes.schema}>
            
            SELECT ?workout ?intensity ?intensityProp
            WHERE {
                ?workout rdf:type schema:Workout .
                ?workout ?intensityProp ?intensity .
                FILTER(CONTAINS(STR(?intensityProp), "intensity"))
                FILTER(LCASE(STR(?intensity)) = "high")
            }
        `,
        
        // Pattern 3: Using ont: namespace
        `
            PREFIX rdf: <${prefixes.rdf}>
            PREFIX schema: <${prefixes.schema}>
            PREFIX ont: <${prefixes.ont || "http://elizaos.local/ontology/"}>
            
            SELECT ?workout ?intensity
            WHERE {
                ?workout rdf:type schema:Workout .
                ?workout ont:intensity ?intensity .
                FILTER(LCASE(STR(?intensity)) = "high")
            }
        `,
        
        // Pattern 4: With both schema: and ont: options
        `
            PREFIX rdf: <${prefixes.rdf}>
            PREFIX schema: <${prefixes.schema}>
            PREFIX ont: <${prefixes.ont || "http://elizaos.local/ontology/"}>
            
            SELECT ?workout ?intensity
            WHERE {
                ?workout rdf:type schema:Workout .
                {
                    ?workout schema:intensity ?intensity .
                } UNION {
                    ?workout ont:intensity ?intensity .
                }
                FILTER(LCASE(STR(?intensity)) = "high")
            }
        `
    ];
    
    // Test each pattern
    results.patternResults = [];
    
    queryPatterns.forEach((query, index) => {
        try {
            const patternResults = rdfManager.executeSparqlQuery(query);
            elizaLogger.info(`Query pattern ${index + 1} returned ${patternResults.length} results`);
            
            results.patternResults.push({
                pattern: index + 1,
                count: patternResults.length,
                results: patternResults
            });
            
            if (patternResults.length > 0) {
                patternResults.forEach(result => {
                    elizaLogger.info(`  Workout: ${result.workout}, Intensity: ${result.intensity}${result.intensityProp ? `, Predicate: ${result.intensityProp}` : ''}`);
                });
            }
        } catch (error) {
            elizaLogger.error(`Error executing query pattern ${index + 1}:`, error);
            results.patternResults.push({
                pattern: index + 1,
                error: error.message
            });
        }
    });
    
    return results;
}

/**
 * Helper to run all available debug diagnostics on the RDF store
 */
export function runFullDiagnostics(rdfManager: any): Record<string, any> {
    elizaLogger.info("Running full RDF diagnostics...");
    
    const diagnosticResults: Record<string, any> = {
        graphData: inspectLoadedData(rdfManager),
        workoutDiagnosis: diagnoseWorkoutQuery(rdfManager)
    };
    
    // Check for common issues
    const issues = [];
    
    if (diagnosticResults.graphData.workouts.length === 0) {
        issues.push("No workout entities found in the graph");
    }
    
    if (diagnosticResults.graphData.intensity.length === 0) {
        issues.push("No intensity properties found in the graph");
    }
    
    if (diagnosticResults.workoutDiagnosis.highIntensityCount === 0) {
        issues.push("No high intensity workouts found");
        
        // Check if we have workouts with intensity, but none are "high"
        if (diagnosticResults.workoutDiagnosis.actualIntensities && 
            diagnosticResults.workoutDiagnosis.actualIntensities.length > 0) {
                
            const intensityValues = diagnosticResults.workoutDiagnosis.actualIntensities.map((i: any) => i.intensity);
            issues.push(`Found intensity values: ${intensityValues.join(', ')}, but none match 'high'`);
        }
    }
    
    // Check which namespace patterns worked
    if (diagnosticResults.workoutDiagnosis.patternResults) {
        const workingPatterns = diagnosticResults.workoutDiagnosis.patternResults
            .filter((p: any) => p.count > 0)
            .map((p: any) => p.pattern);
            
        if (workingPatterns.length > 0) {
            diagnosticResults.workingPatterns = workingPatterns;
        } else {
            issues.push("None of the namespace patterns matched any data");
        }
    }
    
    diagnosticResults.issues = issues;
    
    elizaLogger.info(`Diagnostics complete. Found ${issues.length} potential issues.`);
    if (issues.length > 0) {
        issues.forEach(issue => elizaLogger.warn(`Issue: ${issue}`));
    }
    
    return diagnosticResults;
}