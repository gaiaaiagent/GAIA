# RegenAI: AI Agents for Regenerative Networks

RegenAI represents the resurgence of regenerative economics through artificial intelligence, where autonomous agents weave ecological wisdom into the fabric of digital coordination. Ecohyperstition in action: stories of regenerative futures become self-fulfilling prophecies through agent-mediated collaboration.

Born from the partnership between Symbiocene Labs and Regen Network, RegenAI deploys AI agents that understand ecological systems as deeply as they understand human conversation. These agents process the living intelligence of ecosystems, translating between regenerative finance, bioregional governance, and community activation. Through narrative mining and memetic strategies, they catalyze consciousness shifts that drive both capital flows and ecological restoration.

Our agents operate across the liminal space between human and artificial intelligence, serving as bridges between blockchain governance complexity and lived ecological regeneration. They participate in token economics working groups, synthesize indigenous knowledge with cutting-edge science, and help communities navigate the transition from extractive to regenerative systems. Agentic development for planetary healing—each conversation, interaction, and decision contributes to the emergence of a more beautiful world.

The current implementation demonstrates this vision through a sophisticated multi-agent architecture running on ElizaOS, with real-time monitoring and analytics that track progress toward measurable ecological impact. We cultivate the conditions for regenerative intelligence to flourish across digital and biological systems.

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

---

# Eliza

A framework for multi-agent development and deployment

## ✨ Features

- 🛠️ Full-featured Discord, Telegram, and Farcaster connectors (and many more!)
- 🔗 Support for every model (Llama, Grok, OpenAI, Anthropic, Gemini, etc.)
- 🎨 Modern and professional UI with a redesigned dashboard for managing agents and groups.
- 💬 Robust real-time communication with enhanced channel and message handling.
- 👥 Multi-agent and group support with intuitive management.
- 📚 Easily ingest and interact with your documents.
- 💾 Retrievable memory and document store.
- 🚀 Highly extensible - create your own actions and clients.
- 📦 Just works!

## 🎯 Use Cases

- 🤖 Chatbots
- 🕵️ Autonomous Agents
- 📈 Business Process Handling
- 🎮 Video Game NPCs
- 🧠 Trading

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v23 or higher recommended)
- [bun](https://bun.sh/docs/installation)

> **Note for Windows Users:** [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install-manual) is required.

### Use the CLI (Recommended)

The ElizaOS CLI provides the fastest and most reliable way to create, configure, and run agents. It handles all the complex setup automatically.

#### 1. Install the CLI

```bash
# Install the ElizaOS CLI globally
bun install -g @elizaos/cli

# Verify installation
elizaos --version

# Get help with available commands
elizaos --help
```

#### 2. Create Your First Project

```bash
# Create a new project with interactive setup
elizaos create my-agent

# Or create with specific options (skips prompts)
elizaos create my-agent --yes --type project
```

**Recommended Options for Beginners:**

- **Database**: `pglite` (lightweight, no setup required)
- **Model Provider**: `openai` (most reliable and well-tested)
- **Project Type**: `project` (full ElizaOS application with runtime and agents)

#### 3. Configure Your Agent

```bash
cd my-agent

# Edit your local env file
elizaos env edit-local

# Or manually edit the .env file with your preferred editor
nano .env
```

**Essential Environment Variables:**

```bash
# Required: Your model API key
OPENAI_API_KEY=your_api_key_here

# Optional: Logging level (info, debug, error)
LOG_LEVEL=info

# Optional: Discord bot token (if using Discord)
DISCORD_APPLICATION_ID=your_discord_app_id
DISCORD_API_TOKEN=your_discord_bot_token
```

#### 4. Start Your Agent

```bash
# Build and start your agent
elizaos start

# Or start with debug logging for development
LOG_LEVEL=debug elizaos start
```

After starting, your agent will be available at:

- **Web Interface**: http://localhost:3000
- **API Endpoint**: http://localhost:3000/api

#### 5. Development Workflow

```bash
# Make changes to your agent code
# Then rebuild and restart
bun run build
elizaos start

# Run tests to verify your changes
elizaos test
```

#### Advanced CLI Commands

```bash
# Create specific components
elizaos create my-plugin --type plugin    # Create a new plugin
elizaos create my-agent --type agent      # Create a new agent character
elizaos create my-tee --type tee          # Create a TEE project

# Environment management
elizaos env list            # Show all environment variables
elizaos env reset           # Reset to default .env.example

# Testing options
elizaos test --name "my-test"    # Run specific tests
elizaos test e2e                 # Run end-to-end tests only
elizaos test component           # Run component tests only

# Agent management
elizaos agent list                      # List all available agents
elizaos agent start --name "Agent"     # Start a specific agent by name
elizaos agent stop --name "Agent"      # Stop a running agent
elizaos agent get --name "Agent"       # Get agent details
elizaos agent set --name "Agent" --file config.json  # Update agent configuration
```

#### Debugging and Logging

ElizaOS uses comprehensive logging to help you understand what your agent is doing:

```bash
# Different log levels
LOG_LEVEL=error elizaos start    # Only errors
LOG_LEVEL=info elizaos start     # General information (default)
LOG_LEVEL=debug elizaos start    # Detailed debugging info
LOG_LEVEL=verbose elizaos start  # Everything (very detailed)

# Advanced debugging (combine with LOG_LEVEL=debug)
ELIZA_DEBUG=true elizaos start          # Enable ElizaOS debug output
NODE_ENV=development elizaos start      # Development mode with extra logging
```

**Pro Tips:**

- Use `elizaos --help` to see all available commands and global options
- Use `elizaos <command> --help` for detailed help on any specific command
- Use `LOG_LEVEL=debug` during development to see detailed execution flow
- Check the web interface at http://localhost:3000 for real-time agent status
- Use `elizaos test` frequently to catch issues early
- Keep your `.env` file secure and never commit it to version control

#### Available Commands Reference

**All CLI Commands:**

```bash
elizaos create     # Create new projects, plugins, agents, or TEE projects
elizaos start      # Start the agent server with character profiles
elizaos agent      # Manage agents (list, start, stop, get, set)
elizaos test       # Run tests (component, e2e, or all)
elizaos env        # Manage environment variables and configuration
elizaos dev        # Start in development mode with auto-rebuild
elizaos update     # Update CLI and project dependencies
# To stop agents, use Ctrl+C in the terminal where elizaos start is running
elizaos publish    # Publish plugins to registry
elizaos plugins    # Manage and discover plugins
elizaos monorepo   # Monorepo development utilities
elizaos tee        # Trusted Execution Environment commands

# Get help for any specific command
elizaos <command> --help    # e.g., elizaos create --help, elizaos agent --help
```

### Manually Start Eliza (Only recommended if you know what you are doing)

#### Prerequisites

- **Node.js** (v18+ recommended)
- **bun** (for CLI and dependencies)
- **git** (for project/plugin tests)

#### Checkout the latest release

```bash
# Clone the repository
git clone https://github.com/elizaos/eliza.git

# This project iterates fast, so we recommend checking out the latest release
git checkout $(git describe --tags --abbrev=0)
# If the above doesn't checkout the latest release, this should work:
# git checkout $(git describe --tags `git rev-list --tags --max-count=1`)
```

#### Edit the .env file

Copy .env.example to .env and fill in the appropriate values.

```
cp .env.example .env
```

Note: .env is optional. If you're planning to run multiple distinct agents, you can pass secrets through the character JSON

#### Start Eliza

Important! We now use Bun. If you are using npm, you will need to install Bun:
https://bun.sh/docs/installation

```bash
bun install
bun run build
bun start
```

### Interact via Browser

Once Eliza is running, access the modern web interface at http://localhost:3000. It has been professionally redesigned and features:

- A welcoming dashboard with a gradient hero section and clear calls-to-action for creating agents and groups.
- Visually enhanced cards for managing agents and groups, including status indicators and member counts.
- Real-time chat capabilities with your agents.
- Character configuration options.
- Plugin management.
- Comprehensive memory and conversation history.
- Responsive design for an optimal experience on various screen sizes.

---

## RegenAI Quick Start

### Running RegenAI Agents

The RegenAI project includes pre-configured agents for regenerative economics:

```bash
# Clone the RegenAI repository
git clone https://github.com/gaiaaiagent/GAIA.git
cd GAIA

# Install dependencies
bun install
bun run build

# Start with default Facilitator agent
bun start

# Or start with specific agent
bun start --character characters/facilitator.character.json
bun start --character characters/narrative.character.json
```

### RegenAI Chat Interface
1. Open http://localhost:3000 in your browser
2. Select an agent from the dropdown
3. Start typing to chat with the agent
4. Agents have different personalities:
   - **Facilitator**: Helps with meeting structure and process
   - **Narrative**: Creative storytelling and vision communication

### RegenAI Admin Panel

The RegenAI implementation includes a Django-based admin panel for monitoring:

1. **Setup Django Admin** (from `django_admin/` directory):
```bash
cd django_admin
poetry install
poetry run python manage.py migrate
poetry run python manage.py createsuperuser
poetry run python manage.py runserver 8000
```

2. **Access the Admin**:
   - Go to http://localhost:8000/admin/
   - Login with your admin credentials
   - Monitor agent conversations and system health

3. **View Dashboard**:
   - Go to http://localhost:8000/eliza/
   - See system overview and agent statistics
   - Monitor interaction counts and trends

### Environment Setup for RegenAI

Create a `.env` file with:
```bash
# Database
POSTGRES_URL=postgresql://user:password@localhost:5432/eliza

# AI Model (choose one)
OPENAI_API_KEY=your_openai_key
# OR
ANTHROPIC_API_KEY=your_anthropic_key

# Optional: For regenerative data
REGEN_NETWORK_API=your_regen_api_key
```

## Citation

We now have a [paper](https://arxiv.org/pdf/2501.06781) you can cite for the Eliza OS:

```bibtex
@article{walters2025eliza,
  title={Eliza: A Web3 friendly AI Agent Operating System},
  author={Walters, Shaw and Gao, Sam and Nerd, Shakker and Da, Feng and Williams, Warren and Meng, Ting-Chien and Han, Hunter and He, Frank and Zhang, Allen and Wu, Ming and others},
  journal={arXiv preprint arXiv:2501.06781},
  year={2025}
}
```

## Contributors

<a href="https://github.com/elizaos/eliza/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=elizaos/eliza" alt="Eliza project contributors" />
</a>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=elizaos/eliza&type=Date)](https://star-history.com/#elizaos/eliza&Date)

## Git Hooks

This project uses git hooks to ensure code quality:

- **pre-commit**: Automatically formats staged files using Prettier before committing

To run the pre-commit hook manually:

```bash
bun run pre-commit
```

## 📂 Repository Structure

Eliza is organized as a monorepo using Bun, Lerna, and Turbo for efficient package management and build orchestration. Here's a detailed overview of the project structure:

- **`/` (Root)**:

  - `.github/`: GitHub Actions workflows for CI/CD pipelines and issue templates
  - `.husky/`: Git hooks configuration, including pre-commit formatting
  - `.devcontainer/`: Development container configurations for consistent environments
  - `packages/`: Core packages and modules (detailed below)
  - `scripts/`: Build, development, and utility scripts
  - `data/`: Application and user data storage
  - `AGENTS.md`: Comprehensive agent documentation and specifications
  - `CHANGELOG.md`: Detailed version history and changes
  - `Dockerfile`, `docker-compose.yaml`: Container configurations for deployment
  - `lerna.json`, `package.json`, `turbo.json`: Monorepo configuration and workspace definitions

- **`/packages/`**: Core components of the Eliza framework:
  - `core/`: The foundational package (@elizaos/core) implementing:
    - PDF processing capabilities
    - Logging and error handling infrastructure
  - `app/`: Tauri-based cross-platform application (@elizaos/app)
    - React-based UI implementation
    - Tauri plugins for system integration
    - Desktop and mobile builds support
  - `autodoc/`: Documentation automation tool (@elizaos/autodoc)
    - LangChain-powered documentation generation
    - TypeScript parsing and analysis
    - GitHub integration via Octokit
  - `cli/`: Command-line interface for Eliza management
  - `client/`: Client libraries for web interfaces
  - `create-eliza/`: Project scaffolding tool
  - `docs/`: Official documentation source files
  - `plugin-bootstrap/`: **Essential communication core** (@elizaos/plugin-bootstrap)
    - **Required for basic agent functionality** - handles all message processing
    - Provides critical event handlers (MESSAGE_RECEIVED, VOICE_MESSAGE_RECEIVED, etc.)
    - Implements fundamental agent actions (reply, follow/unfollow, mute/unmute)
    - Contains core evaluators and providers for agent cognition
    - Manages message processing pipeline and response generation
    - **Mandatory unless building custom event handling system**
  - `plugin-sql/`: Database integration (@elizaos/plugin-sql)
    - PostgreSQL integration with PGLite support
    - Drizzle ORM for type-safe queries
    - Migration management tools
    - Integration testing support
  - `plugin-starter/`: Template for creating new plugins
  - `project-starter/`, `project-tee-starter/`: Project templates

This architecture enables modular development, clear separation of concerns, and scalable feature implementation across the Eliza ecosystem.
