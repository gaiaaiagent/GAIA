# MCP Auto-Trigger Options (DEPRECATED)

**This document has been superseded by [MCP-ALWAYS-ON-ARCHITECTURE.md](./MCP-ALWAYS-ON-ARCHITECTURE.md)**

## Summary

After investigation, keyword-based triggers are the wrong approach. The correct architecture is to make MCP an **always-on knowledge retrieval layer** using the native ElizaOS provider pattern.

See [MCP-ALWAYS-ON-ARCHITECTURE.md](./MCP-ALWAYS-ON-ARCHITECTURE.md) for the complete implementation strategy.

## Key Insight

MCP should function like a RAG system where knowledge retrieval happens automatically before every response, not as an optional tool the LLM occasionally decides to use.

The MCP provider already runs on every message via the `PROVIDERS` composition. We simply enhance it to execute searches instead of just returning metadata.

## Migration

This document is preserved for historical reference but should not be used for implementation. All new development should follow the always-on architecture documented in [MCP-ALWAYS-ON-ARCHITECTURE.md](./MCP-ALWAYS-ON-ARCHITECTURE.md).
