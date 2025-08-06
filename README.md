# RegenAI - Multi-Agent System for Regenerative Economics

A partnership between Symbiocene Labs and Regen Network to deploy AI agents that facilitate ecological regeneration through intelligent coordination.

## 🚀 Quick Start

### Docker Deployment (Recommended for Team)

```bash
# Clone and setup
git clone https://github.com/gaiaaiagent/GAIA.git -b regen
cd GAIA
cp .env.example .env

# Add your API key to .env
# OPENAI_API_KEY=your_key_here
# or ANTHROPIC_API_KEY=your_key_here

# Start everything
docker compose up -d
```

**Access Points:**
- AI Agents: http://agents.localhost (auth: regenai/regen2025)
- Admin Dashboard: http://admin.localhost (auth: admin/admin123)
- Direct ports if subdomains fail: 3000 (agents), 8000 (admin)

See [LOCAL-ACCESS.md](LOCAL-ACCESS.md) for detailed setup and troubleshooting.

## 🤖 The RegenAI Agents

Our five specialized agents work together to make regenerative economics accessible:

1. **Advocate** - Educates about carbon credits and regenerative practices
2. **Governor** - Facilitates DAO governance and proposal analysis
3. **Narrator** - Transforms complex data into understandable stories
4. **VoiceOfNature** - Provides ecological and systems thinking perspectives
5. **RegenAI** - Technical coordinator and development facilitator

## 💻 Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v23.3.0+ 
- [Bun](https://bun.sh/) v1.2.15+ (required - we don't use npm/yarn)
- PostgreSQL 14+ (or use Docker)
- API Key (OpenAI or Anthropic)

### Build from Source

```bash
# Install dependencies (MUST use bun, not npm)
bun install

# Build all packages
bun run build

# Configure environment
cp .env.example .env
# Edit .env with your API keys and database URL

# Run all agents together (recommended)
bun start --character characters/regenai.character.json \
         --character characters/advocate.character.json \
         --character characters/governor.character.json \
         --character characters/narrative.character.json \
         --character characters/voiceofnature.character.json

# Access the web interface
open http://localhost:3000
```

### Testing & Quality

```bash
# Run tests
bun test

# Lint code
bun run lint

# Format code
bun run format
```

## 🏗️ Architecture

RegenAI extends [ElizaOS](https://github.com/elizaos/eliza), a powerful multi-agent framework that provides:

### Core Capabilities
- 🔗 Multi-model support (OpenAI, Anthropic, Llama, etc.)
- 💾 Persistent memory and knowledge management
- 🌐 Multi-platform connectors (Discord, Telegram, X, etc.)
- 🔌 Plugin architecture for extensibility
- 📊 Real-time monitoring and analytics

### Key Components
- **Actions** - Agent capabilities and responses
- **Providers** - Context and information suppliers
- **Evaluators** - Post-interaction learning
- **Services** - External integrations (APIs, databases)
- **Memory** - Conversation history and knowledge persistence

### Monorepo Structure
```
packages/
├── core/          # Foundation runtime and types
├── cli/           # Command-line interface
├── client/        # Web UI components
├── plugin-*/      # Various plugins
└── docs/          # Documentation
```

## 📊 Django Admin Dashboard

Monitor and manage your agents through the Django admin interface:

```bash
cd django_admin
poetry install
poetry run python manage.py migrate
poetry run python manage.py createsuperuser
poetry run python manage.py runserver
```

Features:
- Real-time conversation monitoring
- Agent performance metrics
- Knowledge base management
- System health monitoring

## 🛠️ Advanced Usage

<details>
<summary>Using the ElizaOS CLI</summary>

The ElizaOS CLI provides powerful tools for agent development:

```bash
# Install globally
bun install -g @elizaos/cli

# Create new project
elizaos create my-agent

# Manage agents
elizaos agent list
elizaos agent start --name "Advocate"
elizaos agent stop --name "Advocate"

# Run tests
elizaos test
elizaos test --name "specific-test"

# Environment management
elizaos env list
elizaos env edit-local
```

</details>

<details>
<summary>Creating Custom Agents</summary>

1. Copy an existing character file:
```bash
cp characters/advocate.character.json characters/my-agent.character.json
```

2. Edit the character definition:
```json
{
  "name": "MyAgent",
  "description": "Your agent's purpose",
  "modelProvider": "openai",
  "bio": ["Background info"],
  "topics": ["expertise areas"],
  "style": {
    "all": ["communication style"],
    "chat": ["conversational traits"]
  }
}
```

3. Run your agent:
```bash
bun start --character characters/my-agent.character.json
```

</details>

<details>
<summary>Plugin Development</summary>

Create custom functionality by developing plugins:

```typescript
// packages/plugin-custom/src/index.ts
export const customPlugin: Plugin = {
  name: "custom-plugin",
  description: "My custom functionality",
  actions: [/* your actions */],
  providers: [/* your providers */],
  evaluators: [/* your evaluators */],
  services: [/* your services */]
};
```

See the [plugin-starter](packages/plugin-starter) for templates.

</details>

## 🤝 Partnership & Milestones

This project is developed under a Joint Development Agreement between Symbiocene Labs and Regen Network.

### Phase 1 Objectives (Current)
- ✅ Deploy 5 core AI agents
- ✅ Index 15,000+ documents
- ✅ Integrate Regen Registry
- 🔄 Achieve 100,000+ interactions

### Phase 2 Goals
- Multi-chain expansion (Celo, Base, Optimism)
- 10 specialized agents
- 4 bioregional deployments
- Scale to 1M+ interactions

## 📚 Documentation

- [LOCAL-ACCESS.md](LOCAL-ACCESS.md) - Local development guide
- [CLAUDE.md](CLAUDE.md) - AI development context and contract details
- [Characters](characters/) - Agent personality definitions
- [Journal](.claude/journal/) - Development history and learnings
- [ElizaOS Docs](https://elizaos.github.io/eliza/) - Framework documentation

## 🔒 Security & Authentication

- **Development**: Basic Auth for team access
- **Production**: Will implement token-gated access with REGEN tokens
- **API Access**: Protected via ELIZA_SERVER_AUTH_TOKEN
- **Admin Panel**: Django authentication system

## 🌱 Contributing

We welcome contributions that align with regenerative principles:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a PR against the `regen` branch

Please ensure:
- All tests pass (`bun test`)
- Code is formatted (`bun run format`)
- Changes are documented

## 📄 License

This project is developed under the Regen Commons Conditional License (RCCL):
- ✅ Free for non-commercial use
- 🔐 Commercial use requires Regen Commons membership
- 📖 All improvements benefit the commons

## 🙏 Acknowledgments

- [ElizaOS](https://github.com/elizaos/eliza) - The powerful framework we build upon
- [Regen Network](https://regen.network) - For pioneering regenerative economics
- [Symbiocene Labs](https://symbiocene.com) - For AI innovation in ecology

---

*Building AI infrastructure for planetary regeneration* 🌍