#!/bin/bash
code2prompt ./ --include "**/packages/**/*.ts"  --tokens --output gaia_code_packages.md
code2prompt ./ --include "**/agent/**/*.ts"  --tokens --output gaia_code_agent.md
code2prompt ./ --include "**/characters/**/*.json"  --tokens --output gaia_code_characters.md
mv -t characters/knowledge/gaia/code/ gaia_code_agent.md gaia_code_characters.md gaia_code_packages.md
