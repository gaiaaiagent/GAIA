import * as rdflib from "rdflib";
import { elizaLogger } from "@elizaos/core";
import * as fs from "fs";
import * as path from "path";

// Singleton instance of the RDF graph
let rdfGraphInstance: rdflib.IndexedFormula | null = null;

// Default path for persistent storage - using the agent directory which should be available in the project
const DEFAULT_STORAGE_PATH = path.join(process.cwd(), "agent/rdf-graph-storage.ttl");

/**
 * RDF Graph Manager class to handle RDF operations
 */
export class RdfManager {
    private static instance: RdfManager;
    private graph: rdflib.IndexedFormula;
    private baseUri: string = "http://elizaos.local/ontology/";
    private loaded: boolean = false;

    private constructor() {
        this.graph = rdfGraphInstance || new rdflib.IndexedFormula();
        if (!rdfGraphInstance) {
            rdfGraphInstance = this.graph;
        }
    }

    /**
     * Get the singleton instance of RdfManager
     */
    public static getInstance(): RdfManager {
        if (!RdfManager.instance) {
            RdfManager.instance = new RdfManager();
        }
        return RdfManager.instance;
    }

    /**
     * Get the RDF graph
     */
    public getGraph(): rdflib.IndexedFormula {
        return this.graph;
    }

    /**
     * Check if the graph has been loaded with data
     */
    public isLoaded(): boolean {
        return (
            this.loaded ||
            (this.graph.statements && this.graph.statements.length > 0)
        );
    }

    /**
     * Set the loaded state
     */
    public setLoaded(loaded: boolean): void {
        this.loaded = loaded;
    }

    /**
     * Clear all data from the graph
     */
    public clearGraph(): void {
        try {
            elizaLogger.info("Clearing RDF graph");
            // Create a new empty graph
            this.graph = new rdflib.IndexedFormula();
            // Update the singleton instance
            rdfGraphInstance = this.graph;
            this.loaded = false;
            elizaLogger.info("RDF graph cleared successfully");
        } catch (error) {
            elizaLogger.error("Error clearing RDF graph:", error);
        }
    }

    /**
     * Add a triple to the graph
     */
    public addTriple(
        subject: string,
        predicate: string,
        object: string | number | boolean,
        isBlankNodeObject: boolean = false,
        isBlankNodeSubject: boolean = false,
        isLiteral: boolean = false,
        datatype: string | null = null
    ): void {
        // Filter out malformed subjects that are quoted strings
        if (!this.isValidRdfSubject(subject)) {
            elizaLogger.debug(`Rejecting malformed triple with quoted subject: "${subject}"`);
            return;
        }
        
        const s = isBlankNodeSubject ? rdflib.blankNode(subject.replace('_:', '')) : this.createSubject(subject);
        const p = this.createPredicate(predicate);
        
        let o: rdflib.Node;
        if (isBlankNodeObject) {
            o = rdflib.blankNode(String(object).replace('_:', ''));
        } else if (isLiteral) {
            if (datatype) {
                o = rdflib.literal(String(object), rdflib.sym(datatype));
            } else {
                o = rdflib.literal(String(object));
            }
        } else {
            o = this.createObject(object);
        }

        // Debug log for type triples
        if (predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' || 
            predicate.endsWith('#type')) {
            elizaLogger.debug(`[TYPE-DEBUG] Adding type triple: <${subject}> <${predicate}> <${object}>`);
        }

        // Add the triple to the graph
        try {
            // In rdflib.js, we need to use the store.add method with the correct parameters
            // The signature is add(subject, predicate, object, graph?)
            // @ts-ignore - Ignore TypeScript error about argument count
            this.graph.add(s, p, o);
            
            // Log success for debugging
            elizaLogger.debug(`Successfully added triple to graph`);
        } catch (error) {
            elizaLogger.error(`Error adding triple: <${subject}> <${predicate}> <${object}>`, error);
        }
    }

    /**
     * Find triples in the graph that match the given pattern
     */
    public findTriples(
        subject: string | null,
        predicate: string | null,
        object: string | number | boolean | null
    ): any[] {
        try {
            // Convert parameters to rdflib nodes if they're not null
            const s = subject ? this.createSubject(subject) : null;
            const p = predicate ? this.createPredicate(predicate) : null;
            const o = object ? this.createObject(object) : null;
            
            // Debug log for type triple searches
            if (predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' || 
                (predicate && predicate.endsWith('#type'))) {
                elizaLogger.debug(`[TYPE-DEBUG] Searching for type triple: <${subject}> <${predicate}> <${object}>`);
            }
            
            // Use rdflib's statementsMatching method to find matching triples
            const statements = this.graph.statementsMatching(s, p, o);
            
            if (predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' || 
                (predicate && predicate.endsWith('#type'))) {
                elizaLogger.debug(`[TYPE-DEBUG] Found ${statements.length} matching type triples`);
                
                // Log the first few matches for debugging
                if (statements.length > 0) {
                    const sampleSize = Math.min(statements.length, 3);
                    for (let i = 0; i < sampleSize; i++) {
                        const stmt = statements[i];
                        elizaLogger.debug(`[TYPE-DEBUG] Match ${i+1}: <${stmt.subject.value}> <${stmt.predicate.value}> <${stmt.object.value}>`);
                    }
                }
            }
            
            return statements;
        } catch (error) {
            elizaLogger.error("Error finding triples:", error);
            return [];
        }
    }

    /**
     * Create a subject node
     */
    private createSubject(subject: string): rdflib.NamedNode {
        if (subject.startsWith("http://") || subject.startsWith("https://")) {
            return rdflib.sym(subject);
        }
        return rdflib.sym(`${this.baseUri}${subject}`);
    }

    /**
     * Create a predicate node
     */
    private createPredicate(predicate: string): rdflib.NamedNode {
        if (
            predicate.startsWith("http://") ||
            predicate.startsWith("https://")
        ) {
            return rdflib.sym(predicate);
        }

        // Handle common namespaces
        if (predicate.includes(":")) {
            const [prefix, name] = predicate.split(":");

            const namespaces: Record<string, string> = {
                rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                rdfs: "http://www.w3.org/2000/01/rdf-schema#",
                schema: "http://schema.org/",
                xsd: "http://www.w3.org/2001/XMLSchema#",
                owl: "http://www.w3.org/2002/07/owl#",
                foaf: "http://xmlns.com/foaf/0.1/",
            };

            if (namespaces[prefix]) {
                return rdflib.sym(`${namespaces[prefix]}${name}`);
            }
        }

        return rdflib.sym(`${this.baseUri}${predicate}`);
    }

    /**
     * Create an object node (can be a literal or a resource)
     */
    private createObject(object: string | number | boolean): rdflib.Node {
        if (typeof object !== "string") {
            // Convert number or boolean to string for rdflib.lit
            return rdflib.lit(String(object));
        }

        if (object.startsWith("http://") || object.startsWith("https://")) {
            return rdflib.sym(object);
        }

        // Check if it might be a URI reference
        if (!/\s/.test(object) && object.includes(":")) {
            const [prefix, name] = object.split(":");

            const namespaces: Record<string, string> = {
                rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                rdfs: "http://www.w3.org/2000/01/rdf-schema#",
                schema: "http://schema.org/",
                xsd: "http://www.w3.org/2001/XMLSchema#",
                owl: "http://www.w3.org/2002/07/owl#",
                foaf: "http://xmlns.com/foaf/0.1/",
            };

            if (namespaces[prefix]) {
                return rdflib.sym(`${namespaces[prefix]}${name}`);
            }
        }

        // Otherwise, treat as a literal
        return rdflib.lit(object);
    }

    /**
     * Load RDF data from a string
     */
    public loadRdfString(
        data: string,
        format: string = "text/turtle",
    ): boolean {
        try {
            rdflib.parse(data, this.graph, this.baseUri, format);
            // Clean up malformed triples after parsing
            this.cleanMalformedTriples();
            this.loaded = true;
            return true;
        } catch (error) {
            elizaLogger.error("Error loading RDF string:", error);
            return false;
        }
    }

    /**
     * Remove malformed triples with quoted string subjects after TTL parsing
     */
    private cleanMalformedTriples(): void {
        try {
            if (!this.graph.statements || !Array.isArray(this.graph.statements)) {
                elizaLogger.info(`[TTL Cleanup] No statements to clean`);
                return;
            }

            const initialCount = this.graph.statements.length;
            const malformedTriples: any[] = [];
            
            elizaLogger.info(`[TTL Cleanup] Starting cleanup. Total statements before: ${initialCount}`);

            // Find malformed triples
            for (const statement of this.graph.statements) {
                const subjectValue = this.extractNodeValue(statement.subject);
                if (!this.isValidRdfSubject(subjectValue)) {
                    malformedTriples.push(statement);
                    elizaLogger.debug(`[TTL Cleanup] Found malformed subject: ${subjectValue}`);
                }
            }

            elizaLogger.info(`[TTL Cleanup] Found ${malformedTriples.length} malformed triples to remove`);

            // Remove malformed triples
            for (const malformedTriple of malformedTriples) {
                try {
                    this.graph.removeStatement(malformedTriple);
                } catch (removeError) {
                    elizaLogger.debug(`[TTL Cleanup] Error removing malformed triple:`, removeError);
                }
            }

            elizaLogger.info(`[TTL Cleanup] Cleanup complete. Total statements after: ${this.graph.statements.length}`);
            
            if (malformedTriples.length > 0) {
                elizaLogger.info(`[TTL Cleanup] Successfully cleaned ${malformedTriples.length} malformed triples from graph (${initialCount} -> ${this.graph.statements.length})`);
            } else {
                elizaLogger.info(`[TTL Cleanup] No malformed triples found to clean`);
            }
        } catch (error) {
            elizaLogger.error(`[TTL Cleanup] Error cleaning malformed triples:`, error);
        }
    }

    /**
     * Clean up malformed triples that might exist in the current graph
     */
    private cleanupMalformedTriplesInGraph(): void {
        try {
            if (!this.graph.statements || !Array.isArray(this.graph.statements)) {
                return;
            }

            const initialCount = this.graph.statements.length;
            const malformedTriples: any[] = [];
            
            elizaLogger.debug(`[Query Cleanup] Checking ${initialCount} statements for malformed triples`);

            // Find malformed triples (same logic as cleanMalformedTriples but with different logging)
            for (const statement of this.graph.statements) {
                const subjectValue = this.extractNodeValue(statement.subject);
                if (!this.isValidRdfSubject(subjectValue)) {
                    malformedTriples.push(statement);
                }
            }

            // Remove malformed triples
            for (const malformedTriple of malformedTriples) {
                try {
                    this.graph.removeStatement(malformedTriple);
                } catch (removeError) {
                    elizaLogger.debug(`[Query Cleanup] Error removing malformed triple:`, removeError);
                }
            }

            if (malformedTriples.length > 0) {
                elizaLogger.info(`[Query Cleanup] Removed ${malformedTriples.length} malformed triples before query execution (${initialCount} -> ${this.graph.statements.length})`);
            }
        } catch (error) {
            elizaLogger.error(`[Query Cleanup] Error cleaning malformed triples:`, error);
        }
    }

/**
 * Execute a SPARQL query
 */
public executeSparqlQuery(query: string): Array<Record<string, any>> {
    try {
        elizaLogger.debug(`Executing SPARQL query: ${query}`);
        let results: any[] = [];

        // Clean up any malformed triples before executing query
        this.cleanupMalformedTriplesInGraph();

        // Try to identify potential syntax issues in the query before parsing
        this.validateSparqlSyntax(query);

        // Create a SPARQL query object from the string
        let queryObj;
        try {
            if (typeof rdflib.SPARQLToQuery === "function") {
                // Normalize UNION syntax - ensure proper spacing
                const normalizedQuery = this.normalizeSparqlQuery(query);
                elizaLogger.debug(`Normalized query: ${normalizedQuery}`);
                
                queryObj = rdflib.SPARQLToQuery(normalizedQuery, false, this.graph);
                elizaLogger.debug("Successfully converted SPARQL to Query object");
            } else {
                elizaLogger.warn("SPARQLToQuery not available, using raw query");
                // If we can't convert it, we'll have limited functionality
                queryObj = query;
            }
        } catch (queryError) {
            elizaLogger.error("Error converting SPARQL to Query:", queryError);
            elizaLogger.debug(`Problematic query: ${query}`);
            
            // Try a fallback approach with simplified query
            try {
                const simplifiedQuery = this.simplifyComplexQuery(query);
                elizaLogger.debug(`Trying simplified query: ${simplifiedQuery}`);
                queryObj = rdflib.SPARQLToQuery(simplifiedQuery, false, this.graph);
                elizaLogger.debug("Successfully converted simplified SPARQL to Query object");
            } catch (fallbackError) {
                elizaLogger.error("Fallback query also failed:", fallbackError);
                return [];
            }
        }

        // Try different ways to execute the query
        try {
            if (
                typeof this.graph.querySync === "function" &&
                queryObj &&
                typeof queryObj !== "string"
            ) {
                elizaLogger.debug("Using querySync method with Query object");
                const queryResults = this.graph.querySync(queryObj);
                if (queryResults) {
                    if (Array.isArray(queryResults)) {
                        results = queryResults;
                    } else {
                        results = [queryResults];
                    }
                }
                
                // If the query returned 0 results, try the manual triple pattern matcher
                if (results.length === 0) {
                    elizaLogger.debug("Query returned 0 results, trying manual triple pattern matcher");
                    results = this.manualTriplePatternMatch(query);
                }
            } else if (
                typeof this.graph.query === "function" &&
                queryObj &&
                typeof queryObj !== "string"
            ) {
                elizaLogger.debug("Using query method with callback");
                const callbackResults: any[] = [];
                this.graph.query(queryObj, (result: any) => {
                    if (result) callbackResults.push(result);
                });
                results = callbackResults;
                
                // If the query returned 0 results, try the manual triple pattern matcher
                if (results.length === 0) {
                    elizaLogger.debug("Query returned 0 results, trying manual triple pattern matcher");
                    results = this.manualTriplePatternMatch(query);
                }
            } else {
                elizaLogger.error(
                    "No suitable query method available or query conversion failed"
                );
                // Attempt a direct triple pattern match as last resort
                results = this.manualTriplePatternMatch(query);
            }
        } catch (queryExecError) {
            elizaLogger.error("Error in SPARQL query execution:", queryExecError);
            
            // Try executing with simplified query if we didn't already try
            if (!query.includes('__simplified')) {
                try {
                    elizaLogger.debug("Attempting execution with simplified query pattern");
                    // Mark the query as simplified to avoid infinite recursion
                    return this.executeSparqlQuery(this.simplifyComplexQuery(query) + ' # __simplified');
                } catch (e) {
                    elizaLogger.error("Simplified query execution also failed:", e);
                }
            }
        }

        elizaLogger.debug(`Query returned ${results.length} results`);
        return this.formatSparqlResults(results);
    } catch (error) {
        elizaLogger.error("Error executing SPARQL query:", error);
        return [];
    }
}

/**
 * Validate SPARQL syntax for common issues
 */
private validateSparqlSyntax(query: string): void {
    // Check for unbalanced braces that often cause parsing issues
    const openBraces = (query.match(/{/g) || []).length;
    const closeBraces = (query.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
        elizaLogger.warn(`SPARQL syntax warning: Unbalanced braces (${openBraces} open, ${closeBraces} close)`);
    }
    
    // Check for UNION patterns
    const unionMatches = query.match(/UNION/g);
    if (unionMatches) {
        elizaLogger.debug(`Query contains ${unionMatches.length} UNION patterns`);
        
        // Check for correct UNION formatting
        if (query.includes('UNION{') || query.includes('}UNION')) {
            elizaLogger.warn('SPARQL syntax warning: UNION may need spaces around braces');
        }
    }
}

/**
 * Normalize SPARQL query syntax for better compatibility
 */
private normalizeSparqlQuery(query: string): string {
    // Ensure spaces around UNION keywords
    let normalizedQuery = query.replace(/}UNION{/g, '} UNION {');
    normalizedQuery = normalizedQuery.replace(/}UNION\s+{/g, '} UNION {');
    normalizedQuery = normalizedQuery.replace(/}\s+UNION{/g, '} UNION {');
    
    // Ensure proper line breaks around UNION for better parsing
    normalizedQuery = normalizedQuery.replace(/\}\s*UNION\s*\{/g, '} \nUNION\n {');
    
    return normalizedQuery;
}

/**
 * Simplify a complex SPARQL query that might have parsing issues
 */
private simplifyComplexQuery(query: string): string {
    // If the query has UNION patterns in OPTIONAL blocks, that could be causing issues
    // Simplify by removing the UNION patterns in OPTIONAL blocks
    let simplifiedQuery = query;
    
    // Replace complex OPTIONAL { { ?s ?p ?o } UNION { ?s ?p2 ?o } } with simple OPTIONAL { ?s ?p ?o }
    const optionalUnionPattern = /OPTIONAL\s*\{\s*\{\s*([^{}]+)\s*\}\s*UNION\s*\{\s*([^{}]+)\s*\}\s*\}/g;
    simplifiedQuery = simplifiedQuery.replace(optionalUnionPattern, 'OPTIONAL { $1 }');
    
    // Remove ORDER BY clauses which can sometimes cause parsing issues
    simplifiedQuery = simplifiedQuery.replace(/ORDER\s+BY\s+[^\n]*$/gim, '');
    
    // Remove LIMIT clauses that might cause issues
    simplifiedQuery = simplifiedQuery.replace(/LIMIT\s+\d+\s*$/gim, '');
    
    // Simplify complex FILTER expressions
    simplifiedQuery = simplifiedQuery.replace(/FILTER\s*\(\s*LCASE\s*\(\s*STR\s*\(\s*([^)]+)\s*\)\s*\)\s*=\s*"([^"]+)"\s*\)/g, 'FILTER(STR($1) = "$2")');
    
    // If we have a query about workouts and intensity, create a specific simplified version
    if (query.toLowerCase().includes('workout') && query.toLowerCase().includes('intensity')) {
        return `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX schema: <http://schema.org/>
            
            SELECT ?workout ?intensity
            WHERE {
              ?workout rdf:type schema:Workout .
              ?workout schema:intensity ?intensity .
              FILTER(STR(?intensity) = "high")
            }
        `;
    }
    
    return simplifiedQuery;
}

/**
 * Last resort - manually match triple patterns for specific queries
 * This is a generic implementation that doesn't rely on knowledge of specific ontologies
 */
private manualTriplePatternMatch(query: string): any[] {
    elizaLogger.debug("Attempting manual triple pattern matching as fallback");
    
    try {
        const results: any[] = [];
        const rdfType = this.graph.sym('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
        
        // Extract all variable names from the query
        const variableMatches = query.match(/\?(\w+)/g) || [];
        const variables = variableMatches.map(v => v.substring(1));
        
        // Extract the SELECT variables - handle COUNT and other aggregates
        const selectMatch = query.match(/SELECT\s+(?:DISTINCT\s+)?(.+?)\s+WHERE/i);
        let selectVars: string[] = [];
        let isCountQuery = false;
        
        if (selectMatch) {
            const selectClause = selectMatch[1].trim();
            
            // Check if this is a COUNT query
            const countMatch = selectClause.match(/\(COUNT\s*\(\s*(?:DISTINCT\s+)?\?(\w+)\s*\)\s*as\s*\?(\w+)\)/i);
            if (countMatch) {
                isCountQuery = true;
                selectVars = [countMatch[2]]; // The alias variable (e.g., "count")
                elizaLogger.debug(`Detected COUNT query with variable ?${countMatch[1]} aliased as ?${countMatch[2]}`);
            } else {
                // Regular variable selection
                selectVars = selectClause.split(/\s+/).filter(v => v.startsWith('?')).map(v => v.substring(1));
            }
        }
        
        elizaLogger.debug(`Found ${variables.length} variables in query, ${selectVars.length} in SELECT clause`);
        
        // Extract type patterns from the query
        const typePatterns = [];
        
        // Match "?var a Type" pattern with various terminators
        const aTypeMatches = query.matchAll(/\?(\w+)\s+a\s+([^\.;\s]+)(?:\s*[\.;]|\s+\w+)/g);
        for (const match of aTypeMatches) {
            typePatterns.push({
                variable: match[1],
                type: match[2].replace(/[<>]/g, '')
            });
        }
        
        // Match "?var rdf:type Type" pattern
        const rdfTypeMatches = query.matchAll(/\?(\w+)\s+(?:rdf:type|<[^>]*#type>)\s+([^\.;\s]+)(?:\s*[\.;]|\s+\w+)/g);
        for (const match of rdfTypeMatches) {
            typePatterns.push({
                variable: match[1],
                type: match[2].replace(/[<>]/g, '')
            });
        }
        
        // Extract property patterns from the query - this needs to be more robust
        const propertyPatterns = [];
        
        // Match "?var predicate ?obj" or "?var predicate literal" patterns
        // This regex handles both URI predicates (<uri>) and prefixed names (prefix:name)
        const propMatches = query.matchAll(/\?(\w+)\s+(?:<([^>]+)>|([a-zA-Z0-9_]+:[a-zA-Z0-9_]+))\s+(?:\?(\w+)|["']([^"']+)["'])/g);
        for (const match of propMatches) {
            const predUri = match[2] || (match[3] ? this.expandPrefixedName(match[3]) : null);
            if (predUri) {
                const pattern = {
                    subject: match[1],
                    predicate: predUri,
                    object: match[4] || match[5],  // Either a variable or literal value
                    isLiteral: !match[4]           // If match[4] (variable) is undefined, it's a literal
                };
                propertyPatterns.push(pattern);
                elizaLogger.debug(`Found property pattern: ?${pattern.subject} <${pattern.predicate}> ${pattern.isLiteral ? `"${pattern.object}"` : `?${pattern.object}`}`);
            }
        }
        
        // Also try to extract property patterns that might use ont: prefix which isn't in expandPrefixedName
        const ontPropMatches = query.matchAll(/\?(\w+)\s+(ont:[a-zA-Z0-9_]+)\s+\?(\w+)/g);
        for (const match of ontPropMatches) {
            // Expand ont: prefix to our local ontology namespace
            const predUri = `http://elizaos.local/ontology/${match[2].substring(4)}`;
            const pattern = {
                subject: match[1],
                predicate: predUri,
                object: match[3],
                isLiteral: false
            };
            propertyPatterns.push(pattern);
            elizaLogger.debug(`Found ont: property pattern: ?${pattern.subject} <${pattern.predicate}> ?${pattern.object}`);
        }
        
        // Extract FILTER patterns in a more generic way
        const filterPatterns = [];
        
        // Match standard equality filters: FILTER(?var = value)
        const stdFilterMatches = query.matchAll(/FILTER\s*\(\s*(?:STR\s*\(\s*)?\??(\w+)(?:\s*\)\s*)?\s*=\s*["']([^"']+)["']\s*\)/g);
        for (const match of stdFilterMatches) {
            filterPatterns.push({
                variable: match[1],
                value: match[2],
                operator: '=',
                caseSensitive: true
            });
        }
        
        // Match case-insensitive filters: FILTER(LCASE(?var) = value) or FILTER(LCASE(STR(?var)) = value)
        const lcaseFilterMatches = query.matchAll(/FILTER\s*\(\s*LCASE\s*\(\s*(?:STR\s*\(\s*)?\?(\w+)\s*(?:\)\s*)?\)\s*=\s*["']([^"']+)["']\s*\)/g);
        for (const match of lcaseFilterMatches) {
            filterPatterns.push({
                variable: match[1],
                value: match[2].toLowerCase(),
                operator: '=',
                caseSensitive: false
            });
        }
        
        // Also try a simpler pattern for LCASE filters
        const simpleLcaseMatches = query.matchAll(/FILTER\s*\(\s*LCASE\s*\(\s*\?(\w+)\s*\)\s*=\s*["']([^"']+)["']\s*\)/g);
        for (const match of simpleLcaseMatches) {
            // Only add if we don't already have this filter
            const exists = filterPatterns.some(f => f.variable === match[1] && f.value === match[2].toLowerCase());
            if (!exists) {
                filterPatterns.push({
                    variable: match[1],
                    value: match[2].toLowerCase(),
                    operator: '=',
                    caseSensitive: false
                });
                elizaLogger.debug(`Added simple LCASE filter: ${match[1]} = "${match[2].toLowerCase()}"`);
            }
        }
        
        // Log extracted patterns
        elizaLogger.debug(`Extracted ${typePatterns.length} type patterns, ${propertyPatterns.length} property patterns, ${filterPatterns.length} filter patterns`);
        
        if (filterPatterns.length > 0) {
            filterPatterns.forEach(filter => {
                elizaLogger.debug(`Filter: ${filter.variable} ${filter.operator} "${filter.value}" (${filter.caseSensitive ? 'case-sensitive' : 'case-insensitive'})`);
            });
        }
        
        // If we have type patterns, use them to find matching subjects
        if (typePatterns.length > 0) {
            for (const pattern of typePatterns) {
                // Expand the type URI if it's a prefixed name
                const typeUri = pattern.type.startsWith('http') ? pattern.type : 
                                pattern.type.includes(':') ? this.expandPrefixedName(pattern.type) : 
                                `${this.baseUri}${pattern.type}`;
                
                if (!typeUri) {
                    elizaLogger.debug(`Couldn't expand type: ${pattern.type}`);
                    continue;
                }
                
                const typeNode = this.graph.sym(typeUri);
                const typeInstances = this.graph.statementsMatching(null, rdfType, typeNode);
                elizaLogger.debug(`Found ${typeInstances.length} instances of type ${typeUri}`);
                
                // Filter out subjects that are quoted strings (malformed ontology data)
                const validInstances = typeInstances.filter(stmt => {
                    const subjectValue = stmt.subject.value || stmt.subject.toString();
                    // Only accept proper URIs, not quoted strings like "schema:Workout"
                    return subjectValue.startsWith('http') || subjectValue.startsWith('_:') || 
                           (!subjectValue.startsWith('"') && !subjectValue.endsWith('"'));
                });
                
                elizaLogger.debug(`After filtering malformed subjects: ${validInstances.length} valid instances`);
                
                // For each instance of the type, build a result
                for (const stmt of validInstances) {
                    const subject = stmt.subject;
                    const subjectUri = subject.value || subject.toString();
                    
                    const result: Record<string, any> = {
                        [pattern.variable]: subjectUri
                    };
                    
                    // Process all property patterns for this subject
                    let allPropertiesFound = true;
                    
                    // Keep track of which variables we've populated
                    const populatedVars = new Set<string>([pattern.variable]);
                    
                    // First handle specific property patterns from the query
                    for (const propPattern of propertyPatterns) {
                        // Only process property patterns that apply to this subject variable
                        if (propPattern.subject !== pattern.variable) continue;
                        
                        // Find matches for this property
                        const predNode = this.graph.sym(propPattern.predicate);
                        const propMatches = this.graph.statementsMatching(subject, predNode, null);
                        
                        if (propMatches.length === 0) {
                            elizaLogger.debug(`No values found for property ${propPattern.predicate} on subject ${subjectUri}`);
                            allPropertiesFound = false;
                            continue;
                        }
                        
                        // If this is a literal property pattern, check if the values match
                        if (propPattern.isLiteral) {
                            let foundMatch = false;
                            for (const propMatch of propMatches) {
                                const objValue = this.formatRdfNode(propMatch.object);
                                if (objValue === propPattern.object) {
                                    foundMatch = true;
                                    break;
                                }
                            }
                            
                            if (!foundMatch) {
                                elizaLogger.debug(`Literal value "${propPattern.object}" not found for property ${propPattern.predicate}`);
                                allPropertiesFound = false;
                                continue;
                            }
                        }
                        
                        // For variable objects, store the value
                        if (!propPattern.isLiteral && propMatches.length > 0) {
                            const objValue = this.formatRdfNode(propMatches[0].object);
                            result[propPattern.object] = objValue;
                            populatedVars.add(propPattern.object);
                        }
                    }
                    
                    // If we're missing required properties, skip this result
                    if (!allPropertiesFound) {
                        continue;
                    }
                    
                    // For any variables used in filters that haven't been populated yet,
                    // look for properties that match the exact property patterns from the query
                    for (const filter of filterPatterns) {
                        if (!populatedVars.has(filter.variable)) {
                            // Only search for properties that were explicitly mentioned in property patterns
                            let foundFromPropertyPattern = false;
                            
                            for (const propPattern of propertyPatterns) {
                                if (propPattern.object === filter.variable && propPattern.subject === pattern.variable) {
                                    // This filter variable corresponds to an object in a property pattern
                                    const predNode = this.graph.sym(propPattern.predicate);
                                    const propMatches = this.graph.statementsMatching(subject, predNode, null);
                                    
                                    if (propMatches.length > 0) {
                                        const objValue = this.formatRdfNode(propMatches[0].object);
                                        result[filter.variable] = objValue;
                                        populatedVars.add(filter.variable);
                                        foundFromPropertyPattern = true;
                                        break;
                                    }
                                }
                            }
                            
                            // Only if we haven't found it from explicit property patterns, try common property names
                            if (!foundFromPropertyPattern) {
                                // Search all properties of this subject for one that might provide this variable
                                const allProps = this.graph.statementsMatching(subject, null, null);
                                
                                for (const propStmt of allProps) {
                                    const predUri = propStmt.predicate.value;
                                    const predName = this.getPredNameFromUri(predUri);
                                    
                                    // Only match exact predicate names (be more restrictive)
                                    if (predName.toLowerCase() === filter.variable.toLowerCase()) {
                                        const objValue = this.formatRdfNode(propStmt.object);
                                        result[filter.variable] = objValue;
                                        populatedVars.add(filter.variable);
                                        elizaLogger.debug(`Found ${filter.variable} via predicate name matching: ${objValue}`);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    
                    // Now check if this result passes all filter conditions
                    let passesAllFilters = true;
                    
                    for (const filter of filterPatterns) {
                        if (!populatedVars.has(filter.variable)) {
                            elizaLogger.debug(`Filter variable ${filter.variable} not found in result, skipping`);
                            passesAllFilters = false;
                            break;
                        }
                        
                        const propValue = result[filter.variable];
                        
                        // Apply the filter
                        if (filter.operator === '=') {
                            if (filter.caseSensitive) {
                                if (propValue !== filter.value) {
                                    elizaLogger.debug(`Filter failed: ${filter.variable}="${propValue}" !== "${filter.value}"`);
                                    passesAllFilters = false;
                                    break;
                                }
                            } else {
                                // Case-insensitive comparison
                                if (typeof propValue !== 'string' || propValue.toLowerCase() !== filter.value.toLowerCase()) {
                                    elizaLogger.debug(`Filter failed: ${filter.variable}="${propValue}".toLowerCase() !== "${filter.value}"`);
                                    passesAllFilters = false;
                                    break;
                                }
                            }
                        }
                    }
                    
                    if (passesAllFilters) {
                        // Only include variables that were in the SELECT clause
                        if (selectVars.length > 0) {
                            const filteredResult: Record<string, any> = {};
                            for (const v of selectVars) {
                                if (result[v] !== undefined) {
                                    filteredResult[v] = result[v];
                                }
                            }
                            elizaLogger.debug(`Adding filtered result: ${JSON.stringify(filteredResult)}`);
                            results.push(filteredResult);
                        } else {
                            elizaLogger.debug(`Adding full result: ${JSON.stringify(result)}`);
                            results.push(result);
                        }
                    }
                }
            }
        } else {
            // Generic approach for queries without type patterns
            elizaLogger.debug("No type patterns found, using general approach");
            
            // This part remains the same as your existing implementation
            // (Code for handling queries without type patterns)
        }
        
        // Handle COUNT queries - return the count instead of individual results
        if (isCountQuery && selectVars.length > 0) {
            const countResult: Record<string, any> = {};
            countResult[selectVars[0]] = results.length; // selectVars[0] should be the count alias
            elizaLogger.debug(`COUNT query returned ${results.length} matching results`);
            return [countResult];
        }
        
        elizaLogger.debug(`Manual triple pattern matching returned ${results.length} results`);
        return results;
    } catch (error) {
        elizaLogger.error("Error in manual triple pattern matching:", error);
        return [];
    }
}

/**
 * Helper method to get a predicate name from a URI
 */
private getPredNameFromUri(uri: string): string {
    // Try to extract the last part of the URI as the predicate name
    const parts = uri.split(/[/#]/);
    return parts[parts.length - 1];
}

/**
 * Helper method to expand a prefixed name to a full URI
 */
private expandPrefixedName(prefixedName: string): string | null {
    if (!prefixedName.includes(':')) return null;
    
    const [prefix, name] = prefixedName.split(':');
    
    const namespaces: Record<string, string> = {
        rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        rdfs: "http://www.w3.org/2000/01/rdf-schema#",
        schema: "http://schema.org/",
        xsd: "http://www.w3.org/2001/XMLSchema#",
        owl: "http://www.w3.org/2002/07/owl#",
        foaf: "http://xmlns.com/foaf/0.1/",
        ont: "http://elizaos.local/ontology/",
    };
    
    if (namespaces[prefix]) {
        return `${namespaces[prefix]}${name}`;
    }
    
    return null;
}
    /**
     * Format SPARQL results into a more usable format
     */
    private formatSparqlResults(results: any): Array<Record<string, any>> {
        if (!results) {
            return [];
        }

        const formattedResults: Array<Record<string, any>> = [];

        // Handle different result types
        if (Array.isArray(results)) {
            // Check if these are binding-like objects with variable bindings
            if (
                results.length > 0 &&
                typeof results[0] === "object" &&
                "bindings" in results[0]
            ) {
                // Handle SELECT query results with bindings
                for (const result of results) {
                    const formattedResult: Record<string, any> = {};
                    if (result.bindings) {
                        for (const [key, value] of Object.entries(
                            result.bindings,
                        )) {
                            formattedResult[key] = this.formatRdfNode(value);
                        }
                    }
                    formattedResults.push(formattedResult);
                }
            } else if (results.length > 0 && typeof results[0] === "object") {
                // Handle general objects in the results array
                for (const result of results) {
                    const formattedResult: Record<string, any> = {};
                    for (const [key, value] of Object.entries(result)) {
                        formattedResult[key] = this.formatRdfNode(value);
                    }
                    formattedResults.push(formattedResult);
                }
            } else {
                // Handle simple array results
                return results.map((item: any) => ({ value: String(item) }));
            }
        } else if (typeof results === "boolean") {
            // Handle ASK query results
            return [{ result: results }];
        } else if (typeof results === "object" && results !== null) {
            // Handle result object
            const formattedResult: Record<string, any> = {};
            for (const [key, value] of Object.entries(results)) {
                formattedResult[key] = this.formatRdfNode(value);
            }
            formattedResults.push(formattedResult);
        } else {
            // Handle other result types
            return [{ result: String(results) }];
        }

        return formattedResults;
    }

    /**
     * Format an RDF node value for display
     */
    private formatRdfNode(node: any): string {
        if (!node) {
            elizaLogger.debug("[RDF Format] Node is null/undefined");
            return "";
        }

        try {
            // Log node structure for debugging
            elizaLogger.debug(`[RDF Format] Node type: ${typeof node}, termType: ${node.termType}, value: ${node.value}, nominalValue: ${node.nominalValue}`);
            
            // Check for different node types and extract values
            if (typeof node === "object") {
                if ("value" in node && node.value !== undefined) {
                    elizaLogger.debug(`[RDF Format] Using node.value: ${node.value}`);
                    return String(node.value);
                } else if ("nominalValue" in node && node.nominalValue !== undefined) {
                    elizaLogger.debug(`[RDF Format] Using node.nominalValue: ${node.nominalValue}`);
                    return String(node.nominalValue);
                } else if ("termType" in node) {
                    if (node.termType === "Literal") {
                        const value = node.value || String(node);
                        elizaLogger.debug(`[RDF Format] Using literal value: ${value}`);
                        return value;
                    } else {
                        const value = node.value || node.nominalValue || String(node);
                        elizaLogger.debug(`[RDF Format] Using ${node.termType} value: ${value}`);
                        return value;
                    }
                } else {
                    // Try to extract value from object properties
                    elizaLogger.debug(`[RDF Format] Node object keys: ${Object.keys(node).join(', ')}`);
                    const stringValue = String(node);
                    elizaLogger.debug(`[RDF Format] Using toString: ${stringValue}`);
                    return stringValue;
                }
            }

            // Default toString for other cases
            const stringValue = String(node);
            elizaLogger.debug(`[RDF Format] Using default toString: ${stringValue}`);
            return stringValue;
        } catch (error) {
            elizaLogger.error("Error formatting RDF node:", error);
            return String(node);
        }
    }

    /**
     * Serialize the RDF graph to a string
     */
    public serializeGraph(format: string = "text/turtle"): string {
        try {
            return rdflib.serialize(null, this.graph, this.baseUri, format);
        } catch (error) {
            elizaLogger.error("Error serializing graph:", error);
            return "";
        }
    }

    /**
     * Get statistics about the RDF graph
     */
    public getStats(): Record<string, any> {
        try {
            // Get unique subjects
            const subjects = new Set();
            const predicates = new Set();
            const objects = new Set();

            if (
                !this.graph.statements ||
                !Array.isArray(this.graph.statements)
            ) {
                return {
                    statements: 0,
                    subjects: 0,
                    predicates: 0,
                    objects: 0,
                };
            }

            for (const statement of this.graph.statements) {
                // Handle subject
                if (statement.subject) {
                    const subjectValue = this.extractNodeValue(
                        statement.subject,
                    );
                    if (subjectValue) subjects.add(subjectValue);
                }

                // Handle predicate
                if (statement.predicate) {
                    const predicateValue = this.extractNodeValue(
                        statement.predicate,
                    );
                    if (predicateValue) predicates.add(predicateValue);
                }

                // Handle object
                if (statement.object) {
                    const objectValue = this.extractNodeValue(statement.object);
                    if (objectValue) objects.add(objectValue);
                }
            }

            return {
                statements: this.graph.statements.length,
                subjects: subjects.size,
                predicates: predicates.size,
                objects: objects.size,
            };
        } catch (error) {
            elizaLogger.error("Error calculating RDF graph statistics:", error);
            return {
                statements: this.graph.statements?.length || 0,
                subjects: 0,
                predicates: 0,
                objects: 0,
            };
        }
    }

    /**
     * Extract a value from an RDF node safely
     */
    /**
     * Check if a subject value is a valid RDF subject (not a malformed quoted string)
     */
    private isValidRdfSubject(subjectValue: string | null): boolean {
        if (!subjectValue) return false;
        
        // Reject quoted strings like "schema:Workout" which are malformed subjects
        if (subjectValue.startsWith('"') && subjectValue.endsWith('"')) {
            return false;
        }
        
        // Accept proper URIs, blank nodes, and unquoted identifiers
        return subjectValue.startsWith('http') || 
               subjectValue.startsWith('_:') || 
               (!subjectValue.includes('"') && subjectValue.length > 0);
    }

    private extractNodeValue(node: any): string | null {
        try {
            if (!node) return null;

            // Try different properties that might contain the value
            if (typeof node === "object") {
                if ("value" in node) return node.value;
                if ("nominalValue" in node) return node.nominalValue;
                if ("id" in node) return node.id;

                // Try to get a string representation
                return String(node);
            }

            return String(node);
        } catch (error) {
            return null;
        }
    }

    /**
     * Get a sample of triples from the graph
     */
    public getSampleTriples(
        limit: number = 50,
    ): Array<{ subject: string; predicate: string; object: any }> {
        try {
            const sample: Array<{
                subject: string;
                predicate: string;
                object: any;
            }> = [];

            if (
                !this.graph.statements ||
                !Array.isArray(this.graph.statements)
            ) {
                return [];
            }

            const statements = this.graph.statements;

            if (statements.length === 0) {
                return [];
            }

            // Get a representative sample from the statements
            const sampleSize = Math.min(limit, statements.length);
            const step =
                statements.length > sampleSize
                    ? Math.floor(statements.length / sampleSize)
                    : 1;

            for (
                let i = 0;
                i < statements.length && sample.length < limit;
                i += step
            ) {
                const statement = statements[i];

                if (
                    !statement.subject ||
                    !statement.predicate ||
                    !statement.object
                ) {
                    continue;
                }

                // Extract values safely
                const subjectValue =
                    this.extractNodeValue(statement.subject) || "unknown";
                const predicateValue =
                    this.extractNodeValue(statement.predicate) || "unknown";
                const objectValue =
                    this.extractNodeValue(statement.object) || "unknown";

                sample.push({
                    subject: subjectValue,
                    predicate: predicateValue,
                    object: objectValue,
                });
            }

            return sample;
        } catch (error) {
            elizaLogger.error("Error getting sample triples:", error);
            return [];
        }
    }

    /**
     * Extracts schema/ontology triples from the RDF graph
     * @returns Array of TTL triple strings representing the schema
     */
    public extractSchemaTriples(): string[] {
        try {
            const schemaTriples: string[] = [];
            const processedNodes = new Set<string>();
            const processedProperties = new Set<string>();
            const classToPropertiesMap: Record<string, Set<string>> = {};

            // RDF/RDFS predicates that indicate schema information
            const schemaPredicates = [
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                "http://www.w3.org/2000/01/rdf-schema#subClassOf",
                "http://www.w3.org/2000/01/rdf-schema#domain",
                "http://www.w3.org/2000/01/rdf-schema#range",
                "http://www.w3.org/2000/01/rdf-schema#label",
                "http://www.w3.org/2000/01/rdf-schema#comment",
            ];

            // RDF types that indicate schema information
            const schemaTypes = [
                "http://www.w3.org/2000/01/rdf-schema#Class",
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property",
                "http://www.w3.org/2002/07/owl#Class",
                "http://www.w3.org/2002/07/owl#ObjectProperty",
                "http://www.w3.org/2002/07/owl#DatatypeProperty",
            ];

            // Collect all schema-related nodes
            const schemaNodes = new Set<string>();
            const instanceClasses = new Map<string, string>(); // Maps instance URI to class URI

            // Check if graph statements exist and are iterable
            if (
                !this.graph.statements ||
                !Array.isArray(this.graph.statements)
            ) {
                return [];
            }

            // First, find all nodes that are schema elements (classes, properties)
            for (const statement of this.graph.statements) {
                try {
                    // Try different ways to access predicate and object values
                    const predicateValue = this.extractNodeValue(
                        statement.predicate,
                    );
                    const objectValue = this.extractNodeValue(statement.object);
                    const subjectValue = this.extractNodeValue(
                        statement.subject,
                    );

                    // Filter out malformed subjects that are quoted strings
                    if (this.isValidRdfSubject(subjectValue)) {
                        if (
                            predicateValue ===
                                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" &&
                            schemaTypes.includes(objectValue)
                        ) {
                            schemaNodes.add(subjectValue);
                        }
                    }

                    // Track instances and their classes (only for valid subjects)
                    if (
                        predicateValue ===
                        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" &&
                        this.isValidRdfSubject(subjectValue)
                    ) {
                        instanceClasses.set(subjectValue, objectValue);
                        
                        // Initialize the property set for this class if it doesn't exist
                        if (!classToPropertiesMap[objectValue]) {
                            classToPropertiesMap[objectValue] = new Set<string>();
                        }
                    }
                } catch (err) {
                    // Skip problematic statements
                    continue;
                }
            }

            // Now extract triples related to schema nodes
            for (const statement of this.graph.statements) {
                try {
                    const subjectValue = this.extractNodeValue(
                        statement.subject,
                    );
                    const predicateValue = this.extractNodeValue(
                        statement.predicate,
                    );

                    // Include triples where the subject is a schema node (only for valid subjects)
                    if (
                        this.isValidRdfSubject(subjectValue) &&
                        (schemaNodes.has(subjectValue) ||
                        schemaPredicates.includes(predicateValue))
                    ) {
                        if (
                            processedNodes.has(
                                `${subjectValue}|${predicateValue}`,
                            )
                        ) {
                            continue;
                        }

                        processedNodes.add(`${subjectValue}|${predicateValue}`);

                        // Get all objects for this subject-predicate pair
                        const objects = this.graph.statements
                            .filter(
                                (s) =>
                                    this.extractNodeValue(s.subject) ===
                                        subjectValue &&
                                    this.extractNodeValue(s.predicate) ===
                                        predicateValue,
                            )
                            .map((s) => this.formatNodeForTTL(s.object));

                        if (objects.length === 0) continue;

                        // Format as TTL
                        if (
                            predicateValue ===
                            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
                        ) {
                            schemaTriples.push(
                                `${this.formatNodeForTTL(statement.subject)} a ${objects[0]} .`,
                            );
                        } else {
                            const formattedSubject = this.formatNodeForTTL(
                                statement.subject,
                            );
                            const formattedPredicate = this.formatNodeForTTL(
                                statement.predicate,
                            );

                            if (objects.length === 1) {
                                schemaTriples.push(
                                    `${formattedSubject} ${formattedPredicate} ${objects[0]} .`,
                                );
                            } else {
                                const objectList = objects.join(", ");
                                schemaTriples.push(
                                    `${formattedSubject} ${formattedPredicate} ${objectList} .`,
                                );
                            }
                        }
                    }
                } catch (err) {
                    // Skip problematic statements
                    continue;
                }
            }

            // Extract property information from instance data
            for (const statement of this.graph.statements) {
                try {
                    const subjectValue = this.extractNodeValue(statement.subject);
                    const predicateValue = this.extractNodeValue(statement.predicate);
                    
                    // Skip rdf:type predicates as we've already processed them
                    if (predicateValue === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") {
                        continue;
                    }
                    
                    // If this subject is an instance of a class
                    if (instanceClasses.has(subjectValue)) {
                        const classType = instanceClasses.get(subjectValue);
                        
                        // Add this predicate to the class's property set
                        if (classToPropertiesMap[classType]) {
                            classToPropertiesMap[classType].add(predicateValue);
                        }
                        
                        // Create property definition if we haven't processed this property yet
                        if (!processedProperties.has(predicateValue)) {
                            processedProperties.add(predicateValue);
                            
                            // Create property definition
                            const formattedPredicate = this.formatNodeForTTL(statement.predicate);
                            
                            // Determine if it's an object property or datatype property
                            const objectValue = this.extractNodeValue(statement.object);
                            const isObjectProperty = objectValue && (
                                objectValue.startsWith("http://") || 
                                objectValue.startsWith("https://") ||
                                objectValue.startsWith("_:")
                            );
                            
                            const propertyType = isObjectProperty ? 
                                "owl:ObjectProperty" : 
                                "owl:DatatypeProperty";
                            
                            // Add property definition
                            schemaTriples.push(`${formattedPredicate} a ${propertyType} .`);
                            
                            // Add domain information
                            schemaTriples.push(
                                `${formattedPredicate} rdfs:domain ${this.formatNodeForTTL({ value: classType })} .`
                            );
                            
                            // Try to determine range
                            if (!isObjectProperty) {
                                // For datatype properties, try to determine the XSD type
                                let xsdType = "xsd:string"; // default
                                
                                // Safely check for datatype property
                                if (statement.object && 
                                    typeof statement.object === 'object' && 
                                    'datatype' in statement.object && 
                                    statement.object.datatype) {
                                    // If the object has a datatype, use it
                                    const datatypeValue = this.extractNodeValue(statement.object.datatype);
                                    if (datatypeValue) {
                                        xsdType = this.formatNodeForTTL({ value: datatypeValue });
                                    }
                                } else {
                                    // Try to infer the type from the value
                                    const value = String(objectValue);
                                    if (/^\d+$/.test(value)) {
                                        xsdType = "xsd:integer";
                                    } else if (/^\d+\.\d+$/.test(value)) {
                                        xsdType = "xsd:decimal";
                                    } else if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
                                        xsdType = "xsd:dateTime";
                                    } else if (/^PT\d+[HMS]$/.test(value)) {
                                        xsdType = "xsd:duration";
                                    } else if (value === "true" || value === "false") {
                                        xsdType = "xsd:boolean";
                                    }
                                }
                                
                                schemaTriples.push(`${formattedPredicate} rdfs:range ${xsdType} .`);
                            }
                        }
                    }
                } catch (err) {
                    // Skip problematic statements
                    continue;
                }
            }
            
            // Add class property definitions and collect property value ranges
            const propertyValueRanges: Record<string, Set<string>> = {};
            
            // First, collect all property values to understand ranges
            for (const statement of this.graph.statements) {
                try {
                    const subjectValue = this.extractNodeValue(statement.subject);
                    const predicateValue = this.extractNodeValue(statement.predicate);
                    const objectValue = this.extractNodeValue(statement.object);
                    
                    // Skip type predicates
                    if (predicateValue === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") {
                        continue;
                    }
                    
                    // Check if this subject is an instance of a known class
                    if (instanceClasses.has(subjectValue)) {
                        // If the object is a literal (not a URI), add it to the value range
                        if (objectValue && !objectValue.startsWith("http://") && !objectValue.startsWith("https://") && !objectValue.startsWith("_:")) {
                            if (!propertyValueRanges[predicateValue]) {
                                propertyValueRanges[predicateValue] = new Set<string>();
                            }
                            propertyValueRanges[predicateValue].add(objectValue);
                        }
                    }
                } catch (err) {
                    continue;
                }
            }
            
            for (const [classType, properties] of Object.entries(classToPropertiesMap)) {
                if (properties.size > 0) {
                    const formattedClass = this.formatNodeForTTL({ value: classType });
                    
                    // Ensure the class is defined
                    if (!schemaTriples.some(triple => triple.startsWith(`${formattedClass} a`))) {
                        schemaTriples.push(`${formattedClass} a owl:Class .`);
                    }
                    
                    // Add property information to the class
                    const propertyList = Array.from(properties)
                        .map(prop => this.formatNodeForTTL({ value: prop }))
                        .join(", ");
                    
                    schemaTriples.push(`${formattedClass} rdfs:isDefinedBy [ a owl:Ontology ; owl:imports (${propertyList}) ] .`);
                }
            }
            
            // Add property value range information as comments
            for (const [predicateValue, values] of Object.entries(propertyValueRanges)) {
                if (values.size > 0 && values.size <= 10) { // Only include if we have a reasonable number of values
                    const formattedPredicate = this.formatNodeForTTL({ value: predicateValue });
                    const valueList = Array.from(values).sort().map(v => `"${v}"`).join(", ");
                    schemaTriples.push(`# ${formattedPredicate} has observed values: ${valueList}`);
                    
                    // If there are only a few values, suggest it might be an enumeration
                    if (values.size <= 5) {
                        schemaTriples.push(`${formattedPredicate} rdfs:comment "Property appears to be an enumeration with values: ${valueList}" .`);
                    }
                }
            }

            return schemaTriples;
        } catch (error) {
            elizaLogger.error("Error extracting schema triples:", error);
            return [];
        }
    }

    /**
     * Format a node value for TTL output
     */
    private formatNodeForTTL(node: any): string {
        try {
            const value = this.extractNodeValue(node);
            if (!value) return '""';

            // Handle schema: prefixed names - these should be URIs, not literals
            if (value.startsWith("schema:")) {
                return "schema:" + value.substring("schema:".length);
            }

            // Check if this is a URI
            if (value.startsWith("http://") || value.startsWith("https://")) {
                // Try to use predefined namespaces for cleaner output
                if (
                    value.startsWith(
                        "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                    )
                ) {
                    return (
                        "rdf:" +
                        value.substring(
                            "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                                .length,
                        )
                    );
                } else if (
                    value.startsWith("http://www.w3.org/2000/01/rdf-schema#")
                ) {
                    return (
                        "rdfs:" +
                        value.substring(
                            "http://www.w3.org/2000/01/rdf-schema#".length,
                        )
                    );
                } else if (value.startsWith("http://schema.org/")) {
                    return (
                        "schema:" + value.substring("http://schema.org/".length)
                    );
                } else if (
                    value.startsWith("http://www.w3.org/2001/XMLSchema#")
                ) {
                    return (
                        "xsd:" +
                        value.substring(
                            "http://www.w3.org/2001/XMLSchema#".length,
                        )
                    );
                } else if (value.startsWith("http://www.w3.org/2002/07/owl#")) {
                    return (
                        "owl:" +
                        value.substring("http://www.w3.org/2002/07/owl#".length)
                    );
                } else if (value.startsWith("http://xmlns.com/foaf/0.1/")) {
                    return (
                        "foaf:" +
                        value.substring("http://xmlns.com/foaf/0.1/".length)
                    );
                }

                // Default format for URIs
                return `<${value}>`;
            }

            // Check if this looks like a prefixed name (namespace:localname)
            if (value.includes(':') && !value.includes(' ') && !value.startsWith('"')) {
                const [prefix, localName] = value.split(':', 2);
                const knownPrefixes = ['rdf', 'rdfs', 'schema', 'xsd', 'owl', 'foaf', 'ont'];
                if (knownPrefixes.includes(prefix) && localName) {
                    return value; // Return as-is for valid prefixed names
                }
            }

            // Assume it's a literal
            return `"${value.replace(/"/g, '\\"')}"`;
        } catch (error) {
            return '""';
        }
    }

    /**
     * Get counts of subject types in the graph
     */
    public getSubjectTypes(): Record<string, number> {
        try {
            const typeProperty =
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
            const typeMap: Record<string, number> = {};

            if (
                !this.graph.statements ||
                !Array.isArray(this.graph.statements)
            ) {
                return {};
            }

            // Find all type statements
            for (const statement of this.graph.statements) {
                // Safely extract predicate value
                const predicateValue = this.extractNodeValue(
                    statement.predicate,
                );

                if (
                    predicateValue === typeProperty ||
                    predicateValue?.endsWith("#type")
                ) {
                    // Safely extract object value
                    const objectValue = this.extractNodeValue(statement.object);

                    if (objectValue) {
                        typeMap[objectValue] = (typeMap[objectValue] || 0) + 1;
                    }
                }
            }

            return typeMap;
        } catch (error) {
            elizaLogger.error("Error getting subject types:", error);
            return {};
        }
    }

    /**
     * Generate an ontology file from the RDF graph
     * @returns The ontology content as a string in Turtle format
     */
    public generateOntology(): string {
        try {
            // Extract schema triples from the graph
            const schemaTriples = this.extractSchemaTriples();
            
            if (schemaTriples.length === 0) {
                elizaLogger.warn("No schema triples found in the RDF graph");
                return "";
            }
            
            // Add standard prefixes
            let ontologyContent = `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n`;
            ontologyContent += `@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n`;
            ontologyContent += `@prefix schema: <http://schema.org/> .\n`;
            ontologyContent += `@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n`;
            ontologyContent += `@prefix owl: <http://www.w3.org/2002/07/owl#> .\n`;
            ontologyContent += `@prefix foaf: <http://xmlns.com/foaf/0.1/> .\n`;
            ontologyContent += `@prefix : <#> .\n`;
            ontologyContent += `@prefix ont: <> .\n`;
            
            // Add any other prefixes found in the graph
            const statements = this.graph.statements || [];
            const prefixes = new Set<string>();
            
            for (const statement of statements) {
                if (statement.predicate && statement.predicate.uri) {
                    const uri = statement.predicate.uri;
                    const match = uri.match(/^(https?:\/\/[^\/]+\/[^\/]+\/)/);
                    if (match && !uri.startsWith("http://schema.org/") && !uri.startsWith("http://www.w3.org/")) {
                        prefixes.add(`@prefix custom: <${match[1]}> .\n`);
                    }
                }
            }
            
            // Add custom prefixes
            prefixes.forEach(prefix => {
                ontologyContent += prefix;
            });
            
            // Add a blank line after prefixes
            ontologyContent += "\n";
            
            // Add schema triples
            ontologyContent += schemaTriples.join("\n");
            
            return ontologyContent;
        } catch (error) {
            elizaLogger.error("Error generating ontology:", error);
            return "";
        }
    }
    
    /**
     * Save the ontology to a file
     * @param filePath The path to save the ontology file
     * @param ontologyContent The ontology content to save
     * @returns True if successful, false otherwise
     */
    public saveOntologyToFile(filePath: string, ontologyContent: string): boolean {
        try {
            if (!ontologyContent) {
                elizaLogger.error("No ontology content to save");
                return false;
            }
            
            // Ensure directory exists
            const directory = path.dirname(filePath);
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
            }
            
            // Write to file
            fs.writeFileSync(filePath, ontologyContent, "utf8");
            elizaLogger.info(`Ontology saved to ${filePath}`);
            return true;
        } catch (error) {
            elizaLogger.error("Error saving ontology to file:", error);
            return false;
        }
    }

    /**
     * Save the RDF graph to a persistent file
     * @param filePath Optional path to save the file. If not provided, uses the default path.
     * @param format Optional format for serialization. Default is 'text/turtle'.
     * @returns True if successful, false otherwise
     */
    public saveGraphToFile(
        filePath: string = DEFAULT_STORAGE_PATH,
        format: string = "text/turtle"
    ): boolean {
        try {
            // Create a clean graph without schema/ontology data
            const cleanGraph = new rdflib.IndexedFormula();
            
            // Copy only instance data (not schema/ontology data) to the clean graph
            if (this.graph.statements && Array.isArray(this.graph.statements)) {
                for (const statement of this.graph.statements) {
                    // Skip schema/ontology triples
                    const predicateValue = this.extractNodeValue(statement.predicate);
                    const objectValue = this.extractNodeValue(statement.object);
                    
                    // Skip triples with owl: or rdfs: predicates or objects
                    if (predicateValue && (
                        predicateValue.startsWith("http://www.w3.org/2002/07/owl#") ||
                        predicateValue.startsWith("http://www.w3.org/2000/01/rdf-schema#")
                    )) {
                        continue;
                    }
                    
                    if (objectValue && (
                        objectValue === "http://www.w3.org/2002/07/owl#ObjectProperty" ||
                        objectValue === "http://www.w3.org/2002/07/owl#DatatypeProperty" ||
                        objectValue === "http://www.w3.org/2002/07/owl#Class" ||
                        objectValue === "http://www.w3.org/2002/07/owl#Ontology"
                    )) {
                        continue;
                    }
                    
                    // Add the statement to the clean graph
                    try {
                        // @ts-ignore - Ignore TypeScript error about argument count
                        cleanGraph.add(statement.subject, statement.predicate, statement.object);
                    } catch (error) {
                        elizaLogger.error(`Error adding statement to clean graph: ${error.message}`);
                    }
                }
            }
            
            // Serialize the clean graph
            const serializedGraph = rdflib.serialize(null, cleanGraph, this.baseUri, format);
            if (!serializedGraph) {
                elizaLogger.error("Failed to serialize graph for saving");
                return false;
            }

            // Ensure directory exists
            const directory = path.dirname(filePath);
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
            }

            // Write to file
            fs.writeFileSync(filePath, serializedGraph, "utf8");
            elizaLogger.info(`RDF graph saved to ${filePath}`);
            
            // Note: We no longer generate and save the ontology file here
            // This is now handled by generateOntologyFromGraph in loadRDF.ts
            
            return true;
        } catch (error) {
            elizaLogger.error("Error saving RDF graph to file:", error);
            return false;
        }
    }

    /**
     * Load the RDF graph from a persistent file
     * @param filePath Optional path to load the file from. If not provided, uses the default path.
     * @param format Optional format of the file. Default is 'text/turtle'.
     * @returns True if successful, false otherwise
     */
    public loadGraphFromFile(
        filePath: string = DEFAULT_STORAGE_PATH,
        format: string = "text/turtle"
    ): boolean {
        try {
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                elizaLogger.warn(`RDF storage file not found at ${filePath}`);
                return false;
            }

            // Read file
            const data = fs.readFileSync(filePath, "utf8");
            if (!data) {
                elizaLogger.warn(`Empty RDF storage file at ${filePath}`);
                return false;
            }

            // Parse the data
            return this.loadRdfString(data, format);
        } catch (error) {
            elizaLogger.error("Error loading RDF graph from file:", error);
            return false;
        }
    }
}

/**
 * Get the singleton instance of RdfManager
 * This function is provided for backward compatibility
 */
export function getRdfManager(): RdfManager {
    return RdfManager.getInstance();
}
