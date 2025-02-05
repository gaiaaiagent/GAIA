import sqlite3
import os
import sys
from pathlib import Path
import pandas as pd
import sqlite3
from sqlalchemy import create_engine, MetaData, Table
from datetime import datetime

# Display all columns
pd.set_option('display.max_columns', None)
# Display 100 rows
pd.set_option('display.max_rows', 100)

notebook_dir = Path.cwd()  # Gets the current notebook directory
project_root = notebook_dir.parent  # Goes up one level to project root
sys.path.append(str(project_root))

# Define the database path
db_path = project_root / "agent" / "data" / "db.sqlite"

# Create a direct sqlite3 connection first to test
conn = sqlite3.connect(str(db_path))

query_memories = """
SELECT
    memory.id,
    memory.type,
    memory.createdAt,
    json_extract(memory.content, '$.text') as text,
    json_extract(memory.content, '$.url') as url,
    json_extract(memory.content, '$.source') as source,
    memory.embedding,
    memory.userId,
    memory.roomId,
    memory.agentId,
    accounts_a.name as user_name,
    accounts_b.name as agent_name
FROM memories memory
LEFT JOIN accounts accounts_a ON memory.userId = accounts_a.id
LEFT JOIN accounts accounts_b ON memory.agentId = accounts_b.id
"""
df_memories = pd.read_sql_query(query_memories, conn)
df_memories['createdAt'] = pd.to_datetime(df_memories['createdAt'], unit='ms')
df_memories['text_length'] = df_memories['text'].str.len()
df_memories['text_preview'] = df_memories['text'].str.slice(0,50)
# Add source type extracted from URL
df_memories['source_type'] = df_memories['source'].fillna('unknown')
df_memories['hour'] = df_memories['createdAt'].dt.hour
df_memories['day_of_week'] = df_memories['createdAt'].dt.day_name()
df_memories['date'] = df_memories['createdAt'].dt.date
df_memories = df_memories.sort_values('date', ascending=False)

sources = ['echochambers', 'discord', 'twitter']
df_memories = df_memories[df_memories['source'].isin(sources)]


import panel as pn
import param
import pandas as pd
from datetime import datetime
pn.extension()

class RoomExplorer(param.Parameterized):
    room_id = param.Selector()
    agent = param.Selector(objects=list(df_memories['agent_name'].unique()))
    source = param.Selector(objects=sources)

    def __init__(self, df_memories, **params):
        self.df_memories = df_memories
        super().__init__(**params)

    @param.depends('agent', 'source', on_init=True, watch=True)
    def update_room_ids(self):
        filtered_df = self.df_memories[
            (self.df_memories['agent_name'] == self.agent) &
            (self.df_memories['source'] == self.source)
        ]
        self.room_ids = filtered_df['roomId'].unique()
        self.param.room_id.objects = self.room_ids
        try:
            self.room_id = self.room_ids[0]
        except:
            pass

    def get_room_stats(self):
        room_data = self.df_memories[self.df_memories['roomId'] == self.room_id]

        stats = {
           'Source': room_data['source'].iloc[0],
           'Total Memories': len(room_data),
           'Unique Participants': room_data['user_name'].nunique(),
           'Unique Agents': room_data['agent_name'].nunique(),
           'Date Range': f"{room_data['createdAt'].min()} to {room_data['createdAt'].max()}"
        }

        return pn.pane.HTML(f"""
        <div style="padding: 10px; background: #f5f5f5; border-radius: 5px;">
           <h3>Room Statistics</h3>
           {''.join(f'<p><b>{k}:</b> {v}</p>' for k,v in stats.items())}
        </div>
        """)

    def get_messages(self):
        room_data = self.df_memories[self.df_memories['roomId'] == self.room_id]
        room_data = room_data.sort_values('createdAt')

        def row_link_name(row):
            if row['source'] == 'twitter':
                return row['url'].split('/')[3]
            elif row['source'] == 'discord':
                return row['user_name'] or row['agent_name']
            elif row['source'] == 'direct':
                return 'direct'
            else:
                return row['user_name'] or row['agent_name']

        messages_html = ''.join([
           f"""
           <div style="margin: 10px 0; padding: 10px; border: 1px solid #eee;">
               <p><b><a href={row['url']}>{row_link_name(row)}</a></b> at {row['createdAt']} </p>
               <p>{row['text']}</p>
           </div>
           """ for _, row in room_data.iterrows()
        ])
        return pn.pane.HTML(f"<div style='height: calc(100vh - 200px); overflow-y: scroll;'>{messages_html}</div>")

    @param.depends('room_id')
    def view(self):
       if not self.room_id:
           return pn.pane.HTML("Select a room to begin")

       return pn.Column(
           self.get_room_stats(),
           self.get_messages()
       )

# Initialize and display
explorer = RoomExplorer(df_memories)
pn.Row(explorer.param, explorer.view).servable()
