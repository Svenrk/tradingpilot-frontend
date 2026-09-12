import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchTopCrypto, fetchTopStocks, type MarketAsset } from './api/market'
import { MarketTable } from './components/MarketTable'
import { REFRESH_INTERVAL_MS } from './constants'
import './App.css'

type MarketKind = 'crypto' | 'stocks'

interface MarketState {
  assets: MarketAsset[]
  loading: boolean
  error: string | null
  isMockData: boolean
}

const INITIAL_STATE: MarketState = {
  assets: [],
  loading: false,
  error: null,
  isMockData: false,
}

function readMarketKindFromHash(hash: string): MarketKind {
  return hash === '#stocks' ? 'stocks' : 'crypto'
}

function App() {
  const [activeMarket, setActiveMarket] = useState<MarketKind>(() =>
    readMarketKindFromHash(window.location.hash)
  )
  const [marketStates, setMarketStates] = useState<Record<MarketKind, MarketState>>({
    crypto: INITIAL_STATE,
    stocks: INITIAL_STATE,
  })
  const latestRequestIds = useRef<Record<MarketKind, number>>({
    crypto: 0,
    stocks: 0,
  })

  useEffect(() => {
    const syncWithHash = () => setActiveMarket(readMarketKindFromHash(window.location.hash))

    window.addEventListener('hashchange', syncWithHash)
    return () => window.removeEventListener('hashchange', syncWithHash)
  }, [])

  const loadMarketData = useCallback(async (market: MarketKind) => {
    latestRequestIds.current[market] += 1
    const requestId = latestRequestIds.current[market]
    setMarketStates((current) => ({
      ...current,
      [market]: { ...current[market], loading: true },
    }))

    try {
      const result = market === 'crypto' ? await fetchTopCrypto() : await fetchTopStocks()

      if (requestId !== latestRequestIds.current[market]) {
        return
      }

      setMarketStates((current) => ({
        ...current,
        [market]: {
          assets: result.assets,
          loading: false,
          error: result.error,
          isMockData: result.isMockData,
        },
      }))
    } catch (error) {
      if (requestId !== latestRequestIds.current[market]) {
        return
      }

      setMarketStates((current) => ({
        ...current,
        [market]: {
          ...current[market],
          loading: false,
          error: error instanceof Error ? error.message : 'Unable to load market data',
        },
      }))
    }
  }, [])

  useEffect(() => {
    void loadMarketData(activeMarket)
    const interval = window.setInterval(() => void loadMarketData(activeMarket), REFRESH_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [activeMarket, loadMarketData])

  const currentState = marketStates[activeMarket]

  const selectMarket = (market: MarketKind) => {
    window.location.hash = market
    setActiveMarket(market)
  }

  return (
    <main className="app">
      <header className="cockpit-header">
        <h1>TradingPilot Dashboard</h1>
        <p>Flight deck view of top 50 assets by 24-hour volume</p>
      </header>

      <nav className="tabs" aria-label="Market tabs">
        <button
          type="button"
          className={activeMarket === 'crypto' ? 'active' : ''}
          onClick={() => selectMarket('crypto')}
        >
          Crypto
        </button>
        <button
          type="button"
          className={activeMarket === 'stocks' ? 'active' : ''}
          onClick={() => selectMarket('stocks')}
        >
          Stocks
        </button>
      </nav>

      <MarketTable
        title={activeMarket === 'crypto' ? 'Crypto - Top 50 by volume' : 'Stocks - Top 50 by volume'}
        assets={currentState.assets}
        loading={currentState.loading}
        error={currentState.error}
        isMockData={currentState.isMockData}
        onRefresh={() => void loadMarketData(activeMarket)}
      />
    </main>
  )
}

export default App
