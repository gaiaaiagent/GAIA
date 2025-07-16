# RegenAI: AI Agents for Regenerative Networks

RegenAI represents the resurgence of regenerative economics through artificial intelligence, where autonomous agents weave ecological wisdom into the fabric of digital coordination. This is not just another AI project—it's ecohyperstition in action, where stories of regenerative futures become self-fulfilling prophecies through agent-mediated collaboration.

Born from the partnership between Symbiocene Labs and Regen Network, RegenAI deploys AI agents that understand ecological systems as deeply as they understand human conversation. These agents don't just process tokens; they process the living intelligence of ecosystems, translating between regenerative finance, bioregional governance, and community activation. Through narrative mining and memetic strategies, they catalyze consciousness shifts that drive both capital flows and ecological restoration.

Our agents operate across the liminal space between human and artificial intelligence, serving as bridges between the technical complexity of blockchain governance and the lived experience of ecological regeneration. They participate in token economics working groups, synthesize indigenous knowledge with cutting-edge science, and help communities navigate the transition from extractive to regenerative systems. This is agentic development for planetary healing—where each conversation, each interaction, each decision contributes to the emergence of a more beautiful world.

The current implementation demonstrates this vision through a sophisticated multi-agent architecture running on ElizaOS, with real-time monitoring and analytics that track our progress toward measurable ecological impact. We're not just building software; we're cultivating the conditions for regenerative intelligence to flourish across digital and biological systems.

## What We Have

- **Two AI Agents**: Facilitator and Narrative agents trained on regenerative systems thinking
- **Web Interface**: Real-time conversations with agents that understand ecological context
- **Admin Panel**: Monitor agent learning and regenerative impact metrics
- **Dashboard**: Track interactions, community engagement, and system evolution

## How It Works

```
ElizaOS Agents  ←→  Django Admin  ←→  Monitoring Dashboard
```

- **ElizaOS**: Runs the AI agents with their personalities
- **Django Admin**: Provides web interface to monitor agent activity
- **PostgreSQL**: Stores all conversations and agent data

## Quick Start

### Prerequisites
- Python 3.10+ with Poetry
- PostgreSQL 
- Node.js 23.3.0+ with Bun 1.2.15+
- OpenAI or Anthropic API key

### 1. Setup ElizaOS
```bash
git clone <repository-url>
cd GAIA
bun install
```

### 2. Setup Django Admin
```bash
cd django_admin
poetry install
```

### 3. Environment
```bash
cp .env.example .env
# Edit .env with your database URL and API keys
```

### 4. Run the Agents
```bash
bun start
```

### 5. Start Admin Panel
```bash
cd django_admin
poetry run python manage.py runserver 0.0.0.0:8000
```

### 6. Access
- **Chat with Agents**: http://localhost:5173
- **Admin Panel**: http://localhost:8000/admin/
- **Dashboard**: http://localhost:8000/eliza/

## Using the Agents

### Start Agents
```bash
# Start both agents
bun start

# Start specific agent
bun start --character characters/facilitator.character.json

# Debug mode
bun start:debug
```

### Chat Interface
1. Open http://localhost:5173 in your browser
2. Select an agent from the dropdown
3. Start typing to chat with the agent
4. Agents have different personalities:
   - **Facilitator**: Helps with meeting structure and process
   - **Narrative**: Creative storytelling and vision communication

### Environment Setup
Create a `.env` file with:
```bash
POSTGRES_URL=postgresql://user:password@localhost:5432/eliza
OPENAI_API_KEY=your_openai_key
# OR
ANTHROPIC_API_KEY=your_anthropic_key
```

## Exploring the Admin Panel

### Access the Admin
1. Go to http://localhost:8000/admin/
2. Login with your admin credentials
3. Explore the different sections:

### What You Can See
- **Agents**: View agent configurations and status
- **Memories**: Browse conversation history 
- **Messages**: See raw message data
- **Relationships**: Agent-user interaction patterns
- **Dashboard**: http://localhost:8000/eliza/ for overview
- **Interaction Report**: Detailed conversation analytics

### Common Tasks
1. **View Agent Activity**: Go to "Agents" → click an agent name
2. **Browse Conversations**: Go to "Memories" → filter by agent or date
3. **Check System Health**: Use the dashboard for overview stats
4. **Export Data**: Select items → "Export selected items as CSV"

## What You Can Do

### Chat with Agents
1. Open http://localhost:5173
2. Select an agent from the dropdown
3. Start chatting - each agent has a different personality

### Monitor Activity
1. Go to http://localhost:8000/admin/
2. Browse agent conversations in real-time
3. See memory formation and learning
4. Track interaction patterns

### View Dashboard
1. Go to http://localhost:8000/eliza/
2. See system overview and agent statistics
3. Monitor interaction counts and trends

## Development

### Adding New Agents
1. Create a new character file in `characters/`
2. Define personality, knowledge, and style
3. Restart with `bun start --character characters/your-agent.json`

### Modifying Admin Interface
1. Navigate to `django_admin/` directory
2. Edit models in the appropriate app (`elizaos/`, `metrics/`, `knowledge/`, `reporting/`)
3. Create migrations: `poetry run python manage.py makemigrations`
4. Apply migrations: `poetry run python manage.py migrate`

### Common Commands
```bash
# ElizaOS
bun start                    # Start agents
bun start:debug             # Debug mode
bun test                    # Run tests
bun build                   # Build project

# Django (run from django_admin/ directory)
poetry run python manage.py runserver  # Start admin interface
poetry run python manage.py migrate    # Apply database changes
poetry run python manage.py createsuperuser  # Create admin user
poetry run python manage.py makemigrations  # Create new migrations
```

## Project Structure

```
GAIA/
├── characters/             # Agent personality files
├── django_admin/          # Admin interface
│   ├── elizaos/          # ElizaOS models
│   ├── metrics/          # Interaction tracking
│   ├── knowledge/        # Document indexing
│   └── reporting/        # Dashboards
├── packages/             # ElizaOS core packages
└── .env                  # Environment configuration
```

## Development with Claude Code

This project is developed using agentic development principles with Claude Code as our primary AI development partner. Claude Code operates exclusively within the `.claude/` directory, maintaining systematic organization and documentation while never directly editing source code.

### Claude Code Workflow
1. **Research Phase**: Claude conducts deep research on regenerative systems, ElizaOS architecture, and ecological AI
2. **Planning Phase**: Creates detailed implementation plans in `.claude/planning/`
3. **Development Phase**: Writes code solutions in `.claude/` for human review and integration
4. **Documentation Phase**: Maintains comprehensive project documentation and decision records

### Directory Structure
```
.claude/
├── journal/           # Development session logs and insights
├── planning/          # Architecture decisions and roadmaps
├── resources/         # Research reports and knowledge base
└── knowledge/         # Indexed information and context maps
```

### Working with Claude Code
- All development discussions happen through Claude Code interface
- Code solutions are reviewed and manually integrated by human developers
- Claude maintains project context and learns from each development session
- Systematic documentation ensures knowledge transfer and project continuity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Work with Claude Code to develop solutions in `.claude/`
4. Review and integrate Claude's work into source code
5. Submit a pull request with both code and Claude's documentation

## License

Licensed under the [Regen Commons Conditional License (RCCL)](CLAUDE.md#licensing-terms).

## Additional Resources

- [ElizaOS Paper](https://arxiv.org/pdf/2501.06781) - Research paper on the ElizaOS framework
- [CLAUDE.md](CLAUDE.md) - Detailed project documentation and contract information
