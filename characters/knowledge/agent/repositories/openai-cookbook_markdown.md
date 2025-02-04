Project Path: openai-cookbook

Source Tree:

```
openai-cookbook
├── CONTRIBUTING.md
└── README.md

```

`/home/ygg/Workspace/Eliza/GAIA/openai-cookbook/CONTRIBUTING.md`:

```md
# Welcome, AI Chef

The OpenAI Cookbook is a community-driven resource aimed at sharing knowledge in a way that is accessible, engaging, and enriching for all AI builders.

Before contributing, read through the existing issues and pull requests to see if someone else is already working on something similar. That way you can avoid duplicating efforts.

## What makes a good contribution?

Generally, we have found that the best contributions to the Cookbook are **useful**, **novel** or **creative**, or a combination of these.

- **Useful:** Involves concepts or techniques that can be applied broadly and often, and can translate to practical use-cases and solving real-world problems. If you're doing something often, chances are others are too, and having reusable examples to reference can be very helpful.
- **Novel:** Showcases new developments or techniques. Look out for new research on how to best use LLMs, or new models and capabilities in the API.
- **Creative:** Uses LLMs in creative and innovative ways, or combines multiple APIs and tools in novel ways.

Additionally, we strive to maintain a **neutral** tone, and aim for **high quality** writing.

- **Neutral:** Maintains a neutral stance on tools and products. While it's natural to have preferences for particular tools, a good guide avoids over-evangelizing or marketing specific products, ensuring integrity and inclusivity.
- **High quality:** Well structured, clear and complete. Writing good content ensures others can fully benefit from it. See the rubric below for more details on how we assess the quality of submissions to the Cookbook.

## Rubric

To ensure the quality of submissions, we have established a rubric that assesses each contribution on various areas. The purpose of this rating system is to maintain a high standard of quality, relevance, and uniqueness. Each area is rated on a scale from 1 to 4. Contributions that score lower than a 3 in any of the areas will generally be rejected.

We encourage contributors to familiarize themselves with this rubric before writing content. Understanding the criteria not only increases the chances of your contribution being accepted, but also helps in creating a resource that is comprehensive, clear, and beneficial for all users.

For additional advice on writing good documentation, refer to [What Makes Documentation Good](https://cookbook.openai.com/what_makes_documentation_good).

| Criteria     | Description                                                                                         | Score |
| ------------ | --------------------------------------------------------------------------------------------------- | ----- |
| Relevance    | Is the content related to building with OpenAI technologies? Is it useful to others?                |       |
| Uniqueness   | Does the content offer new insights or unique information compared to existing documentation?       |       |
| Clarity      | Is the language easy to understand? Are things well-explained? Is the title clear?                  |       |
| Correctness  | Are the facts, code snippets, and examples correct and reliable? Does everything execute correctly? |       |
| Conciseness  | Is the content concise? Are all details necessary? Can it be made shorter?                          |       |
| Completeness | Is the content thorough and detailed? Are there things that weren’t explained fully?                |       |
| Grammar      | Are there grammatical or spelling errors present?                                                   |       |

### Breakdown

| Criteria     | 4                                             | 3                                         | 2                                             | 1                                          |
| ------------ | --------------------------------------------- | ----------------------------------------- | --------------------------------------------- | ------------------------------------------ |
| Relevance    | Relevant and useful.                          | Relevant but not very useful.             | Tangentially relevant.                        | Not relevant.                              |
| Uniqueness   | Completely unique with fresh insights.        | Unique with minor overlaps.               | Some unique aspects, but significant overlap. | Many similar guides/examples.              |
| Clarity      | Clear language and structure.                 | Clear language, unclear structure.        | Some sections unclear.                        | Confusing and unclear.                     |
| Correctness  | Completely error free.                        | Code works, minor improvements needed.    | Few errors and warnings.                      | Many errors, code doesn't execute.         |
| Conciseness  | Cannot be reduced in any section, or overall. | Mostly short, but could still be reduced. | Some long sections, and/or long overall.      | Very long sections and overall, redundant. |
| Completeness | Complete and detailed.                        | Mostly complete, minor additions needed.  | Lacks some explanations.                      | Missing significant portions.              |
| Grammar      | Perfect grammar.                              | Correct grammar, few typos.               | Some spelling/grammatical errors.             | Numerous spelling/grammatical errors.      |

```

`/home/ygg/Workspace/Eliza/GAIA/openai-cookbook/README.md`:

```md
<a href="https://cookbook.openai.com" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="/images/openai-cookbook-white.png" style="max-width: 100%; width: 400px; margin-bottom: 20px">
    <img alt="OpenAI Cookbook Logo" src="/images/openai-cookbook.png" width="400px">
  </picture>
</a>

<h3></h3>
 
> ✨ Navigate at [cookbook.openai.com](https://cookbook.openai.com)

Example code and guides for accomplishing common tasks with the [OpenAI API](https://platform.openai.com/docs/introduction). To run these examples, you'll need an OpenAI account and associated API key ([create a free account here](https://beta.openai.com/signup)). Set an environment variable called `OPENAI_API_KEY` with your API key. Alternatively, in most IDEs such as Visual Studio Code, you can create an `.env` file at the root of your repo containing `OPENAI_API_KEY=<your API key>`, which will be picked up by the notebooks.

Most code examples are written in Python, though the concepts can be applied in any language.

For other useful tools, guides and courses, check out these [related resources from around the web](https://cookbook.openai.com/related_resources).

## Contributing

The OpenAI Cookbook is a community-driven resource. Whether you're submitting an idea, fixing a typo, adding a new guide, or improving an existing one, your contributions are greatly appreciated!

Before contributing, read through the existing issues and pull requests to see if someone else is already working on something similar. That way you can avoid duplicating efforts.

If there are examples or guides you'd like to see, feel free to suggest them on the [issues page](https://github.com/openai/openai-cookbook/issues).

If you'd like to contribute new content, make sure to read through our [contribution guidelines](/CONTRIBUTING.md). We welcome high-quality submissions of new examples and guides, as long as they meet our criteria and fit within the scope of the cookbook.

The contents of this repo are automatically rendered into [cookbook.openai.com](https://cookbook.openai.com) based on [registry.yaml](/registry.yaml).

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=468576060&machine=basicLinux32gb&location=EastUs)

```