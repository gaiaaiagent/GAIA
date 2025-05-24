---
@id: ontology/ontology
@type: owl:Ontology
name: Sample Ontology
description: A basic ontology definition file
prefix: ont
baseUri: http://example.org/ontology/
version: 1.0.0
---

# Sample Ontology

This ontology file serves as a template for defining concepts, relationships, and properties in a structured way.

## Classes

### Thing
The root class from which all other classes inherit.

### Concept
A general concept or category.

## Properties

### hasName
- Domain: Thing
- Range: Text
- Description: The name of an entity

### hasDescription
- Domain: Thing 
- Range: Text
- Description: A description of an entity

## Relationships

### partOf
- Domain: Thing
- Range: Thing
- Description: Indicates that one thing is part of another