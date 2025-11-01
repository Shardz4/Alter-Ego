import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'

// Initialize Aptos client
const config = new AptosConfig({ 
  network: Network.TESTNET 
})
export const aptosClient = new Aptos(config)

// Module address - should be set in environment variables
export const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MOVE_MODULE_ADDRESS || ''

/**
 * Market data structure matching the Move contract
 */
export interface Market {
  id: number
  question: string
  creator: string
  resolveTs: number
  totalYesShares: number
  totalNoShares: number
  totalYesVolume: number
  totalNoVolume: number
  settled: boolean
  result: boolean
  createdAt: number
}

/**
 * User position structure
 */
export interface Position {
  marketId: number
  user: string
  yesShares: number
  noShares: number
  yesCost: number
  noCost: number
  agreementPercentage: number
  predictionSide: boolean
}

/**
 * Get market details by ID
 */
export async function getMarket(marketId: number): Promise<Market | null> {
  try {
    const result = await aptosClient.view({
      payload: {
        function: `${MODULE_ADDRESS}::perception_market::get_market`,
        typeArguments: [],
        functionArguments: [marketId.toString()],
      },
    })

    if (!result || result.length === 0) return null

    return {
      id: marketId,
      question: result[0] as string,
      creator: result[1] as string,
      resolveTs: Number(result[2]),
      totalYesShares: Number(result[3]),
      totalNoShares: Number(result[4]),
      totalYesVolume: Number(result[5]),
      totalNoVolume: Number(result[6]),
      settled: result[7] as boolean,
      result: result[8] as boolean,
      createdAt: 0, // Not returned by view function
    }
  } catch (error) {
    console.error('Error fetching market:', error)
    return null
  }
}

/**
 * Get total number of markets
 */
export async function getMarketsCount(): Promise<number> {
  try {
    const result = await aptosClient.view({
      payload: {
        function: `${MODULE_ADDRESS}::perception_market::get_markets_count`,
        typeArguments: [],
        functionArguments: [],
      },
    })

    return Number(result[0])
  } catch (error) {
    console.error('Error fetching markets count:', error)
    return 0
  }
}

/**
 * Get all markets (by fetching each one)
 */
export async function getAllMarkets(): Promise<Market[]> {
  try {
    const count = await getMarketsCount()
    const markets: Market[] = []

    for (let i = 0; i < count; i++) {
      const market = await getMarket(i)
      if (market) {
        markets.push(market)
      }
    }

    return markets
  } catch (error) {
    console.error('Error fetching all markets:', error)
    return []
  }
}

/**
 * Get user position in a market
 */
export async function getUserPosition(
  userAddress: string,
  marketId: number
): Promise<Position | null> {
  try {
    const result = await aptosClient.view({
      payload: {
        function: `${MODULE_ADDRESS}::perception_market::get_user_position`,
        typeArguments: [],
        functionArguments: [userAddress, marketId.toString()],
      },
    })

    if (!result || result.length === 0) return null

    return {
      marketId,
      user: userAddress,
      yesShares: Number(result[0]),
      noShares: Number(result[1]),
      yesCost: Number(result[2]),
      noCost: Number(result[3]),
      agreementPercentage: Number(result[4]),
      predictionSide: result[5] as boolean,
    }
  } catch (error) {
    console.error('Error fetching user position:', error)
    return null
  }
}

/**
 * Get market price (YES percentage)
 */
export async function getMarketPrice(marketId: number): Promise<number> {
  try {
    const result = await aptosClient.view({
      payload: {
        function: `${MODULE_ADDRESS}::perception_market::get_market_price`,
        typeArguments: [],
        functionArguments: [marketId.toString()],
      },
    })

    return Number(result[0]) / 100 // Convert from 0-100 to 0-1
  } catch (error) {
    console.error('Error fetching market price:', error)
    return 0.5 // Default 50%
  }
}

/**
 * Create transaction payload for creating a market
 */
export function createMarketPayload(question: string, resolveTs: number) {
  return {
    function: `${MODULE_ADDRESS}::perception_market::create_market`,
    typeArguments: [],
    functionArguments: [question, resolveTs.toString()],
  }
}

/**
 * Create transaction payload for buying YES shares
 */
export function buyYesPayload(
  marketId: number,
  amount: number,
  agreementPercentage: number
) {
  return {
    function: `${MODULE_ADDRESS}::perception_market::buy_yes`,
    typeArguments: [],
    functionArguments: [
      marketId.toString(),
      amount.toString(),
      agreementPercentage.toString(),
    ],
  }
}

/**
 * Create transaction payload for buying NO shares
 */
export function buyNoPayload(
  marketId: number,
  amount: number,
  agreementPercentage: number
) {
  return {
    function: `${MODULE_ADDRESS}::perception_market::buy_no`,
    typeArguments: [],
    functionArguments: [
      marketId.toString(),
      amount.toString(),
      agreementPercentage.toString(),
    ],
  }
}

/**
 * Create transaction payload for settling a market (admin only)
 */
export function settleMarketPayload(marketId: number, result: boolean) {
  return {
    function: `${MODULE_ADDRESS}::perception_market::settle_market`,
    typeArguments: [],
    functionArguments: [marketId.toString(), result.toString()],
  }
}

/**
 * Initialize the market registry (admin only, one-time)
 */
export function initializePayload() {
  return {
    function: `${MODULE_ADDRESS}::perception_market::initialize`,
    typeArguments: [],
    functionArguments: [],
  }
}

/**
 * Helper to wait for transaction confirmation
 */
export async function waitForTransaction(txHash: string, timeoutMs = 60000): Promise<boolean> {
  const start = Date.now()
  
  while (Date.now() - start < timeoutMs) {
    try {
      const txn = await aptosClient.waitForTransaction({
        transactionHash: txHash,
      })
      
      if (txn.success) {
        return true
      }
      return false
    } catch (error) {
      // Transaction not yet available, wait and retry
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
  
  throw new Error('Transaction confirmation timeout')
}

