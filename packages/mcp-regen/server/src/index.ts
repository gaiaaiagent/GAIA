// src/index.ts
import { RegenMCPServer } from './server.js';

const server = new RegenMCPServer();
server.run().catch(console.error);
