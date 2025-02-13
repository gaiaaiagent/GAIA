// __tests__/listOwnersAction.test.ts

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { listOwnersAction } from '../src/actions/listOwnersAction';
import { sepolia } from 'viem/chains';

// Mock Safe protocol kit
vi.mock('@safe-global/protocol-kit', () => {
  return {
    default: {
      init: vi.fn().mockImplementation(({ safeAddress }) => {
        // Mock that only a specific address is a valid safe
        if (safeAddress === '0x1234567890123456789012345678901234567890') {
          return {
            getThreshold: vi.fn().mockResolvedValue(2),
            getOwners: vi.fn().mockResolvedValue([
              '0xc3C24d9fF87d6d626d33a58CDD33BF55667b2688',
              '0xf223d9c3982983d938614De919433166c601E5E'
            ])
          };
        } else {
          throw new Error('The provided address is not a valid Safe account.');
        }
      })
    }
  };
});

describe('listOwnersAction', () => {
  let mockRuntime;
  let mockMessage;
  let mockCallback;

  beforeEach(() => {
    mockRuntime = {
      getSetting: vi.fn((key) => {
        if (key === 'SIGNER_ADDRESS') return '0xsignerAddress';
        if (key === 'SIGNER_PRIVATE_KEY') return '0xprivateKey';
        return undefined;
      }),
      character: {
        settings: {}
      }
    };

    mockMessage = {
      content: {
        text: 'list owners of safe 0x1234567890123456789012345678901234567890'
      },
      roomId: 'test-room'
    };

    mockCallback = vi.fn();

    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should validate successfully', async () => {
      const result = await listOwnersAction.validate(mockRuntime, mockMessage);
      expect(result).toBe(true);
    });
  });

  describe('action properties', () => {
    it('should have correct action properties', () => {
      expect(listOwnersAction.name).toBe('LIST_SAFE_OWNERS');
      expect(listOwnersAction.description).toBeDefined();
      expect(listOwnersAction.description).toContain('Lists all owners');
      expect(listOwnersAction.examples).toBeDefined();
      expect(Array.isArray(listOwnersAction.examples)).toBe(true);
    });
  });

  describe('handler execution', () => {
    it('should handle successful owners listing', async () => {
      const result = await listOwnersAction.handler(
        mockRuntime,
        mockMessage,
        undefined,
        {},
        mockCallback
      );

      expect(result).toBe(true);
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('has 2 owners (2 signatures required)'),
          content: expect.objectContaining({
            safeAddress: '0x1234567890123456789012345678901234567890',
            owners: [
              '0xc3C24d9fF87d6d626d33a58CDD33BF55667b2688',
              '0xf223d9c3982983d938614De919433166c601E5E'
            ],
            threshold: 2,
            totalOwners: 2
          })
        })
      );
    });

    it('should handle missing signer credentials', async () => {
      mockRuntime.getSetting.mockReturnValue(undefined);

      const result = await listOwnersAction.handler(
        mockRuntime,
        mockMessage,
        undefined,
        {},
        mockCallback
      );

      expect(result).toBe(false);
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Missing SIGNER_ADDRESS'),
          content: expect.objectContaining({
            error: expect.stringContaining('Missing SIGNER_ADDRESS')
          })
        })
      );
    });

    it('should handle invalid safe address', async () => {
      mockMessage.content.text = 'list owners of safe 0xInvalidAddress';

      const result = await listOwnersAction.handler(
        mockRuntime,
        mockMessage,
        undefined,
        {},
        mockCallback
      );

      expect(result).toBe(false);
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Please provide the Safe address'),
          content: expect.objectContaining({
            error: expect.stringContaining('Please provide the Safe address')
          })
        })
      );
    });

    it('should handle non-safe address', async () => {
      mockMessage.content.text = 'list owners of safe 0x0987654321098765432109876543210987654321';

      const result = await listOwnersAction.handler(
        mockRuntime,
        mockMessage,
        undefined,
        {},
        mockCallback
      );

      expect(result).toBe(false);
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('The provided address is not a valid Safe account'),
          content: expect.objectContaining({
            error: expect.stringContaining('The provided address is not a valid Safe account')
          })
        })
      );
    });

    it('should handle address in various message formats', async () => {
      const testCases = [
        'list owners of safe 0x1234567890123456789012345678901234567890',
        'get owners for 0x1234567890123456789012345678901234567890',
        'Can you list all the owners of 0x1234567890123456789012345678901234567890',
        'owners of 0x1234567890123456789012345678901234567890',
        '0x1234567890123456789012345678901234567890 show owners'
      ];

      for (const testMessage of testCases) {
        mockMessage.content.text = testMessage;
        const result = await listOwnersAction.handler(
          mockRuntime,
          mockMessage,
          undefined,
          {},
          mockCallback
        );
        expect(result).toBe(true);
        expect(mockCallback).toHaveBeenLastCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('has 2 owners (2 signatures required)'),
            content: expect.objectContaining({
              totalOwners: 2
            })
          })
        );
      }
    });
  });
});
