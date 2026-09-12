import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import type { MarketAsset } from './api/market'

const { cryptoAssets, stockAssets } = vi.hoisted(() => ({
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
}))

vi.mock('./api/market', () => ({
  fetchTopCrypto: vi.fn().mockResolvedValue({
    assets: cryptoAssets,
    isMockData: false,
    error: null,
  }),
  fetchTopStocks: vi.fn().mockResolvedValue({
    assets: stockAssets,
    isMockData: false,
    error: null,
  }),
}))

describe('App', () => {
  beforeEach(() => {
    window.location.hash = '#crypto'
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

    await user.click(screen.getByRole('button', { name: '5m % change' }))

    const rowsAfter = screen.getAllByRole('row').slice(1)
    expect(within(rowsAfter[0]).getByText('BTC')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '5m % change ▼' }))

    const rowsAsc = screen.getAllByRole('row').slice(1)
    expect(within(rowsAsc[0]).getByText('ETH')).toBeInTheDocument()
  })
})
