import { describe, expect, it } from 'vitest'
import type { MarketAsset } from '../api/market'
import { sortAssets } from './sortAssets'

const BASE_ASSETS: MarketAsset[] = [
  {
    symbol: 'AAA',
    name: 'Asset AAA',
    price: 10,
    volume24h: 300,
    change5m: -1,
    change4h: 2,
    change24h: 4,
  },
  {
    symbol: 'BBB',
    name: 'Asset BBB',
    price: 20,
    volume24h: 200,
    change5m: 1,
    change4h: -3,
    change24h: -5,
  },
  {
    symbol: 'CCC',
    name: 'Asset CCC',
    price: 30,
    volume24h: 100,
    change5m: 0.5,
    change4h: 1,
    change24h: 2,
  },
]

describe('sortAssets', () => {
  it('sorts change5m descending and ascending', () => {
    const descending = sortAssets(BASE_ASSETS, { key: 'change5m', direction: 'desc' })
    const ascending = sortAssets(BASE_ASSETS, { key: 'change5m', direction: 'asc' })

    expect(descending.map((asset) => asset.symbol)).toEqual(['BBB', 'CCC', 'AAA'])
    expect(ascending.map((asset) => asset.symbol)).toEqual(['AAA', 'CCC', 'BBB'])
  })

  it('sorts change4h descending and ascending', () => {
    const descending = sortAssets(BASE_ASSETS, { key: 'change4h', direction: 'desc' })
    const ascending = sortAssets(BASE_ASSETS, { key: 'change4h', direction: 'asc' })

    expect(descending.map((asset) => asset.symbol)).toEqual(['AAA', 'CCC', 'BBB'])
    expect(ascending.map((asset) => asset.symbol)).toEqual(['BBB', 'CCC', 'AAA'])
  })

  it('sorts change24h descending and ascending', () => {
    const descending = sortAssets(BASE_ASSETS, { key: 'change24h', direction: 'desc' })
    const ascending = sortAssets(BASE_ASSETS, { key: 'change24h', direction: 'asc' })

    expect(descending.map((asset) => asset.symbol)).toEqual(['AAA', 'CCC', 'BBB'])
    expect(ascending.map((asset) => asset.symbol)).toEqual(['BBB', 'CCC', 'AAA'])
  })
})
