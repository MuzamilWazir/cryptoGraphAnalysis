"use client"

import { useState } from "react"

interface Headline {
  title: string
  link: string
  source: string
}

interface ApiResponse {
  success: boolean
  summary: string
  headlines: Headline[]
  token: string
  timestamp: string
  warning?: string
}

export default function NewsCard({ token }: { token: string }) {

  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchAnalysis = async () => {

    setLoading(true)

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token })
      })

      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error("Error fetching analysis:", error)
    }
    
    setLoading(false)
  }

  return (

    <div className="bg-slate-900 text-white p-6 rounded-xl mt-6 border border-slate-700 shadow-lg">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          📊 AI Market Analysis for {token}
        </h2>

        <button
          onClick={fetchAnalysis}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-sm font-semibold transition"
        >
          {loading ? "Analyzing..." : "Get Analysis"}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-slate-400 animate-pulse text-center py-8">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
            <p>Analyzing market data from multiple sources...</p>
          </div>
        </div>
      )}

      {/* Summary Section */}
      {data && !loading && (
        <>
          <div className="bg-slate-800 p-6 rounded-lg mb-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold mb-3 text-blue-300">📈 Analysis Summary</h3>
            <p className="text-slate-100 whitespace-pre-line leading-relaxed">
              {data.summary}
            </p>
            {data.timestamp && (
              <p className="text-xs text-slate-500 mt-3">
                Updated: {new Date(data.timestamp).toLocaleString()}
              </p>
            )}
          </div>

          {/* Headlines Section */}
          {data.headlines && data.headlines.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-200">
                📰 Market Headlines ({data.headlines.length} sources)
              </h3>

              <div className="space-y-3">
                {data.headlines.map((item, index) => (
                  <a
                    key={index}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition cursor-pointer"
                  >
                    {/* Source Badge */}
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-1 bg-blue-600 text-white rounded">
                        {item.source}
                      </span>
                    </div>

                    {/* Headline */}
                    <p className="text-sm text-slate-100 group-hover:text-blue-400 transition line-clamp-2">
                      {item.title}
                    </p>

                    {/* Link Indicator */}
                    <p className="text-xs text-slate-500 mt-2 group-hover:text-blue-400">
                      Read more →
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* No Headlines Alert */}
          {(!data.headlines || data.headlines.length === 0) && (
            <div className="text-slate-400 text-center py-6">
              <p>No headlines available for {token} at this time.</p>
            </div>
          )}

          {/* Status Indicator */}
          {data.warning && (
            <div className="mt-4 p-3 bg-yellow-900 rounded border border-yellow-700 text-yellow-200 text-sm">
              ⚠️ {data.warning}
            </div>
          )}
        </>
      )}

      {/* Initial State */}
      {!data && !loading && (
        <div className="text-slate-400 text-center py-12">
          <p className="mb-4">Click "Get Analysis" to fetch real-time market data and AI insights</p>
          <p className="text-xs">Sources: CoinGecko, Reddit, Twitter/X, News APIs</p>
        </div>
      )}

    </div>
  )
}