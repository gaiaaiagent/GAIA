import { elizaLogger } from "@elizaos/core";

/**
 * Class to manage schema property namespace resolution
 * This class loads schema definitions and helps map property names to their proper namespaces
 */
export class PropertyNamespaceResolver {
  private static instance: PropertyNamespaceResolver;
  private schemaPropertyMap: Map<string, string> = new Map();
  private namespaceMap: Map<string, string> = new Map();
  private defaultNamespace: string = "http://elizaos.local/ontology/";
  private isInitialized: boolean = false;

  /**
   * Private constructor - use getInstance() instead
   */
  private constructor() {
    // Initialize standard namespaces
    this.namespaceMap.set("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    this.namespaceMap.set("rdfs", "http://www.w3.org/2000/01/rdf-schema#");
    this.namespaceMap.set("schema", "http://schema.org/");
    this.namespaceMap.set("xsd", "http://www.w3.org/2001/XMLSchema#");
    this.namespaceMap.set("owl", "http://www.w3.org/2002/07/owl#");
    this.namespaceMap.set("foaf", "http://xmlns.com/foaf/0.1/");
    this.namespaceMap.set("ont", "http://elizaos.local/ontology/");
  }

  /**
   * Gets the singleton instance
   */
  public static getInstance(): PropertyNamespaceResolver {
    if (!PropertyNamespaceResolver.instance) {
      PropertyNamespaceResolver.instance = new PropertyNamespaceResolver();
    }
    return PropertyNamespaceResolver.instance;
  }

  /**
   * Expands a namespace prefix to its full URI
   */
  public expandNamespacePrefix(prefix: string): string | null {
    return this.namespaceMap.get(prefix) || null;
  }

  /**
   * Adds a namespace prefix mapping
   */
  public addNamespacePrefix(prefix: string, uri: string): void {
    if (prefix && uri) {
      this.namespaceMap.set(prefix, uri);
      elizaLogger.debug(`Added namespace prefix: ${prefix} -> ${uri}`);
    }
  }

  /**
   * Registers a property with its namespace
   */
  public registerProperty(property: string, namespace: string): void {
    if (property && namespace) {
      this.schemaPropertyMap.set(property, namespace);
      elizaLogger.debug(`Registered property namespace: ${property} -> ${namespace}`);
    }
  }

  /**
   * Sets the default namespace for properties without defined namespaces
   */
  public setDefaultNamespace(namespace: string): void {
    if (namespace) {
      this.defaultNamespace = namespace;
      elizaLogger.debug(`Set default namespace to: ${namespace}`);
    }
  }

  /**
   * Expands a term to its full URI based on registered schemas and namespaces
   */
  public expandTerm(term: string): string {
    if (!term) return term;
    
    // If it's already a full URI, return it unchanged
    if (term.includes('://')) return term;
    
    // Check if it has a namespace prefix
    const colonIndex = term.indexOf(':');
    if (colonIndex > 0) {
      const prefix = term.substring(0, colonIndex);
      const localName = term.substring(colonIndex + 1);
      
      const namespaceUri = this.namespaceMap.get(prefix);
      if (namespaceUri) {
        return `${namespaceUri}${localName}`;
      }
      
      // If namespace not found, log a warning and use the term as is
      elizaLogger.warn(`Unknown namespace prefix: ${prefix} in term: ${term}`);
      return term;
    }
    
    // No prefix - check if this property is registered in a schema
    const registeredNamespace = this.schemaPropertyMap.get(term);
    if (registeredNamespace) {
      elizaLogger.debug(`Found registered namespace for property "${term}": ${registeredNamespace}`);
      return `${registeredNamespace}${term}`;
    }
    
    // Not found in any schema, use default namespace
    elizaLogger.debug(`No registered namespace for property "${term}", using default: ${this.defaultNamespace}`);
    return `${this.defaultNamespace}${term}`;
  }

  /**
   * Parses and extracts namespace prefixes from ontology content
   */
  public parseNamespacePrefixes(ontologyContent: string): void {
    try {
      // Match @prefix declarations in TTL
      const prefixRegex = /@prefix\s+([a-zA-Z0-9_-]+):\s+<([^>]+)>\s*\./g;
      let match;
      
      while ((match = prefixRegex.exec(ontologyContent)) !== null) {
        const prefix = match[1];
        const uri = match[2];
        this.addNamespacePrefix(prefix, uri);
      }
      
      elizaLogger.debug(`Parsed ${this.namespaceMap.size} namespace prefixes from ontology content`);
    } catch (error) {
      elizaLogger.error(`Error parsing namespace prefixes: ${error}`);
    }
  }

  /**
   * Parses ontology content to extract property definitions and their namespaces
   */
  public parsePropertyDefinitions(ontologyContent: string): void {
    try {
      // This regex matches property definitions in TTL like "schema:name a rdf:Property"
      const propertyRegex = /([a-zA-Z0-9_-]+):([a-zA-Z0-9_-]+)\s+a\s+rdf:Property/g;
      let match;
      
      while ((match = propertyRegex.exec(ontologyContent)) !== null) {
        const prefix = match[1];
        const property = match[2];
        
        const namespaceUri = this.namespaceMap.get(prefix);
        if (namespaceUri) {
          this.registerProperty(property, namespaceUri);
        } else {
          elizaLogger.warn(`Unknown namespace prefix in property definition: ${prefix}:${property}`);
        }
      }
      
      // Also try to find schema:X definitions in general
      const schemaDefRegex = /(schema):([a-zA-Z0-9_-]+)\s+a\s+/g;
      while ((match = schemaDefRegex.exec(ontologyContent)) !== null) {
        const property = match[2];
        const namespaceUri = this.namespaceMap.get("schema");
        if (namespaceUri) {
          this.registerProperty(property, namespaceUri);
        }
      }
      
      elizaLogger.debug(`Parsed ${this.schemaPropertyMap.size} property definitions from ontology content`);
    } catch (error) {
      elizaLogger.error(`Error parsing property definitions: ${error}`);
    }
  }

  /**
   * Initialize from ontology content - parses prefixes and properties
   */
  public initializeFromOntology(ontologyContent: string): void {
    this.parseNamespacePrefixes(ontologyContent);
    this.parsePropertyDefinitions(ontologyContent);
    this.isInitialized = true;
    
    // Log summary information
    elizaLogger.info(`PropertyNamespaceResolver initialized with ${this.namespaceMap.size} namespaces and ${this.schemaPropertyMap.size} registered properties`);
    elizaLogger.debug(`Namespace prefixes: ${Array.from(this.namespaceMap.keys()).join(', ')}`);
    elizaLogger.debug(`Registered properties: ${Array.from(this.schemaPropertyMap.keys()).join(', ')}`);
  }

  /**
   * Gets whether the resolver has been initialized with ontology data
   */
  public getIsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Gets alternative namespace URIs for a property
   * Useful for SPARQL queries to handle multiple possible property paths
   */
  public getAlternativeNamespaces(property: string): string[] {
    const namespaces: string[] = [];
    
    // Add the primary namespace if registered
    const registeredNamespace = this.schemaPropertyMap.get(property);
    if (registeredNamespace) {
      namespaces.push(`${registeredNamespace}${property}`);
    }
    
    // Add the schema.org namespace as an alternative
    const schemaNamespace = this.namespaceMap.get("schema");
    if (schemaNamespace && !namespaces.includes(`${schemaNamespace}${property}`)) {
      namespaces.push(`${schemaNamespace}${property}`);
    }
    
    // Add the default namespace as a fallback
    if (!namespaces.includes(`${this.defaultNamespace}${property}`)) {
      namespaces.push(`${this.defaultNamespace}${property}`);
    }
    
    return namespaces;
  }

  /**
   * Generates a UNION pattern for SPARQL queries to handle multiple possible property paths
   */
  public generateSparqlPropertyUnion(subject: string, property: string, object: string): string {
    const namespaces = this.getAlternativeNamespaces(property);
    
    if (namespaces.length === 1) {
      return `${subject} <${namespaces[0]}> ${object} .`;
    }
    
    const unionPatterns = namespaces.map(ns => `{ ${subject} <${ns}> ${object} }`);
    return unionPatterns.join(" UNION ");
  }

  /**
   * Gets all registered properties
   */
  public getRegisteredProperties(): string[] {
    return Array.from(this.schemaPropertyMap.keys());
  }

  /**
   * Gets all registered namespaces
   */
  public getNamespacePrefixes(): Record<string, string> {
    return Object.fromEntries(this.namespaceMap.entries());
  }
}

export default PropertyNamespaceResolver;