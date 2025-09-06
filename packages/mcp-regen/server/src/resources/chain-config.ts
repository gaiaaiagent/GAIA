import { Tendermint34Client } from '@cosmjs/tendermint-rpc';

type ChainConfig = {
  rpcEndpoint: string;
  chainId: string;
  denomination: string;
  bech32Prefix: string;
  blockExplorerUrl?: string;
};

/**
 * Retrieves the chain configuration and node status for a given URI.
 * @param uri - The resource URI
 */
export async function getChainConfig(uri: { href: string }) {
  const defaultConfig: ChainConfig = {
    rpcEndpoint: 'https://regen-rpc.polkachu.com',
    chainId: 'regen-1',
    denomination: 'uregen',
    bech32Prefix: 'regen',
    blockExplorerUrl: 'https://regen.aneka.io',
  };

  try {
    const client = await Tendermint34Client.connect(defaultConfig.rpcEndpoint);
    const status = await client.status();

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              ...defaultConfig,
              nodeInfo: status.nodeInfo,
              latestBlockHeight: status.syncInfo.latestBlockHeight,
              catchingUp: status.syncInfo.catchingUp,
              status: 'ok',
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              ...defaultConfig,
              status: 'error',
              error: error instanceof Error ? error.message : String(error),
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
