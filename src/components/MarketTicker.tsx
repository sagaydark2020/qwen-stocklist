import React from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import { formatPrice } from '../utils/yahooFinance';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MarketTicker() {
  const { quotes } = useWatchlist();
  const allQuotes = Object.values(quotes);

  if (allQuotes.length === 0) return null;

  return (
    <div className="bg-slate-900/60 border-b border-white/[0.04] overflow-hidden">
      <div className="flex animate-scroll">
        {[...allQuotes, ...allQuotes].map((quote, idx) => {
          const isPositive = quote.change > 0;
          const isNegative = quote.change < 0;
          return (
            <div
              key={`${quote.symbol}-${idx}`}
              className="flex items-center gap-2 px-4 py-2.5 whitespace-nowrap border-r border-white/[0.03]"
            >
              <span className="text-xs font-medium text-white">{quote.symbol}</span>
              <span className="text-xs text-slate-300">{formatPrice(quote.price)}</span>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${
                isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-slate-400'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : isNegative ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <Minus className="w-3 h-3" />
                )}
                {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
