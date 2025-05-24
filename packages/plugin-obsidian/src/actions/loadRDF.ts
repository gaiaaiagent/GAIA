import {
    type Action,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    type State,
    elizaLogger,
} from "@elizaos/core";
import { getObsidian, markdownToPlaintext } from "../helper";
import * as rdflib from 'rdflib';
import { getRdfManager } from '../helper/RDFmanager';
import { getTempFileSystem } from '../helper/tempFileSystem';
import * as path from 'path';
import { PropertyNamespaceResolver } from '../helper/propertyNamespaceResolver';
import { inspectLoadedData } from '../helper/debugUtils';
import { generateOntologyFromGraph } from "../helper/generateOntologyTtl";


/**
 * Helper function to get the indentation level of a line
 */
const getIndentation = (line: string): number => {
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
};

/**
 * Process nested YAML structures (arrays and objects)
 * Returns the parsed value and the last line index processed
 */
const processNestedStructure = (lines: string[], startLine: number): { value: any; endLine: number } => {
    const result: { value: any; endLine: number } = { value: null, endLine: startLine };
    
    // Determine if we're dealing with an array or object
    const isArray = lines[startLine].trim() === '-' || lines[startLine].trim().endsWith(':') && lines[startLine + 1]?.trim().startsWith('-');
    
    if (isArray) {
        // Process array
        const array: any[] = [];
        let currentLine = startLine;
        
        // Skip the initial line if it just has a key with colon
        if (lines[currentLine].trim().endsWith(':') && !lines[currentLine].trim().startsWith('-')) {
            currentLine++;
        }
        
        // Get the base indentation level for array items
        const baseIndent = getIndentation(lines[currentLine]);
        
        while (currentLine < lines.length) {
            const line = lines[currentLine];
            const indent = getIndentation(line);
            const trimmedLine = line.trim();
            
            // Stop if we encounter a line with less indentation than our base
            if (trimmedLine && indent < baseIndent) {
                break;
            }
            
            // Process array item
            if (trimmedLine.startsWith('-')) {
                const itemContent = trimmedLine.substring(1).trim();
                
                if (itemContent === '' || itemContent === ':') {
                    // This is a complex item (object or nested array)
                    const nestedResult = processNestedStructure(lines, currentLine + 1);
                    if (nestedResult.value !== null) {
                        array.push(nestedResult.value);
                        currentLine = nestedResult.endLine;
                    } else {
                        // If parsing failed, just add an empty object
                        array.push({});
                    }
                } else if (itemContent.includes(':')) {
                    // This is an inline object
                    const obj: Record<string, any> = {};
                    const keyValue = itemContent.match(/^([^:]+):\s*(.*)$/);
                    if (keyValue) {
                        const key = keyValue[1].trim();
                        const value = keyValue[2].trim();
                        obj[key] = value;
                        array.push(obj);
                    } else {
                        // If parsing failed, just add the raw content
                        array.push(itemContent);
                    }
                } else {
                    // Simple value
                    array.push(itemContent);
                }
            }
            
            currentLine++;
        }
        
        result.value = array;
        result.endLine = currentLine - 1;
    } else {
        // Process object
        const obj: Record<string, any> = {};
        let currentLine = startLine;
        
        // Get the base indentation level for object properties
        const baseIndent = getIndentation(lines[currentLine]);
        
        while (currentLine < lines.length) {
            const line = lines[currentLine];
            const indent = getIndentation(line);
            const trimmedLine = line.trim();
            
            // Stop if we encounter a line with less indentation than our base
            if (trimmedLine && indent < baseIndent) {
                break;
            }
            
            // Process object property
            if (trimmedLine && indent === baseIndent) {
                const keyValueMatch = trimmedLine.match(/^([^:]+):\s*(.*)$/);
                if (keyValueMatch) {
                    const key = keyValueMatch[1].trim();
                    const value = keyValueMatch[2].trim();
                    
                    if (value === '' || value === '-') {
                        // This is a nested structure
                        const nestedResult = processNestedStructure(lines, currentLine + 1);
                        if (nestedResult.value !== null) {
                            obj[key] = nestedResult.value;
                            currentLine = nestedResult.endLine;
                        }
                    } else {
                        // Simple value
                        obj[key] = value;
                    }
                }
            }
            
            currentLine++;
        }
        
        result.value = Object.keys(obj).length > 0 ? obj : null;
        result.endLine = currentLine - 1;
    }
    
    return result;
};

/**
 * Parses frontmatter from markdown content and extracts RDF compatible data
 * Improved to handle YAML parsing properly
 */
const extractRdfFromFrontmatter = (content: string, filePath: string = ''): Record<string, any> | null => {
    try {
        elizaLogger.debug(`Extracting frontmatter from file: ${filePath}`);
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
        const match = content.match(frontmatterRegex);
        
        if (!match || !match[1]) {
            elizaLogger.debug(`No frontmatter found in file: ${filePath}`);
            return null;
        }

        const frontmatterYaml = match[1];
        elizaLogger.debug(`Raw frontmatter from ${filePath}:\n${frontmatterYaml}`);
        
        // Parse YAML manually using regex - no external YAML package
        const rdfData: Record<string, any> = {};
        
        // Process lines one by one
        const lines = frontmatterYaml.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines and comments
            if (!line || line.startsWith('#')) continue;
            
            // Check for key-value pairs
            const keyValueMatch = line.match(/^([^:]+):\s*(.*)$/);
            if (keyValueMatch) {
                const key = keyValueMatch[1].trim().replace(/^["']|["']$/g, ''); // Remove quotes
                let value = keyValueMatch[2].trim();
                
                // Check if value continues on next lines (array/object)
                if (value === '' || value === '-') {
                    // This is potentially the start of a nested structure
                    const nestedValue = processNestedStructure(lines, i);
                    if (nestedValue.value !== null) {
                        rdfData[key] = nestedValue.value;
                        i = nestedValue.endLine; // Skip processed lines
                        continue;
                    }
                }
                
                // Handle quoted values
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                
                // Special case for @id and @type
                if (key === '@id' || key === '@type' || key === '"@id"' || key === '"@type"') {
                    const cleanKey = key.replace(/^"|"$/g, '');
                    rdfData[cleanKey] = value;
                } else {
                    rdfData[key] = value;
                }
            }
        }
        
        elizaLogger.debug(`Extracted frontmatter data: ${JSON.stringify(rdfData, null, 2)}`);
        return Object.keys(rdfData).length > 0 ? rdfData : null;
        
    } catch (error) {
        elizaLogger.error(`Error extracting RDF from frontmatter in ${filePath}:`, error);
        return null;
    }
};

/**
 * Adds RDF data from a note to the RDF graph with robust namespace handling
 */
const addNoteToRdfGraph = (
    rdfManager: any, 
    noteId: string, 
    noteData: Record<string, any>,
    baseUri: string,
    filePath: string = ''
): boolean => {
    try {
        elizaLogger.debug(`Adding note ${noteId} to RDF graph`);
        elizaLogger.debug(`Note data: ${JSON.stringify(noteData, null, 2)}`);
        
        // Get the namespace resolver
        const resolver = PropertyNamespaceResolver.getInstance();
        if (!resolver.getIsInitialized()) {
            elizaLogger.warn("PropertyNamespaceResolver not initialized with ontology data");
        }
        
        // Determine subject URI
        let subjectUri = '';
        if (noteData['@id']) {
            // If @id is already a full URI, use it directly
            if (noteData['@id'].includes('://')) {
                subjectUri = noteData['@id'];
                elizaLogger.debug(`Using full URI from @id: ${subjectUri}`);
            } else {
                // Otherwise append to base URI
                subjectUri = `${baseUri}${noteData['@id']}`;
                elizaLogger.debug(`Created URI from @id: ${subjectUri}`);
            }
        } else {
            // Use noteId if @id not provided
            subjectUri = `${baseUri}notes/${noteId}`;
            elizaLogger.debug(`Generated URI from note ID: ${subjectUri}`);
        }
        
        // Add type if present
        if (noteData['@type']) {
            const rawTypeValue = noteData['@type'];
            elizaLogger.debug(`Processing @type value: ${rawTypeValue}`);
            
            const typeValue = resolver.expandTerm(rawTypeValue);
            elizaLogger.debug(`Expanded @type to: ${typeValue}`);
            
            // Check if this type triple already exists in the graph
            const existingTriples = rdfManager.findTriples(
                subjectUri,
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                typeValue
            );
            
            elizaLogger.debug(`Found ${existingTriples.length} existing type triples for this subject/type`);
            
            if (existingTriples.length === 0) {
                rdfManager.addTriple(
                    subjectUri,
                    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                    typeValue
                );
                
                elizaLogger.debug(`Added type triple: <${subjectUri}> <rdf:type> <${typeValue}>`);
            } else {
                elizaLogger.debug(`Skipped adding duplicate type triple: <${subjectUri}> <rdf:type> <${typeValue}>`);
            }
        }
        
        // Get information about class type to make better property namespace decisions
        let classType = noteData['@type'] || '';
        elizaLogger.debug(`Note has class type: ${classType}`);
        
        // Add other properties
        for (const [key, value] of Object.entries(noteData)) {
            if (key !== '@id' && key !== '@type') {
                // Skip internal properties
                if (key.startsWith('@')) {
                    elizaLogger.debug(`Skipping internal property: ${key}`);
                    continue;
                }
                
                // Handle the predicate namespace using the resolver
                // Important: Try to use the schema namespace for known properties from schemas
                const usePrefixedKey = classType.startsWith('schema:') && 
                                     !key.includes(':') ? 
                                     `schema:${key}` : key;
                
                elizaLogger.debug(`Resolving property "${key}" to appropriate namespace (using prefixed key: ${usePrefixedKey})`);
                const predicate = resolver.expandTerm(usePrefixedKey);
                
                elizaLogger.debug(`Resolved property "${key}" → "${usePrefixedKey}" → "${predicate}"`);
                
                // Process the object value (which could be a simple value or complex object)
                if (typeof value === 'object' && value !== null) {
                    elizaLogger.debug(`Processing complex value for property "${key}": ${JSON.stringify(value)}`);
                    // Handle complex objects by recursively adding them
                    processComplexValue(rdfManager, subjectUri, predicate, value, resolver, classType, `${key} in ${filePath}`);
                } else {
                    // Handle special data types if possible
                    let processedValue = value;
                    let isLiteral = true;
                    let datatype = null;
                    
                    // Process URIs
                    if (typeof value === 'string' && (
                        value.startsWith('http://') || 
                        value.startsWith('https://') ||
                        // Handle relative URIs that match a pattern like people/name or places/location
                        value.match(/^(people|places|workouts|notes|organizations)\/[a-zA-Z0-9-_]+$/)
                    )) {
                        // This looks like a URI reference - ensure it's formatted correctly
                        if (!value.includes('://')) {
                            // It's a relative URI, so prepend the base URI
                            processedValue = `${baseUri}${value}`;
                            elizaLogger.debug(`Converted relative URI "${value}" to absolute: "${processedValue}"`);
                        }
                        isLiteral = false; // Treat as URI, not literal
                    } 
                    // Process date/time values
                    else if (typeof value === 'string' && (
                        key === 'startDate' || key === 'endDate' || 
                        key.endsWith('Date') || key.endsWith('DateTime')
                    ) && value.match(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?Z?)?$/)) {
                        datatype = 'http://www.w3.org/2001/XMLSchema#dateTime';
                        elizaLogger.debug(`Set datatype for property ${key} to dateTime`);
                    }
                    // Process duration values
                    else if (typeof value === 'string' && key === 'duration' && value.startsWith('PT')) {
                        datatype = 'http://www.w3.org/2001/XMLSchema#duration';
                        elizaLogger.debug(`Set datatype for property ${key} to duration`);
                    }
                    // Process number values
                    else if (typeof value === 'string' && value.match(/^-?\d+(\.\d+)?$/)) {
                        if (value.includes('.')) {
                            datatype = 'http://www.w3.org/2001/XMLSchema#decimal';
                        } else {
                            datatype = 'http://www.w3.org/2001/XMLSchema#integer';
                        }
                        elizaLogger.debug(`Set datatype for property ${key} to ${datatype.split('#')[1]}`);
                    }
                    
                    // Add simple property triple
                    rdfManager.addTriple(
                        subjectUri, 
                        predicate, 
                        processedValue, 
                        false, // Not a blank node
                        false, // Not a blank node subject
                        isLiteral, // Is a literal
                        datatype // Datatype
                    );
                    elizaLogger.debug(`Added property triple: <${subjectUri}> <${predicate}> ${
                        isLiteral ? 
                        `"${processedValue}"${datatype ? `^^<${datatype}>` : ''}` : 
                        `<${processedValue}>`
                    }`);
                }
            }
        }
        
        return true;
    } catch (error) {
        elizaLogger.error(`Error adding note ${noteId} to RDF graph:`, error);
        return false;
    }
};

/**
 * Processes a complex object value and adds appropriate triples
 */
const processComplexValue = (
    rdfManager: any,
    subject: string,
    predicate: string,
    value: any,
    resolver: PropertyNamespaceResolver,
    parentClassType: string = '',
    context: string = ''
): void => {
    elizaLogger.debug(`Processing complex value in context: ${context}`);
    
    if (Array.isArray(value)) {
        // Handle arrays
        elizaLogger.debug(`Processing array with ${value.length} items`);
        
        value.forEach((item, index) => {
            const blankNode = `_:item${Math.random().toString(36).substring(2, 10)}_${index}`;
            elizaLogger.debug(`Creating blank node for array item ${index}: ${blankNode}`);
            
            // Add the connection from subject to the blank node
            rdfManager.addTriple(subject, predicate, blankNode, true); // true = blank node
            
            if (typeof item === 'object' && item !== null) {
                // Handle object item
                elizaLogger.debug(`Array item ${index} is an object with properties: ${JSON.stringify(Object.keys(item))}`);
                
                // Check if item has @type
                if (item['@type']) {
                    const typeValue = resolver.expandTerm(item['@type']);
                    elizaLogger.debug(`Adding type for array item: ${typeValue}`);
                    rdfManager.addTriple(
                        blankNode,
                        'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                        typeValue,
                        false, // not a blank node target
                        true   // is a blank node subject
                    );
                }
                
                // Get item type for better property namespace resolution
                const itemType = item['@type'] || '';
                
                // Process other properties
                for (const [k, v] of Object.entries(item)) {
                    if (k !== '@type') {
                        // Try to use schema namespace for schemas
                        const usePrefixedKey = (itemType.startsWith('schema:') || parentClassType.startsWith('schema:')) && 
                                             !k.includes(':') ? 
                                             `schema:${k}` : k;
                        
                        const itemPredicate = resolver.expandTerm(usePrefixedKey);
                        elizaLogger.debug(`Adding property ${k} → ${usePrefixedKey} → ${itemPredicate} for array item ${index}`);
                        
                        if (typeof v === 'object' && v !== null) {
                            // Recursively process nested objects
                            processComplexValue(
                                rdfManager, 
                                blankNode, 
                                itemPredicate, 
                                v, 
                                resolver, 
                                itemType,
                                `nested in array[${index}].${k}`
                            );
                        } else {
                            // Handle special data types
                            let datatype = null;
                            
                            // Process date/time values
                            if (typeof v === 'string' && (
                                k === 'startDate' || k === 'endDate' || 
                                k.endsWith('Date') || k.endsWith('DateTime')
                            ) && v.match(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?Z?)?$/)) {
                                datatype = 'http://www.w3.org/2001/XMLSchema#dateTime';
                            }
                            // Process duration values
                            else if (typeof v === 'string' && k === 'duration' && v.startsWith('PT')) {
                                datatype = 'http://www.w3.org/2001/XMLSchema#duration';
                            }
                            // Process number values
                            else if (typeof v === 'string' && v.match(/^-?\d+(\.\d+)?$/)) {
                                if (v.includes('.')) {
                                    datatype = 'http://www.w3.org/2001/XMLSchema#decimal';
                                } else {
                                    datatype = 'http://www.w3.org/2001/XMLSchema#integer';
                                }
                            }
                            
                            // Add simple value
                            rdfManager.addTriple(
                                blankNode, 
                                itemPredicate, 
                                v, 
                                false, // not a blank node target
                                true,  // is a blank node subject
                                true,  // is a literal
                                datatype // datatype if applicable
                            );
                        }
                    }
                }
            } else {
                // Handle primitive item
                elizaLogger.debug(`Array item ${index} is a primitive value: ${item}`);
                rdfManager.addTriple(
                    blankNode, 
                    'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', 
                    item, 
                    false, // not a blank node target
                    true,  // is a blank node subject
                    true   // is a literal
                );
            }
        });
    } else {
        // Handle object with properties
        elizaLogger.debug(`Processing object with properties: ${JSON.stringify(Object.keys(value))}`);
        
        const blankNode = `_:obj${Math.random().toString(36).substring(2, 10)}`;
        elizaLogger.debug(`Creating blank node for object: ${blankNode}`);
        
        // Add the connection from subject to the blank node
        rdfManager.addTriple(subject, predicate, blankNode, true); // true = blank node
        
        // Check if object has @type
        const objType = value['@type'] || '';
        if (objType) {
            const typeValue = resolver.expandTerm(objType);
            elizaLogger.debug(`Adding type for object: ${typeValue}`);
            rdfManager.addTriple(
                blankNode,
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                typeValue,
                false, // not a blank node target
                true   // is a blank node subject
            );
        }
        
        // Process other properties
        for (const [k, v] of Object.entries(value)) {
            if (k !== '@type') {
                // Try to use schema namespace for schemas
                const usePrefixedKey = (objType.startsWith('schema:') || parentClassType.startsWith('schema:')) && 
                                     !k.includes(':') ? 
                                     `schema:${k}` : k;
                
                const objPredicate = resolver.expandTerm(usePrefixedKey);
                elizaLogger.debug(`Adding property ${k} → ${usePrefixedKey} → ${objPredicate} for object`);
                
                if (typeof v === 'object' && v !== null) {
                    // Recursively process nested objects
                    processComplexValue(
                        rdfManager, 
                        blankNode, 
                        objPredicate, 
                        v, 
                        resolver, 
                        objType,
                        `nested in object.${k}`
                    );
                } else {
                    // Handle special data types
                    let datatype = null;
                    
                    // Process date/time values
                    if (typeof v === 'string' && (
                        k === 'startDate' || k === 'endDate' || 
                        k.endsWith('Date') || k.endsWith('DateTime')
                    ) && v.match(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?Z?)?$/)) {
                        datatype = 'http://www.w3.org/2001/XMLSchema#dateTime';
                    }
                    // Process duration values
                    else if (typeof v === 'string' && k === 'duration' && v.startsWith('PT')) {
                        datatype = 'http://www.w3.org/2001/XMLSchema#duration';
                    }
                    // Process number values
                    else if (typeof v === 'string' && v.match(/^-?\d+(\.\d+)?$/)) {
                        if (v.includes('.')) {
                            datatype = 'http://www.w3.org/2001/XMLSchema#decimal';
                        } else {
                            datatype = 'http://www.w3.org/2001/XMLSchema#integer';
                        }
                    }
                    
                    // Add simple value
                    rdfManager.addTriple(
                        blankNode, 
                        objPredicate, 
                        v, 
                        false, // not a blank node target
                        true,  // is a blank node subject
                        true,  // is a literal
                        datatype // datatype if applicable
                    );
                }
            }
        }
    }
};



export const loadRdfAction: Action = {
    name: "LOAD_DATA",
    similes: [
        "IMPORT_DATA", "BUILD_GRAPH", "SCAN_VAULT",
        "RDF_IMPORT", "LOAD_SEMANTIC_DATA", "BUILD_KNOWLEDGE_GRAPH"
    ],
    description:
        "Load vault data from Obsidian vault files with compatible frontmatter and ontology definitions into a semantic graph database",
    validate: async (runtime: IAgentRuntime) => {
        try {
            elizaLogger.debug("Validating Obsidian connection for RDF loading");
            const obsidian = await getObsidian(runtime);
            await obsidian.connect();
            elizaLogger.debug("Obsidian connection validated successfully");
            return true;
        } catch (error) {
            elizaLogger.error("Failed to validate Obsidian connection for RDF loading:", error);
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
        elizaLogger.info("Starting RDF data loading handler");
        const obsidian = await getObsidian(runtime);
        const rdfManager = getRdfManager();
        const graph = rdfManager.getGraph();
        const baseUri = "http://elizaos.local/ontology/";
        const tempFileSystem = getTempFileSystem();
        
        // Get the property namespace resolver singleton
        const propertyResolver = PropertyNamespaceResolver.getInstance();
        
        // Define persistent storage path
        const persistentStoragePath = path.join(process.cwd(), "rdf-graph-storage.ttl");
        elizaLogger.info(`Using persistent storage path: ${persistentStoragePath}`);
        
        try {
            // Clear the existing graph to start fresh
            elizaLogger.info("Clearing existing RDF graph to build fresh data");
            rdfManager.clearGraph();
            
            if (callback) {
                callback({
                    text: "Cleared existing RDF graph. Building fresh graph from current vault data...",
                    partial: true
                });
            }
            
            // Log standard namespace information
            elizaLogger.info("Using standard RDF namespaces");
            const standardNamespaces = {
                rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                rdfs: "http://www.w3.org/2000/01/rdf-schema#",
                xsd: "http://www.w3.org/2001/XMLSchema#",
                schema: "http://schema.org/",
                foaf: "http://xmlns.com/foaf/0.1/",
                owl: "http://www.w3.org/2002/07/owl#",
                dc: "http://purl.org/dc/elements/1.1/",
                dcterms: "http://purl.org/dc/terms/",
            };
            
            // Standard namespaces should be handled automatically by the rdflib library
            // We'll just log them for debugging
            for (const [prefix, uri] of Object.entries(standardNamespaces)) {
                elizaLogger.debug(`Using standard namespace: ${prefix} -> ${uri}`);
            }
            
            // Store the standard namespaces in the combined ontology content
            // This will be parsed by the property resolver
            let initialOntologyContent = "";
            for (const [prefix, uri] of Object.entries(standardNamespaces)) {
                initialOntologyContent += `@prefix ${prefix}: <${uri}> .\n`;
            }
            initialOntologyContent += "\n";
            
            // Initialize the property namespace resolver with the standard namespaces
            propertyResolver.initializeFromOntology(initialOntologyContent);
            
            // Check if we need to load ontology files first
            const ontologyFolder = "Ontology";
            elizaLogger.debug(`Checking if ontology folder '${ontologyFolder}' exists...`);
            
            const ontologyFolderExists = await obsidian.folderExists(ontologyFolder);
            elizaLogger.debug(`Ontology folder exists: ${ontologyFolderExists}`);
            
            if (ontologyFolderExists) {
                elizaLogger.info(`Loading ontology files from ${ontologyFolder}`);
                const ontologyFiles = await obsidian.listFilesInFolder(ontologyFolder, ['.md', '.ttl', '.jsonld', '.rdf', '.xml', '.n3']);
                
                elizaLogger.debug(`Found ${ontologyFiles.length} ontology files: ${JSON.stringify(ontologyFiles)}`);
                
                // Collect all ontology content for property namespace resolver
                let combinedOntologyContent = "";
                
                let loadedCount = 0;
                for (const file of ontologyFiles) {
                    // Skip generated schema files to prevent circular dependency
                    if (file.includes('generated-schema')) {
                        elizaLogger.debug(`Skipping generated schema file to prevent circular dependency: ${file}`);
                        continue;
                    }
                    
                    // Ensure we have the full path including the folder
                    const filePath = file.includes('/') ? file : `${ontologyFolder}/${file}`;
                    elizaLogger.debug(`Reading ontology file: ${filePath}`);
                    
                    try {
                        const fileContent = await obsidian.readFile(filePath);
                        
                        if (fileContent) {
                            elizaLogger.debug(`Successfully read ontology file (${fileContent.length} bytes): ${filePath}`);
                            
                            if (file.endsWith('.md')) {
                                // For markdown files, extract the ontology content
                                // This assumes ontology content is in a code block
                                const ttlBlockRegex = /```(?:turtle|ttl)\s*([\s\S]*?)```/g;
                                const jsonBlockRegex = /```(?:json|jsonld)\s*([\s\S]*?)```/g;
                                
                                let matchFound = false;
                                
                                // Extract all ttl blocks
                                let ttlMatch;
                                while ((ttlMatch = ttlBlockRegex.exec(fileContent)) !== null) {
                                    const ontologyContent = ttlMatch[1];
                                    if (ontologyContent && ontologyContent.trim()) {
                                        elizaLogger.debug(`Found TTL block (${ontologyContent.length} bytes) in: ${filePath}`);
                                        combinedOntologyContent += ontologyContent + "\n\n";
                                        matchFound = true;
                                        
                                        try {
                                            rdfManager.loadRdfString(ontologyContent, 'text/turtle');
                                            elizaLogger.debug(`Successfully loaded TTL block from: ${filePath}`);
                                        } catch (parseError) {
                                            elizaLogger.error(`Error parsing TTL block in ${filePath}:`, parseError);
                                            elizaLogger.debug(`Problematic TTL content: ${ontologyContent.substring(0, 200)}...`);
                                        }
                                    }
                                }
                                
                                // Extract all JSON-LD blocks if no TTL blocks found
                                if (!matchFound) {
                                    let jsonMatch;
                                    while ((jsonMatch = jsonBlockRegex.exec(fileContent)) !== null) {
                                        const ontologyContent = jsonMatch[1];
                                        if (ontologyContent && ontologyContent.trim()) {
                                            elizaLogger.debug(`Found JSON-LD block (${ontologyContent.length} bytes) in: ${filePath}`);
                                            
                                            try {
                                                rdfManager.loadRdfString(ontologyContent, 'application/ld+json');
                                                elizaLogger.debug(`Successfully loaded JSON-LD block from: ${filePath}`);
                                                matchFound = true;
                                            } catch (parseError) {
                                                elizaLogger.error(`Error parsing JSON-LD block in ${filePath}:`, parseError);
                                                elizaLogger.debug(`Problematic JSON-LD content: ${ontologyContent.substring(0, 200)}...`);
                                            }
                                        }
                                    }
                                }
                                
                                if (matchFound) {
                                    loadedCount++;
                                } else {
                                    elizaLogger.debug(`No TTL or JSON-LD blocks found in Markdown file: ${filePath}`);
                                }
                            } else {
                                // For direct ontology files (ttl, jsonld, etc.)
                                elizaLogger.debug(`Processing non-Markdown ontology file: ${filePath}`);
                                
                                try {
                                    // Add the content to the combined ontology
                                    combinedOntologyContent += fileContent + "\n\n";
                                    
                                    // Determine content type based on file extension
                                    let contentType = 'text/turtle'; // default
                                    if (file.endsWith('.jsonld')) contentType = 'application/ld+json';
                                    else if (file.endsWith('.xml') || file.endsWith('.rdf')) contentType = 'application/rdf+xml';
                                    else if (file.endsWith('.n3')) contentType = 'text/n3';
                                    
                                    rdfManager.loadRdfString(fileContent, contentType);
                                    loadedCount++;
                                    elizaLogger.debug(`Successfully loaded ontology from file: ${filePath} as ${contentType}`);
                                } catch (error) {
                                    elizaLogger.error(`Error parsing ontology file ${filePath}:`, error);
                                    elizaLogger.debug(`Problematic content: ${fileContent.substring(0, 200)}...`);
                                }
                            }
                        } else {
                            elizaLogger.warn(`Empty or null content returned for file: ${filePath}`);
                        }
                    } catch (error) {
                        elizaLogger.error(`Error processing ontology file ${filePath}:`, error);
                    }
                }
                
                // Initialize the property namespace resolver with the combined ontology content
                elizaLogger.info(`Initializing property namespace resolver with ${combinedOntologyContent.length} bytes of ontology data`);
                // Append the combined ontology content to the initial content with standard namespaces
                propertyResolver.initializeFromOntology(initialOntologyContent + combinedOntologyContent);
                
                elizaLogger.info(`Loaded ${loadedCount} ontology files`);
            } else {
                elizaLogger.warn(`Ontology folder '${ontologyFolder}' not found in vault`);
            }
            
            // MODIFIED SECTION - Only scan the knowledge folder for RDF-compatible frontmatter
            const knowledgeFolder = "knowledge"; // Define the knowledge folder path
            elizaLogger.info(`Scanning ${knowledgeFolder} folder for files with RDF-compatible frontmatter`);
            
            // Check if knowledge folder exists
            const knowledgeFolderExists = await obsidian.folderExists(knowledgeFolder);
            if (!knowledgeFolderExists) {
                elizaLogger.warn(`Knowledge folder '${knowledgeFolder}' not found in vault`);
                
                if (callback) {
                    callback({
                        text: `Error: The knowledge folder '${knowledgeFolder}' was not found in your vault.`,
                        error: true
                    });
                }
                return false;
            }
            
            // Get all files recursively in the vault
            const allFiles = await obsidian.listAllFiles(['.md']);
            
            // Filter to only include files in the knowledge folder or its subfolders
            const knowledgeFiles = allFiles.filter(filePath => 
                filePath === knowledgeFolder || 
                filePath.startsWith(`${knowledgeFolder}/`) ||
                // Handle the full path case like in the example
                filePath.includes(`/cognitive-ecosystem-seed/${knowledgeFolder}/`)
            );
            
            elizaLogger.debug(`Found ${knowledgeFiles.length} markdown files in ${knowledgeFolder} folder (out of ${allFiles.length} total files)`);
            
            let processedCount = 0;
            let rdfCount = 0;
            let errorCount = 0;
            
            // Now loop through only the knowledge files
            for (const filePath of knowledgeFiles) {
                processedCount++;
                
                // Skip files in the Ontology folder as they've already been processed
                if (filePath.startsWith(ontologyFolder + '/')) {
                    elizaLogger.debug(`Skipping ontology file: ${filePath}`);
                    continue;
                }
                
                try {
                    // Read file content
                    elizaLogger.debug(`Reading file: ${filePath}`);
                    const content = await obsidian.readFile(filePath);
                    
                    if (content) {
                        elizaLogger.debug(`Processing file content (${content.length} bytes): ${filePath}`);
                        const rdfData = extractRdfFromFrontmatter(content, filePath);
                        
                        if (rdfData) {
                            elizaLogger.debug(`Found RDF-compatible frontmatter in file: ${filePath}`);
                            elizaLogger.debug(`Extracted data: ${JSON.stringify(rdfData, null, 2)}`);
                            
                            const fileId = filePath.replace(/\.[^/.]+$/, ""); // Remove extension
                            elizaLogger.debug(`Generated file ID: ${fileId}`);
                            
                            try {
                                if (addNoteToRdfGraph(rdfManager, fileId, rdfData, baseUri, filePath)) {
                                    rdfCount++;
                                    elizaLogger.debug(`Successfully added RDF data from file: ${filePath}`);
                                }
                            } catch (error) {
                                errorCount++;
                                elizaLogger.error(`Error adding file ${filePath} to RDF graph:`, error);
                            }
                        } else {
                            elizaLogger.debug(`No RDF-compatible frontmatter found in file: ${filePath}`);
                        }
                    } else {
                        elizaLogger.debug(`Empty or null content for file: ${filePath}`);
                    }
                } catch (error) {
                    errorCount++;
                    elizaLogger.error(`Error reading file ${filePath}:`, error);
                }
                
                // Provide periodic updates
                if (processedCount % 50 === 0 && callback) {
                    callback({
                        text: `Processing files... ${processedCount}/${knowledgeFiles.length} files scanned, ${rdfCount} with RDF data loaded, ${errorCount} errors encountered.`,
                        partial: true
                    });
                }
            }
            
            // Debug the namespace resolver results
            const namespaces = propertyResolver.getNamespacePrefixes();
            const properties = propertyResolver.getRegisteredProperties();
            elizaLogger.info(`Namespace resolver statistics: ${Object.keys(namespaces).length} namespaces, ${properties.length} properties`);
            elizaLogger.debug(`Registered namespaces: ${JSON.stringify(namespaces)}`);
            
            // Log sample of properties for debugging (not all to avoid log overflow)
            const sampleSize = Math.min(properties.length, 20);
            elizaLogger.debug(`Sample of registered properties (${sampleSize}/${properties.length}): ${properties.slice(0, sampleSize).join(', ')}${properties.length > sampleSize ? '...' : ''}`);
            
            // Save the graph to a temporary file for debugging
            const serializedGraph = rdfManager.serializeGraph('text/turtle');
            elizaLogger.debug(`Serialized RDF graph size: ${serializedGraph.length} bytes`);
            
            const graphPath = await tempFileSystem.writeTempFile("vault-rdf.ttl", serializedGraph);
            elizaLogger.info(`RDF graph saved for debugging at: ${graphPath}`);
            
            // Create ontology file
            elizaLogger.info("Generating ontology file");
            const ontologyResult = await generateOntologyFromGraph(runtime);
            if (!ontologyResult.success) {
                elizaLogger.warn("Ontology generation failed or found no schema to extract");
            }
            
            // Save the graph to persistent storage
            if (rdfManager.saveGraphToFile(persistentStoragePath)) {
                elizaLogger.info(`RDF graph saved to persistent storage at ${persistentStoragePath}`);
            } else {
                elizaLogger.error("Failed to save RDF graph to persistent storage");
            }
            
            // Set the loaded state
            rdfManager.setLoaded(true);
            
            // Run diagnostics on the loaded data
            elizaLogger.info("Running diagnostics on loaded RDF data");
            const diagnostics = inspectLoadedData(rdfManager);
            
            // Log the diagnostics
            elizaLogger.debug(`Diagnostics report: ${JSON.stringify(diagnostics, null, 2)}`);
            
            const graphStats = rdfManager.getStats();
            elizaLogger.info(`RDF data loading complete. Processed ${processedCount} files from knowledge folder, found ${rdfCount} with RDF data, encountered ${errorCount} errors.`);
            elizaLogger.debug(`Graph statistics: ${JSON.stringify(graphStats, null, 2)}`);
            
            if (callback) {
                callback({
                    text: `Successfully loaded RDF data from your knowledge folder!\n\n**Summary:**\n- Processed ${processedCount} files from the knowledge folder\n- Found ${rdfCount} files with RDF-compatible data\n- Encountered ${errorCount} errors during processing\n- RDF graph now contains ${graphStats.statements} statements\n- ${graphStats.subjects} unique subjects\n- ${graphStats.predicates} unique predicates\n\nThe RDF graph is now ready for SPARQL queries.\n\n**Diagnostics:**\n- Ontology file created at: ${ontologyResult.ttlFilePath}\n- Graph file saved at: ${graphPath}`,
                    metadata: {
                        processedCount,
                        rdfCount,
                        errorCount,
                        graphStats,
                        graphPath,
                        ontologyPath: ontologyResult.ttlFilePath,
                        ontologyMarkdownPath: ontologyResult.markdownPath,
                        diagnostics
                    }
                });
            }
            
            return true;
        } catch (error) {
            elizaLogger.error("Error loading RDF data:", error);
            if (callback) {
                callback({
                    text: `Error loading RDF data: ${error.message}`,
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
                    text: "Load RDF data from my knowledge folder",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{responseData}}",
                    action: "LOAD_DATA",
                },
            },
        ]
    ],
};

export default loadRdfAction;