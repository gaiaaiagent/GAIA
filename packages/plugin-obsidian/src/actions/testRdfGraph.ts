// testRdfGraph.ts

// Instead of: const { getRdfManager } = require("../helper/rdfManager");
import { getRdfManager } from "../helper/RDFmanager.ts";
import * as path from "path";

async function main() {
  try {
    console.log("Attempting to read triples from the RDF manager...");

    // Get the RDF manager
    const rdfManager = getRdfManager();
    
    // Define the path to the persistent storage file
    // At the project root
    const persistentStoragePath = path.join(process.cwd(), "../../../../agent/rdf-graph-storage.ttl");
    console.log(`Looking for persistent RDF storage at: ${persistentStoragePath}`);
    
    // Try to load from persistent storage
    if (rdfManager.loadGraphFromFile(persistentStoragePath)) {
      console.log("Successfully loaded RDF graph from persistent storage");
    } else {
      console.warn("Failed to load RDF graph from persistent storage");
      
      // If your manager tracks a 'loaded' flag, you can check it
      if (!rdfManager.isLoaded()) {
        console.warn("The RDF graph has not been loaded yet. Run LOAD_DATA first.");
        return;
      }
    }

    // Access rdflib store
    const store = rdfManager.getGraph();
    const statements = store.statements || [];

    console.log(`Total statements: ${statements.length}\n`);
    statements.forEach((stmt, index) => {
      console.log(
        `[${index + 1}] <${stmt.subject.value}> <${stmt.predicate.value}> <${stmt.object.value}>`
      );
    });

    console.log("\nDone listing all RDF statements.");
  } catch (error) {
    console.error("Failed to read RDF data:", error);
  }
}

main();
