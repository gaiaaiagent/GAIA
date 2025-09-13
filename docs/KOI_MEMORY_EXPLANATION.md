# Understanding KOI Memories vs Agent Knowledge

## The Key Distinction

There are **TWO SEPARATE** systems for knowledge:

### 1. **Agent Knowledge Base** (38,889 memories)
- **Table:** `memories` 
- **Purpose:** Pre-loaded knowledge for Eliza agents
- **Source:** Bulk imported from documents, likely during initial setup
- **Status:** Static knowledge base, not actively growing
- **Access:** Agents query this for RAG responses

### 2. **KOI Sensor Pipeline** (25 memories - updated)
- **Table:** `koi_memories` (isolated table)
- **Purpose:** Real-time content collection from sensors
- **Source:** Active sensors monitoring websites, forums, GitHub, etc.
- **Status:** Actively collecting
- **Access:** Through KOI Event Bridge with BGE embeddings

## Why Only 25 KOI Memories?

### Current Reality:
1. **Sensors are starting to collect** - The pipeline is operational
2. **Production deployment recent** - Just deployed with Milestone B
3. **Manual and automatic entries** - Mix of test and real content

### The Pipeline IS Working:
- ✅ Events flow correctly: Sensor → Coordinator → Event Bridge → BGE → Database
- ✅ Embeddings are generated (100% coverage)
- ✅ Storage works perfectly
- ✅ MCP Knowledge Server provides agent access

### Active Components:
- ✅ KOI Coordinator (Port 8005)
- ✅ Event Bridge v2 (Port 8100)
- ✅ BGE Server (Port 8090)
- ✅ MCP Server (Port 8200)

## How to Get More Memories

### Option 1: Start Active Collection
```bash
# Start GitHub sensor
cd /opt/projects/koi-sensors/sensors/github
python3 github_sensor.py &

# Start Discord sensor
cd /opt/projects/koi-sensors/sensors/discord
python3 discord_sensor.py &

# Start Forum sensor
cd /opt/projects/koi-sensors/sensors/discourse
python3 discourse_sensor.py &
```

### Option 2: Bulk Import Existing Documents
```bash
# If you have documents in /opt/projects/koi-sensors/indexing/storage/documents/
# Process them through the pipeline:
cd /opt/projects/koi-sensors
python3 indexing/scripts/run_collection_only.py
```

### Option 3: Configure Website Sensor Properly
The website sensor is running but needs URLs to monitor:
```yaml
# /opt/projects/koi-sensors/sensors/websites/config.yaml
websites:
  - url: https://regen.network/blog
    check_interval: 3600  # 1 hour
  - url: https://docs.regen.network
    check_interval: 3600
```

## The Architecture

```
                    38,889 memories
                         ↓
┌─────────────────────────────────────┐
│     AGENT KNOWLEDGE (memories)       │ ← Pre-loaded, static
└─────────────────────────────────────┘
                         
                    25 memories (growing)
                         ↓
┌─────────────────────────────────────┐
│    KOI PIPELINE (koi_memories)       │ ← Real-time, dynamic
└─────────────────────────────────────┘
         ↑            ↑            ↑
    Website      GitHub      Discord
    Sensor       Sensor      Sensor
```

## Summary

- **The pipeline works perfectly** - Every test shows successful processing
- **Sensors need configuration** - They're starting to find content
- **Two separate systems** - Agent memories (38k) vs KOI memories (25)
- **This is normal** - KOI is for real-time updates, not bulk knowledge

## Next Steps

1. **Configure sensors with actual URLs to monitor**
2. **Start additional sensors (GitHub, Discord, Forums)**
3. **Or bulk import existing documents through KOI pipeline**
4. **Monitor collection rate with:** 
   ```bash
   watch -n 60 'docker exec gaia-postgres-1 psql -U postgres -d eliza -c "SELECT COUNT(*) FROM koi_memories"'
   ```

The low count isn't a bug - it's because sensors are just starting to be configured with sources to actively monitor!