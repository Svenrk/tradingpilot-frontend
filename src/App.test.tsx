import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import type { MarketAsset } from './api/market'

const { cryptoAssets, stockAssets, fetchTopCryptoMock, fetchTopStocksMock } = vi.hoisted(() => ({
  cryptoAssets: [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 10,
      volume24h: 300,
      change5m: 1,
      change4h: 1,
      change24h: 3,
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 12,
      volume24h: 200,
      change5m: -2,
      change4h: -1,
      change24h: 1,
    },
  ] as MarketAsset[],
  stockAssets: [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 100,
      volume24h: 500,
      change5m: 0.2,
      change4h: 0.4,
      change24h: -1,
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      price: 98,
      volume24h: 400,
      change5m: -0.3,
      change4h: 0.1,
      change24h: 2,
    },
  ] as MarketAsset[],
  fetchTopCryptoMock: vi.fn(),
  fetchTopStocksMock: vi.fn(),
}))

vi.mock('./api/market', () => ({
  fetchTopCrypto: fetchTopCryptoMock,
  fetchTopStocks: fetchTopStocksMock,
}))

describe('App', () => {
  beforeEach(() => {
    window.location.hash = '#crypto'
    fetchTopCryptoMock.mockResolvedValue({
      assets: cryptoAssets,
      isMockData: false,
      error: null,
    })
    fetchTopStocksMock.mockResolvedValue({
      assets: stockAssets,
      isMockData: false,
      error: null,
    })
  })

  it('switches tabs and keeps active tab in URL hash', async () => {
    const user = userEvent.setup()
    render(<App />)

    await screen.findByRole('button', { name: 'Stocks' })
    await user.click(screen.getByRole('button', { name: 'Stocks' }))

    expect(window.location.hash).toBe('#stocks')
    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument()
    })
  })

  it('changes row order when clicking a % sort header', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('BTC')).toBeInTheDocument()
      expect(screen.getByText('ETH')).toBeInTheDocument()
    })

    const rowsBefore = screen.getAllByRole('row').slice(1)
    expect(within(rowsBefore[0]).getByText('BTC')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Volume \(24h\)/ }))
    const rowsVolumeDesc = screen.getAllByRole('row').slice(1)
    expect(within(rowsVolumeDesc[0]).getByText('BTC')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Volume \(24h\)/ }))
    const rowsVolumeAsc = screen.getAllByRole('row').slice(1)
    expect(within(rowsVolumeAsc[0]).getByText('ETH')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^24h % change/ }))
    const rowsTwentyFourDesc = screen.getAllByRole('row').slice(1)
    expect(within(rowsTwentyFourDesc[0]).getByText('BTC')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^5m % change/ }))
    await user.click(screen.getByRole('button', { name: /^5m % change/ }))

    const rowsAsc = screen.getAllByRole('row').slice(1)
    expect(within(rowsAsc[0]).getByText('ETH')).toBeInTheDocument()
  })

  it('defaults to descending 24h % order on first render', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('BTC')).toBeInTheDocument()
    })

    const rowsBefore = screen.getAllByRole('row').slice(1)
    expect(within(rowsBefore[0]).getByText('BTC')).toBeInTheDocument()
  })

  it('renders loading state while data is being fetched', async () => {
    let resolveCrypto: (() => void) | undefined
    fetchTopCryptoMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCrypto = () =>
            resolve({
              assets: cryptoAssets,
              isMockData: false,
              error: null,
            })
        })
    )

    render(<App />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading data…')
    resolveCrypto?.()
    await screen.findByText('BTC')
  })

  it('renders fallback error banner when API data fails and mock data is used', async () => {
    fetchTopCryptoMock.mockResolvedValue({
      assets: cryptoAssets,
      isMockData: true,
      error: 'Request failed: 500',
    })

    render(<App />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Showing mock data')
    expect(screen.getByText('mock data')).toBeInTheDocument()
  })
})
