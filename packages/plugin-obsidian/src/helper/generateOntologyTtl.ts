import { elizaLogger } from "@elizaos/core";
import { getRdfManager } from './rdfManager';
import { getObsidian } from '../helper';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Extracts schema/ontology information from the RDF graph and saves it as a TTL file
 */
export async function generateOntologyFromGraph(runtime: any): Promise<{
    success: boolean;
    ttlFilePath?: string;
    markdownPath?: string;
}> {
    try {
        elizaLogger.info("Generating ontology TTL from RDF graph");
        
        // Get the RDF manager and check if data is loaded
        const rdfManager = getRdfManager();
        if (!rdfManager.isLoaded()) {
            elizaLogger.error("RDF graph is not loaded, cannot generate ontology");
            return {
                success: false,
                ttlFilePath: '',
                markdownPath: ''
            };
        }
        
        // Get graph statistics
        const stats = rdfManager.getStats();
        elizaLogger.debug(`RDF graph contains ${stats.statements} statements, ${stats.subjects} subjects, ${stats.predicates} predicates`);
        
        // Extract schema-related triples
        const rawSchemaTriples = rdfManager.extractSchemaTriples();
        elizaLogger.debug(`Extracted ${rawSchemaTriples.length} raw schema-related triples`);
        
        // Process and deduplicate schema triples
        const processedTriples = new Set<string>();
        const cleanedTriples: string[] = [];
        
        // Process and deduplicate schema triples
        for (const triple of rawSchemaTriples) {
            // We should not filter out "_g_L" entries as they are legitimate blank nodes
            // Instead, we'll properly handle them in the ontology
            
            // Normalize the triple to handle different range values
            let normalizedTriple = triple;
            
            // If this is a range triple, extract the predicate and subject
            if (triple.includes('rdfs:range')) {
                const match = triple.match(/^(\S+)\s+rdfs:range\s+(\S+)\s+\./);
                if (match) {
                    const [_, subject, range] = match;
                    
                    // Check if we already have a range for this subject
                    const existingTriple = cleanedTriples.find(t => 
                        t.startsWith(`${subject} rdfs:range`) && t !== triple);
                    
                    if (existingTriple) {
                        // If we already have a range, skip this one if it's xsd:string
                        // (prefer more specific types over generic string)
                        if (range === 'xsd:string') {
                            continue;
                        }
                        
                        // If the existing one is xsd:string, replace it with this one
                        if (existingTriple.includes('xsd:string')) {
                            const index = cleanedTriples.indexOf(existingTriple);
                            cleanedTriples[index] = triple;
                            continue;
                        }
                    }
                }
            }
            
            // Add the triple if we haven't seen it before
            if (!processedTriples.has(normalizedTriple)) {
                processedTriples.add(normalizedTriple);
                cleanedTriples.push(triple);
            }
        }
        
        elizaLogger.debug(`Cleaned schema triples: ${cleanedTriples.length} (removed ${rawSchemaTriples.length - cleanedTriples.length} duplicates)`);
        
        if (cleanedTriples.length === 0) {
            elizaLogger.warn("No schema information found in the RDF graph after cleaning");
            return {
                success: false,
                ttlFilePath: '',
                markdownPath: ''
            };
        }
        
        // Generate prefixes for common namespaces
        const prefixes = `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix schema: <http://schema.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
`;
        
        // Combine prefixes and schema triples
        const ttlContent = prefixes + cleanedTriples.join("\n\n");
        
        // Define the path for the ontology file - same directory as the graph file
        const graphFilePath = path.join(process.cwd(), "rdf-graph-storage.ttl");
        const ontologyFilePath = graphFilePath.replace(/\.ttl$/, '-ontology.ttl');
        
        elizaLogger.debug(`Saving ontology TTL to ${ontologyFilePath}`);
        
        // Ensure directory exists
        const directory = path.dirname(ontologyFilePath);
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }
        
        // Write to file
        fs.writeFileSync(ontologyFilePath, ttlContent, "utf8");
        elizaLogger.info(`Successfully saved ontology TTL to ${ontologyFilePath}`);
        
        // Create a markdown file with the TTL embedded in a code block
        const markdownContent = `# Generated Ontology Schema

This file was automatically generated from the RDF graph.
It contains the schema/ontology information extracted from your data.

\`\`\`turtle
${ttlContent}
\`\`\`
`;
        
        const mdFilePath = ontologyFilePath.replace(/\.ttl$/, '.md');
        elizaLogger.debug(`Saving ontology markdown to ${mdFilePath}`);
        
        fs.writeFileSync(mdFilePath, markdownContent, "utf8");
        elizaLogger.info(`Successfully saved ontology markdown to ${mdFilePath}`);
        
        // Also save a copy to the Obsidian vault for reference if needed
        try {
            const obsidian = await getObsidian(runtime);
            const ontologyFolder = "Ontology";
            
            // Check if the folder exists
            const ontologyFolderExists = await obsidian.folderExists(ontologyFolder);
            if (ontologyFolderExists) {
                const vaultFilePath = `${ontologyFolder}/generated-schema.ttl`;
                await obsidian.saveFile(vaultFilePath, ttlContent, true);
                elizaLogger.info(`Also saved a copy of the ontology to Obsidian vault at ${vaultFilePath}`);
            }
        } catch (error) {
            elizaLogger.warn(`Could not save ontology to Obsidian vault: ${error.message}`);
            // Continue anyway since we've already saved to the filesystem
        }
        
        return {
            success: true,
            ttlFilePath: ontologyFilePath,
            markdownPath: mdFilePath
        };
    } catch (error) {
        elizaLogger.error("Error generating ontology TTL:", error);
        return { success: false };
    }
}
