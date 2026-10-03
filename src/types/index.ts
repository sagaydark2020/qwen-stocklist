export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  currency: string;
  exchange: string;
  lastUpdated: string;
}

export interface WatchlistStock {
  symbol: string;
  addedAt: string;
}

export interface Watchlist {
  id: string;
  name: string;
  description: string;
  stocks: WatchlistStock[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
