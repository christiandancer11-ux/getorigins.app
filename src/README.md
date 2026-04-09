# Origins — Card Collector Platform

A cutting-edge platform for trading card collectors to register, track, and share their card collections with interactive QR codes, video messages, and real-time market data.

## Features

- **AI Card Scanner** — Snap a photo and AI identifies the card, auto-fills details, and generates unique QR code stickers
- **Video Messages** — Record personal messages that travel with cards from owner to owner
- **Social Network** — Follow collectors, discover collections, and engage with reactions and comments
- **Market Value** — Real-time eBay sold prices, 130point comps, and community trade data
- **Card Show Trades** — Log in-person deals with AI-verified fair market values
- **Trending Dashboard** — See the hottest cards trending across all sports and TCGs
- **Price Alerts** — Get notified when cards hit your buy/sell price targets
- **Pro Card Flipper** — Find PSA/BGS/SGC/CGC cards with high odds of perfect 10s
- **Leaderboard & Analytics** — Track your ranking and collection performance metrics
- **BOLO Stolen Card Alerts** — Get notified of stolen cards reported by verified dealers near you

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack React Query
- **Backend**: Base44 serverless functions (Deno)
- **Database**: Base44 entities
- **Payments**: Stripe
- **Authentication**: Base44 Auth
- **Animations**: Framer Motion

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=https://yourapp.com
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` to start developing.

### Building

```bash
npm run build
```

## Project Structure

```
src/
├── pages/              # Page components
├── components/         # Reusable React components
├── functions/          # Backend serverless functions
├── entities/           # Data model schemas
├── lib/                # Utility functions and helpers
├── hooks/              # Custom React hooks
├── api/                # API client setup
├── utils/              # General utilities
├── App.jsx             # Main app router
└── index.css           # Global styles
```

## Key Pages

- **Landing** — Marketing homepage with feature overview and pricing
- **Dashboard** — User's collection overview and management
- **RegisterCard** — AI-powered card registration with photo upload
- **CardDetail** — Individual card view with video messages and reactions
- **ScanCard** — QR code scanning and card story discovery
- **Profile** — User profile and account management
- **Leaderboard** — Collector rankings and statistics
- **Analytics** — Card performance and engagement metrics
- **MarketValue** — Real-time market data and valuations
- **Trending** — Top 100 hottest cards across categories
- **BOLOAlerts** — Stolen card watch list and notifications

## Payments

This app uses Stripe for subscription management. The app includes:
- Free tier with basic features
- Origins Pro Bundle ($14.99/month) with all premium features
- Referral and promo code system

## License

© Origins. All rights reserved by Skillerz Breaks.