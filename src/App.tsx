import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  loading: true,
  error: null,
  isMockData: false,
}

function readMarketKindFromHash(hash: string): MarketKind {
  return hash === '#stocks' ? 'stocks' : 'crypto'
}

function useMarketState(kind: MarketKind) {
  const [state, setState] = useState<MarketState>(INITIAL_STATE)
  const latestRequestId = useRef(0)

  const loadData = useCallback(async () => {
    latestRequestId.current += 1
    const requestId = latestRequestId.current
    setState((current) => ({ ...current, loading: true }))

    const result = kind === 'crypto' ? await fetchTopCrypto() : await fetchTopStocks()

    if (requestId !== latestRequestId.current) {
      return
    }

    setState({
      assets: result.assets,
      loading: false,
      error: result.error,
      isMockData: result.isMockData,
    })
  }, [kind])

  useEffect(() => {
    void loadData()
    const interval = window.setInterval(loadData, REFRESH_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [loadData])

  return {
    ...state,
    refresh: loadData,
  }
}

function App() {
  const [activeMarket, setActiveMarket] = useState<MarketKind>(() =>
    readMarketKindFromHash(window.location.hash)
  )

  useEffect(() => {
    const syncWithHash = () => setActiveMarket(readMarketKindFromHash(window.location.hash))

    window.addEventListener('hashchange', syncWithHash)
    return () => window.removeEventListener('hashchange', syncWithHash)
  }, [])

  const cryptoState = useMarketState('crypto')
  const stocksState = useMarketState('stocks')

  const currentState = useMemo(
    () => (activeMarket === 'crypto' ? cryptoState : stocksState),
    [activeMarket, cryptoState, stocksState]
  )

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
        onRefresh={currentState.refresh}
      />
    </main>
  )
}

export default App
