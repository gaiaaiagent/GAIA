#!/bin/bash

# KOI Database Migration Script with Backup
# This script creates a backup before running migrations

set -e  # Exit on error

# Configuration
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5433}"
POSTGRES_DB="${POSTGRES_DB:-eliza}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== KOI Database Migration Script ===${NC}"
echo ""

# Create backup directory if it doesn't exist
BACKUP_DIR="./db-backups"
mkdir -p "$BACKUP_DIR"

# Generate timestamp for backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/eliza_backup_${TIMESTAMP}.sql"

# Step 1: Create database backup
echo -e "${YELLOW}Step 1: Creating database backup...${NC}"
PGPASSWORD=$POSTGRES_PASSWORD pg_dump \
    -h $POSTGRES_HOST \
    -p $POSTGRES_PORT \
    -U $POSTGRES_USER \
    -d $POSTGRES_DB \
    -f "$BACKUP_FILE" \
    --verbose \
    --no-owner \
    --no-acl

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
    echo -e "  Size: $(du -h $BACKUP_FILE | cut -f1)"
else
    echo -e "${RED}✗ Backup failed! Aborting migration.${NC}"
    exit 1
fi

# Step 2: Test database connection
echo ""
echo -e "${YELLOW}Step 2: Testing database connection...${NC}"
PGPASSWORD=$POSTGRES_PASSWORD psql \
    -h $POSTGRES_HOST \
    -p $POSTGRES_PORT \
    -U $POSTGRES_USER \
    -d $POSTGRES_DB \
    -c "SELECT version();" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}✗ Cannot connect to database! Check your settings.${NC}"
    exit 1
fi

# Step 3: Run migrations
echo ""
echo -e "${YELLOW}Step 3: Running migrations...${NC}"

# Check if migrations directory exists
if [ ! -d "./migrations" ]; then
    echo -e "${RED}✗ Migrations directory not found!${NC}"
    exit 1
fi

# Run each migration file in order
for migration in ./migrations/*.sql; do
    if [ -f "$migration" ]; then
        filename=$(basename "$migration")
        echo -e "  Running: $filename"
        
        PGPASSWORD=$POSTGRES_PASSWORD psql \
            -h $POSTGRES_HOST \
            -p $POSTGRES_PORT \
            -U $POSTGRES_USER \
            -d $POSTGRES_DB \
            -f "$migration" \
            --single-transaction \
            -v ON_ERROR_STOP=1
        
        if [ $? -eq 0 ]; then
            echo -e "  ${GREEN}✓ $filename applied successfully${NC}"
        else
            echo -e "  ${RED}✗ $filename failed!${NC}"
            echo -e "${RED}Migration failed. Database has been rolled back.${NC}"
            echo -e "${YELLOW}To restore from backup, run:${NC}"
            echo -e "  PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB < $BACKUP_FILE"
            exit 1
        fi
    fi
done

# Step 4: Verify migration
echo ""
echo -e "${YELLOW}Step 4: Verifying migration...${NC}"
PGPASSWORD=$POSTGRES_PASSWORD psql \
    -h $POSTGRES_HOST \
    -p $POSTGRES_PORT \
    -U $POSTGRES_USER \
    -d $POSTGRES_DB \
    -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agent_knowledge_permissions';" \
    | grep -q "agent_knowledge_permissions"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migration completed successfully!${NC}"
    echo -e "${GREEN}✓ Backup saved at: $BACKUP_FILE${NC}"
    echo ""
    echo -e "${YELLOW}To rollback if needed:${NC}"
    echo -e "  ./rollback-migration.sh $BACKUP_FILE"
else
    echo -e "${RED}✗ Migration verification failed!${NC}"
    exit 1
fi

# Optional: Clean up old backups (keep last 10)
echo ""
echo -e "${YELLOW}Cleaning up old backups (keeping last 10)...${NC}"
cd "$BACKUP_DIR"
ls -t eliza_backup_*.sql 2>/dev/null | tail -n +11 | xargs -r rm
cd - > /dev/null
echo -e "${GREEN}✓ Cleanup complete${NC}"

echo ""
echo -e "${GREEN}=== Migration completed successfully ===${NC}"