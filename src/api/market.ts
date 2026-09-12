export interface MarketAsset {
  symbol: string
  name: string
  price: number
  volume24h: number
  change5m: number
  change4h: number
  change24h: number
}

export interface MarketFetchResult {
  assets: MarketAsset[]
  isMockData: boolean
  error: string | null
}

const TOP_LIMIT = 50

const CRYPTO_SYMBOLS: Array<[string, string]> = [
  ['BTC', 'Bitcoin'],
  ['ETH', 'Ethereum'],
  ['USDT', 'Tether'],
  ['BNB', 'BNB'],
  ['SOL', 'Solana'],
  ['XRP', 'XRP'],
  ['USDC', 'USD Coin'],
  ['DOGE', 'Dogecoin'],
  ['TRX', 'TRON'],
  ['ADA', 'Cardano'],
  ['AVAX', 'Avalanche'],
  ['SHIB', 'Shiba Inu'],
  ['TON', 'Toncoin'],
  ['LINK', 'Chainlink'],
  ['DOT', 'Polkadot'],
  ['BCH', 'Bitcoin Cash'],
  ['NEAR', 'NEAR Protocol'],
  ['LTC', 'Litecoin'],
  ['MATIC', 'Polygon'],
  ['UNI', 'Uniswap'],
  ['ICP', 'Internet Computer'],
  ['PEPE', 'Pepe'],
  ['APT', 'Aptos'],
  ['FIL', 'Filecoin'],
  ['ATOM', 'Cosmos'],
  ['ARB', 'Arbitrum'],
  ['OP', 'Optimism'],
  ['ETC', 'Ethereum Classic'],
  ['XLM', 'Stellar'],
  ['INJ', 'Injective'],
  ['HBAR', 'Hedera'],
  ['IMX', 'Immutable'],
  ['RUNE', 'THORChain'],
  ['MKR', 'Maker'],
  ['AAVE', 'Aave'],
  ['GRT', 'The Graph'],
  ['ALGO', 'Algorand'],
  ['VET', 'VeChain'],
  ['SAND', 'The Sandbox'],
  ['MANA', 'Decentraland'],
  ['RNDR', 'Render'],
  ['KAS', 'Kaspa'],
  ['FET', 'Fetch.ai'],
  ['THETA', 'Theta Network'],
  ['JUP', 'Jupiter'],
  ['BONK', 'Bonk'],
  ['SEI', 'Sei'],
  ['TIA', 'Celestia'],
  ['PYTH', 'Pyth Network'],
  ['WIF', 'dogwifhat'],
]

const STOCK_SYMBOLS: Array<[string, string]> = [
  ['AAPL', 'Apple Inc.'],
  ['MSFT', 'Microsoft Corporation'],
  ['NVDA', 'NVIDIA Corporation'],
  ['AMZN', 'Amazon.com, Inc.'],
  ['GOOGL', 'Alphabet Inc.'],
  ['META', 'Meta Platforms, Inc.'],
  ['TSLA', 'Tesla, Inc.'],
  ['BRK.B', 'Berkshire Hathaway Inc.'],
  ['JPM', 'JPMorgan Chase & Co.'],
  ['V', 'Visa Inc.'],
  ['MA', 'Mastercard Incorporated'],
  ['UNH', 'UnitedHealth Group Incorporated'],
  ['XOM', 'Exxon Mobil Corporation'],
  ['LLY', 'Eli Lilly and Company'],
  ['JNJ', 'Johnson & Johnson'],
  ['WMT', 'Walmart Inc.'],
  ['PG', 'Procter & Gamble Co.'],
  ['AVGO', 'Broadcom Inc.'],
  ['COST', 'Costco Wholesale Corporation'],
  ['HD', 'The Home Depot, Inc.'],
  ['ABBV', 'AbbVie Inc.'],
  ['KO', 'The Coca-Cola Company'],
  ['PEP', 'PepsiCo, Inc.'],
  ['BAC', 'Bank of America Corporation'],
  ['MRK', 'Merck & Co., Inc.'],
  ['CVX', 'Chevron Corporation'],
  ['ORCL', 'Oracle Corporation'],
  ['NFLX', 'Netflix, Inc.'],
  ['ADBE', 'Adobe Inc.'],
  ['AMD', 'Advanced Micro Devices, Inc.'],
  ['CRM', 'Salesforce, Inc.'],
  ['TMO', 'Thermo Fisher Scientific Inc.'],
  ['CSCO', 'Cisco Systems, Inc.'],
  ['MCD', "McDonald's Corporation"],
  ['DIS', 'The Walt Disney Company'],
  ['ABT', 'Abbott Laboratories'],
  ['ACN', 'Accenture plc'],
  ['NKE', 'NIKE, Inc.'],
  ['INTC', 'Intel Corporation'],
  ['TXN', 'Texas Instruments Incorporated'],
  ['QCOM', 'QUALCOMM Incorporated'],
  ['AMAT', 'Applied Materials, Inc.'],
  ['IBM', 'International Business Machines Corporation'],
  ['GE', 'General Electric Company'],
  ['CAT', 'Caterpillar Inc.'],
  ['HON', 'Honeywell International Inc.'],
  ['LOW', "Lowe's Companies, Inc."],
  ['GS', 'The Goldman Sachs Group, Inc.'],
  ['PFE', 'Pfizer Inc.'],
  ['UBER', 'Uber Technologies, Inc.'],
]

function normalizeAsset(asset: MarketAsset): MarketAsset {
  return {
    symbol: asset.symbol,
    name: asset.name,
    price: Number(asset.price),
    volume24h: Number(asset.volume24h),
    change5m: Number(asset.change5m),
    change4h: Number(asset.change4h),
    change24h: Number(asset.change24h),
  }
}

function parseRequiredNumber(value: unknown): number {
  const numericValue =
    typeof value === 'number' || typeof value === 'string' ? Number(value) : Number.NaN

  if (!Number.isFinite(numericValue)) {
    throw new Error('Invalid numeric field in backend response')
  }

  return numericValue
}

function parseRequiredString(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error('Invalid string field in backend response')
  }

  return value
}

function seededValue(seed: number): number {
  const x = Math.sin(seed) * 10_000
  return x - Math.floor(x)
}

function basePrice(seed: number, kind: 'crypto' | 'stock'): number {
  if (kind === 'crypto') {
    return Number((Math.pow(10, seededValue(seed) * 5) * 0.75).toFixed(2))
  }

  return Number((20 + seededValue(seed) * 580).toFixed(2))
}

function toChange(seed: number, amplitude: number): number {
  return Number((((seededValue(seed) - 0.5) * 2 * amplitude).toFixed(2)))
}

function createMockAssets(
  kind: 'crypto' | 'stock',
  symbols: Array<[string, string]>
): MarketAsset[] {
  const volumeBase = kind === 'crypto' ? 9_500_000_000 : 780_000_000
  const volumeStep = kind === 'crypto' ? 145_000_000 : 11_000_000

  return symbols.slice(0, TOP_LIMIT).map(([symbol, name], index) => {
    const rank = index + 1
    const seed = rank * 97 + symbol.length * 31
    const jitter = (seededValue(seed + 10) - 0.5) * (volumeStep * 0.35)

    return {
      symbol,
      name,
      price: basePrice(seed, kind),
      volume24h: Number((volumeBase - index * volumeStep + jitter).toFixed(2)),
      change5m: toChange(seed + 2, 1.5),
      change4h: toChange(seed + 3, 6),
      change24h: toChange(seed + 4, 12),
    }
  })
}

function getMockAssets(kind: 'crypto' | 'stock'): MarketAsset[] {
  if (kind === 'crypto') {
    return createMockAssets('crypto', CRYPTO_SYMBOLS)
  }

  return createMockAssets('stock', STOCK_SYMBOLS)
}

function parseMarketResponse(payload: unknown): MarketAsset[] {
  const rawAssets = Array.isArray(payload)
    ? payload
    : typeof payload === 'object' && payload !== null && 'assets' in payload
      ? (payload as { assets: unknown }).assets
      : null

  if (!Array.isArray(rawAssets)) {
    throw new Error('Invalid backend response shape')
  }

  return rawAssets.map((asset) => {
    if (typeof asset !== 'object' || asset === null) {
      throw new Error('Invalid backend response shape')
    }

    return normalizeAsset({
      symbol: parseRequiredString((asset as Record<string, unknown>).symbol),
      name: parseRequiredString((asset as Record<string, unknown>).name),
      price: parseRequiredNumber((asset as Record<string, unknown>).price),
      volume24h: parseRequiredNumber((asset as Record<string, unknown>).volume24h),
      change5m: parseRequiredNumber((asset as Record<string, unknown>).change5m),
      change4h: parseRequiredNumber((asset as Record<string, unknown>).change4h),
      change24h: parseRequiredNumber((asset as Record<string, unknown>).change24h),
    })
  })
}

async function fetchTop(path: string, kind: 'crypto' | 'stock'): Promise<MarketFetchResult> {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

  if (!apiBaseUrl) {
    return {
      assets: getMockAssets(kind),
      isMockData: true,
      error: null,
    }
  }

  try {
    const response = await fetch(`${apiBaseUrl}${path}`)
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }

    const payload = await response.json()
    const assets = parseMarketResponse(payload)

    return {
      assets,
      isMockData: false,
      error: null,
    }
  } catch (error) {
    return {
      assets: getMockAssets(kind),
      isMockData: true,
      error: error instanceof Error ? error.message : 'Unable to load market data',
    }
  }
}

export async function fetchTopCrypto(): Promise<MarketFetchResult> {
  return fetchTop('/markets/crypto/top?limit=50', 'crypto')
}

export async function fetchTopStocks(): Promise<MarketFetchResult> {
  return fetchTop('/markets/stocks/top?limit=50', 'stock')
}
