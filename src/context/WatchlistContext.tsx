import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Watchlist, WatchlistStock, StockQuote } from '../types';
import { fetchStockQuotes } from '../utils/yahooFinance';
import { useAuth } from './AuthContext';

interface WatchlistContextType {
  watchlists: Watchlist[];
  quotes: Record<string, StockQuote>;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  createWatchlist: (name: string, description: string) => Watchlist;
  deleteWatchlist: (id: string) => void;
  updateWatchlist: (id: string, name: string, description: string) => void;
  addStockToWatchlist: (watchlistId: string, symbol: string) => void;
  removeStockFromWatchlist: (watchlistId: string, symbol: string) => void;
  syncQuotes: () => Promise<void>;
  getWatchlistQuotes: (watchlistId: string) => StockQuote[];
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const storageKey = user ? `watchlists_${user.id}` : '';

  // Load watchlists from localStorage
  useEffect(() => {
    if (user && storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setWatchlists(JSON.parse(stored));
      } else {
        // Create a default watchlist for new users
        const defaultWatchlist: Watchlist = {
          id: crypto.randomUUID(),
          name: 'My UAE Portfolio',
          description: 'Default watchlist for UAE market stocks',
          stocks: [
            { symbol: 'EMAAR.DF', addedAt: new Date().toISOString() },
            { symbol: 'ETISALAT.DF', addedAt: new Date().toISOString() },
            { symbol: 'SALIK.DF', addedAt: new Date().toISOString() },
            { symbol: 'FAB.DF', addedAt: new Date().toISOString() },
            { symbol: 'PARKIN.DF', addedAt: new Date().toISOString() },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setWatchlists([defaultWatchlist]);
        localStorage.setItem(storageKey, JSON.stringify([defaultWatchlist]));
      }
    }
  }, [user, storageKey]);

  // Save watchlists to localStorage
  useEffect(() => {
    if (storageKey && watchlists.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(watchlists));
    }
  }, [watchlists, storageKey]);

  // Auto-sync quotes every 30 seconds
  const syncQuotes = useCallback(async () => {
    if (watchlists.length === 0) return;
    
    setIsSyncing(true);
    const allSymbols = [...new Set(watchlists.flatMap(wl => wl.stocks.map(s => s.symbol)))];
    
    if (allSymbols.length > 0) {
      try {
        const fetchedQuotes = await fetchStockQuotes(allSymbols);
        const quotesMap: Record<string, StockQuote> = {};
        fetchedQuotes.forEach(q => {
          quotesMap[q.symbol] = q;
        });
        setQuotes(quotesMap);
        setLastSyncTime(new Date().toISOString());
      } catch (error) {
        console.error('Failed to sync quotes:', error);
      }
    }
    setIsSyncing(false);
  }, [watchlists]);

  // Initial sync and periodic sync
  const hasWatchlists = watchlists.length > 0;
  useEffect(() => {
    if (hasWatchlists) {
      setIsLoading(true);
      syncQuotes().then(() => setIsLoading(false));
      
      const interval = setInterval(syncQuotes, 30000); // Sync every 30 seconds
      return () => clearInterval(interval);
    }
  }, [hasWatchlists]);

  const createWatchlist = (name: string, description: string): Watchlist => {
    const newWatchlist: Watchlist = {
      id: crypto.randomUUID(),
      name,
      description,
      stocks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setWatchlists(prev => [...prev, newWatchlist]);
    return newWatchlist;
  };

  const deleteWatchlist = (id: string) => {
    setWatchlists(prev => prev.filter(wl => wl.id !== id));
  };

  const updateWatchlist = (id: string, name: string, description: string) => {
    setWatchlists(prev =>
      prev.map(wl =>
        wl.id === id
          ? { ...wl, name, description, updatedAt: new Date().toISOString() }
          : wl
      )
    );
  };

  const addStockToWatchlist = (watchlistId: string, symbol: string) => {
    setWatchlists(prev =>
      prev.map(wl => {
        if (wl.id === watchlistId) {
          if (wl.stocks.find(s => s.symbol === symbol)) return wl; // Already exists
          return {
            ...wl,
            stocks: [...wl.stocks, { symbol, addedAt: new Date().toISOString() }],
            updatedAt: new Date().toISOString(),
          };
        }
        return wl;
      })
    );
  };

  const removeStockFromWatchlist = (watchlistId: string, symbol: string) => {
    setWatchlists(prev =>
      prev.map(wl => {
        if (wl.id === watchlistId) {
          return {
            ...wl,
            stocks: wl.stocks.filter(s => s.symbol !== symbol),
            updatedAt: new Date().toISOString(),
          };
        }
        return wl;
      })
    );
  };

  const getWatchlistQuotes = (watchlistId: string): StockQuote[] => {
    const watchlist = watchlists.find(wl => wl.id === watchlistId);
    if (!watchlist) return [];
    return watchlist.stocks
      .map(s => quotes[s.symbol])
      .filter(Boolean);
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlists,
        quotes,
        isLoading,
        isSyncing,
        lastSyncTime,
        createWatchlist,
        deleteWatchlist,
        updateWatchlist,
        addStockToWatchlist,
        removeStockFromWatchlist,
        syncQuotes,
        getWatchlistQuotes,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
