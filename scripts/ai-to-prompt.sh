#!/bin/bash

# Create directories if they don't exist
mkdir -p characters/knowledge/agent/repositories
mkdir -p ./repositories

# Define repository configurations
# Format: "repo_url|refresh|get_markdown|get_python"
# refresh: 0=skip if exists, 1=always refresh
# get_markdown: 0=skip, 1=process
# get_python: 0=skip, 1=process
declare -A repo_configs
repo_configs=(
    ["https://github.com/GaiaNet-AI/awesome-gaia"]="1|1|0"
    ["https://github.com/Farama-Foundation/Gymnasium"]="1|0|1"
    ["https://github.com/openai/openai-cookbook"]="1|1|1"
    ["https://github.com/togethercomputer/together-cookbook"]="1|1|1"
    ["https://github.com/anthropics/anthropic-cookbook"]="1|1|1"
    ["https://github.com/anthropics/courses"]="1|1|1"
    ["https://github.com/ThyrixYang/awesome-artificial-intelligence-research"]="1|1|0"
    ["https://github.com/abilzerian/LLM-Prompt-Library"]="1|1|0"
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

# Function to get config value
get_config_value() {
    local config_string="$1"
    local index="$2"
    echo "$config_string" | cut -d'|' -f"$index"
}

# Process each repository
for repo_url in "${!repo_configs[@]}"; do
    config="${repo_configs[$repo_url]}"
    repo_name=$(get_repo_name "$repo_url")
    repo_path="./repositories/$repo_name"
    echo "Processing $repo_name..."

    # Get configuration values
    refresh=$(get_config_value "$config" 1)
    get_markdown=$(get_config_value "$config" 2)
    get_python=$(get_config_value "$config" 3)

    # Check if repository exists and handle according to refresh setting
    if [ -d "$repo_path" ]; then
        if [ "$refresh" -eq 0 ]; then
            echo "Skipping existing $repo_name directory (refresh=0)..."
            continue
        else
            echo "Removing existing $repo_name directory..."
            rm -rf "$repo_path"
        fi
    fi

    # Clone repository
    echo "Cloning $repo_name..."
    git clone "$repo_url" "$repo_path"

    # Convert notebooks if Python processing is enabled
    if [ "$get_python" -eq 1 ]; then
        echo "Converting notebooks in $repo_name..."
        convert_notebooks "$repo_path"

        # Generate prompts for Python files
        echo "Generating Python prompts for $repo_name..."
        code2prompt "$repo_path" --include "**/*.py" --tokens --output "${repo_name}_python.md" --exclude-from-tree

        # Move Python prompt file to output directory
        mv "${repo_name}_python.md" characters/knowledge/agent/repositories/
    fi

    # Generate prompts for Markdown files if enabled
    if [ "$get_markdown" -eq 1 ]; then
        echo "Generating Markdown prompts for $repo_name..."
        code2prompt "$repo_path" --include "**/*.md" --exclude "*_*.md,*chat*" --tokens --output "${repo_name}_markdown.md" --exclude-from-tree

        # Move Markdown prompt file to output directory
        mv "${repo_name}_markdown.md" characters/knowledge/agent/repositories/
    fi

    echo "Completed processing $repo_name"
    echo "----------------------------------------"
done

echo "All repositories processed successfully."
echo "Generated prompts can be found in characters/knowledge/agent/repositories/"
echo "Repository clones can be found in ./repositories/"
