import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { PushWalletConnector } from '@/lib/pushWalletConnector';
import { metaMask } from 'wagmi/connectors';

export const pushChain = {
  id: 42101,
  name: 'Push Chain Donut Testnet',
  network: 'push-donut',
  nativeCurrency: {
    decimals: 18,
    name: 'Push Chain',
    symbol: 'PC',
  },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_PUSH_RPC || 'https://evm.rpc-testnet-donut-node1.push.org'] },
    public: { http: [process.env.NEXT_PUBLIC_PUSH_RPC || 'https://evm.rpc-testnet-donut-node1.push.org'] },
  },
  blockExplorers: {
    default: { name: 'Push Chain Explorer', url: 'https://donut.push.network' },
  },
  testnet: true,
};

// Using Ethereum Sepolia testnet for deployment
export const deploymentChain = sepolia;

export const config = createConfig({
  chains: [deploymentChain, pushChain],
  connectors: [PushWalletConnector({ chains: [deploymentChain, pushChain] }), metaMask()],
  transports: { 
    [pushChain.id]: http(pushChain.rpcUrls.default.http[0]),
    [deploymentChain.id]: http(deploymentChain.rpcUrls.default.http[0])
  },
});