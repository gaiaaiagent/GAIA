// __tests__/addOwnerAction.test.ts

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { addOwnerAction } from '../src/actions/addOwnerAction';
import { sepolia } from 'viem/chains';

// Mock Safe protocol kit
vi.mock('@safe-global/protocol-kit', () => {
  return {
    default: {
      init: vi.fn().mockImplementation(({ safeAddress }) => {
        // Mock that only the safe address is a valid safe
        if (safeAddress === '0x1234567890123456789012345678901234567890') {
          return {
            getThreshold: vi.fn().mockResolvedValue(1),
            getOwners: vi.fn().mockResolvedValue(['0xexistingOwner']),
            createEncodedAddOwnerWithThresholdData: vi.fn().mockReturnValue('0xencoded'),
            createTransaction: vi.fn().mockResolvedValue({
              data: { to: '0x', value: '0', data: '0x' }
            }),
            signTransaction: vi.fn().mockResolvedValue({
              data: { to: '0x', value: '0', data: '0x' }
            }),
            executeTransaction: vi.fn().mockResolvedValue({
              transactionResponse: {
                hash: '0xtxhash',
                wait: vi.fn().mockResolvedValue({ status: 'success' })
              }
            })
          };
        } else {
          throw new Error('Not a Safe address');
        }
      })
    }
  };
});

describe('addOwnerAction', () => {
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
        text: 'add 0x742d35Cc6634C0532925a3b844Bc454e4438f44e as owner to safe 0x1234567890123456789012345678901234567890'
      },
      roomId: 'test-room'
    };

    mockCallback = vi.fn();

    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should validate successfully', async () => {
      const result = await addOwnerAction.validate(mockRuntime, mockMessage);
      expect(result).toBe(true);
    });
  });

  describe('action properties', () => {
    it('should have correct action properties', () => {
      expect(addOwnerAction.name).toBe('ADD_SAFE_OWNER');
      expect(addOwnerAction.description).toBeDefined();
      expect(addOwnerAction.description).toContain('Adds a new owner');
      expect(addOwnerAction.examples).toBeDefined();
      expect(Array.isArray(addOwnerAction.examples)).toBe(true);
    });
  });

  describe('handler execution', () => {
    it('should handle successful owner addition', async () => {
      const result = await addOwnerAction.handler(
        mockRuntime,
        mockMessage,
        undefined,
        {},
        mockCallback
      );

      expect(result).toBe(true);
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Successfully added owner'),
          content: expect.objectContaining({
            safeAddress: '0x1234567890123456789012345678901234567890',
            newOwner: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            txHash: '0xtxhash'
          })
        })
      );
    });

    it('should handle missing signer credentials', async () => {
      mockRuntime.getSetting.mockReturnValue(undefined);

      const result = await addOwnerAction.handler(
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

    it('should handle invalid ethereum address in message', async () => {
      mockMessage.content.text = 'add invalid-address as owner to safe another-invalid-address';

      const result = await addOwnerAction.handler(
        mockRuntime,
        mockMessage,
        undefined,
        {},
        mockCallback
      );

      expect(result).toBe(false);
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Please provide both the Safe address and the new owner address'),
          content: expect.objectContaining({
            error: expect.stringContaining('Please provide both the Safe address')
          })
        })
      );
    });
  });
});
