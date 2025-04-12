# Generated Ontology Schema

This file was automatically generated from the RDF graph.
It contains the schema/ontology information extracted from your data.

```turtle
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix schema: <http://schema.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
"_g_L68C1701" a owl:Ontology .

"_g_L70C1733" a owl:Ontology .

"_g_L72C1765" a owl:Ontology .

<http://elizaos.local/ontology/workouts/4b1f0572-6f29-4e9c-b8bd-cece993a2090> a schema:Workout .

schema:duration a owl:DatatypeProperty .

schema:duration rdfs:domain schema:Workout .

schema:duration rdfs:range xsd:duration .

schema:endDate a owl:DatatypeProperty .

schema:endDate rdfs:domain schema:Workout .

schema:endDate rdfs:range xsd:dateTime .

schema:exerciseType a owl:DatatypeProperty .

schema:exerciseType rdfs:domain schema:Workout .

schema:exerciseType rdfs:range xsd:string .

schema:intensity a owl:DatatypeProperty .

schema:intensity rdfs:domain schema:Workout .

schema:intensity rdfs:range xsd:string .

schema:location a owl:ObjectProperty .

schema:location rdfs:domain schema:Workout .

schema:name a owl:DatatypeProperty .

schema:name rdfs:domain schema:Workout .

schema:name rdfs:range xsd:string .

schema:performer a owl:ObjectProperty .

schema:performer rdfs:domain schema:Workout .

schema:sets a owl:DatatypeProperty .

schema:sets rdfs:domain schema:Workout .

schema:sets rdfs:range xsd:string .

schema:startDate a owl:DatatypeProperty .

schema:startDate rdfs:domain schema:Workout .

schema:startDate rdfs:range xsd:dateTime .

schema:Workout a owl:Class .

rdfs:domain a owl:ObjectProperty .

rdfs:domain rdfs:domain owl:DatatypeProperty .

rdfs:range a owl:ObjectProperty .

rdfs:range rdfs:domain owl:DatatypeProperty .

"_g_L74C1797" a owl:Ontology .

schema:Workout rdfs:isDefinedBy [ a owl:Ontology ; owl:imports (schema:duration, schema:endDate, schema:exerciseType, schema:intensity, schema:location, schema:name, schema:performer, schema:sets, schema:startDate) ] .

owl:DatatypeProperty a owl:Class .

owl:DatatypeProperty rdfs:isDefinedBy [ a owl:Ontology ; owl:imports (rdfs:domain, rdfs:range) ] .

owl:ObjectProperty a owl:Class .

owl:ObjectProperty rdfs:isDefinedBy [ a owl:Ontology ; owl:imports (rdfs:domain) ] .
```
