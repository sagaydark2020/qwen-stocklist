import React, { useState } from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import { UAE_STOCKS } from '../utils/yahooFinance';
import { Search, X, Plus, Check } from 'lucide-react';

interface AddStockModalProps {
  watchlistId: string;
  onClose: () => void;
}

export default function AddStockModal({ watchlistId, onClose }: AddStockModalProps) {
  const { watchlists, addStockToWatchlist } = useWatchlist();
  const [search, setSearch] = useState('');
  const [customSymbol, setCustomSymbol] = useState('');

  const watchlist = watchlists.find(wl => wl.id === watchlistId);
  const existingSymbols = watchlist?.stocks.map(s => s.symbol) || [];

  const filteredStocks = UAE_STOCKS.filter(stock => {
    const matchesSearch = stock.name.toLowerCase().includes(search.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleAddStock = (symbol: string) => {
    addStockToWatchlist(watchlistId, symbol);
  };

  const handleAddCustom = () => {
    if (customSymbol.trim()) {
      const symbol = customSymbol.trim().toUpperCase();
      addStockToWatchlist(watchlistId, symbol);
      setCustomSymbol('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-slate-800 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <div>
            <h3 className="text-lg font-semibold text-white">Add Stock</h3>
            <p className="text-sm text-slate-400 mt-0.5">to {watchlist?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/[0.06]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Search UAE stocks..."
              autoFocus
            />
          </div>

          {/* Custom symbol input */}
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={customSymbol}
              onChange={(e) => setCustomSymbol(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Custom symbol (e.g., EMAAR.DF)"
            />
            <button
              onClick={handleAddCustom}
              disabled={!customSymbol.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Stock list */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredStocks.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500 text-sm">No stocks found</p>
              <p className="text-slate-600 text-xs mt-1">Try adding a custom symbol above</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredStocks.map((stock) => {
                const isAdded = existingSymbols.includes(stock.symbol);
                return (
                  <div
                    key={stock.symbol}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-700/50 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-slate-300 font-medium">
                          {stock.symbol.substring(0, 3)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{stock.symbol}</p>
                        <p className="text-xs text-slate-400">{stock.name} • {stock.exchange}</p>
                      </div>
                    </div>
                    {isAdded ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 rounded-lg">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs text-emerald-400">Added</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddStock(stock.symbol)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Add</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06]">
          <p className="text-xs text-slate-500 text-center">
            💡 Tip: Use .DF suffix for DFM stocks (e.g., EMAAR.DF, SALIK.DF)
          </p>
        </div>
      </div>
    </div>
  );
}
