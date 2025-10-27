import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { sepolia } from 'wagmi/chains';

// Define pushDonutTestnet to avoid naming conflicts
export const pushDonutTestnet = {
  id: 42101,
  name: 'Push Chain Donut Testnet',
  nativeCurrency: { name: 'Push', symbol: 'PC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evm.rpc-testnet-donut-node1.push.org/', 'https://evm.rpc-testnet-donut-node2.push.org/'] },
    public: { http: ['https://evm.rpc-testnet-donut-node1.push.org/', 'https://evm.rpc-testnet-donut-node2.push.org/'] },
  },
  blockExplorers: {
    default: { name: 'Push Donut Explorer', url: 'https://evm-explorer-testnet.push.org' },
  },
} as const;

export const deploymentChain = sepolia;  // Your existing chain

export const config = createConfig({
  chains: [sepolia, pushDonutTestnet],
  connectors: [
    // MetaMask injected provider
    injected({ target: 'metaMask' }),
    // Push Wallet injected provider
    injected({
      target: {
        id: 'pushWallet',
        name: 'Push Wallet',
        provider(window: any) {
          // Try multiple potential injection points from Push UI kit
          const candidates = [
            // Dedicated Push provider if UI kit exposes it
            (window as any)?.pushEthereum,
            // EIP-6963 style providers array
            Array.isArray((window as any)?.ethereum?.providers)
              ? (window as any).ethereum.providers.find((p: any) => p?.isPush || p?.isPushWallet)
              : undefined,
            // Single injected provider with identifying flags
            (window as any)?.ethereum?.isPushWallet ? (window as any).ethereum : undefined,
            (window as any)?.ethereum?.isPush ? (window as any).ethereum : undefined,
          ].filter(Boolean)
          return candidates[0]
        },
      },
      shimDisconnect: true,
    }),
  ],
  transports: {
    [sepolia.id]: http(),
    [pushDonutTestnet.id]: http(),
  },
});