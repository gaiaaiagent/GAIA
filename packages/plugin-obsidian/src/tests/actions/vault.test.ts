// src/tests/actions/vault.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listAllFilesAction } from '../../actions/vault';
import { elizaLogger } from "@elizaos/core";
import type { IAgentRuntime } from "@elizaos/core";

// Create a mock object for Obsidian client
const mockObsidianClient = {
    connect: vi.fn(),
    getAllFiles: vi.fn(),
    listFiles: vi.fn()
};

// Mock the helper module
vi.mock('../../helper', () => ({
    getObsidian: () => mockObsidianClient
}));

describe('listAllFilesAction', () => {
    let mockRuntime: IAgentRuntime;
    let mockCallback: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup mock runtime
        mockRuntime = {
            logger: elizaLogger,
            getSetting: vi.fn().mockReturnValue('mock-api-key'),
        } as unknown as IAgentRuntime;

        // Setup mock callback
        mockCallback = vi.fn();
    });

    describe('validate', () => {
        it('should return true when connection is successful', async () => {
            mockObsidianClient.connect.mockResolvedValue(undefined);
            const result = await listAllFilesAction.validate(mockRuntime);
            expect(result).toBe(true);
            expect(mockObsidianClient.connect).toHaveBeenCalled();
        });

        it('should return false when connection fails', async () => {
            mockObsidianClient.connect.mockRejectedValue(new Error('Connection failed'));
            const result = await listAllFilesAction.validate(mockRuntime);
            expect(result).toBe(false);
        });
    });

    describe('handler', () => {
        it('should handle empty vault correctly', async () => {
            mockObsidianClient.getAllFiles.mockResolvedValue([]);

            await listAllFilesAction.handler(mockRuntime, {} as any, {} as any, {}, mockCallback);

            expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
                text: expect.stringContaining('Found 0 files'),
                metadata: expect.objectContaining({
                    count: 0,
                    files: [],
                })
            }));
        });

        it('should handle flat directory structure', async () => {
            const mockFiles = ['file1.md', 'file2.md', 'file3.txt'];
            mockObsidianClient.getAllFiles.mockResolvedValue(mockFiles);

            await listAllFilesAction.handler(mockRuntime, {} as any, {} as any, {}, mockCallback);

            const callbackArg = mockCallback.mock.calls[0][0];
            expect(callbackArg.metadata.count).toBe(3);
            expect(callbackArg.metadata.files).toEqual(mockFiles);
            expect(callbackArg.text).toContain('Found 3 files');
        });

        it('should handle nested directory structure', async () => {
            const mockFiles = [
                'folder1/file1.md',
                'folder1/subfolder/file2.md',
                'folder2/file3.md'
            ];
            mockObsidianClient.getAllFiles.mockResolvedValue(mockFiles);

            await listAllFilesAction.handler(mockRuntime, {} as any, {} as any, {}, mockCallback);

            const callbackArg = mockCallback.mock.calls[0][0];
            expect(callbackArg.metadata.count).toBe(3);
            expect(callbackArg.text).toContain('📁 folder1');
            expect(callbackArg.text).toContain('📁 folder2');
        });

        it('should handle errors gracefully', async () => {
            mockObsidianClient.getAllFiles.mockRejectedValue(new Error('Failed to get files'));

            await listAllFilesAction.handler(mockRuntime, {} as any, {} as any, {}, mockCallback);

            expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
                text: expect.stringContaining('Error listing files'),
                error: true
            }));
        });

        it('should generate correct statistics', async () => {
            const mockFiles = [
                'docs/note1.md',
                'docs/note2.md',
                'images/pic1.png',
                'readme.txt'
            ];
            mockObsidianClient.getAllFiles.mockResolvedValue(mockFiles);

            await listAllFilesAction.handler(mockRuntime, {} as any, {} as any, {}, mockCallback);

            const callbackArg = mockCallback.mock.calls[0][0];
            expect(callbackArg.metadata.statistics.totalFiles).toBe(4);
            expect(callbackArg.metadata.statistics.byExtension).toEqual({
                'md': 2,
                'png': 1,
                'txt': 1
            });
            expect(callbackArg.metadata.statistics.maxDepth).toBe(1);
        });

        it('should properly handle files at different directory depths', async () => {
            const mockFiles = [
                'root.md',
                'folder1/file1.md',
                'folder1/deep/file2.md',
                'folder1/deep/deeper/file3.md'
            ];
            mockObsidianClient.getAllFiles.mockResolvedValue(mockFiles);

            await listAllFilesAction.handler(mockRuntime, {} as any, {} as any, {}, mockCallback);

            const callbackArg = mockCallback.mock.calls[0][0];
            expect(callbackArg.metadata.statistics.maxDepth).toBe(3);
            expect(callbackArg.text).toContain('📄 root.md');
            expect(callbackArg.text).toContain('📁 folder1');
            expect(callbackArg.text).toContain('📁 deep');
            expect(callbackArg.text).toContain('📁 deeper');
        });
    });
});
