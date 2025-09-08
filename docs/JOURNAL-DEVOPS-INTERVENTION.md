# DevOps Intervention Journal Entry
**Date: September 7, 2025**
**Location: Production Server (202.61.196.119)**

## The Turning Point

OK yeah we are reaching a point right now were devops is the most critical function. It's time to work towards a guarantee on stability. Right now, we are on the production server. This is where the agents need to be supremely stable. This project needs a bit of an intervention. We need to start codifying good practices into our workflows. So we begin now, slowly. 

I'm wondering, what are all these changed files? We will have to get to a clean slate here and push so that we can pull down into our local development branch on my pc to start development there and we need to move away from making all these changes on the server. There should be sufficient stability to the point where we can push to deploy with github workflows. And we will have a production branch, a dev branch, and feature branches. This must be codified into our DNA in CLAUDE.md or by using things like claude commands and subagents. 

Can you please write these notes verbatim as a journal entry and then let's gracefully work through getting our environment cleaned up here so that we can push from here and stop devving on the server once and for all. I'm totally not sure about the mcp stuff, it's a bit of a nightmare, and we don't need those three files we created above, just the systemd one would be good, there might be other files that we don't necessarily need but we also have to be super careful.

## The Reality Check

This moment represents a critical juncture in the RegenAI project. We've been operating in "cowboy mode" - making changes directly on production, mixing development with deployment, and lacking proper version control workflows. This ends today.

## What Needs to Change

1. **No more development on production server** - This server should only receive tested, stable deployments
2. **Proper git branching strategy** - production, dev, and feature branches
3. **GitHub Actions for deployment** - Automated, tested deployments only
4. **Clean working tree** - No uncommitted changes on production
5. **Codified practices in CLAUDE.md** - Make good DevOps part of our DNA

## Immediate Actions Required

1. Clean up the current working directory
2. Identify and remove unnecessary files (keeping only systemd setup)
3. Commit all necessary changes
4. Push to repository
5. Set up local development environment
6. Establish deployment pipeline

## The MCP Situation

The MCP (Model Context Protocol) servers situation has become a nightmare. We need to evaluate whether these are actually necessary for production stability or if they're adding complexity without value.

## Files to Keep vs Remove

**Keep:**
- systemd service configuration (essential for stability)
- Any production-critical configurations

**Remove:**
- docker-compose.agents.yaml (unnecessary complexity)
- monitor-agents.sh (cron-based, less reliable than systemd)
- setup-auto-restart.md (document in proper ops guide instead)
- Any experimental MCP configurations

## The Path Forward

This is not just about cleaning up files. This is about establishing professional DevOps practices that will ensure the RegenAI agents can serve their purpose reliably. Every minute of downtime is a missed opportunity for regenerative impact.

We commit to:
- Stability over features
- Process over improvisation  
- Documentation over tribal knowledge
- Automation over manual intervention

The intervention starts now.