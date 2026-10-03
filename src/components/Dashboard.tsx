import React, { useState } from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import WatchlistCard from './WatchlistCard';
import AddStockModal from './AddStockModal';
import CreateWatchlistModal from './CreateWatchlistModal';
import MarketTicker from './MarketTicker';
import { Plus, LayoutGrid, List, TrendingUp, TrendingDown, Activity } from 'lucide-react';

export default function Dashboard() {
  const { watchlists, quotes, isSyncing, lastSyncTime } = useWatchlist();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [addStockWatchlistId, setAddStockWatchlistId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Calculate market summary
  const allQuotes = Object.values(quotes);
  const gainers = allQuotes.filter(q => q.change > 0).length;
  const losers = allQuotes.filter(q => q.change < 0).length;
  const unchanged = allQuotes.filter(q => q.change === 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Market Ticker */}
      <MarketTicker />
      
      {/* Market Summary Bar */}
      <div className="bg-slate-900/50 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300 font-medium">Market Overview</span>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-sm text-emerald-400 font-medium">{gainers} Gainers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-sm text-red-400 font-medium">{losers} Losers</span>
                </div>
                <span className="text-sm text-slate-500">{unchanged} Unchanged</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSyncing && (
                <span className="text-xs text-yellow-400 animate-pulse">Syncing...</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">My Watchlists</h2>
            <p className="text-sm text-slate-400 mt-1">
              {watchlists.length} watchlist{watchlists.length !== 1 ? 's' : ''} • {allQuotes.length} stocks tracked
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="hidden sm:flex items-center bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Create watchlist button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-600/25"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Watchlist</span>
            </button>
          </div>
        </div>

        {/* Watchlists */}
        {watchlists.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-2xl mb-4">
              <List className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white">No watchlists yet</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
              Create your first watchlist to start tracking UAE market stocks in real-time.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-600/25"
            >
              <Plus className="w-4 h-4" />
              Create Your First Watchlist
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-4'}>
            {watchlists.map((watchlist) => (
              <WatchlistCard
                key={watchlist.id}
                watchlist={watchlist}
                onAddStock={(id) => setAddStockWatchlistId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateWatchlistModal onClose={() => setShowCreateModal(false)} />
      )}
      {addStockWatchlistId && (
        <AddStockModal
          watchlistId={addStockWatchlistId}
          onClose={() => setAddStockWatchlistId(null)}
        />
      )}
    </div>
  );
}
