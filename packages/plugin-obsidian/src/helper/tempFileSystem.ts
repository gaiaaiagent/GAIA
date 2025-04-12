import { elizaLogger } from "@elizaos/core";

/**
 * A simple in-memory temporary file system for storing and retrieving files
 * This is used as a replacement for runtime.fileSystem which is not available
 */
class TempFileSystem {
    private tempData: Map<string, string> = new Map();
    
    /**
     * Writes content to a temporary file and returns an ID that can be used to retrieve it
     * @param filename - Name of the temporary file (used for ID generation)
     * @param content - Content to store
     * @returns Temporary file ID that can be used to retrieve the content
     */
    async writeTempFile(filename: string, content: string): Promise<string> {
        const tempId = `temp_${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        this.tempData.set(tempId, content);
        elizaLogger.debug(`Wrote temporary file: ${tempId} (${content.length} bytes)`);
        return tempId;
    }
    
    /**
     * Reads content from a temporary file
     * @param tempId - Temporary file ID returned from writeTempFile
     * @returns The content of the temporary file, or null if not found
     */
    async readTempFile(tempId: string): Promise<string | null> {
        const content = this.tempData.get(tempId);
        if (!content) {
            elizaLogger.debug(`Temporary file not found: ${tempId}`);
            return null;
        }
        elizaLogger.debug(`Read temporary file: ${tempId} (${content.length} bytes)`);
        return content;
    }
    
    /**
     * Deletes a temporary file
     * @param tempId - Temporary file ID returned from writeTempFile
     * @returns True if the file was deleted, false if it wasn't found
     */
    async deleteTempFile(tempId: string): Promise<boolean> {
        const deleted = this.tempData.delete(tempId);
        if (deleted) {
            elizaLogger.debug(`Deleted temporary file: ${tempId}`);
        } else {
            elizaLogger.debug(`Failed to delete temporary file (not found): ${tempId}`);
        }
        return deleted;
    }
    
    /**
     * Lists all temporary files
     * @returns Array of temporary file IDs
     */
    listTempFiles(): string[] {
        return Array.from(this.tempData.keys());
    }
    
    /**
     * Clears all temporary files
     */
    clearAll(): void {
        const count = this.tempData.size;
        this.tempData.clear();
        elizaLogger.debug(`Cleared all temporary files (${count} files)`);
    }
}

// Create a singleton instance of the file system
let tempFileSystem: TempFileSystem | null = null;

/**
 * Gets the singleton instance of the temporary file system
 * @returns TempFileSystem instance
 */
export function getTempFileSystem(): TempFileSystem {
    if (!tempFileSystem) {
        tempFileSystem = new TempFileSystem();
        elizaLogger.debug("Created new TempFileSystem instance");
    }
    return tempFileSystem;
}