#!/bin/bash

# KOI Database Rollback Script
# Restores database from a backup file

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

echo -e "${GREEN}=== KOI Database Rollback Script ===${NC}"
echo ""

# Check if backup file was provided
if [ $# -eq 0 ]; then
    echo -e "${RED}Error: No backup file specified${NC}"
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Available backups:"
    ls -lh ./db-backups/eliza_backup_*.sql 2>/dev/null || echo "  No backups found in ./db-backups/"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}Backup file: $BACKUP_FILE${NC}"
echo -e "Size: $(du -h $BACKUP_FILE | cut -f1)"
echo ""

# Confirm rollback
echo -e "${YELLOW}WARNING: This will restore the database to the state in the backup.${NC}"
echo -e "${YELLOW}All changes made after the backup will be lost!${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}Rollback cancelled.${NC}"
    exit 0
fi

# Test database connection
echo ""
echo -e "${YELLOW}Testing database connection...${NC}"
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

# Create a safety backup before rollback
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SAFETY_BACKUP="./db-backups/eliza_pre_rollback_${TIMESTAMP}.sql"

echo ""
echo -e "${YELLOW}Creating safety backup before rollback...${NC}"
PGPASSWORD=$POSTGRES_PASSWORD pg_dump \
    -h $POSTGRES_HOST \
    -p $POSTGRES_PORT \
    -U $POSTGRES_USER \
    -d $POSTGRES_DB \
    -f "$SAFETY_BACKUP" \
    --verbose \
    --no-owner \
    --no-acl

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Safety backup created: $SAFETY_BACKUP${NC}"
else
    echo -e "${RED}✗ Safety backup failed! Aborting rollback.${NC}"
    exit 1
fi

# Perform rollback
echo ""
echo -e "${YELLOW}Performing rollback...${NC}"

# Drop and recreate the database (cleanest approach)
echo -e "  Dropping existing database..."
PGPASSWORD=$POSTGRES_PASSWORD psql \
    -h $POSTGRES_HOST \
    -p $POSTGRES_PORT \
    -U $POSTGRES_USER \
    -d postgres \
    -c "DROP DATABASE IF EXISTS $POSTGRES_DB;"

echo -e "  Creating fresh database..."
PGPASSWORD=$POSTGRES_PASSWORD psql \
    -h $POSTGRES_HOST \
    -p $POSTGRES_PORT \
    -U $POSTGRES_USER \
    -d postgres \
    -c "CREATE DATABASE $POSTGRES_DB;"

echo -e "  Restoring from backup..."
PGPASSWORD=$POSTGRES_PASSWORD psql \
    -h $POSTGRES_HOST \
    -p $POSTGRES_PORT \
    -U $POSTGRES_USER \
    -d $POSTGRES_DB \
    < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database restored successfully${NC}"
else
    echo -e "${RED}✗ Restore failed!${NC}"
    echo -e "${YELLOW}Attempting to restore safety backup...${NC}"
    
    # Try to restore the safety backup
    PGPASSWORD=$POSTGRES_PASSWORD psql \
        -h $POSTGRES_HOST \
        -p $POSTGRES_PORT \
        -U $POSTGRES_USER \
        -d postgres \
        -c "DROP DATABASE IF EXISTS $POSTGRES_DB;"
    
    PGPASSWORD=$POSTGRES_PASSWORD psql \
        -h $POSTGRES_HOST \
        -p $POSTGRES_PORT \
        -U $POSTGRES_USER \
        -d postgres \
        -c "CREATE DATABASE $POSTGRES_DB;"
    
    PGPASSWORD=$POSTGRES_PASSWORD psql \
        -h $POSTGRES_HOST \
        -p $POSTGRES_PORT \
        -U $POSTGRES_USER \
        -d $POSTGRES_DB \
        < "$SAFETY_BACKUP"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Safety backup restored${NC}"
    else
        echo -e "${RED}✗ CRITICAL: Could not restore database!${NC}"
        echo -e "${RED}Manual intervention required.${NC}"
    fi
    exit 1
fi

# Verify rollback
echo ""
echo -e "${YELLOW}Verifying rollback...${NC}"

# Check if the permissions table exists (it shouldn't after rollback to pre-migration state)
PGPASSWORD=$POSTGRES_PASSWORD psql \
    -h $POSTGRES_HOST \
    -p $POSTGRES_PORT \
    -U $POSTGRES_USER \
    -d $POSTGRES_DB \
    -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agent_knowledge_permissions';" \
    | grep -q "agent_knowledge_permissions"

if [ $? -eq 0 ]; then
    echo -e "${YELLOW}⚠ Permissions table still exists (backup was post-migration)${NC}"
else
    echo -e "${GREEN}✓ Permissions table removed (database is pre-migration state)${NC}"
fi

echo ""
echo -e "${GREEN}=== Rollback completed successfully ===${NC}"
echo -e "${GREEN}Safety backup saved at: $SAFETY_BACKUP${NC}"