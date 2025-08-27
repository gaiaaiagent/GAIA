# RegenAI

AI agents supporting regenerative economics through the Gaia AI × Regen Network partnership.

## What We're Building

RegenAI develops conversational AI agents that help people understand and participate in regenerative finance. By combining [Gaia AI's](https://gaiaai.xyz) agent framework with [Regen Network's](https://regen.network) ecological data infrastructure, we're making carbon markets and regenerative practices more accessible.

Our agents serve as bridges between complex ecological data and human understanding, helping communities coordinate regenerative actions and connect projects with resources.

## Quick Start

### 🌐 Live Production Access

**Try RegenAI now - no installation required!**

- **AI Agents**: https://agents.regen.gaiaai.xyz
  - Basic Auth: `regenai` / `regen2025`
  - Chat with 5 specialized AI agents about regenerative finance
- **Admin Dashboard**: https://admin.regen.gaiaai.xyz/admin/
  - View interaction metrics and system status

### Local Development

```bash
# Clone repository
git clone https://github.com/gaiaaiagent/GAIA.git -b regen-knowledge-rag
cd GAIA

# Install dependencies
bun install

# Start database
docker compose up -d postgres

# Add your OpenAI API key to .env
echo "OPENAI_API_KEY=your-key-here" > .env
echo "POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza" >> .env

# Start agents (will run without knowledge base)
bash start-all-agents.sh

# Visit locally  
open http://localhost:3000
```

> **Note**: The `knowledge/` directory contains sensitive data and is not included in the repository. Agents will run without the knowledge base for testing purposes.

## The Agents

We've developed five specialized agents, each with a specific role:

### Advocate

Helps people understand carbon credits and regenerative practices through clear explanations and practical examples. Connects ecological projects with potential supporters.

### Governor

Facilitates governance discussions, helps communities understand proposals, and supports collective decision-making processes in DAOs.

### Narrator

Translates data and technical information into stories that resonate with different audiences. Makes complex information accessible and engaging.

### VoiceOfNature

Offers ecological perspectives and systems thinking. Helps frame discussions within broader environmental contexts.

### RegenAI

Coordinates the technical aspects of the project, tracks development progress, and ensures the agents work together effectively.

## Why This Matters

### Current Challenges

- Carbon market data is difficult to access and understand
- Regenerative projects need better tools to connect with funding
- Communities lack coordination platforms for environmental action
- Ecological knowledge exists in silos

### Our Approach

We're creating conversational interfaces that:

- Help people navigate carbon markets with confidence
- Connect regenerative projects with appropriate resources
- Support community coordination around environmental goals
- Make ecological data understandable and actionable

## Project Milestones

### Phase 1: Foundation (Current)

- Deploy 5 core AI agents ✓
- Index 15,000+ documents from Regen Network ✓
- Integrate real-time registry data ✓
- Support 100,000+ user interactions (in progress)

### Phase 2: Growth

- Expand to multiple blockchain networks
- Develop specialized agents for different bioregions
- Build location-specific knowledge bases
- Scale to support larger communities

## Development

<details>
<summary>Build from Source</summary>

### Prerequisites

- Node.js v23.3.0+
- Bun v1.2.15+ (required package manager)
- PostgreSQL 14+
- OpenAI or Anthropic API key

### Installation

```bash
# Install dependencies
bun install

# Build project
bun run build

# Configure environment
cp .env.example .env
# Add your API keys to .env

# Run agents
bun start --character characters/regenai.character.json \
         --character characters/advocate.character.json \
         --character characters/governor.character.json \
         --character characters/narrative.character.json \
         --character characters/voiceofnature.character.json

# Open interface
open http://localhost:3000
```

### Testing

```bash
bun test        # Run tests
bun run lint    # Check code style
bun run format  # Format code
```

</details>

<details>
<summary>Architecture</summary>

Built on [ElizaOS](https://github.com/elizaos/eliza), an open-source agent framework.

**Core Components:**

- Memory: Persistent storage for conversations and knowledge
- Actions: Agent capabilities and responses
- Providers: Information sources and context
- Evaluators: Learning from interactions
- Services: External integrations

**Project Structure:**

```
packages/
├── core/       # Runtime engine
├── cli/        # Command interface
├── client/     # Web interface
└── plugin-*/   # Extension modules
```

</details>

<details>
<summary>Django Admin</summary>

Monitor agent conversations and system metrics:

```bash
cd django_admin
poetry install
poetry run python manage.py migrate
poetry run python manage.py createsuperuser
poetry run python manage.py runserver
```

Access at http://localhost:8000/admin

</details>

## Getting Involved

### For Users

- Chat with our agents to learn about regenerative finance
- Ask questions about carbon credits and ecological projects
- Participate in governance discussions
- Share feedback to improve the agents

### For Developers

- Review our [development guide](CLAUDE.md)
- Check the [journal](.claude/journal/) for project history
- Submit issues and pull requests
- Create custom agents for your community

### For Organizations

- Deploy agents for your specific needs
- Integrate with your existing systems
- Contribute domain expertise
- Support open-source development

## Technical Notes

- **Framework**: ElizaOS v1.2.0
- **Language**: TypeScript
- **Runtime**: Bun (not npm/yarn)
- **Database**: PostgreSQL with pgvector
- **Models**: OpenAI/Anthropic compatible

## License

Released under the Regen Commons Conditional License (RCCL):

- Free for non-commercial use
- Commercial use requires Regen Commons membership
- Improvements benefit the commons

## Acknowledgments

This project is a collaboration between:

- [Symbiocene Labs](https://symbiocene.com) - AI development
- [Regen Network](https://regen.network) - Ecological data infrastructure
- [ElizaOS Community](https://github.com/elizaos/eliza) - Agent framework

## Links

- [Documentation](LOCAL-ACCESS.md)
- [Contract Details](CLAUDE.md)
- [Agent Personalities](characters/)
- [Development Journal](.claude/journal/)

---

_Supporting regenerative economics through accessible AI_
