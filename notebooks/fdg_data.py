import json
import sqlite3
import sys
from pathlib import Path
import pandas as pd

notebook_dir = Path.cwd()  # Gets the current notebook directory
project_root = notebook_dir.parent  # Goes up one level to project root
sys.path.append(str(project_root))

# Define the database path
db_path = project_root / "agent" / "data" / "db.sqlite"

conn = sqlite3.connect(db_path)

# Get data
memories = pd.read_sql_query("""
   SELECT memory.id, memory.type, memory.roomId, memory.userId, memory.agentId, 
          a1.name as user_name, a2.name as agent_name
   FROM memories memory
   LEFT JOIN accounts a1 ON memory.userId = a1.id
   LEFT JOIN accounts a2 ON memory.agentId = a2.id
""", conn)

accounts = pd.read_sql("SELECT id, name FROM accounts", conn)
rooms = pd.read_sql("SELECT id FROM rooms", conn)

# Create nodes with labels
nodes = []
for _, m in memories.iterrows():
   nodes.append({"id": m["id"], "type": "memory", "name": m["type"]})
for _, a in accounts.iterrows():
   nodes.append({"id": a["id"], "type": "account", "name": a["name"]})
for _, r in rooms.iterrows():
   nodes.append({"id": r["id"], "type": "room"})

# Create links
links = []
for _, m in memories.iterrows():
   if pd.notna(m["roomId"]):
       links.append({"source": m["id"], "target": m["roomId"]})
   if pd.notna(m["userId"]):
       links.append({"source": m["id"], "target": m["userId"]})
   if pd.notna(m["agentId"]):
       links.append({"source": m["id"], "target": m["agentId"]})

with open('data.json', 'w') as f:
   json.dump({"nodes": nodes, "links": links}, f)