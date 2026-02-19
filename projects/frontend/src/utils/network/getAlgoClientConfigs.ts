import { AlgoViteClientConfig, AlgoViteKMDConfig } from '../../interfaces/network'

// Default to Algorand Testnet via AlgoNode (free public API, no token needed)
const TESTNET_DEFAULTS = {
  server: 'https://testnet-api.algonode.cloud',
  port: '443',
  token: '',
  network: 'testnet',
}

const TESTNET_INDEXER_DEFAULTS = {
  server: 'https://testnet-idx.algonode.cloud',
  port: '443',
  token: '',
  network: 'testnet',
}

export function getAlgodConfigFromViteEnvironment(): AlgoViteClientConfig {
  let server = import.meta.env.VITE_ALGOD_SERVER ?? TESTNET_DEFAULTS.server
  let port = import.meta.env.VITE_ALGOD_PORT ?? TESTNET_DEFAULTS.port

  if (server.startsWith('/')) {
    server = window.location.origin + server
    port = ''
  }

  return {
    server,
    port,
    token: import.meta.env.VITE_ALGOD_TOKEN ?? TESTNET_DEFAULTS.token,
    network: import.meta.env.VITE_ALGOD_NETWORK ?? TESTNET_DEFAULTS.network,
  }
}

export function getIndexerConfigFromViteEnvironment(): AlgoViteClientConfig {
  return {
    server: import.meta.env.VITE_INDEXER_SERVER ?? TESTNET_INDEXER_DEFAULTS.server,
    port: import.meta.env.VITE_INDEXER_PORT ?? TESTNET_INDEXER_DEFAULTS.port,
    token: import.meta.env.VITE_INDEXER_TOKEN ?? TESTNET_INDEXER_DEFAULTS.token,
    network: import.meta.env.VITE_ALGOD_NETWORK ?? TESTNET_INDEXER_DEFAULTS.network,
  }
}

export function getKmdConfigFromViteEnvironment(): AlgoViteKMDConfig {
  if (!import.meta.env.VITE_KMD_SERVER) {
    throw new Error('Attempt to get default kmd configuration without specifying VITE_KMD_SERVER in the environment variables')
  }

  return {
    server: import.meta.env.VITE_KMD_SERVER,
    port: import.meta.env.VITE_KMD_PORT,
    token: import.meta.env.VITE_KMD_TOKEN,
    wallet: import.meta.env.VITE_KMD_WALLET,
    password: import.meta.env.VITE_KMD_PASSWORD,
  }
}
