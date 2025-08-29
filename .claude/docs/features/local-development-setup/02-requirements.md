---
rid: koi:feature:local-development-setup:requirements
last-updated: 2025-08-27
confidence: high
related:
  - koi:feature:local-development-setup:design
  - koi:planning:infrastructure
---

# Local Development Setup Requirements

## Overview

Enable developers to run RegenAI agents locally with minimal setup, providing a consistent and reliable development environment that mirrors production capabilities while remaining lightweight and fast.

## Design References

### Core Design Decisions

- [Design Vision](koi:feature:local-development-setup:design#design-vision)
- [System Architecture](koi:feature:local-development-setup:design#system-architecture)
- [Core Components](koi:feature:local-development-setup:design#core-components)

### Related Specifications

- [Environment Discovery](koi:strategy:environment-discovery)
- [Agent Operations](koi:docs:agent-operations)

## Functional Requirements

### FR-LDS-001: Environment Auto-Detection

**Description**: System must automatically detect whether it's running in local, staging, or production environment

**Design Reference**: [Environment Detection Service](koi:feature:local-development-setup:design#environment-detection-service)

**Acceptance Criteria**:
- Detects environment without manual configuration
- Falls back to `GAIA_ENV` environment variable if set
- Returns clear environment name: 'local', 'staging', or 'production'
- Works on Mac, Linux, and WSL2

**Test Scenarios**:
```typescript
test('detects local environment by default', async () => {
  const env = await detectEnvironment();
  expect(env.name).toBe('local');
  expect(env.paths.knowledge).toContain('/knowledge');
});

test('respects GAIA_ENV override', async () => {
  process.env.GAIA_ENV = 'staging';
  const env = await detectEnvironment();
  expect(env.name).toBe('staging');
});
```

### FR-LDS-002: Single Command Setup

**Description**: Developers must be able to start development environment with a single command

**Design Reference**: [User Workflows](koi:feature:local-development-setup:design#user-workflows)

**Acceptance Criteria**:
- Single command `./dev.sh start` starts minimal environment
- Automatically checks for prerequisites
- Provides clear progress indicators
- Completes in under 5 minutes on standard hardware

**Dependencies**:
- Docker installed
- Bun installed
- 8GB RAM available

### FR-LDS-003: Progressive Service Tiers

**Description**: Support three tiers of service complexity

**Acceptance Criteria**:
- **Minimal**: PostgreSQL + single agent (default)
- **Standard**: PostgreSQL + all 5 agents
- **Full**: All services including KOI, Django, Nginx

**Test Scenarios**:
```bash
# Test minimal tier
./dev.sh start
curl http://localhost:3000/health # Should respond

# Test standard tier  
./dev.sh start --standard
for port in 3000 3001 3002 3003 3004; do
  curl http://localhost:$port/health # All should respond
done

# Test full tier
./dev.sh start --full
curl http://localhost:8001/regen/health # KOI node
curl http://localhost:8100/stats # KOI query
curl http://localhost:8000/admin # Django
```

## Non-Functional Requirements

### NFR-LDS-001: Performance Requirements

**Description**: Local development must be responsive and resource-efficient

**Acceptance Criteria**:
- Cold start time < 30 seconds for minimal tier
- Cold start time < 60 seconds for full tier
- RAM usage < 2GB for minimal tier
- RAM usage < 4GB for standard tier
- RAM usage < 6GB for full tier

**Measurement Method**:
```bash
# Measure startup time
time ./dev.sh start

# Measure memory usage
docker stats --no-stream
ps aux | grep -E 'bun|node' | awk '{sum+=$6} END {print sum/1024 " MB"}'
```

### NFR-LDS-002: Reliability Requirements

**Description**: Development environment must be stable and recoverable

**Acceptance Criteria**:
- Services automatically restart on failure
- Clean reset command available
- No data loss on normal shutdown
- Graceful handling of port conflicts

### NFR-LDS-003: Developer Experience Requirements

**Description**: Setup and usage must be intuitive and well-documented

**Acceptance Criteria**:
- Clear error messages with fix suggestions
- Helpful output during startup
- Comprehensive `--help` documentation
- Status command shows all service health

## Interface Requirements

### CLI Requirements

#### Command: dev.sh

- **start**: Start services
  - Options: --minimal, --standard, --full
  - Default: --minimal
  
- **stop**: Stop all services
  
- **restart**: Restart services
  
- **status**: Show service status
  - Shows: service name, status, port, health
  
- **logs**: Tail service logs
  - Usage: `./dev.sh logs [service]`
  
- **reset**: Clean reset of environment
  - Removes: containers, volumes, generated files
  - Preserves: .env.local, knowledge files

- **test**: Run test suite
  - Runs appropriate tests for current tier

### Integration Requirements

#### IR-LDS-001: PostgreSQL Integration

**Description**: Seamless PostgreSQL setup with pgvector extension

**Requirements**:
- Auto-installs pgvector extension
- Runs migrations automatically
- Provides connection string to agents
- Uses port 5432 (standard) in local, 5433 in production

**Compatibility**:
- PostgreSQL 15+ with pgvector
- Supports ARM64 and x86_64

## Data Requirements

### Data Schema

**Configuration Structure**:
```typescript
interface LocalConfig {
  // Environment detection
  environment: 'local' | 'staging' | 'production';
  
  // Service ports (local defaults)
  ports: {
    postgres: 5432;      // Standard port locally
    agents: [3000, 3001, 3002, 3003, 3004];
    koi_node?: 8001;
    koi_query?: 8100;
    django?: 8000;
    nginx?: 80;
  };
  
  // Local paths (relative to project root)
  paths: {
    knowledge: './knowledge';
    characters: './characters';
    plugins: './packages';
    logs: './logs';
    data: './data';
  };
  
  // Feature flags
  features: {
    koi: boolean;
    django: boolean;
    nginx: boolean;
    hot_reload: boolean;
  };
}
```

### Data Constraints

- Port numbers must be available on host
- Paths must be relative to project root
- Knowledge directory must exist
- At least one character file required

### Data Migration

- **From**: Production paths (`/opt/projects/`)
- **To**: Relative paths (`./`)
- **Strategy**: Environment variable substitution

## Security Requirements

### SR-LDS-001: Secret Management

**Description**: Secure handling of API keys and credentials

**Requirements**:
- `.env.local` never committed to git
- Separate dev and prod API keys
- Clear documentation for required keys
- Helpful errors for missing keys

### SR-LDS-002: Network Isolation

**Description**: Local services not exposed externally by default

**Requirements**:
- All services bind to localhost only
- Optional ngrok integration for testing
- No production data in development
- Sanitized test datasets provided

## Quality Requirements

### Code Quality

- Shell scripts pass shellcheck
- TypeScript configs properly typed
- Docker configs follow best practices
- Documentation complete for all commands

### Testing Requirements

- Setup tested on Mac, Linux, WSL2
- Each tier has smoke tests
- Service health checks implemented
- Reset command fully tested

## Acceptance Criteria Summary

### Feature Complete Checklist

- [ ] Environment auto-detection working
- [ ] Single command setup functional
- [ ] Three service tiers implemented
- [ ] All CLI commands working
- [ ] PostgreSQL auto-setup complete
- [ ] Port conflict handling implemented
- [ ] Documentation complete
- [ ] Tests passing on all platforms

### Definition of Done

1. Fresh clone to running agent < 5 minutes
2. All commands documented with --help
3. Error messages helpful and actionable
4. Resource usage within limits
5. Works on Mac, Linux, and WSL2
6. Team members successfully tested setup
7. README.md updated with setup instructions

## Test Scenarios

### Happy Path Scenarios

1. **Scenario: Fresh Developer Setup**
   - Given: Fresh clone of repository
   - When: Run `./dev.sh start`
   - Then: Agent accessible at http://localhost:3000

2. **Scenario: Full Environment Launch**
   - Given: Configured `.env.local`
   - When: Run `./dev.sh start --full`
   - Then: All services healthy and responding

### Edge Cases

1. **Edge Case: Port Already in Use**
   - Condition: PostgreSQL already running on 5432
   - Expected Behavior: Detect and suggest alternative or use existing

2. **Edge Case: Insufficient Resources**
   - Condition: Less than 4GB RAM available
   - Expected Behavior: Warning with option to continue

### Error Scenarios

1. **Error: Missing Docker**
   - Trigger: Docker not installed
   - Expected Response: Clear message with install instructions
   - Recovery: Install Docker and retry

2. **Error: Missing API Keys**
   - Trigger: Required API keys not in .env.local
   - Expected Response: List missing keys with setup guide
   - Recovery: Add keys to .env.local

## Dependencies

### Internal Dependencies

- ElizaOS packages built successfully
- Character files present in ./characters
- Knowledge files structured correctly

### External Dependencies

- Docker Desktop or Docker Engine
- Bun runtime (latest)
- 8GB RAM minimum
- 10GB disk space

### Environmental Requirements

- macOS 12+, Ubuntu 20.04+, or Windows 10 with WSL2
- Internet connection for pulling Docker images
- Terminal with UTF-8 support

## Risks and Mitigations

### Technical Risks

1. **Risk**: Docker performance on Mac
   - **Impact**: Slow startup and high CPU usage
   - **Mitigation**: Recommend native services for Mac development

2. **Risk**: Port conflicts with existing services
   - **Impact**: Services fail to start
   - **Mitigation**: Auto-detect and suggest alternatives

### Implementation Risks

1. **Risk**: Complexity creep in dev script
   - **Impact**: Hard to maintain and debug
   - **Mitigation**: Keep script modular and well-commented

## Open Items

1. **Hot Reload Support**: How to implement for agents?
   - **Owner**: Team discussion needed
   - **Due Date**: Before Phase 2

2. **Windows Native Support**: WSL2 only or native support?
   - **Owner**: Team decision
   - **Due Date**: Based on developer needs

---

_These requirements translate the Local Development Setup design into specific, testable acceptance criteria._