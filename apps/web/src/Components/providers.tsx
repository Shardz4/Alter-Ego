'use client';  // Mark as client component for hooks and providers

import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/config/chains';
import {
  PushUniversalWalletProvider,
  PushUI,
} from '@pushchain/ui-kit';

const queryClient = new QueryClient();

const walletConfig = {
  uid: 'alter-ego-wallet',  // Unique identifier for the wallet instance
  network: PushUI.CONSTANTS.PUSH_NETWORK.TESTNET,
  login: {
    email: true,
    google: true,
    wallet: {
      enabled: true,
    },
    appPreview: true,
  },
  modal: {
    loginLayout: PushUI.CONSTANTS.LOGIN.LAYOUT.SPLIT,
    connectedLayout: PushUI.CONSTANTS.CONNECTED.LAYOUT.HOVER,
    appPreview: true,
  },
};

const appMetadata = {
  logoUrl: '/alter.ico',
  title: 'Alter Ego',
  description: 'Cross-chain prediction markets on Push Chain',
};

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <PushUniversalWalletProvider config={walletConfig} app={appMetadata}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider 
            appInfo={{
              appName: 'Alter Ego',
              learnMoreUrl: '/',
            }}
          >
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </PushUniversalWalletProvider>
  );
}