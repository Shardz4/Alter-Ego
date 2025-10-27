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
injected({ target: 'metaMask' }),  // Bridges Push's injected provider
],
transports: {
[sepolia.id]: http(),
[pushDonutTestnet.id]: http(),
},
});