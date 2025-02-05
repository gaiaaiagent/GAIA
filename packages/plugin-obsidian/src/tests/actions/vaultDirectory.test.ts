// src/tests/actions/vaultDirectory.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listDirectoryAction } from '../../actions/vaultDirectory';
import { elizaLogger } from "@elizaos/core";
import type { IAgentRuntime } from "@elizaos/core";

// Create mock Obsidian client
const mockObsidianClient = {
    connect: vi.fn(),
    listDirectoryFiles: vi.fn(),
};

// Mock the helper module
vi.mock('../../helper', () => ({
    getObsidian: () => mockObsidianClient
}));

describe('listDirectoryAction', () => {
    let mockRuntime: IAgentRuntime;
    let mockCallback: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockRuntime = {
            logger: elizaLogger,
            getSetting: vi.fn().mockReturnValue('mock-api-key'),
        } as unknown as IAgentRuntime;

        mockCallback = vi.fn();
    });

    describe('validate', () => {
        it('should return true when connection is successful', async () => {
            mockObsidianClient.connect.mockResolvedValue(undefined);
            const result = await listDirectoryAction.validate(mockRuntime);
            expect(result).toBe(true);
        });

        it('should return false when connection fails', async () => {
            mockObsidianClient.connect.mockRejectedValue(new Error('Connection failed'));
            const result = await listDirectoryAction.validate(mockRuntime);
            expect(result).toBe(false);
        });
    });

    describe('handler', () => {
        it('should handle client LIST_DIRECTORY format', async () => {
            mockObsidianClient.listDirectoryFiles.mockResolvedValue(['file1.md', 'file2.md']);

            await listDirectoryAction.handler(
                mockRuntime,
                { content: { text: 'LIST_DIRECTORY mission' } } as any,
                {} as any,
                {},
                mockCallback
            );

            expect(mockObsidianClient.listDirectoryFiles).toHaveBeenCalledWith('mission');

            const callbackArg = mockCallback.mock.calls[0][0];
            expect(callbackArg.metadata.directory).toBe('mission');
        });

        it('should extract directory path from "List directory" command', async () => {
            mockObsidianClient.listDirectoryFiles.mockResolvedValue(['file1.md', 'file2.md']);

            await listDirectoryAction.handler(
                mockRuntime,
                { content: { text: 'List directory mission' } } as any,
                {} as any,
                {},
                mockCallback
            );

            expect(mockObsidianClient.listDirectoryFiles).toHaveBeenCalledWith('mission');
        });

        it('should extract directory path from "Show files in" command', async () => {
            mockObsidianClient.listDirectoryFiles.mockResolvedValue(['file1.md', 'file2.md']);

            await listDirectoryAction.handler(
                mockRuntime,
                { content: { text: 'Show files in mission/subfolder' } } as any,
                {} as any,
                {},
                mockCallback
            );

            expect(mockObsidianClient.listDirectoryFiles).toHaveBeenCalledWith('mission/subfolder');
        });

        it('should extract directory path from "ls" command', async () => {
            mockObsidianClient.listDirectoryFiles.mockResolvedValue(['file1.md', 'file2.md']);

            await listDirectoryAction.handler(
                mockRuntime,
                { content: { text: 'ls mission' } } as any,
                {} as any,
                {},
                mockCallback
            );

            expect(mockObsidianClient.listDirectoryFiles).toHaveBeenCalledWith('mission');
        });

        it('should handle paths with spaces', async () => {
            mockObsidianClient.listDirectoryFiles.mockResolvedValue(['file1.md', 'file2.md']);

            await listDirectoryAction.handler(
                mockRuntime,
                { content: { text: 'List directory mission plans' } } as any,
                {} as any,
                {},
                mockCallback
            );

            expect(mockObsidianClient.listDirectoryFiles).toHaveBeenCalledWith('mission plans');
        });

        it('should handle nested paths', async () => {
            mockObsidianClient.listDirectoryFiles.mockResolvedValue(['file1.md', 'file2.md']);

            await listDirectoryAction.handler(
                mockRuntime,
                { content: { text: 'List directory mission/plans/current' } } as any,
                {} as any,
                {},
                mockCallback
            );

            expect(mockObsidianClient.listDirectoryFiles).toHaveBeenCalledWith('mission/plans/current');
        });

        it('should handle raw directory path', async () => {
            mockObsidianClient.listDirectoryFiles.mockResolvedValue(['file1.md', 'file2.md']);

            await listDirectoryAction.handler(
                mockRuntime,
                { content: { text: 'mission' } } as any,
                {} as any,
                {},
                mockCallback
            );

            expect(mockObsidianClient.listDirectoryFiles).toHaveBeenCalledWith('mission');
        });

        it('should return error when no directory specified', async () => {
            await listDirectoryAction.handler(
                mockRuntime,
                { content: { text: 'List directory' } } as any,
                {} as any,
                {},
                mockCallback
            );

            expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
                text: expect.stringContaining('Directory path is required'),
                error: true
            }));
        });

        it('should format directory listing with proper structure', async () => {
            const mockFiles = ['file1.md', 'file2.md', 'subfolder/file3.md'];
            mockObsidianClient.listDirectoryFiles.mockResolvedValue(mockFiles);

            await listDirectoryAction.handler(
                mockRuntime,
                { content: { text: 'List directory mission' } } as any,
                {} as any,
                {},
                mockCallback
            );

            const callbackArg = mockCallback.mock.calls[0][0];
            expect(callbackArg.text).toContain('Found 3 files');
            expect(callbackArg.metadata.directory).toBe('mission');
            expect(callbackArg.metadata.files).toEqual(mockFiles);
        });

        it('should handle empty directories', async () => {
            mockObsidianClient.listDirectoryFiles.mockResolvedValue([]);

            await listDirectoryAction.handler(
                mockRuntime,
                { content: { text: 'List directory mission' } } as any,
                {} as any,
                {},
                mockCallback
            );

            expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
                text: expect.stringContaining('No files found in the directory'),
            }));
        });

        it('should handle directory listing errors', async () => {
            mockObsidianClient.listDirectoryFiles.mockRejectedValue(new Error('Access denied'));

            await listDirectoryAction.handler(
                mockRuntime,
                { content: { text: 'List directory mission' } } as any,
                {} as any,
                {},
                mockCallback
            );

            expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
                text: expect.stringContaining('Error listing directory'),
                error: true
            }));
        });
    });
});
