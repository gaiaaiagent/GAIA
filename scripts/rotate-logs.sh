#!/bin/bash

# Log rotation for RegenAI agents
LOG_DIR="/home/ygg/Workspace/cognitive-ecosystem/07-projects/16-regen-ai/GAIA/logs"
MAX_SIZE=50M  # Max size before rotation
MAX_AGE=7     # Days to keep old logs

for log in regenai advocate voiceofnature governor narrative; do
    log_file="$LOG_DIR/${log}.log"
    if [ -f "$log_file" ]; then
        size=$(du -sm "$log_file" 2>/dev/null | cut -f1)
        if [ "$size" -gt 50 ]; then
            mv "$log_file" "$log_file.$(date +%Y%m%d_%H%M%S)"
            touch "$log_file"
            echo "Rotated $log.log (was ${size}MB)"
        fi
    fi
done

# Clean old logs
find "$LOG_DIR" -name "*.log.*" -mtime +$MAX_AGE -delete
