import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createSafeAction } from '../src/actions/createSafeAction';

// Mock Safe protocol kit using a factory function
vi.mock('@safe-global/protocol-kit', () => {
  return {
    default: {
      init: vi.fn().mockImplementation(() => ({
        getAddress: vi.fn().mockResolvedValue('0xsafeAddress')
      }))
    }
  };
});

describe('createSafeAction', () => {
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
        text: 'create a new safe smart account'
      },
      roomId: 'test-room'
    };

    mockCallback = vi.fn();

    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should validate successfully', async () => {
      const result = await createSafeAction.validate(mockRuntime, mockMessage);
      expect(result).toBe(true);
    });
  });

  describe('action properties', () => {
    it('should have correct action properties', () => {
      expect(createSafeAction.name).toBe('CREATE_SAFE_ACCOUNT');
      expect(createSafeAction.similes).toContain('make a new safe smart account');
      expect(createSafeAction.description).toBeDefined();
      expect(createSafeAction.description).toContain('Creates a new Safe smart account');
      expect(createSafeAction.examples).toBeDefined();
      expect(Array.isArray(createSafeAction.examples)).toBe(true);
    });

    it('should have valid examples', () => {
      createSafeAction.examples.forEach(example => {
        expect(Array.isArray(example)).toBe(true);
        example.forEach(interaction => {
          expect(interaction).toHaveProperty('user');
          expect(interaction).toHaveProperty('content');
        });
      });
    });
  });

  describe('safe creation', () => {
    it('should handle successful safe creation', async () => {
      const result = await createSafeAction.handler(
        mockRuntime,
        mockMessage,
        undefined,
        {},
        mockCallback
      );

      expect(result).toBe(true);
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Safe smart account created successfully'),
          content: expect.objectContaining({
            safeAddress: '0xsafeAddress'
          })
        })
      );
    });

    it('should handle missing signer credentials', async () => {
      mockRuntime.getSetting.mockReturnValue(undefined);

      const result = await createSafeAction.handler(
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

    it('should handle Safe initialization failure', async () => {
      const Safe = await import('@safe-global/protocol-kit');
      Safe.default.init.mockImplementationOnce(() => {
        throw new Error('Failed to initialize Safe');
      });

      const result = await createSafeAction.handler(
        mockRuntime,
        mockMessage,
        undefined,
        {},
        mockCallback
      );

      expect(result).toBe(false);
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Error creating safe account'),
          content: expect.objectContaining({
            error: expect.stringContaining('Failed to initialize Safe')
          })
        })
      );
    });

    it('should handle getAddress failure', async () => {
      const Safe = await import('@safe-global/protocol-kit');
      Safe.default.init.mockImplementationOnce(() => ({
        getAddress: vi.fn().mockRejectedValue(new Error('Failed to get safe address'))
      }));

      const result = await createSafeAction.handler(
        mockRuntime,
        mockMessage,
        undefined,
        {},
        mockCallback
      );

      expect(result).toBe(false);
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Error creating safe account'),
          content: expect.objectContaining({
            error: expect.stringContaining('Failed to get safe address')
          })
        })
      );
    });

    it('should create safe with default threshold of 1', async () => {
      const Safe = await import('@safe-global/protocol-kit');
      await createSafeAction.handler(
        mockRuntime,
        mockMessage,
        undefined,
        {},
        mockCallback
      );

      expect(Safe.default.init).toHaveBeenCalledWith(
        expect.objectContaining({
          predictedSafe: expect.objectContaining({
            safeAccountConfig: expect.objectContaining({
              threshold: 1
            })
          })
        })
      );
    });

    it('should create safe with correct owner address', async () => {
      const Safe = await import('@safe-global/protocol-kit');
      const ownerAddress = '0xsignerAddress';

      await createSafeAction.handler(
        mockRuntime,
        mockMessage,
        undefined,
        {},
        mockCallback
      );

      expect(Safe.default.init).toHaveBeenCalledWith(
        expect.objectContaining({
          predictedSafe: expect.objectContaining({
            safeAccountConfig: expect.objectContaining({
              owners: [ownerAddress]
            })
          })
        })
      );
    });

    it('should use correct safe version and deployment type', async () => {
      const Safe = await import('@safe-global/protocol-kit');
      await createSafeAction.handler(
        mockRuntime,
        mockMessage,
        undefined,
        {},
        mockCallback
      );

      expect(Safe.default.init).toHaveBeenCalledWith(
        expect.objectContaining({
          predictedSafe: expect.objectContaining({
            safeDeploymentConfig: expect.objectContaining({
              safeVersion: '1.4.1',
              deploymentType: 'canonical'
            })
          })
        })
      );
    });

    it('should handle state parameter correctly', async () => {
      const mockState = {
        someState: 'value'
      };

      const result = await createSafeAction.handler(
        mockRuntime,
        mockMessage,
        mockState,
        {},
        mockCallback
      );

      expect(result).toBe(true);
      expect(mockCallback).toHaveBeenCalled();
    });

    it('should handle options parameter correctly', async () => {
      const mockOptions = {
        customOption: 'value'
      };

      const result = await createSafeAction.handler(
        mockRuntime,
        mockMessage,
        undefined,
        mockOptions,
        mockCallback
      );

      expect(result).toBe(true);
      expect(mockCallback).toHaveBeenCalled();
    });
  });
});
