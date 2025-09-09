#!/bin/bash
echo "Stopping KOI Pipeline services..."
kill 42725 2>/dev/null || true
kill 43276 2>/dev/null || true
kill 43277 2>/dev/null || true
kill 43299 2>/dev/null || true
docker stop koi-postgres-local 2>/dev/null || true
echo "All services stopped."
