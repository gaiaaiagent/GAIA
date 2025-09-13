# KOI Pipeline Status - September 13, 2025

## Current Infrastructure Status ✅

The KOI pipeline infrastructure is fully operational with events flowing through all components:

```
Sensors → Coordinator (8005) → Event Bridge (8100) → BGE Server (8090) → PostgreSQL (5433)
   ✅           ✅                    ✅                   ✅                  ✅
```

## Working Components

### KOI Sensors (koi-sensors repo)
- **Website Sensor**: Monitoring docs.regen.network, guides.regen.network, registry.regen.network
- **Medium Sensor**: Processing 10 historical articles from Regen Network Medium
- **Coordinator**: Running on port 8005, receiving events from sensors
- **Status**: Successfully broadcasting events to pipeline

### KOI Processor (koi-processor repo)
- **Event Bridge v2**: Running on port 8100, receiving events from coordinator
- **BGE Server**: Running on port 8090, ready to generate embeddings
- **PostgreSQL**: Running on port 5433 with pgvector extension
- **Status**: All services operational

### UI Integration (GAIA repo)
- **Pipeline Monitor**: Shows service status at https://regen.gaiaai.xyz/koi
- **Nginx Proxy**: Routes /api/koi/coordinator to port 8005
- **Status**: UI correctly displays service health

## Critical Issue: No Content Data ⚠️

While the pipeline infrastructure works perfectly, **sensors are not sending actual content data**:

- Events contain only metadata (RIDs, URLs, timestamps)
- No webpage content or article text is being captured
- Event Bridge reports: "Content too short or empty"
- Database shows: "0 chunks, 0 embeddings"

## What Needs to be Fixed

The sensors need to be enhanced to:

1. **Extract Content**: Actually fetch and parse webpage/article content
2. **Include in Events**: Add content to the KOI event bundles
3. **Process Through Pipeline**: Ensure content gets chunked, embedded, and stored

## How to Start Everything

### On Server
```bash
# Start pipeline services
cd /opt/projects/koi-processor
./start_all_services.sh

# Start sensors (in separate terminal)
cd /opt/projects/koi-sensors
./start_all_sensors.sh

# Monitor
tail -f /opt/projects/koi-processor/logs/*.log
tail -f /tmp/*_sensor.log
```

### For Local Development
```bash
# Clone repositories
git clone https://github.com/gaiaaiagent/koi-sensors.git
git clone https://github.com/gaiaaiagent/koi-processor.git

# Start services locally
# See RECENT_CHANGES.md in each repo for setup instructions
```

## GitHub Repositories

All code is up to date on GitHub:
- https://github.com/gaiaaiagent/koi-sensors (branch: regen-prod)
- https://github.com/gaiaaiagent/koi-processor (branch: main)
- https://github.com/gaiaaiagent/GAIA (branch: regen)

## Next Development Priority

**Fix content extraction in sensors** - This is the only remaining issue preventing the full pipeline from working. Once sensors send actual content, the entire system will process and store it automatically.