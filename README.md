# tradingpilot-frontend

Frontend dashboard for TradingPilot. This app visualizes top-volume crypto and stock assets and is designed to work with the FastAPI backend in [`Svenrk/tradingpilot-core`](https://github.com/Svenrk/tradingpilot-core).

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Available scripts:

- `npm run dev` - start Vite dev server
- `npm run build` - type-check and build production bundle
- `npm run lint` - run ESLint
- `npm run test` - run Vitest test suite

## Backend relationship

When `VITE_API_BASE_URL` is set, the frontend requests:

- `GET {VITE_API_BASE_URL}/markets/crypto/top?limit=50`
- `GET {VITE_API_BASE_URL}/markets/stocks/top?limit=50`

Expected response JSON shape:

```json
{
  "assets": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "price": 64321.12,
      "volume24h": 29500123456.23,
      "change5m": 0.14,
      "change4h": -1.03,
      "change24h": 2.67
    }
  ]
}
```

A plain array of asset objects is also accepted.

If `VITE_API_BASE_URL` is missing or the API request fails, the app automatically falls back to deterministic mock data and surfaces a `mock data` badge in the UI.
