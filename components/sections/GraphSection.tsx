"use client";
import { useState, useEffect } from "react";
import { CandlestickData, Time } from "lightweight-charts";

import CryptoChart from "./CryptoChart"; // The component we discussed earlier
import NewsCard from "./NewsCard";

// Fetch all symbols ending in USDT
const fetchAllTokens = async () => {
  try {
    const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
    const data = await response.json();
    
    // Filter for only 'TRADING' status and 'USDT' pairs
    const usdtPairs = data.symbols
      .filter((s: any) => s.status === 'TRADING' && s.symbol.endsWith('USDT'))
      .map((s: any) => ({
        label: s.baseAsset, // e.g., "BTC"
        value: s.symbol,    // e.g., "BTCUSDT"
      }))
      .sort((a: any, b: any) => a.label.localeCompare(b.label)); // Alphabetical

    return usdtPairs;
  } catch (error) {
    console.error("Failed to fetch tokens:", error);
    return [];
  }
};

export default function GraphSection() {
  const [tokens, setTokens] = useState<{label: string, value: string}[]>([]);
  const [tokensLoading, setTokensLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState("BTCUSDT");
  const [chartData, setChartData] = useState<CandlestickData<Time>[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeInterval, setTimeInterval] = useState('1h');
  const [search, setSearch] = useState('');

  // Function to fetch data from Binance (FREE)
  const fetchBinanceData = async (symbol: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeInterval}&limit=100`
      );
      const rawData = await response.json();
      
      // Format Binance data for Lightweight Charts
      const formattedData: CandlestickData<Time>[] = rawData.map((d: (string | number)[]) => ({
        time: (d[0] as number) / 1000, // Binance gives ms, chart needs seconds
        open: parseFloat(d[1] as string),
        high: parseFloat(d[2] as string),
        low: parseFloat(d[3] as string),
        close: parseFloat(d[4] as string),
      }));

      setChartData(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Get all coins on mount
    const loadTokens = async () => {
      const allTokens = await fetchAllTokens();
      setTokens(allTokens);
      setTokensLoading(false);
    };
    loadTokens();
  }, []);

  useEffect(() => {
    fetchBinanceData(selectedToken);
  }, [selectedToken, timeInterval]);

  // Live update every 60 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchBinanceData(selectedToken);
    }, 60000); // 1 minute

    return () => clearInterval(intervalId);
  }, [selectedToken, timeInterval]);

  const filteredTokens = tokens.filter(token => 
    token.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="p-8 bg-gray-900 text-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Market Analysis</h2>
        
        {/* SEARCH BAR */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coins..."
            className="bg-gray-800 border border-gray-700 text-white p-2 rounded-lg w-full md:w-64 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* TIME INTERVAL BUTTONS */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Time Interval:</label>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeInterval('1m')}
              className={`px-4 py-2 rounded-lg ${timeInterval === '1m' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'} hover:bg-gray-600`}
            >
              1 Min
            </button>
            <button
              onClick={() => setTimeInterval('5m')}
              className={`px-4 py-2 rounded-lg ${timeInterval === '5m' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'} hover:bg-gray-600`}
            >
              5 Min
            </button>
            <button
              onClick={() => setTimeInterval('1h')}
              className={`px-4 py-2 rounded-lg ${timeInterval === '1h' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'} hover:bg-gray-600`}
            >
              1 Hour
            </button>
            <button
              onClick={() => setTimeInterval('1d')}
              className={`px-4 py-2 rounded-lg ${timeInterval === '1d' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'} hover:bg-gray-600`}
            >
              1 Day
            </button>
          </div>
        </div>
        
        {/* DROPDOWN */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Token:</label>
          <select 
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white p-2 rounded-lg w-full md:w-64 outline-none focus:ring-2 focus:ring-blue-500"
            disabled={tokensLoading}
          >
            {tokensLoading ? (
              <option>Loading tokens...</option>
            ) : (
              filteredTokens.map((token) => (
                <option key={token.value} value={token.value}>
                  {token.label}
                </option>
              ))
            )}
          </select>
        </div>

        {/* CHART DISPLAY */}
        <div className="bg-black p-4 rounded-xl border border-gray-800 relative">
          {loading ? (
            <div className="h-100 flex items-center justify-center">Loading Data...</div>
          ) : (
            <CryptoChart data={chartData} />
          )}
        </div>

        {/* NEWS ANALYSIS CARD */}
        <NewsCard token={selectedToken.replace('USDT', '')} />
      </div>
    </section>
  );
}