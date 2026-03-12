export interface NewsItem {
  title: string;
  url: string;
  source: 'Google' | 'X';
}

export interface PredictionResult {
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  reason: string;
}