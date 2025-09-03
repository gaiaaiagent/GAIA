from rid_lib.core import ORN


class SlackWorkspace(ORN):
    namespace = "slack.workspace"

    def __init__(
            self,
            team_id: str,
        ):
        self.team_id = team_id
            
    @property
    def reference(self):
        return self.team_id
        
    @classmethod
    def from_reference(cls, reference):
        return cls(reference)