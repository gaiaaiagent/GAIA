#!/bin/bash

# Neo4j initial setup script for KOI

echo "Setting up Neo4j for KOI Knowledge Graph..."

# Check if Neo4j is running
if ! curl -s http://localhost:7474 > /dev/null; then
    echo "Neo4j is not running. Starting Neo4j..."
    brew services start neo4j
    sleep 5
fi

# Change password using REST API
echo "Changing Neo4j password..."
curl -X POST http://localhost:7474/user/neo4j/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'neo4j:neo4j' | base64)" \
  -d '{"password": "koi-knowledge-2025"}' 2>/dev/null

if [ $? -eq 0 ]; then
    echo "Password changed successfully!"
else
    echo "Password might already be changed or there was an error."
fi

# Test connection with new password
echo ""
echo "Testing connection with new password..."
echo "RETURN 'KOI Knowledge Graph Ready!' as message;" | cypher-shell -u neo4j -p "koi-knowledge-2025" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Neo4j is configured and ready for KOI!"
else
    echo "⚠️  Could not connect with new password. You may need to set it manually."
    echo "Visit http://localhost:7474 and login with neo4j/neo4j, then change password to: koi-knowledge-2025"
fi

echo ""
echo "Neo4j Web Interface: http://localhost:7474"
echo "Bolt URL: bolt://localhost:7687"
echo "Username: neo4j"
echo "Password: koi-knowledge-2025"