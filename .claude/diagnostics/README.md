# ElizaOS Diagnostic Tools

This directory contains diagnostic scripts and tools for investigating ElizaOS behavior and debugging issues systematically.

## Purpose

Rather than debugging through trial and error, these tools help us:
- Understand system behavior before attempting fixes
- Create reproducible investigation processes
- Build a library of diagnostic capabilities
- Document architectural assumptions

## Tools

### 01-investigate-group-chat.js
Investigates why agents aren't responding in group chats by checking:
- Message presence in database
- Channel existence and configuration
- Participant registration
- Agent availability
- Complete message flow analysis

**Usage:**
```bash
node .claude/diagnostics/01-investigate-group-chat.js
```

## Creating New Diagnostic Tools

When creating new diagnostic tools:

1. **Number them sequentially** (01-, 02-, etc.)
2. **Name descriptively** (investigate-[subsystem].js)
3. **Include comprehensive comments**
4. **Output colored, structured results**
5. **Provide actionable insights**

## Best Practices

1. **Investigate, Don't Fix**: Tools should reveal issues, not patch them
2. **Be Systematic**: Check each component in the flow
3. **Educate**: Output should teach about the system
4. **Be Reusable**: Parameterize where possible

## Future Tools Needed

- [ ] WebSocket connection analyzer
- [ ] Agent health checker
- [ ] Database consistency validator
- [ ] Message flow tracer
- [ ] Plugin compatibility checker
- [ ] Memory usage analyzer
- [ ] Performance profiler

## Integration with Development

These tools support our development philosophy:
- **Understand before fixing**
- **Document discoveries**
- **Build knowledge systematically**
- **Create educational value**

---

*Part of the RegenAI development toolkit*