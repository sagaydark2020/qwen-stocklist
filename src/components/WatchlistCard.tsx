import React, { useState } from 'react';
import { Watchlist, StockQuote } from '../types';
import { useWatchlist } from '../context/WatchlistContext';
import { formatPrice, formatNumber } from '../utils/yahooFinance';
import {
  TrendingUp, TrendingDown, Trash2, Edit3, Plus, X,
  ChevronDown, ChevronUp, MoreVertical, BarChart3
} from 'lucide-react';

interface WatchlistCardProps {
  watchlist: Watchlist;
  onAddStock: (watchlistId: string) => void;
}

export default function WatchlistCard({ watchlist, onAddStock }: WatchlistCardProps) {
  const { deleteWatchlist, removeStockFromWatchlist, updateWatchlist, getWatchlistQuotes } = useWatchlist();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState(watchlist.name);
  const [editDesc, setEditDesc] = useState(watchlist.description);

  const quotes = getWatchlistQuotes(watchlist.id);

  const totalValue = quotes.reduce((sum, q) => sum + q.price, 0);
  const avgChange = quotes.length > 0
    ? quotes.reduce((sum, q) => sum + q.changePercent, 0) / quotes.length
    : 0;

  const handleDelete = () => {
    deleteWatchlist(watchlist.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.1] transition-all duration-300">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  autoFocus
                />
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Description"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (editName.trim()) {
                        updateWatchlist(watchlist.id, editName.trim(), editDesc.trim());
                      }
                      setEditingName(false);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setEditName(watchlist.name); setEditDesc(watchlist.description); }}
                    className="px-3 py-1 bg-white/5 text-slate-400 text-xs rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-white truncate">{watchlist.name}</h3>
                <p className="text-sm text-slate-400 mt-0.5 truncate">{watchlist.description || 'No description'}</p>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => onAddStock(watchlist.id)}
              className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
              title="Add stock"
            >
              <Plus className="w-4 h-4" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
                  <button
                    onClick={() => { setEditingName(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-400">{watchlist.stocks.length} stocks</span>
          </div>
          {quotes.length > 0 && (
            <>
              <div className="text-xs text-slate-400">
                Avg: <span className={`font-medium ${avgChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stock list */}
      {isExpanded && (
        <div className="border-t border-white/[0.04]">
          {quotes.length === 0 && watchlist.stocks.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500 text-sm">No stocks in this watchlist</p>
              <button
                onClick={() => onAddStock(watchlist.id)}
                className="mt-3 text-blue-400 text-sm hover:text-blue-300 transition-colors"
              >
                + Add your first stock
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {quotes.map((quote) => (
                <StockRow key={quote.symbol} quote={quote} watchlistId={watchlist.id} onRemove={removeStockFromWatchlist} />
              ))}
              {/* Show stocks without quotes yet */}
              {watchlist.stocks
                .filter(s => !quotes.find(q => q.symbol === s.symbol))
                .map(s => (
                  <div key={s.symbol} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-slate-400 font-medium">{s.symbol.substring(0, 2)}</span>
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{s.symbol}</p>
                        <p className="text-xs text-slate-500">Loading...</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeStockFromWatchlist(watchlist.id, s.symbol)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Delete Watchlist</h3>
            <p className="text-slate-400 text-sm mt-2">
              Are you sure you want to delete "{watchlist.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StockRow({ quote, watchlistId, onRemove }: { quote: StockQuote; watchlistId: string; onRemove: (id: string, symbol: string) => void }) {
  const isPositive = quote.change >= 0;

  return (
    <div className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-white font-medium truncate">{quote.symbol}</p>
          <p className="text-xs text-slate-500 truncate">{quote.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs text-slate-400">Vol: {formatNumber(quote.volume)}</p>
          <p className="text-xs text-slate-500">H: {formatPrice(quote.high)} L: {formatPrice(quote.low)}</p>
        </div>
        <div className="text-right min-w-[80px]">
          <p className="text-sm text-white font-semibold">{formatPrice(quote.price)}</p>
          <p className={`text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{quote.change.toFixed(2)} ({isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%)
          </p>
        </div>
        <button
          onClick={() => onRemove(watchlistId, quote.symbol)}
          className="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
          title="Remove stock"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
