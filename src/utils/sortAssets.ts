import type { MarketAsset } from '../api/market'

export type SortKey = 'volume24h' | 'change5m' | 'change4h' | 'change24h'

export interface SortState {
  key: SortKey
  direction: 'asc' | 'desc'
}

export function sortAssets(assets: MarketAsset[], sortState: SortState): MarketAsset[] {
  const directionFactor = sortState.direction === 'asc' ? 1 : -1

  return [...assets].sort((a, b) => {
    return (a[sortState.key] - b[sortState.key]) * directionFactor
  })
}
