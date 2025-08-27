# Telegram Bot Setup Guide for RegenAI Agents

## Overview

The RegenAI project has 5 AI agents integrated with Telegram, allowing team members to interact with them directly through Telegram messages. Each agent has its own unique personality and expertise area.

## Available RegenAI Telegram Bots

### 1. **RegenAI** - Development Orchestrator
- **Telegram Handle:** `@RegenAIBot` (example - replace with actual handle)
- **Expertise:** General RegenAI questions, development coordination
- **Character:** Technical, collaborative, systems thinking

### 2. **Facilitator** - Community Facilitator  
- **Telegram Handle:** `@RegenFacilitatorBot` (example - replace with actual handle)
- **Expertise:** Community engagement, process facilitation, meeting coordination
- **Character:** Supportive, organized, people-focused

### 3. **Voice of Nature** - Philosophical Voice
- **Telegram Handle:** `@RegenVoiceOfNatureBot` (example - replace with actual handle)
- **Expertise:** Ecological wisdom, regenerative principles, philosophical insights
- **Character:** Contemplative, nature-centered, inspiring

### 4. **Governor** - Governance Expert
- **Telegram Handle:** `@RegenGovernorBot` (example - replace with actual handle)
- **Expertise:** Governance processes, DAODAO proposals, token economics
- **Character:** Analytical, structured, governance-focused

### 5. **Narrative** - Storyteller
- **Telegram Handle:** `@RegenNarrativeBot` (example - replace with actual handle)
- **Expertise:** Storytelling, content creation, narrative development
- **Character:** Creative, engaging, story-focused

## How to Get Started

### Step 1: Find and Start the Bot
1. Search for the bot handle in Telegram (e.g., `@RegenAIBot`)
2. Click "Start" to begin the conversation
3. The bot will introduce itself and explain its capabilities

### Step 2: Basic Interaction
- Send any message to start a conversation
- Ask questions about:
  - Regen Network projects and initiatives
  - Regenerative agriculture and carbon credits
  - Governance proposals and voting
  - Technical questions about the platform
  - Community events and activities

### Step 3: Example Interactions

**With RegenAI:**
```
You: What's the status of the latest Regen Registry updates?
RegenAI: I can help you understand the current Regen Registry developments...
```

**With Governor:**
```
You: How do I create a governance proposal?
Governor: Let me walk you through the DAODAO proposal creation process...
```

**With Voice of Nature:**
```
You: What are the regenerative principles behind carbon credit methodologies?
Voice of Nature: The living systems approach to carbon sequestration reflects...
```

## Bot Capabilities

### What the Bots Can Do:
- ✅ Answer questions about Regen Network
- ✅ Explain governance processes
- ✅ Provide information about carbon credits and methodologies
- ✅ Share regenerative principles and philosophy
- ✅ Help with community coordination
- ✅ Create and share narratives about regenerative work

### What the Bots Cannot Do:
- ❌ Execute transactions or governance votes
- ❌ Access private/confidential information
- ❌ Make official decisions for the organization
- ❌ Access external systems without proper permissions

## Best Practices for Interaction

### 1. **Be Specific**
Instead of: "Tell me about Regen"
Try: "What are the main types of carbon credit methodologies available on Regen Registry?"

### 2. **Ask Follow-up Questions**
The bots can engage in multi-turn conversations, so feel free to dig deeper into topics.

### 3. **Use Context**
Reference previous parts of the conversation or specific Regen initiatives you're working on.

### 4. **Respect the Character**
Each bot has a unique personality - lean into their strengths:
- Ask **Governor** about governance and processes
- Ask **Voice of Nature** about regenerative philosophy  
- Ask **Facilitator** about community coordination
- Ask **Narrative** about storytelling and content

## Technical Details

### For Developers/Admins

**Current Bot Configuration:**
```json
{
  "clients": ["telegram"],
  "allowDirectMessages": true,
  "shouldOnlyJoinInAllowedGroups": false,
  "messageTrackingLimit": 100,
  "secrets": {
    "key": "<TELEGRAM_BOT_TOKEN>"
  }
}
```

**Agent Architecture:**
- Agents run as native bun processes (NOT Docker containers)
- Database: PostgreSQL with pgvector on port 5433
- Knowledge base: 600+ Notion pages + Regen Network documentation
- Model: Gemini 1.5 Flash for chat, OpenAI embeddings

**Bot Tokens (Environment Variables):**
```bash
TELEGRAM_BOT_TOKEN=8058793609:AAE63KMIa2Rc36NXapru7uHpGyytembWwug  # RegenAI
TELEGRAM_BOT_TOKEN_ADVOCATE=8280814835:AAFHeomcNuk3kwUKa3senaRU-bf8lK-LOjY  # Facilitator  
TELEGRAM_BOT_TOKEN_NARRATIVE=7413348697:AAGoaawG6RIr8Q6aV_NXavNM99wqSyE0KcY  # Narrative
TELEGRAM_BOT_TOKEN_VOICEOFNATURE=8258974878:AAE_rEkaTtIsaIfxZdkYTumLP7wCzlxv-tk  # Voice of Nature
# Governor token to be added
```

## Group Integration

### Adding Bots to Telegram Groups

**For Group Administrators:**
1. Add the bot to your Telegram group
2. Grant admin permissions if needed for full functionality
3. The bot will introduce itself and explain its role
4. Team members can mention the bot with `@BotHandle` to ask questions

**Group Guidelines:**
- Bots respond when directly mentioned
- They can participate in group discussions about Regen topics
- Use `/help` to see available commands
- Respect that bots are AI assistants, not human team members

## Troubleshooting

### Common Issues:

**Bot Not Responding:**
- Check if the bot is online (agents may restart occasionally)
- Try sending `/start` to reset the conversation
- Contact the technical team if issues persist

**Incorrect Information:**
- Bots are trained on available documentation but may not have the latest updates
- Always verify important information with official sources
- Report persistent inaccuracies to help improve the training

**Technical Errors:**
- Bots may occasionally show "thinking" messages during heavy load
- If a bot seems stuck, try starting a new conversation
- Contact support if technical issues persist

## Feedback and Support

### How to Provide Feedback:
- **General Feedback:** Share your experience with the bots - what works well, what could be improved
- **Content Suggestions:** Let us know if bots should know about specific Regen initiatives or documents
- **Technical Issues:** Report bugs or persistent problems
- **Feature Requests:** Suggest new capabilities or improvements

### Contact Information:
- **Technical Support:** [Add contact information]
- **Content Updates:** [Add contact information]  
- **General Questions:** [Add contact information]

## Security and Privacy

### What Information is Stored:
- Conversation history for context (limited retention)
- User interaction patterns for improvement
- No personal data beyond what's necessary for functionality

### Privacy Guidelines:
- Don't share sensitive personal information
- Don't share confidential business information
- Be aware that conversations may be logged for improvement purposes
- Bots cannot access your private messages with other users

## Future Enhancements

### Planned Features:
- Integration with Regen Registry for real-time credit information
- Enhanced governance proposal assistance
- Multi-language support
- Voice message support
- Integration with calendar and meeting coordination

### How to Request Features:
Submit feature requests through [appropriate channel] with:
- Detailed description of the desired functionality
- Use case explanation
- Priority level and timeline needs

---

## Quick Start Checklist

- [ ] Find the bot handle for the agent you want to interact with
- [ ] Send `/start` to begin the conversation  
- [ ] Ask a specific question related to the bot's expertise
- [ ] Explore different types of questions and topics
- [ ] Join relevant Telegram groups where bots are present
- [ ] Provide feedback on your experience

**Questions?** Contact [support channel] or ask in the main Regen Telegram group.

---

*This guide will be updated as new features and bots are added. Last updated: August 27, 2025*