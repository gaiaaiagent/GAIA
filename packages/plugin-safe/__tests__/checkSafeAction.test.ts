import { describe, expect, it, vi, beforeEach } from 'vitest';
import { checkSafeAction } from '../src/actions/checkSafeAction';
import { sepolia } from 'viem/chains';

// Mock viem/chains
vi.mock('viem/chains', () => ({
  sepolia: {
    id: 11155111,
    name: 'Sepolia',
    network: 'sepolia',
    nativeCurrency: {
      decimals: 18,
      name: 'Sepolia Ether',
      symbol: 'ETH'
    }
  }
}));

// Mock viem
vi.mock('viem', () => ({
  createPublicClient: () => ({
    getBalance: vi.fn().mockResolvedValue(BigInt(1000000000000000000))
  }),
  http: vi.fn()
}));

// Mock Safe Protocol Kit
vi.mock('@safe-global/protocol-kit', () => ({
  default: {
    init: vi.fn().mockImplementation(() => ({
      getAddress: vi.fn().mockResolvedValue('0xpredictedAddress'),
      connect: vi.fn().mockImplementation(() => ({
        isSafeDeployed: vi.fn().mockResolvedValue(true),
        getAddress: vi.fn().mockResolvedValue('0xpredictedAddress'),
        getOwners: vi.fn().mockResolvedValue(['0xowner1']),
        getThreshold: vi.fn().mockResolvedValue(1)
      }))
    }))
  }
}));

describe('checkSafeAction', () => {
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
        text: 'check safe account'
      },
      roomId: 'test-room'
    };

    mockCallback = vi.fn();

    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should validate successfully', async () => {
      const result = await checkSafeAction.validate(mockRuntime, mockMessage);
      expect(result).toBe(true);
    });
  });

  describe('action properties', () => {
    it('should have correct action properties', () => {
      expect(checkSafeAction.name).toBe('CHECK_SAFE_ACCOUNT');
      expect(checkSafeAction.similes).toContain('check safe');
      expect(checkSafeAction.description).toBeDefined();
      expect(checkSafeAction.description).toContain('Checks if the Safe smart account already exists');
      expect(checkSafeAction.examples).toBeDefined();
      expect(Array.isArray(checkSafeAction.examples)).toBe(true);
    });
  });

  describe('safe checking', () => {
    it('should handle existing safe check', async () => {
      const result = await checkSafeAction.handler(
        mockRuntime,
        mockMessage,
        undefined,
        {},
        mockCallback
      );

      expect(result).toBe(true);
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Safe account already exists'),
          content: expect.objectContaining({
            isSafeDeployed: true,
            safeAddress: '0xpredictedAddress',
            safeOwners: ['0xowner1'],
            safeThreshold: 1
          })
        })
      );
    });

    it('should handle missing signer credentials', async () => {
      mockRuntime.getSetting.mockReturnValue(undefined);

      const result = await checkSafeAction.handler(
        mockRuntime,
        mockMessage,
        undefined,
        {},
        mockCallback
      );

      expect(result).toBe(false);
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Missing SIGNER_ADDRESS or SIGNER_PRIVATE_KEY secrets'),
          content: expect.objectContaining({
            error: expect.stringContaining('Missing SIGNER_ADDRESS or SIGNER_PRIVATE_KEY secrets')
          })
        })
      );
    });

    // it('should handle non-deployed safe', async () => {
    //   const Safe = await import('@safe-global/protocol-kit');
    //   Safe.default.init.mockImplementationOnce(() => ({
    //     getAddress: vi.fn().mockResolvedValue('0xpredictedAddress'),
    //     connect: vi.fn().mockImplementation(() => ({
    //       isSafeDeployed: vi.fn().mockResolvedValue(false),
    //       getAddress: vi.fn().mockResolvedValue('0xpredictedAddress')
    //     }))
    //   }));
    //
    //   const result = await checkSafeAction.handler(
    //     mockRuntime,
    //     mockMessage,
    //     undefined,
    //     {},
    //     mockCallback
    //   );
    //
    //   expect(result).toBe(true); // Check completed successfully, even though safe doesn't exist
    //   expect(mockCallback).toHaveBeenCalledWith(
    //     expect.objectContaining({
    //       text: expect.stringContaining('No Safe account deployed at the predicted address'),
    //       content: expect.objectContaining({
    //         isSafeDeployed: false,
    //         safeAddress: '0xpredictedAddress'
    //       })
    //     })
    //   );
    // });

    it('should handle Safe API errors', async () => {
      const Safe = await import('@safe-global/protocol-kit');
      Safe.default.init.mockImplementationOnce(() => ({
        getAddress: vi.fn().mockRejectedValue(new Error('API Error'))
      }));

      const result = await checkSafeAction.handler(
        mockRuntime,
        mockMessage,
        undefined,
        {},
        mockCallback
      );

      expect(result).toBe(false);
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Error checking safe account'),
          content: expect.objectContaining({
            error: expect.stringContaining('API Error')
          })
        })
      );
    });
  });
});
