#!/bin/bash

# Create output directory if it doesn't exist
mkdir -p characters/knowledge/agent/repositories

# Define repositories array
repositories=(
    "https://github.com/GaiaNet-AI/awesome-gaia"
    "https://github.com/Farama-Foundation/Gymnasium"
    "https://github.com/openai/openai-cookbook"
    "https://github.com/togethercomputer/together-cookbook"
    "https://github.com/anthropics/anthropic-cookbook"
    "https://github.com/anthropics/courses"
    "https://github.com/ThyrixYang/awesome-artificial-intelligence-research"
    "https://github.com/abilzerian/LLM-Prompt-Library"
)

# Function to get repository name from URL
get_repo_name() {
    echo "$1" | sed 's|.*/||'
}

# Function to convert notebooks to python
convert_notebooks() {
    local repo_dir="$1"
    find "$repo_dir" -name "*.ipynb" -type f -exec jupyter nbconvert --to python {} \;
}

# Process each repository
for repo_url in "${repositories[@]}"; do
    repo_name=$(get_repo_name "$repo_url")
    echo "Processing $repo_name..."

    # Remove if exists
    if [ -d "$repo_name" ]; then
        echo "Removing existing $repo_name directory..."
        rm -rf "$repo_name"
    fi

    # Clone repository
    echo "Cloning $repo_name..."
    git clone "$repo_url"

    # Convert notebooks if any exist
    echo "Converting notebooks in $repo_name..."
    convert_notebooks "$repo_name"

    # Generate prompts for Python files
    echo "Generating Python prompts for $repo_name..."
    code2prompt "./$repo_name" --include "**/*.py" --tokens --output "${repo_name}_python.md" --exclude-from-tree

    # Generate prompts for Markdown files
    echo "Generating Markdown prompts for $repo_name..."
    code2prompt "./$repo_name" --include "**/*.md" --exclude "*_*.md,*chat*" --tokens --output "${repo_name}_markdown.md" --exclude-from-tree

    # Move generated files to output directory
    echo "Moving prompt files to output directory..."
    mv "${repo_name}_python.md" "${repo_name}_markdown.md" characters/knowledge/agent/repositories/

    echo "Completed processing $repo_name"
    echo "----------------------------------------"
done

echo "All repositories processed successfully."
echo "Generated prompts can be found in characters/knowledge/agent/repositories/"
