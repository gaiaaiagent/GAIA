import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

export type LoadedSchema = {
    id: string;
    type: string;
    label: string;
    description?: string;
    subClassOf?: string;
    properties: Record<string, { range: string; required?: boolean }>;
    raw: any;
    fileName: string;
};

export function loadSchemasFromVault(vaultPath: string): LoadedSchema[] {
    const ontologyPath = path.join(vaultPath, "Ontology");
    if (!fs.existsSync(ontologyPath)) return [];

    const files = fs.readdirSync(ontologyPath).filter(f => f.endsWith('.md'));

    return files.map(file => {
        const filePath = path.join(ontologyPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(content);
        return {
            id: data['@id'],
            type: data['@type'],
            label: data.label,
            description: data.description,
            subClassOf: data.subClassOf,
            properties: data.properties,
            raw: data,
            fileName: file
        };
    });
}
