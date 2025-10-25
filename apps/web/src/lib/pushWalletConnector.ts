import { injected } from 'wagmi/connectors'

// Export a connector factory that uses the current `@wagmi/connectors` API.
// Call `PushWalletConnector({ chains })` (no `new`) when constructing connectors.
export function PushWalletConnector(_: { chains?: any[] } = {}) {
  return injected({
    // Target can be an object with id/name/provider function
    target: {
      id: 'pushWallet',
      name: 'Push Wallet',
      provider(window: any) {
        return window?.ethereum?.isPushWallet ? window.ethereum : undefined
      },
    },
    // Keep shimDisconnect behavior consistent with other injected connectors
    shimDisconnect: true,
    // `chains` will be provided by wagmi's createConfig when the connector is used,
    // but exposing the param keeps parity with previous usage.
    // (The `injected` connector reads chains from the config passed by wagmi.)
  })
}

// Note: project already has broader `window.ethereum` types via dependencies.
// Keep runtime checks in code instead of re-declaring the global type here.