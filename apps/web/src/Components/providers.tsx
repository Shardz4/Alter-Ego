'use client'

import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'

const queryClient = new QueryClient()

// You can register specific wallets (e.g., Petra, Martian) by importing their adapters.
// For now, keep the list empty to allow default injected wallets.
const wallets: any[] = []

interface ProvidersProps { children: ReactNode }

export function Providers({ children }: ProvidersProps) {
  return (
    <AptosWalletAdapterProvider plugins={wallets} autoConnect>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </AptosWalletAdapterProvider>
  )
}
