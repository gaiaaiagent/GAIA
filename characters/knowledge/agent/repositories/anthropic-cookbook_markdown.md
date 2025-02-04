Project Path: anthropic-cookbook

Source Tree:

```
anthropic-cookbook
├── README.md
├── patterns
│   └── agents
│       └── README.md
└── skills
    ├── contextual-embeddings
    │   └── README.md
    ├── README.md
    ├── classification
    │   ├── evaluation
    │   │   └── README.md
    │   └── README.md
    └── summarization
        ├── evaluation
        │   └── README.md
        └── README.md

```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/README.md`:

```md
# Anthropic Cookbook

The Anthropic Cookbook provides code and guides designed to help developers build with Claude, offering copy-able code snippets that you can easily integrate into your own projects.

## Prerequisites

To make the most of the examples in this cookbook, you'll need an Anthropic API key (sign up for free [here](https://www.anthropic.com)).

While the code examples are primarily written in Python, the concepts can be adapted to any programming language that supports interaction with the Anthropic API.

If you're new to working with the Anthropic API, we recommend starting with our [Anthropic API Fundamentals course](https://github.com/anthropics/courses/tree/master/anthropic_api_fundamentals) to get a solid foundation.

## Explore Further

Looking for more resources to enhance your experience with Claude and AI assistants? Check out these helpful links:

- [Anthropic developer documentation](https://docs.anthropic.com/claude/docs/guide-to-anthropics-prompt-engineering-resources)
- [Anthropic support docs](https://support.anthropic.com)
- [Anthropic Discord community](https://www.anthropic.com/discord)

## Contributing

The Anthropic Cookbook thrives on the contributions of the developer community. We value your input, whether it's submitting an idea, fixing a typo, adding a new guide, or improving an existing one. By contributing, you help make this resource even more valuable for everyone.

To avoid duplication of efforts, please review the existing issues and pull requests before contributing.

If you have ideas for new examples or guides, share them on the [issues page](https://github.com/anthropics/anthropic-cookbook/issues).

## Table of recipes

### Skills
- [Classification](https://github.com/anthropics/anthropic-cookbook/tree/main/skills/classification): Explore techniques for text and data classification using Claude.
- [Retrieval Augmented Generation](https://github.com/anthropics/anthropic-cookbook/tree/main/skills/retrieval_augmented_generation): Learn how to enhance Claude's responses with external knowledge.
- [Summarization](https://github.com/anthropics/anthropic-cookbook/tree/main/skills/summarization): Discover techniques for effective text summarization with Claude.

### Tool Use and Integration
- [Tool use](https://github.com/anthropics/anthropic-cookbook/tree/main/tool_use): Learn how to integrate Claude with external tools and functions to extend its capabilities.
  - [Customer service agent](https://github.com/anthropics/anthropic-cookbook/blob/main/tool_use/customer_service_agent.ipynb)
  - [Calculator integration](https://github.com/anthropics/anthropic-cookbook/blob/main/tool_use/calculator_tool.ipynb)
  - [SQL queries](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/how_to_make_sql_queries.ipynb)

### Third-Party Integrations
- [Retrieval augmented generation](https://github.com/anthropics/anthropic-cookbook/tree/main/third_party): Supplement Claude's knowledge with external data sources.
  - [Vector databases (Pinecone)](https://github.com/anthropics/anthropic-cookbook/blob/main/third_party/Pinecone/rag_using_pinecone.ipynb)
  - [Wikipedia](https://github.com/anthropics/anthropic-cookbook/blob/main/third_party/Wikipedia/wikipedia-search-cookbook.ipynb/)
  - [Web pages](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/read_web_pages_with_haiku.ipynb)
  - [Internet search (Brave)](https://github.com/anthropics/anthropic-cookbook/blob/main/third_party/Brave/web_search_using_brave.ipynb)
- [Embeddings with Voyage AI](https://github.com/anthropics/anthropic-cookbook/blob/main/third_party/VoyageAI/how_to_create_embeddings.md)

### Multimodal Capabilities
- [Vision with Claude](https://github.com/anthropics/anthropic-cookbook/tree/main/multimodal): 
  - [Getting started with images](https://github.com/anthropics/anthropic-cookbook/blob/main/multimodal/getting_started_with_vision.ipynb)
  - [Best practices for vision](https://github.com/anthropics/anthropic-cookbook/blob/main/multimodal/best_practices_for_vision.ipynb)
  - [Interpreting charts and graphs](https://github.com/anthropics/anthropic-cookbook/blob/main/multimodal/reading_charts_graphs_powerpoints.ipynb)
  - [Extracting content from forms](https://github.com/anthropics/anthropic-cookbook/blob/main/multimodal/how_to_transcribe_text.ipynb)
- [Generate images with Claude](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/illustrated_responses.ipynb): Use Claude with Stable Diffusion for image generation.

### Advanced Techniques
- [Sub-agents](https://github.com/anthropics/anthropic-cookbook/blob/main/multimodal/using_sub_agents.ipynb): Learn how to use Haiku as a sub-agent in combination with Opus.
- [Upload PDFs to Claude](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/pdf_upload_summarization.ipynb): Parse and pass PDFs as text to Claude.
- [Automated evaluations](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/building_evals.ipynb): Use Claude to automate the prompt evaluation process.
- [Enable JSON mode](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/how_to_enable_json_mode.ipynb): Ensure consistent JSON output from Claude.
- [Create a moderation filter](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/building_moderation_filter.ipynb): Use Claude to create a content moderation filter for your application.
- [Prompt caching](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/prompt_caching.ipynb): Learn techniques for efficient prompt caching with Claude.

## Additional Resources

- [Anthropic on AWS](https://github.com/aws-samples/anthropic-on-aws): Explore examples and solutions for using Claude on AWS infrastructure.
- [AWS Samples](https://github.com/aws-samples/): A collection of code samples from AWS which can be adapted for use with Claude. Note that some samples may require modification to work optimally with Claude.
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/patterns/agents/README.md`:

```md
# Building Effective Agents Cookbook

Reference implementation for [Building Effective Agents](https://anthropic.com/research/building-effective-agents) by Erik Schluntz and Barry Zhang.

This repository contains example minimal implementations of common agent workflows discussed in the blog:

- Basic Building Blocks
  - Prompt Chaining
  - Routing
  - Multi-LLM Parallelization
- Advanced Workflows
  - Orchestrator-Subagents
  - Evaluator-Optimizer

## Getting Started
See the Jupyter notebooks for detailed examples:

- [Basic Workflows](basic_workflows.ipynb)
- [Evaluator-Optimizer Workflow](evaluator_optimizer.ipynb) 
- [Orchestrator-Workers Workflow](orchestrator_workers.ipynb)
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/contextual-embeddings/README.md`:

```md
# Retrieval Augmented Generation with Contextual Embeddings

Learn how to improve RAG performance using contextual embeddings to add relevant context to each chunk before embedding.

## Contents

- `guide.ipynb`: Main tutorial notebook
- `data/`: Data files for examples and testing
- `evaluation/`: Evaluation scripts using Promptfoo

For evaluation instructions, see `evaluation/README.md`.

```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/README.md`:

```md
# Claude Skills

Welcome to the Skills section of the Anthropic Cookbook! This directory contains a collection of guides that showcase specific skills and capabilities where Claude excels. Each guide provides an in-depth exploration of a particular skill, discussing potential use cases, prompt engineering techniques to optimize results, and approaches for evaluating Claude's performance.

## Guides

- **[Classification with Claude](./classification/guide.ipynb)**: Discover how Claude can revolutionize classification tasks, especially in scenarios with complex business rules and limited training data. This guide walks you through data preparation, prompt engineering with retrieval-augmented generation (RAG), testing, and evaluation.

- **[Retrieval Augmented Generation with Claude](./retrieval_augmented_generation/guide.ipynb)**: Learn how to enhance Claude's capabilities with domain-specific knowledge using RAG. This guide demonstrates how to build a RAG system from scratch, optimize its performance, and create an evaluation suite. You'll learn how techniques like summary indexing and re-ranking can significantly improve precision, recall, and overall accuracy in question-answering tasks.

- **[Retrieval Augmented Generation with Contextual Embeddings](./contextual-embeddings/guide.ipynb)**: Learn how to use a new technique to improve the performance of your RAG system. In traditional RAG, documents are typically split into smaller chunks for efficient retrieval. While this approach works well for many applications, it can lead to problems when individual chunks lack sufficient context. Contextual Embeddings solve this problem by adding relevant context to each chunk before embedding. You'll learn how to use contextual embeddings with semantic search, BM25 search, and reranking to improve performance.

- **[Summarization with Claude](./summarization/guide.ipynb)**: Explore Claude's ability to summarize and synthesize information from multiple sources. This guide covers a variety of summarization techniques, including multi-shot, domain-based, and chunking methods, as well as strategies for handling long-form content and multiple documents. We also explore evaluating summaries, which can be a balance of art, subjectivity, and the right approach!

- **[Text-to-SQL with Claude](./text_to_sql/guide.ipynb)**: This guide covers how to generate complex SQL queries from natural language using prompting techniques, self-improvement, and RAG. We'll also explore how to evaluate and improve the accuracy of generated SQL queries, with evals that test for syntax, data correctness, row count, and more.

## Getting Started

To get started with the Skills guides, simply navigate to the desired guide's directory and follow the instructions provided in the `guide.ipynb` file. Each guide is self-contained and includes all the necessary code, data, and evaluation scripts to reproduce the examples and experiments.
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/classification/evaluation/README.md`:

```md
# Evaluations with Promptfoo



### Pre-requisities 
To use Promptfoo you will need to have node.js & npm installed on your system. For more information follow [this guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)  

You can install promptfoo using npm or run it directly using npx. In this guide we will use npx.  

*Note: For this example you will not need to run `npx promptfoo@latest init` there is already an initialized `promptfooconfig.yaml` file in this directory*  

See the official docs [here](https://www.promptfoo.dev/docs/getting-started)  



### Getting Started
The evaluation is orchestrated by the `promptfooconfig.yaml` file. In this file we define the following sections:

- Prompts
    - Promptfoo enables you to import prompts in many different formats. You can read more about this [here](https://www.promptfoo.dev/docs/configuration/parameters).
    - In this example we will load 3 prompts - the same used in `guide.ipynb` from the `prompts.py` file:
        - The functions are identical to those used in `guide.ipynb` except that instead of calling the Anthropic API they just return the prompt. Promptfoo then handles the orchestration of calling the API and storing the results.
        - You can read more about prompt functions [here](https://www.promptfoo.dev/docs/configuration/parameters#prompt-functions). Using python allows us to reuse the VectorDB class which is necessary for RAG, this is defined in `vectordb.py`.
- Providers
    - With Promptfoo you can connect to many different LLMs from different platforms, see [here for more](https://www.promptfoo.dev/docs/providers). In `guide.ipynb` we used Haiku with default temperature 0.0. We will use Promptfoo to experiment with an array of different temperature settings to identify the optimal choice for our use case.
- Tests
    - We will use the same data that was used in `guide.ipynb` which can be found in this [Google Sheet](https://docs.google.com/spreadsheets/d/1UwbrWCWsTFGVshyOfY2ywtf5BEt7pUcJEGYZDkfkufU/edit#gid=0).
    - Promptfoo has a wide array of built in tests which can be found [here](https://www.promptfoo.dev/docs/configuration/expected-outputs/deterministic).
    - In this example we will define a test in our `dataset.csv` as the conditions of our evaluation change with each row and a test in the `promptfooconfig.yaml` for conditions that are consistent across all test cases. Read more about this [here](https://www.promptfoo.dev/docs/configuration/parameters/#import-from-csv)
- Transform
    - In the `defaultTest` section we define a transform function. This is a python function which extracts the specific output we want to test from the LLM response. 
- Output
    - We define the path for the output file. Promptfoo can output results in many formats, [see here](https://www.promptfoo.dev/docs/configuration/parameters/#output-file). Alternatively you can use Promptfoo's web UI, [see here](https://www.promptfoo.dev/docs/usage/web-ui).


### Run the eval

To get started with Promptfoo open your terminal and navigate to this directory (`./evaluation`).

Before running your evaluation you must define the following environment variables:

`export ANTHROPIC_API_KEY=YOUR_API_KEY`  
`export VOYAGE_API_KEY=YOUR_API_KEY`

From the `evaluation` directory, run the following command.  

`npx promptfoo@latest eval`

If you would like to increase the concurrency of the requests (default = 4), run the following command.  

`npx promptfoo@latest eval -j 25`  

When the evaluation is complete the terminal will print the results for each row in the dataset.

You can now go back to `guide.ipynb` to analyze the results!



```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/classification/README.md`:

```md
# Classification with Claude

Learn how to use Claude for classification tasks, especially in scenarios with complex business rules and limited training data.

## Contents

- `guide.ipynb`: Main tutorial notebook
- `data/`: Data files for examples and testing
- `evaluation/`: Evaluation scripts using Promptfoo

For evaluation instructions, see `evaluation/README.md`.

```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/summarization/evaluation/README.md`:

```md

# Evaluations with Promptfoo

### A Note on This Evaluation Suite

1) Be sure to follow the instructions below - specifically the pre-requisites about required packages.

2) Running the full eval suite may require higher than normal rate limits. Consider only running a subset of tests in promptfoo.

3) Not every test will pass out of the box - we've designed the evaluation to be moderately challenging.

### Pre-requisities 
To use Promptfoo you will need to have node.js & npm installed on your system. For more information follow [this guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)  

You can install promptfoo using npm or run it directly using npx. In this guide we will use npx.  

*Note: For this example you will not need to run `npx promptfoo@latest init` there is already an initialized `promptfooconfig.yaml` file in this directory*  

See the official docs [here](https://www.promptfoo.dev/docs/getting-started)  

#### NOTE - Additional Deps
For this example you will need to install the following dependencies in order for our custom_evals to run properly.

`pip install nltk rouge-score`

### Getting Started

To get started, set your ANTHROPIC_API_KEY environment variable, or other required keys for the providers you selected. You can do `export ANTHROPIC_API_KEY=YOUR_API_KEY`.

Then, `cd` into the `evaluation` directory and write `npx promptfoo@latest eval -c promptfooconfig.yaml --output ../data/results.csv`

Afterwards, you can view the results by running `npx promptfoo@latest view`.

### How it Works

The promptfooconfig.yaml file is the heart of our evaluation setup. It defines several crucial sections:

Prompts:
- Prompts are imported from the prompts.py file.
- These prompts are designed to test various aspects of LM performance.


Providers:
- We configure different Claude versions and their settings here.
- This allows us to test across multiple models or with varying parameters (e.g., different temperature settings).


Tests:
- Test cases are defined either in this file, or in this case imported from tests.yaml.
- These tests specify the inputs and expected outputs for our evaluations.
- Promptfoo offers various built-in test types (see docs), or you can define your own. We have 3 custom evaluations and 1 out of the box (contains method):
    - `bleu_eval.py`: Implements the BLEU (Bilingual Evaluation Understudy) score, which measures the similarity between machine-generated text and reference texts.
    - `rouge_eval.py`: Implements the ROUGE (Recall-Oriented Understudy for Gisting Evaluation) score, which assesses the quality of summarization by comparing it to reference summaries.
    - `llm_eval.py`: Contains custom evaluation metrics that leverage Language Models to assess various aspects of generated text, such as coherence, relevance, or factual accuracy.

Output:
- Specifies the format and location of evaluation results.
- Promptfoo supports various output formats too!

### Overriding the Python binary

By default, promptfoo will run python in your shell. Make sure python points to the appropriate executable.

If a python binary is not present, you will see a "python: command not found" error.

To override the Python binary, set the PROMPTFOO_PYTHON environment variable. You may set it to a path (such as /path/to/python3.11) or just an executable in your PATH (such as python3.11).
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/summarization/README.md`:

```md
# Summarization with Claude

Explore Claude's ability to summarize and synthesize information from multiple sources using various techniques.

## Contents

- `guide.ipynb`: Main tutorial notebook
- `data/`: Data files for examples and testing
- `evaluation/`: Evaluation scripts using Promptfoo

For evaluation instructions, see `evaluation/README.md`.

```