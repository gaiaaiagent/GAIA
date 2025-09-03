from rid_lib.core import ORN
from .slack_workspace import SlackWorkspace


class SlackChannel(ORN):
    namespace = "slack.channel"
    
    def __init__(
            self,
            team_id: str,
            channel_id: str,
        ):
        self.team_id = team_id
        self.channel_id = channel_id
            
    @property
    def reference(self):
        return f"{self.team_id}/{self.channel_id}"
    
    @property
    def workspace(self):
        return SlackWorkspace(
            self.team_id
        )
        
    @classmethod
    def from_reference(cls, reference):
        components = reference.split("/")
        if len(components) == 2:
            return cls(*components)
        else:
            raise ValueError("Slack Channel reference must contain two '/'-separated components: '<team_id>/<channel_id>'")