import * as fs from 'fs';
import * as path from 'path';
import Arweave from 'arweave';

/**
 * Interface for upload result
 */
export interface UploadResult {
    path?: string;
    id?: string;
    success: boolean;
    error?: any;
}

/**
 * Interface for manifest upload result
 */
export interface ManifestResult {
    id?: string;
    url?: string;
    success: boolean;
    error?: any;
}

/**
 * Get content type based on file extension
 */
function getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.html') return 'text/html';
    if (ext === '.css') return 'text/css';
    if (ext === '.js') return 'application/javascript';
    if (ext === '.json') return 'application/json';
    if (ext === '.png') return 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
    if (ext === '.gif') return 'image/gif';
    if (ext === '.svg') return 'image/svg+xml';
    if (ext === '.pdf') return 'application/pdf';
    return 'application/octet-stream';
}

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dir: string): string[] {
    const files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...getAllFiles(fullPath));
        } else {
            files.push(fullPath);
        }
    }
    
    return files;
}

/**
 * Upload a single file to Arweave
 */
async function uploadFile(arweave: Arweave, wallet: any, file: string, publicDir: string): Promise<UploadResult> {
    const relativePath = path.relative(publicDir, file);
    const data = fs.readFileSync(file);
    
    try {
        // Create transaction
        const tx = await arweave.createTransaction({ data }, wallet);
        tx.addTag('Content-Type', getContentType(file));
        tx.addTag('App-Name', 'Quartz-Site');
        tx.addTag('Path', relativePath);
        
        // Sign and post transaction
        await arweave.transactions.sign(tx, wallet);
        const response = await arweave.transactions.post(tx);
        
        if (response.status === 200 || response.status === 202) {
            console.log(`Uploaded ${relativePath} as ${tx.id}`);
            return { path: relativePath, id: tx.id, success: true };
        } else {
            console.error(`Failed to upload ${relativePath}: ${response.status}`);
            return { path: relativePath, success: false, error: response.status };
        }
    } catch (error) {
        console.error(`Error uploading ${relativePath}:`, error);
        return { path: relativePath, success: false, error };
    }
}

/**
 * Create and upload a manifest file
 */
async function createAndUploadManifest(arweave: Arweave, wallet: any, txIds: Record<string, string>): Promise<ManifestResult> {
    const indexTxId = txIds['index.html'];
    if (!indexTxId) {
        return { success: false, error: 'index.html not found in uploaded files' };
    }
    
    try {
        // Define the manifest structure with all required properties
        interface ArweaveManifest {
            manifest: string;
            version: string;
            index: { path: string };
            paths: Record<string, { id: string }>;
            fallback?: { id: string };
        }
        
        const manifest: ArweaveManifest = {
            manifest: 'arweave/paths',
            version: '0.2.0',
            index: {
                path: 'index.html'
            },
            paths: {}
        };
        
        // Add all files to the manifest
        for (const [filePath, id] of Object.entries(txIds)) {
            manifest.paths[filePath] = { id };
        }
        
        // Add special handling for paths without extensions
        for (const [filePath, id] of Object.entries(txIds)) {
            if (filePath.endsWith('.html') && filePath !== 'index.html' && filePath !== '404.html') {
                const pathWithoutExtension = filePath.replace(/\.html$/, '');
                if (!manifest.paths[pathWithoutExtension]) {
                    manifest.paths[pathWithoutExtension] = { id };
                }
            }
        }
        
        // Add fallback to index.html for client-side routing
        manifest.fallback = { id: indexTxId };
        
        // Upload manifest
        const manifestTx = await arweave.createTransaction({
            data: JSON.stringify(manifest)
        }, wallet);
        
        manifestTx.addTag('Content-Type', 'application/x.arweave-manifest+json');
        manifestTx.addTag('App-Name', 'Quartz-Site');
        
        await arweave.transactions.sign(manifestTx, wallet);
        const manifestResponse = await arweave.transactions.post(manifestTx);
        
        if (manifestResponse.status === 200 || manifestResponse.status === 202) {
            console.log(`Manifest uploaded as ${manifestTx.id}`);
            console.log(`Site URL: https://arweave.net/${manifestTx.id}`);
            return { 
                id: manifestTx.id, 
                url: `https://arweave.net/${manifestTx.id}`,
                success: true 
            };
        } else {
            console.error(`Failed to upload manifest: ${manifestResponse.status}`);
            return { success: false, error: manifestResponse.status };
        }
    } catch (error) {
        console.error('Error creating and uploading manifest:', error);
        return { success: false, error };
    }
}

/**
 * Upload a site to Arweave
 * @param walletPath Path to the Arweave wallet file
 * @param publicDir Path to the directory containing the files to upload
 * @returns Result of the upload operation
 */
export async function uploadSiteToArweave(walletPath: string, publicDir: string): Promise<ManifestResult> {
    try {
        // Initialize Arweave
        const arweave = Arweave.init({
            host: 'arweave.net',
            port: 443,
            protocol: 'https'
        });

        // Read wallet key file
        const wallet = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
        
        const files = getAllFiles(publicDir);
        console.log(`Found ${files.length} files to upload`);
        
        // Upload each file and store the transaction IDs
        const txIds: Record<string, string> = {};
        for (const file of files) {
            const result = await uploadFile(arweave, wallet, file, publicDir);
            if (result.success && result.path && result.id) {
                txIds[result.path] = result.id;
            }
        }
        
        // Create and upload manifest
        return await createAndUploadManifest(arweave, wallet, txIds);
    } catch (error) {
        console.error('Error uploading site:', error);
        return { success: false, error };
    }
}
