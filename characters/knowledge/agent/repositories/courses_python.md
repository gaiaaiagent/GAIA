Project Path: courses

Source Tree:

```
courses
├── prompt_evaluations
│   ├── 05_prompt_foo_code_graded_animals
│   │   ├── transform.py
│   │   └── prompts.py
│   ├── 09_custom_model_graded_prompt_foo
│   │   ├── custom_llm_eval.py
│   │   └── prompts.py
│   ├── 06_prompt_foo_code_graded_classification
│   │   └── prompts.py
│   └── 07_prompt_foo_custom_graders
│       └── count.py
└── prompt_engineering_interactive_tutorial
    ├── AmazonBedrock
    │   └── utils
    │       ├── __init__.py
    │       └── hints.py
    └── Anthropic 1P
        └── hints.py

```

`/home/ygg/Workspace/Eliza/GAIA/courses/prompt_evaluations/05_prompt_foo_code_graded_animals/transform.py`:

```py
def get_transform(output, context):
    if "<thinking>" in output:
        try:
            return output.split("<answer>")[1].split("</answer>")[0].strip()
        except Exception as e:
            print(f"Error in get_transform: {e}")
            return output
    return output


```

`/home/ygg/Workspace/Eliza/GAIA/courses/prompt_evaluations/05_prompt_foo_code_graded_animals/prompts.py`:

```py
def simple_prompt(animal_statement):
    return f"""You will be provided a statement about an animal and your job is to determine how many legs that animal has.
    
    Here is the animal statement.
    <animal_statement>{animal_statement}</animal_statement>
    
    How many legs does the animal have? Please respond with a number"""

def better_prompt(animal_statement):
    return f"""You will be provided a statement about an animal and your job is to determine how many legs that animal has.
    
    Here is the animal statement.
    <animal_statement>{animal_statement}</animal_statement>
    
    How many legs does the animal have? Please only respond with a single digit like 2 or 9"""

def chain_of_thought_prompt(animal_statement):
    return f"""You will be provided a statement about an animal and your job is to determine how many legs that animal has.
    
    Here is the animal statement.
    <animal_statement>{animal_statement}</animal_statement>
    
    How many legs does the animal have? 
    Start by reasoning about the numbers of legs the animal has, thinking step by step inside of <thinking> tags.  
    Then, output your final answer inside of <answer> tags. 
    Inside the <answer> tags return just the number of legs as an integer and nothing else."""
```

`/home/ygg/Workspace/Eliza/GAIA/courses/prompt_evaluations/09_custom_model_graded_prompt_foo/custom_llm_eval.py`:

```py
import anthropic
import os
import json

def llm_eval(summary, article):
    """
    Evaluate summary using an LLM (Claude).
    
    Args:
    summary (str): The summary to evaluate.
    article (str): The original text that was summarized.
    
    Returns:
    bool: True if the average score is above the threshold, False otherwise.
    """
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    prompt = f"""Evaluate the following summary based on these criteria:
    1. Conciseness (1-5) - is the summary as concise as possible?
        - Conciseness of 1: The summary is unnecessarily long, including excessive details, repetitions, or irrelevant information. It fails to distill the key points effectively.
        - Conciseness of 3:  The summary captures most key points but could be more focused. It may include some unnecessary details or slightly overexplain certain concepts.
        - Conciseness of 5: The summary effectively condenses the main ideas into a brief, focused text. It includes all essential information without any superfluous details or explanations.
    2. Accuracy (1-5) - is the summary completely accurate based on the initial article'?
        - Accuracy of 1: The summary contains significant errors, misrepresentations, or omissions that fundamentally alter the meaning or key points of the original article.
        - Accuracy of 3:  The summary captures some key points correctly but may have minor inaccuracies or omissions. The overall message is generally correct, but some details may be wrong.
        - Accuracy of 5: The summary faithfully represents the main gist of the original article without any errors or misinterpretations. All included information is correct and aligns with the source material.
    4. Tone (1-5) - is the summary appropriate for a grade school student with no technical training?
        - Tone of 1: The summary uses language or concepts that are too complex, technical, or mature for a grade school audience. It may contain jargon, advanced terminology, or themes that are not suitable for young readers.
        - Tone of 2:  The summary mostly uses language suitable for grade school students but occasionally includes terms or concepts that may be challenging. Some explanations might be needed for full comprehension.
        - Tone of 3: The summary consistently uses simple, clear language that is easily understandable by grade school students. It explains complex ideas in a way that is accessible and engaging for young readers.
    5. Explanation - a general description of the way the summary is evaluated

    <examples>
    <example>
    This summary:
    <summary>
    Artificial neural networks are computer systems inspired by how the human brain works. They are made up of interconnected "neurons" that process information. These networks can learn to do tasks by looking at lots of examples, similar to how humans learn. 

    Some key things about neural networks:
    - They can recognize patterns and make predictions
    - They improve with more data and practice
    - They're used for things like identifying objects in images, translating languages, and playing games

    Neural networks are a powerful tool in artificial intelligence and are behind many of the "smart" technologies we use today. While they can do amazing things, they still aren't as complex or capable as the human brain.
    <summary>
    Should receive a 5 for tone, a 5 for accuracy, and a 5 for conciseness
    </example>

    <example>
    This summary:
    <summary>
    Here is a summary of the key points from the article on artificial neural networks (ANNs):

    1. ANNs are computational models inspired by biological neural networks in animal brains. They consist of interconnected artificial neurons that process and transmit signals.

    2. Basic structure:
    - Input layer receives data
    - Hidden layers process information 
    - Output layer produces results
    - Neurons are connected by weighted edges

    3. Learning process:
    - ANNs learn by adjusting connection weights
    - Use techniques like backpropagation to minimize errors
    - Can perform supervised, unsupervised, and reinforcement learning

    4. Key developments:
    - Convolutional neural networks (CNNs) for image processing
    - Recurrent neural networks (RNNs) for sequential data
    - Deep learning with many hidden layers

    5. Applications:
    - Pattern recognition, classification, regression
    - Computer vision, speech recognition, natural language processing
    - Game playing, robotics, financial modeling

    6. Advantages:
    - Can model complex non-linear relationships
    - Ability to learn and generalize from data
    - Adaptable to many different types of problems

    7. Challenges:
    - Require large amounts of training data
    - Can be computationally intensive
    - "Black box" nature can make interpretability difficult

    8. Recent advances:
    - Improved hardware (GPUs) enabling deeper networks
    - New architectures like transformers for language tasks
    - Progress in areas like generative AI

    The article provides a comprehensive overview of ANN concepts, history, types, applications, and ongoing research areas in this field of artificial intelligence and machine learning.
    </summary>
    Should receive a 1 for tone, a 5 for accuracy, and a 3 for conciseness
    </example>
    </examples>

    Provide a score for each criterion in JSON format. Here is the format you should follow always:

    <json>
    {{
    "conciseness": <number>,
    "accuracy": <number>,
    "tone": <number>,
    "explanation": <string>,
    }}
    </json>


    Original Text: <original_article>{article}</original_article>
    
    Summary to Evaluate: <summary>{summary}</summary>
    """
    
    response = client.messages.create(
        model="claude-3-5-sonnet-20240620",
        max_tokens=1000,
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": prompt
            },
            {
                "role": "assistant",
                "content": "<json>" 
            }
        ],
        stop_sequences=["</json>"]
    )
    
    evaluation = json.loads(response.content[0].text)
    # Filter out non-numeric values and calculate the average
    numeric_values = [value for key, value in evaluation.items() if isinstance(value, (int, float))]
    avg_score = sum(numeric_values) / len(numeric_values)
    # Return the average score and the overall model response
    return avg_score, response.content[0].text

def get_assert(output: str, context, threshold=4.5):
    article = context['vars']['article']
    score, evaluation = llm_eval(output, article )
    return {
        "pass": score >= threshold,
        "score": score,
        "reason": evaluation
    }
    


```

`/home/ygg/Workspace/Eliza/GAIA/courses/prompt_evaluations/09_custom_model_graded_prompt_foo/prompts.py`:

```py
def basic_summarize(article):
  return f"Summarize this article {article}"

def better_summarize(article):
  return f"""
  Summarize this article for a grade-school audience: {article}"""

def best_summarize(article):
  return f"""
  You are tasked with summarizing long wikipedia articles for a grade-school audience.
  Write a short summary, keeping it as concise as possible. 
  The summary is intended for a non-technical, grade-school audience. 
  This is the article: {article}"""


```

`/home/ygg/Workspace/Eliza/GAIA/courses/prompt_evaluations/06_prompt_foo_code_graded_classification/prompts.py`:

```py
def basic_prompt(complaint):
    return f"""
    Classify the following customer complaint into one or more of these categories: 
    Software Bug, Hardware Malfunction, User Error, Feature Request, or Service Outage.
    Only respond with the classification.

    Complaint: {complaint}

    Classification:
    """


def improved_prompt(complaint):
    return f"""
    You are an AI assistant specializing in customer support issue classification. Your task is to analyze customer complaints and categorize them into one or more of the following categories:

    1. Software Bug: Issues related to software not functioning as intended.
    2. Hardware Malfunction: Problems with physical devices or components.
    3. User Error: Difficulties arising from user misunderstanding or misuse.
    4. Feature Request: Suggestions for new functionalities or improvements.
    5. Service Outage: System-wide issues affecting service availability.

    Important Guidelines:
    - A complaint may fall into multiple categories. If so, list all that apply but try to prioritize picking a single category when possible.

    Examples:
    1. Complaint: "The app crashes when I try to save my progress."
    Classification: Software Bug

    2. Complaint: "My keyboard isn't working after I spilled coffee on it."
    Classification: Hardware Malfunction

    3. Complaint: "I can't find the login button on your website."
    Classification: User Error

    4. Complaint: "It would be great if your app had a dark mode."
    Classification: Feature Request

    5. Complaint: "None of your services are loading for me or my colleagues."
    Classification: Service Outage

    6. Complaint "Complaint: The app breaks every time I try to change my profile picture"
    Classification: Software Bug

    7. Complaint "The app is acting buggy on my phone and it seems like your website is down, so I'm completely stuck!"
    Classification: Software Bug, Service Outage

    8. Complaint: "Your software makes my computer super laggy and awful, I hate it!"
    Classification: Software Bug

    9. Complaint: "Your dumb app always breaks when I try to do anything with images."
    Classification: 'Software Bug'

    Now, please classify the following customer complaint:

    <complaint>{complaint}</complaint>

    Only respond with the appropriate categories and nothing else.
    Classification:
    """

```

`/home/ygg/Workspace/Eliza/GAIA/courses/prompt_evaluations/07_prompt_foo_custom_graders/count.py`:

```py
import re

def get_assert(output, context):
    topic = context["vars"]["topic"]
    goal_count = int(context["vars"]["count"])
    pattern = fr'(^|\s)\b{re.escape(topic)}\b'

    actual_count = len(re.findall(pattern, output.lower()))

    pass_result = goal_count == actual_count

    result = {
        "pass": pass_result,
        "score": 1 if pass_result else 0,
        "reason": f"Expected {topic} to appear {goal_count} times. Actual: {actual_count}",
    }
    return result
```

`/home/ygg/Workspace/Eliza/GAIA/courses/prompt_engineering_interactive_tutorial/AmazonBedrock/utils/hints.py`:

```py
exercise_1_1_hint = """The grading function in this exercise is looking for an answer that contains the exact Arabic numerals "1", "2", and "3".
You can often get Claude to do what you want simply by asking."""

exercise_1_2_hint = """The grading function in this exercise is looking for answers that contain "soo" or "giggles".
There are many ways to solve this, just by asking!"""

exercise_2_1_hint ="""The grading function in this exercise is looking for any answer that includes the word "hola".
Ask Claude to reply in Spanish like you would when speaking with a human. It's that simple!"""

exercise_2_2_hint = """The grading function in this exercise is looking for EXACTLY "Michael Jordan".
How would you ask another human to do this? Reply with no other words? Reply with only the name and nothing else? There are several ways to approach this answer."""

exercise_2_3_hint = """The grading function in this cell is looking for a response that is equal to or greater than 800 words.
Because LLMs aren't great at counting words yet, you may have to overshoot your target."""

exercise_3_1_hint = """The grading function in this exercise is looking for an answer that includes the words "incorrect" or "not correct".
Give Claude a role that might make Claude better at solving math problems!"""

exercise_4_1_hint = """The grading function in this exercise is looking for a solution that includes the words "haiku" and "pig".
Don't forget to include the exact phrase "{TOPIC}" wherever you want the topic to be substituted in. Changing the "TOPIC" variable value should make Claude write a haiku about a different topic."""

exercise_4_2_hint = """The grading function in this exercise is looking for a response that includes the word "brown".
If you surround "{QUESTION}" in XML tags, how does that change Claude's response?"""

exercise_4_3_hint = """The grading function in this exercise is looking for a response that includes the word "brown".
Try removing one word or section of characters at a time, starting with the parts that make the least sense. Doing this one word at a time will also help you see just how much Claude can or can't parse and understand."""

exercise_5_1_hint = """The grading function for this exercise is looking for a response that includes the word "Warrior".
Write more words in Claude's voice to steer Claude to act the way you want it to. For instance, instead of "Stephen Curry is the best because," you could write "Stephen Curry is the best and here are three reasons why. 1:"""

exercise_5_2_hint = """The grading function looks for a response of over 5 lines in length that includes the words "cat" and "<haiku>".
Start simple. Currently, the prompt asks Claude for one haiku. You can change that and ask for two (or even more). Then if you run into formatting issues, change your prompt to fix that after you've already gotten Claude to write more than one haiku."""

exercise_5_3_hint = """The grading function in this exercise is looking for a response that contains the words "tail", "cat", and "<haiku>".
It's helpful to break this exercise down to several steps.								
1.	Modify the initial prompt template so that Claude writes two poems.							
2.	Give Claude indicators as to what the poems will be about, but instead of writing in the subjects directly (e.g., dog, cat, etc.), replace those subjects with the keywords "{ANIMAL1}" and "{ANIMAL2}".							
3.	Run the prompt and make sure that the full prompt with variable substitutions has all the words correctly substituted. If not, check to make sure your {bracket} tags are spelled correctly and formatted correctly with single moustache brackets."""

exercise_6_1_hint = """The grading function in this exercise is looking for the correct categorization letter + the closing parentheses and the first letter of the name of the category, such as "C) B" or "B) B" etc.
Let's take this exercise step by step:										
1.	How will Claude know what categories you want to use? Tell it! Include the four categories you want directly in the prompt. Be sure to include the parenthetical letters as well for easy classification. Feel free to use XML tags to organize your prompt and make clear to Claude where the categories begin and end.									
2.	Try to cut down on superfluous text so that Claude immediately answers with the classification and ONLY the classification. There are several ways to do this, from speaking for Claude (providing anything from the beginning of the sentence to a single open parenthesis so that Claude knows you want the parenthetical letter as the first part of the answer) to telling Claude that you want the classification and only the classification, skipping the preamble.
Refer to Chapters 2 and 5 if you want a refresher on these techniques.							
3.	Claude may still be incorrectly categorizing or not including the names of the categories when it answers. Fix this by telling Claude to include the full category name in its answer.)								
4.	Be sure that you still have {email} somewhere in your prompt template so that we can properly substitute in emails for Claude to evaluate."""

exercise_6_1_solution = """
USER TURN
Please classify this email into the following categories: {email}

Do not include any extra words except the category.

<categories>
(A) Pre-sale question
(B) Broken or defective item
(C) Billing question
(D) Other (please explain)
</categories>

ASSISTANT TURN
(
"""

exercise_6_2_hint = """The grading function in this exercise is looking for only the correct letter wrapped in <answer> tags, such as "<answer>B</answer>". The correct categorization letters are the same as in the above exercise.
Sometimes the simplest way to go about this is to give Claude an example of how you want its output to look. Just don't forget to wrap your example in <example></example> tags! And don't forget that if you prefill Claude's response with anything, Claude won't actually output that as part of its response."""

exercise_7_1_hint = """You're going to have to write some example emails and classify them for Claude (with the exact formatting you want). There are multiple ways to do this. Here are some guidelines below.										
1.	Try to have at least two example emails. Claude doesn't need an example for all categories, and the examples don't have to be long. It's more helpful to have examples for whatever you think the trickier categories are (which you were asked to think about at the bottom of Chapter 6 Exercise 1). XML tags will help you separate out your examples from the rest of your prompt, although it's unnecessary.									
2.	Make sure your example answer formatting is exactly the format you want Claude to use, so Claude can emulate the format as well. This format should make it so that Claude's answer ends in the letter of the category. Wherever you put the {email} placeholder, make sure that it's formatted exactly like your example emails.									
3.	Make sure you still have the categories listed within the prompt itself, otherwise Claude won't know what categories to reference, as well as {email} as a placeholder for substitution."""

exercise_7_1_solution = """
USER TURN
Please classify emails into the following categories, and do not include explanations: 
<categories>
(A) Pre-sale question
(B) Broken or defective item
(C) Billing question
(D) Other (please explain)
</categories>

Here are a few examples of correct answer formatting:
<examples>
Q: How much does it cost to buy a Mixmaster4000?
A: The correct category is: A

Q: My Mixmaster won't turn on.
A: The correct category is: B

Q: Please remove me from your mailing list.
A: The correct category is: D
</examples>

Here is the email for you to categorize: {email}

ASSISTANT TURN
The correct category is:
"""
exercise_8_1_hint = """The grading function in this exercise is looking for a response that contains the phrase "I do not", "I don't", or "Unfortunately".
What should Claude do if it doesn't know the answer?"""

exercise_8_2_hint = """The grading function in this exercise is looking for a response that contains the phrase "49-fold".
Make Claude show its work and thought process first by extracting relevant quotes and seeing whether or not the quotes provide sufficient evidence. Refer back to the Chapter 8 Lesson if you want a refresher."""

exercise_9_1_solution = """
You are a master tax acountant. Your task is to answer user questions using any provided reference documentation.

Here is the material you should use to answer the user's question:
<docs>
{TAX_CODE}
</docs>

Here is an example of how to respond:
<example>
<question>
What defines a "qualified" employee?
</question>
<answer>
<quotes>For purposes of this subsection—
(A)In general
The term "qualified employee" means any individual who—
(i)is not an excluded employee, and
(ii)agrees in the election made under this subsection to meet such requirements as are determined by the Secretary to be necessary to ensure that the withholding requirements of the corporation under chapter 24 with respect to the qualified stock are met.</quotes>

<answer>According to the provided documentation, a "qualified employee" is defined as an individual who:

1. Is not an "excluded employee" as defined in the documentation.
2. Agrees to meet the requirements determined by the Secretary to ensure the corporation's withholding requirements under Chapter 24 are met with respect to the qualified stock.</answer>
</example>

First, gather quotes in <quotes></quotes> tags that are relevant to answering the user's question. If there are no quotes, write "no relevant quotes found".

Then insert two paragraph breaks before answering the user question within <answer></answer> tags. Only answer the user's question if you are confident that the quotes in <quotes></quotes> tags support your answer. If not, tell the user that you unfortunately do not have enough information to answer the user's question.

Here is the user question: {QUESTION}
"""

exercise_9_2_solution = """
You are Codebot, a helpful AI assistant who finds issues with code and suggests possible improvements.

Act as a Socratic tutor who helps the user learn.

You will be given some code from a user. Please do the following:
1. Identify any issues in the code. Put each issue inside separate <issues> tags.
2. Invite the user to write a revised version of the code to fix the issue.

Here's an example:

<example>
<code>
def calculate_circle_area(radius):
    return (3.14 * radius) ** 2
</code>
<issues>
<issue>
3.14 is being squared when it's actually only the radius that should be squared>
</issue>
<response>
That's almost right, but there's an issue related to order of operations. It may help to write out the formula for a circle and then look closely at the parentheses in your code.
</response>
</example>

Here is the code you are to analyze:

<code>
{CODE}
</code>

Find the relevant issues and write the Socratic tutor-style response. Do not give the user too much help! Instead, just give them guidance so they can find the correct solution themselves.

Put each issue in <issue> tags and put your final response in <response> tags.
"""

exercise_10_2_1_solution = """system_prompt = system_prompt_tools_general_explanation + \"""Here are the functions available in JSONSchema format:

<tools>

<tool_description>
<tool_name>get_user</tool_name>
<description>
Retrieves a user from the database by their user ID.
</description>
<parameters>
<parameter>
<name>user_id</name>
<type>int</type>
<description>The ID of the user to retrieve.</description>
</parameter>
</parameters>
</tool_description>

<tool_description>
<tool_name>get_product</tool_name>
<description>
Retrieves a product from the database by its product ID.
</description>
<parameters>
<parameter>
<name>product_id</name>
<type>int</type>
<description>The ID of the product to retrieve.</description>
</parameter>
</parameters>
</tool_description>

<tool_description>
<tool_name>add_user</tool_name>
<description>
Adds a new user to the database.
</description>
<parameters>
<parameter>
<name>name</name>
<type>str</type>
<description>The name of the user.</description>
</parameter>
<parameter>
<name>email</name>
<type>str</type>
<description>The email address of the user.</description>
</parameter>
</parameters>
</tool_description>

<tool_description>
<tool_name>add_product</tool_name>
<description>
Adds a new product to the database.
</description>
<parameters>
<parameter>
<name>name</name>
<type>str</type>
<description>The name of the product.</description>
</parameter>
<parameter>
<name>price</name>
<type>float</type>
<description>The price of the product.</description>
</parameter>
</parameters>
</tool_description>

</tools>
"""
```

`/home/ygg/Workspace/Eliza/GAIA/courses/prompt_engineering_interactive_tutorial/Anthropic 1P/hints.py`:

```py
exercise_1_1_hint = """The grading function in this exercise is looking for an answer that contains the exact Arabic numerals "1", "2", and "3".
You can often get Claude to do what you want simply by asking."""

exercise_1_2_hint = """The grading function in this exercise is looking for answers that contain "soo" or "giggles".
There are many ways to solve this, just by asking!"""

exercise_2_1_hint ="""The grading function in this exercise is looking for any answer that includes the word "hola".
Ask Claude to reply in Spanish like you would when speaking with a human. It's that simple!"""

exercise_2_2_hint = """The grading function in this exercise is looking for EXACTLY "Michael Jordan".
How would you ask another human to do this? Reply with no other words? Reply with only the name and nothing else? There are several ways to approach this answer."""

exercise_2_3_hint = """The grading function in this cell is looking for a response that is equal to or greater than 800 words.
Because LLMs aren't great at counting words yet, you may have to overshoot your target."""

exercise_3_1_hint = """The grading function in this exercise is looking for an answer that includes the words "incorrect" or "not correct".
Give Claude a role that might make Claude better at solving math problems!"""

exercise_4_1_hint = """The grading function in this exercise is looking for a solution that includes the words "haiku" and "pig".
Don't forget to include the exact phrase "{TOPIC}" wherever you want the topic to be substituted in. Changing the "TOPIC" variable value should make Claude write a haiku about a different topic."""

exercise_4_2_hint = """The grading function in this exercise is looking for a response that includes the word "brown".
If you surround "{QUESTION}" in XML tags, how does that change Claude's response?"""

exercise_4_3_hint = """The grading function in this exercise is looking for a response that includes the word "brown".
Try removing one word or section of characters at a time, starting with the parts that make the least sense. Doing this one word at a time will also help you see just how much Claude can or can't parse and understand."""

exercise_5_1_hint = """The grading function for this exercise is looking for a response that includes the word "Warrior".
Write more words in Claude's voice to steer Claude to act the way you want it to. For instance, instead of "Stephen Curry is the best because," you could write "Stephen Curry is the best and here are three reasons why. 1:"""

exercise_5_2_hint = """The grading function looks for a response of over 5 lines in length that includes the words "cat" and "<haiku>".
Start simple. Currently, the prompt asks Claude for one haiku. You can change that and ask for two (or even more). Then if you run into formatting issues, change your prompt to fix that after you've already gotten Claude to write more than one haiku."""

exercise_5_3_hint = """The grading function in this exercise is looking for a response that contains the words "tail", "cat", and "<haiku>".
It's helpful to break this exercise down to several steps.								
1.	Modify the initial prompt template so that Claude writes two poems.							
2.	Give Claude indicators as to what the poems will be about, but instead of writing in the subjects directly (e.g., dog, cat, etc.), replace those subjects with the keywords "{ANIMAL1}" and "{ANIMAL2}".							
3.	Run the prompt and make sure that the full prompt with variable substitutions has all the words correctly substituted. If not, check to make sure your {bracket} tags are spelled correctly and formatted correctly with single moustache brackets."""

exercise_6_1_hint = """The grading function in this exercise is looking for the correct categorization letter + the closing parentheses and the first letter of the name of the category, such as "C) B" or "B) B" etc.
Let's take this exercise step by step:										
1.	How will Claude know what categories you want to use? Tell it! Include the four categories you want directly in the prompt. Be sure to include the parenthetical letters as well for easy classification. Feel free to use XML tags to organize your prompt and make clear to Claude where the categories begin and end.									
2.	Try to cut down on superfluous text so that Claude immediately answers with the classification and ONLY the classification. There are several ways to do this, from speaking for Claude (providing anything from the beginning of the sentence to a single open parenthesis so that Claude knows you want the parenthetical letter as the first part of the answer) to telling Claude that you want the classification and only the classification, skipping the preamble.
Refer to Chapters 2 and 5 if you want a refresher on these techniques.							
3.	Claude may still be incorrectly categorizing or not including the names of the categories when it answers. Fix this by telling Claude to include the full category name in its answer.)								
4.	Be sure that you still have {email} somewhere in your prompt template so that we can properly substitute in emails for Claude to evaluate."""

exercise_6_1_solution = """
USER TURN
Please classify this email into the following categories: {email}

Do not include any extra words except the category.

<categories>
(A) Pre-sale question
(B) Broken or defective item
(C) Billing question
(D) Other (please explain)
</categories>

ASSISTANT TURN
(
"""

exercise_6_2_hint = """The grading function in this exercise is looking for only the correct letter wrapped in <answer> tags, such as "<answer>B</answer>". The correct categorization letters are the same as in the above exercise.
Sometimes the simplest way to go about this is to give Claude an example of how you want its output to look. Just don't forget to wrap your example in <example></example> tags! And don't forget that if you prefill Claude's response with anything, Claude won't actually output that as part of its response."""

exercise_7_1_hint = """You're going to have to write some example emails and classify them for Claude (with the exact formatting you want). There are multiple ways to do this. Here are some guidelines below.										
1.	Try to have at least two example emails. Claude doesn't need an example for all categories, and the examples don't have to be long. It's more helpful to have examples for whatever you think the trickier categories are (which you were asked to think about at the bottom of Chapter 6 Exercise 1). XML tags will help you separate out your examples from the rest of your prompt, although it's unnecessary.									
2.	Make sure your example answer formatting is exactly the format you want Claude to use, so Claude can emulate the format as well. This format should make it so that Claude's answer ends in the letter of the category. Wherever you put the {email} placeholder, make sure that it's formatted exactly like your example emails.									
3.	Make sure you still have the categories listed within the prompt itself, otherwise Claude won't know what categories to reference, as well as {email} as a placeholder for substitution."""

exercise_7_1_solution = """
USER TURN
Please classify emails into the following categories, and do not include explanations: 
<categories>
(A) Pre-sale question
(B) Broken or defective item
(C) Billing question
(D) Other (please explain)
</categories>

Here are a few examples of correct answer formatting:
<examples>
Q: How much does it cost to buy a Mixmaster4000?
A: The correct category is: A

Q: My Mixmaster won't turn on.
A: The correct category is: B

Q: Please remove me from your mailing list.
A: The correct category is: D
</examples>

Here is the email for you to categorize: {email}

ASSISTANT TURN
The correct category is:
"""
exercise_8_1_hint = """The grading function in this exercise is looking for a response that contains the phrase "I do not", "I don't", or "Unfortunately".
What should Claude do if it doesn't know the answer?"""

exercise_8_2_hint = """The grading function in this exercise is looking for a response that contains the phrase "49-fold".
Make Claude show its work and thought process first by extracting relevant quotes and seeing whether or not the quotes provide sufficient evidence. Refer back to the Chapter 8 Lesson if you want a refresher."""

exercise_9_1_solution = """
You are a master tax acountant. Your task is to answer user questions using any provided reference documentation.

Here is the material you should use to answer the user's question:
<docs>
{TAX_CODE}
</docs>

Here is an example of how to respond:
<example>
<question>
What defines a "qualified" employee?
</question>
<answer>
<quotes>For purposes of this subsection—
(A)In general
The term "qualified employee" means any individual who—
(i)is not an excluded employee, and
(ii)agrees in the election made under this subsection to meet such requirements as are determined by the Secretary to be necessary to ensure that the withholding requirements of the corporation under chapter 24 with respect to the qualified stock are met.</quotes>

<answer>According to the provided documentation, a "qualified employee" is defined as an individual who:

1. Is not an "excluded employee" as defined in the documentation.
2. Agrees to meet the requirements determined by the Secretary to ensure the corporation's withholding requirements under Chapter 24 are met with respect to the qualified stock.</answer>
</example>

First, gather quotes in <quotes></quotes> tags that are relevant to answering the user's question. If there are no quotes, write "no relevant quotes found".

Then insert two paragraph breaks before answering the user question within <answer></answer> tags. Only answer the user's question if you are confident that the quotes in <quotes></quotes> tags support your answer. If not, tell the user that you unfortunately do not have enough information to answer the user's question.

Here is the user question: {QUESTION}
"""

exercise_9_2_solution = """
You are Codebot, a helpful AI assistant who finds issues with code and suggests possible improvements.

Act as a Socratic tutor who helps the user learn.

You will be given some code from a user. Please do the following:
1. Identify any issues in the code. Put each issue inside separate <issues> tags.
2. Invite the user to write a revised version of the code to fix the issue.

Here's an example:

<example>
<code>
def calculate_circle_area(radius):
    return (3.14 * radius) ** 2
</code>
<issues>
<issue>
3.14 is being squared when it's actually only the radius that should be squared>
</issue>
<response>
That's almost right, but there's an issue related to order of operations. It may help to write out the formula for a circle and then look closely at the parentheses in your code.
</response>
</example>

Here is the code you are to analyze:

<code>
{CODE}
</code>

Find the relevant issues and write the Socratic tutor-style response. Do not give the user too much help! Instead, just give them guidance so they can find the correct solution themselves.

Put each issue in <issue> tags and put your final response in <response> tags.
"""

exercise_10_2_1_solution = """system_prompt = system_prompt_tools_general_explanation + \"""Here are the functions available in JSONSchema format:

<tools>

<tool_description>
<tool_name>get_user</tool_name>
<description>
Retrieves a user from the database by their user ID.
</description>
<parameters>
<parameter>
<name>user_id</name>
<type>int</type>
<description>The ID of the user to retrieve.</description>
</parameter>
</parameters>
</tool_description>

<tool_description>
<tool_name>get_product</tool_name>
<description>
Retrieves a product from the database by its product ID.
</description>
<parameters>
<parameter>
<name>product_id</name>
<type>int</type>
<description>The ID of the product to retrieve.</description>
</parameter>
</parameters>
</tool_description>

<tool_description>
<tool_name>add_user</tool_name>
<description>
Adds a new user to the database.
</description>
<parameters>
<parameter>
<name>name</name>
<type>str</type>
<description>The name of the user.</description>
</parameter>
<parameter>
<name>email</name>
<type>str</type>
<description>The email address of the user.</description>
</parameter>
</parameters>
</tool_description>

<tool_description>
<tool_name>add_product</tool_name>
<description>
Adds a new product to the database.
</description>
<parameters>
<parameter>
<name>name</name>
<type>str</type>
<description>The name of the product.</description>
</parameter>
<parameter>
<name>price</name>
<type>float</type>
<description>The price of the product.</description>
</parameter>
</parameters>
</tool_description>

</tools>
"""
```