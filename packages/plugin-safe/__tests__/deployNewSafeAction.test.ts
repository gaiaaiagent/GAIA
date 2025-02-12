import { describe, expect, it, vi, beforeEach } from 'vitest';
import { deployNewSafeAction } from '../src/actions/deployNewSafeAction';
import { sepolia } from 'viem/chains';

// Mock external dependencies
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

vi.mock('viem', () => ({
  createPublicClient: vi.fn(() => ({
    getBalance: vi.fn().mockResolvedValue(BigInt(1000000000000000000))
  })),
  createWalletClient: vi.fn(),
  http: vi.fn(),
  formatUnits: vi.fn().mockReturnValue('1.0')
}));

vi.mock('@safe-global/protocol-kit', () => {
  const mockInit = vi.fn().mockResolvedValue({
      createSafeDeploymentTransaction: vi.fn().mockResolvedValue({
        to: '0x123',
        value: '0',
        data: '0x456'
      }),
      getSafeProvider: vi.fn().mockReturnValue({
        getExternalSigner: vi.fn().mockResolvedValue({
          sendTransaction: vi.fn().mockResolvedValue('0xtxhash'),
          waitForTransactionReceipt: vi.fn().mockResolvedValue({
            status: 'success'
          })
        })
      }),
      getAddress: vi.fn().mockResolvedValue('0xsafeAddress'),
      connect: vi.fn().mockResolvedValue({
        isSafeDeployed: vi.fn().mockResolvedValue(true),
        getAddress: vi.fn().mockResolvedValue('0xsafeAddress'),
        getOwners: vi.fn().mockResolvedValue(['0xowner1']),
        getThreshold: vi.fn().mockResolvedValue(1)
      })
    });
  return {
    default: { init: mockInit }
  };
});

describe('deployNewSafeAction', () => {
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
        text: 'deploy a new safe account'
      },
      roomId: 'test-room'
    };

    mockCallback = vi.fn();

    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should validate successfully', async () => {
      const result = await deployNewSafeAction.validate(mockRuntime, mockMessage);
      expect(result).toBe(true);
    });
  });

  describe('action properties', () => {
    it('should have correct action properties', () => {
      expect(deployNewSafeAction.name).toBe('DEPLOY_NEW_SAFE_ACCOUNT');
      expect(deployNewSafeAction.description).toBeDefined();
      expect(deployNewSafeAction.description).toContain('Deploys a new Safe smart account');
      expect(deployNewSafeAction.examples).toBeDefined();
      expect(Array.isArray(deployNewSafeAction.examples)).toBe(true);
    });
  });

  describe('safe deployment', () => {
    it('should handle successful safe deployment', async () => {
      const result = await deployNewSafeAction.handler(
        mockRuntime,
        mockMessage,
        undefined,
        {},
        mockCallback
      );

      expect(result).toBe(true);
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Safe smart account deployed successfully'),
          content: expect.objectContaining({
            safeAddress: '0xsafeAddress',
            txHash: '0xtxhash',
            safeOwners: ['0xowner1'],
            safeThreshold: 1
          })
        })
      );
    });

    it('should handle missing signer credentials', async () => {
      mockRuntime.getSetting.mockReturnValue(undefined);

      const result = await deployNewSafeAction.handler(
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
  });
});
