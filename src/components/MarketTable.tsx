import { useMemo, useState } from 'react'
import type { MarketAsset } from '../api/market'
import { sortAssets, type SortKey, type SortState } from '../utils/sortAssets'

interface MarketTableProps {
  title: string
  assets: MarketAsset[]
  loading: boolean
  error: string | null
  isMockData: boolean
  onRefresh: () => void
}

const DEFAULT_SORT_STATE: SortState = {
  key: 'change24h',
  direction: 'desc',
}

const SORT_HEADERS: Array<{ key: SortKey; label: string }> = [
  { key: 'volume24h', label: 'Volume (24h)' },
  { key: 'change5m', label: '5m % change' },
  { key: 'change4h', label: '4h % change' },
  { key: 'change24h', label: '24h % change' },
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value)
}

function formatChange(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function MarketTable({
  title,
  assets,
  loading,
  error,
  isMockData,
  onRefresh,
}: MarketTableProps) {
  const [sortState, setSortState] = useState<SortState>(DEFAULT_SORT_STATE)

  const sortedAssets = useMemo(() => sortAssets(assets, sortState), [assets, sortState])

  const onSortChange = (key: SortKey) => {
    setSortState((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === 'desc' ? 'asc' : 'desc',
        }
      }

      return {
        key,
        direction: 'desc',
      }
    })
  }

  return (
    <section className="table-wrapper" aria-label={title}>
      <div className="table-header">
        <h2>{title}</h2>
        <div className="table-controls">
          {isMockData && <span className="badge">mock data</span>}
          <button type="button" onClick={onRefresh}>
            Refresh
          </button>
        </div>
      </div>

      {loading && assets.length === 0 && <p role="status">Loading data…</p>}
      {error && <p role="alert">API unavailable ({error}). Showing mock data.</p>}

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Symbol</th>
              <th>Name</th>
              <th>Price</th>
              {SORT_HEADERS.map((header) => (
                <th
                  key={header.key}
                  aria-sort={
                    sortState.key === header.key
                      ? sortState.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  <button
                    type="button"
                    className="sort-button"
                    onClick={() => onSortChange(header.key)}
                  >
                    {header.label}
                    {sortState.key === header.key
                      ? ` ${sortState.direction === 'desc' ? '▼' : '▲'}`
                      : ''}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedAssets.map((asset, index) => (
              <tr key={asset.symbol}>
                <td>{index + 1}</td>
                <td>{asset.symbol}</td>
                <td>{asset.name}</td>
                <td>{formatCurrency(asset.price)}</td>
                <td>{formatNumber(asset.volume24h)}</td>
                <td className={asset.change5m >= 0 ? 'gain' : 'loss'}>
                  {formatChange(asset.change5m)}
                </td>
                <td className={asset.change4h >= 0 ? 'gain' : 'loss'}>
                  {formatChange(asset.change4h)}
                </td>
                <td className={asset.change24h >= 0 ? 'gain' : 'loss'}>
                  {formatChange(asset.change24h)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
