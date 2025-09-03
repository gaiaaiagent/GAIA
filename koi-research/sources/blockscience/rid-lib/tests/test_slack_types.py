from rid_lib.core import RID
from rid_lib.types import SlackWorkspace, SlackChannel, SlackMessage, SlackUser


def test_slack_workspace():
    workspace1 = RID.from_string("orn:slack.workspace:TA2E6KPK3")
    workspace2 = SlackWorkspace.from_reference("TA2E6KPK3")
    workspace3 = SlackWorkspace("TA2E6KPK3")
    
    assert workspace1 == workspace2 == workspace3
    assert workspace1.team_id == workspace2.team_id == workspace3.team_id == "TA2E6KPK3"
    
def test_slack_channel():
    channel1 = RID.from_string("orn:slack.channel:TA2E6KPK3/C07BKQX0EVC")
    channel2 = SlackChannel.from_reference("TA2E6KPK3/C07BKQX0EVC")
    channel3 = SlackChannel("TA2E6KPK3", "C07BKQX0EVC")
    
    assert channel1 == channel2 == channel3
    assert channel1.team_id == channel2.team_id == channel3.team_id == "TA2E6KPK3"
    assert channel1.channel_id == channel2.channel_id == channel3.channel_id == "C07BKQX0EVC"
    
def test_slack_message():
    message1 = RID.from_string("orn:slack.message:TA2E6KPK3/C07BKQX0EVC/1721669683.087619")
    message2 = SlackMessage.from_reference("TA2E6KPK3/C07BKQX0EVC/1721669683.087619")
    message3 = SlackMessage("TA2E6KPK3", "C07BKQX0EVC", "1721669683.087619")
    
    assert message1 == message2 == message3
    assert message1.team_id == message2.team_id == message3.team_id == "TA2E6KPK3"
    assert message1.channel_id == message2.channel_id == message3.channel_id == "C07BKQX0EVC"
    assert message1.ts == message2.ts == message3.ts == "1721669683.087619"
    
def test_slack_user():
    user1 = RID.from_string("orn:slack.user:TA2E6KPK3/U04PMMHGERJ")
    user2 = SlackUser.from_reference("TA2E6KPK3/U04PMMHGERJ")
    user3 = SlackUser("TA2E6KPK3", "U04PMMHGERJ")

    assert user1 == user2 == user3
    assert user1.team_id == user2.team_id == user3.team_id == "TA2E6KPK3"
    assert user1.user_id == user2.user_id == user3.user_id == "U04PMMHGERJ"
    