// file: helper/structuredKnowledge.ts

import { embed } from "@elizaos/core";
import { stringToUuid } from "@elizaos/core";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import yaml from "js-yaml";
import type { IAgentRuntime } from "@elizaos/core";

function chunkMarkdownBySection(markdown: string): string[] {
    const tree = unified().use(remarkParse).parse(markdown);
    const sections: string[] = [];
    let currentSection: string[] = [];

    visit(tree, node => {
        if (node.type === "heading") {
            if (currentSection.length > 0) {
                sections.push(currentSection.join("\n"));
                currentSection = [];
            }
        }

        if ("value" in node) {
            currentSection.push((node as any).value);
        }
    });

    if (currentSection.length > 0) {
        sections.push(currentSection.join("\n"));
    }

    return sections;
}

function attachFrontmatterToChunks(frontmatter: any, chunks: string[]): string[] {
    const fmString = frontmatter ? `---\n${yaml.dump(frontmatter)}---\n` : "";
    return chunks.map(chunk => `${fmString}${chunk}`);
}

export async function setStructuredMarkdownKnowledge(
    runtime: IAgentRuntime,
    filePath: string,
    markdown: string,
    frontmatter: Record<string, any> = {},
    knowledgeIdPrefix = "obsidian-"
) {
    const chunks = chunkMarkdownBySection(markdown);
    const embeddedChunks = attachFrontmatterToChunks(frontmatter, chunks);

    const sourceId = `${knowledgeIdPrefix}${filePath}`;

    for (const chunk of embeddedChunks) {
        const embedding = await embed(runtime, chunk);
        await runtime.knowledgeManager.createMemory({
            id: stringToUuid(`${sourceId}-${chunk.slice(0, 32)}`),
            roomId: runtime.agentId,
            agentId: runtime.agentId,
            userId: runtime.agentId,
            createdAt: Date.now(),
            content: {
                source: sourceId,
                text: chunk,
                metadata: {
                    path: filePath,
                    ...frontmatter,
                },
            },
            embedding,
        });
    }
}
