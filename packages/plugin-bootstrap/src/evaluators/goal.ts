import { composeContext } from "@elizaos/core";
import { generateText } from "@elizaos/core";
import { getGoals } from "@elizaos/core";
import { parseJsonArrayFromText } from "@elizaos/core";
import {
    type IAgentRuntime,
    type Memory,
    ModelClass,
    type Objective,
    type Goal,
    type State,
    type Evaluator,
    elizaLogger,
    GoalStatus,
} from "@elizaos/core";

const CREATE_GOAL_REGEX = /\b(?:create|set|make|add|start)\s+(?:a\s+)?(?:new\s+)?goal/i;

const createGoalTemplate = `TASK: Create a new goal based on the conversation.

# INSTRUCTIONS
Create ONE new goal with 2-3 specific, measurable objectives based on the recent conversation.
- Do not modify or reference any existing goals
- Keep objectives clear and achievable
- Focus on what was explicitly mentioned in the conversation

# RECENT MESSAGES
{{recentMessages}}

Response format:
\`\`\`json
[
  {
    "name": "Goal name",
    "objectives": [
      { "description": "First objective" },
      { "description": "Second objective" }
    ]
  }
]
\`\`\``;

const updateGoalTemplate = `TASK: Update existing goals based on new information.

# INSTRUCTIONS
Review the conversation and update the status of existing goals ONLY:
- Only update goals if there is clear evidence of progress
- Mark objectives as completed only when explicitly achieved
- Set goal status to DONE if all objectives are completed
- Set status to FAILED if explicitly cancelled or impossible
- Do not create new goals or objectives
- Do not modify objective descriptions

# CURRENT GOALS
{{goals}}

# RECENT MESSAGES
{{recentMessages}}

Response format:
\`\`\`json
[
  {
    "id": "<existing_goal_id>",
    "status": "IN_PROGRESS" | "DONE" | "FAILED",
    "objectives": [
      { "description": "Exact existing objective text", "completed": true | false }
    ]
  }
]
\`\`\``;

async function handler(
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined,
    options: { [key: string]: unknown } = { onlyInProgress: true }
): Promise<Goal[]> {
    state = (await runtime.composeState(message)) as State;

    // Determine if this is a create or update operation
    const isCreateOperation = CREATE_GOAL_REGEX.test(message.content.text);


    const context = composeContext({
        state,
        template: isCreateOperation ? createGoalTemplate : updateGoalTemplate,
    });

    elizaLogger.debug("Context:", context);

    const response = await generateText({
        runtime,
        context,
        modelClass: ModelClass.SMALL,
    });

    elizaLogger.debug("Response:", response);

    const updates = parseJsonArrayFromText(response);
    elizaLogger.debug("Updates:", updates);

    // Handle both updates and new goals
    const results = [];

    if (isCreateOperation) {
        elizaLogger.debug("Create Operation");
        // Handle new goal creation
        const goalData = updates?.[0];
        if (goalData?.name && Array.isArray(goalData?.objectives)) {
            elizaLogger.debug("Creating Goal: ", goalData.name)
            const newGoal: Goal = {
                roomId: message.roomId,
                userId: runtime.agentId,
                name: goalData.name,
                status: GoalStatus.IN_PROGRESS,
                objectives: goalData.objectives.map(obj => ({
                    description: obj.description,
                    completed: false
                }))
            };

            await runtime.databaseAdapter.createGoal(newGoal);
            results.push(newGoal);
            elizaLogger.debug("Goal Created: ", newGoal)
        }
    } else {
        elizaLogger.debug("Update operation");
        // Handle updates to existing goals
        const goalsData = await getGoals({
            runtime,
            roomId: message.roomId,
            onlyInProgress: options.onlyInProgress as boolean,
        });

        // Process updates for existing goals
        for (const item of updates || []) {
            if (!item?.id) continue;

            const existingGoal = goalsData.find(g => g.id === item.id);
            if (!existingGoal) continue;

            const updatedGoal = {
                ...existingGoal,
                status: item.status || existingGoal.status,
                objectives: existingGoal.objectives.map((objective) => {
                    const updatedObjective = item.objectives?.find(
                        uo => uo.description === objective.description
                    );
                    return updatedObjective ?
                        { ...objective, completed: updatedObjective.completed } :
                        objective;
                })
            };

            const id = updatedGoal.id;
            delete updatedGoal.id;
            await runtime.databaseAdapter.updateGoal({ ...updatedGoal, id });
            results.push({ ...updatedGoal, id });
        }
    }

    return results;
}

export const goalEvaluator: Evaluator = {
    name: "MANAGE_GOALS",
    similes: [
        "UPDATE_GOALS",
        "CREATE_GOAL",
        "EDIT_GOAL",
        "NEW_GOAL",
        "ADD_GOAL",
        "UPDATE_GOAL_STATUS",
        "UPDATE_OBJECTIVES",
    ],
    alwaysRun: true,
    validate: async (
        runtime: IAgentRuntime,
        message: Memory
    ): Promise<boolean> => {
        // Skip if this is the agent's own message
        if (message.userId === runtime.agentId) {
            return false;
        }

        // Validate if we should create a new goal
        if (CREATE_GOAL_REGEX.test(message.content.text)) {
            return true;
        }

        // Or if we should update existing goals
        const goals = await getGoals({
            runtime,
            count: 1,
            onlyInProgress: true,
            roomId: message.roomId,
        });
        return goals.length > 0;
    },
    description:
        "Manage goals by analyzing the conversation to either update existing goals or create new ones based on the context.",
    handler,
    examples: [
        {
            context: `Recent messages:`,
            messages: [
                {
                    user: "{{user1}}",
                    content: {
                        text: "Let's create a goal for improving our documentation",
                    },
                },
                {
                    user: "{{user2}}",
                    content: {
                        text: "We need API docs and user guides",
                    },
                },
            ],
            outcome: `[
        {
          "name": "Documentation Improvement",
          "objectives": [
            { "description": "Create comprehensive API documentation", "completed": false  },
            { "description": "Write end-user guides", "completed": false  }
          ]
        }
      ]`,
        },
        {
            context: `Goals:
- Name: Learn React
  id: abc-123
  Status: IN_PROGRESS
  Objectives:
    - Learn basic components
    - Build a sample project`,
            messages: [
                {
                    user: "{{user1}}",
                    content: {
                        text: "I just finished my first React component!",
                    },
                },
            ],
            outcome: `[
        {
          "id": "abc-123",
          "objectives": [
            { "description": "Learn basic components", "completed": true },
            { "description": "Build a sample project", "completed": false }
          ]
        }
      ]`,
        }
    ],
};
