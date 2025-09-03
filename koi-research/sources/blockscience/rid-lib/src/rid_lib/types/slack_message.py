from rid_lib.core import ORN
from .slack_channel import SlackChannel
from .slack_workspace import SlackWorkspace


class SlackMessage(ORN):
    namespace = "slack.message"
    
    def __init__(
            self,
            team_id: str,
            channel_id: str,
            ts: str,
        ):
        self.team_id = team_id
        self.channel_id = channel_id
        self.ts = ts
            
    @property
    def reference(self):
        return f"{self.team_id}/{self.channel_id}/{self.ts}"
    
    @property
    def workspace(self):
        return SlackWorkspace(
            self.team_id
        )
    
    @property
    def channel(self):
        return SlackChannel(
            self.team_id,
            self.channel_id
        )
        
    @classmethod
    def from_reference(cls, reference):
        components = reference.split("/")
        if len(components) == 3:
            return cls(*components)
        else:
            raise ValueError("Slack Message reference must contain three '/'-separated components: '<team_id>/<channel_id>/<ts>'")