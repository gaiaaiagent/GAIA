import { elizaLogger } from "@elizaos/core";
import { getRdfManager } from './rdfManager';
import { getObsidian } from '../helper';

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
        const schemaTriples = rdfManager.extractSchemaTriples();
        elizaLogger.debug(`Extracted ${schemaTriples.length} schema-related triples`);
        
        if (schemaTriples.length === 0) {
            elizaLogger.warn("No schema information found in the RDF graph");
            return {
                success: false,
                ttlFilePath: '',
                markdownPath: ''
            };
        }
        
        // Generate prefixes for common namespaces
        const prefixes = `
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix schema: <http://schema.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
`;
        
        // Combine prefixes and schema triples
        const ttlContent = prefixes + schemaTriples.join("\n\n");
        
        // Get obsidian provider
        const obsidian = await getObsidian(runtime);
        
        // Ensure the Ontology folder exists
        const ontologyFolder = "Ontology";
        const ontologyFolderExists = await obsidian.folderExists(ontologyFolder);
        
        if (!ontologyFolderExists) {
            elizaLogger.debug(`Creating Ontology folder for saving schema TTL`);
            // Create the folder or handle the case where it doesn't exist
        }
        
        // Save the TTL content to the generated-schema.ttl file
        const filePath = `${ontologyFolder}/generated-schema.ttl`;
        elizaLogger.debug(`Saving ontology TTL to ${filePath}`);
        
        await obsidian.saveFile(filePath, ttlContent, true);
        elizaLogger.info(`Successfully saved ontology TTL to ${filePath}`);
        
        // Create a markdown file with the TTL embedded in a code block
        const markdownContent = `# Generated Ontology Schema

This file was automatically generated from the RDF graph in your vault.
It contains the schema/ontology information extracted from your data.

\`\`\`turtle
${ttlContent}
\`\`\`
`;
        
        const mdFilePath = `${ontologyFolder}/generated-schema.md`;
        elizaLogger.debug(`Saving ontology markdown to ${mdFilePath}`);
        
        await obsidian.saveFile(mdFilePath, markdownContent, true);
        elizaLogger.info(`Successfully saved ontology markdown to ${mdFilePath}`);
        
        return {
            success: true,
            ttlFilePath: filePath,
            markdownPath: mdFilePath
        };
    } catch (error) {
        elizaLogger.error("Error generating ontology TTL:", error);
        return { success: false };
    }
}