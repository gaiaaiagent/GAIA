#!/bin/bash
echo "packages_to_prompt:"
code2prompt ./ --include "**/packages/**/*.ts"  --tokens --output gaia_code_packages.md --exclude-from-tree
echo "agent_to_prompt:"
code2prompt ./ --include "**/agent/**/*.ts"  --tokens --output gaia_code_agent.md --exclude-from-tree
echo "characters_to_prompt:"
code2prompt ./ --include "**/characters/**/*.json"  --tokens --output gaia_code_characters.md --exclude-from-tree
echo "docs_to_prompt:"
code2prompt ./docs/ --exclude "*_*.md,*chat*" --include "*.md"  --tokens --output gaia_code_docs.md --exclude-from-tree
echo "moving files to characters/knowledge/gaia/code/:"
mv -t characters/knowledge/gaia/code/ gaia_code_agent.md gaia_code_characters.md gaia_code_packages.md gaia_code_docs.md
echo "gaia_to_prompt complete."
