export interface RedditPost {
  kind: string;
  data: {
    id: string;
    title: string;
    selftext: string;
    author: string;
    subreddit: string;
    score: number;
    ups: number;
    downs: number;
    created_utc: number;
    url: string;
    num_comments: number;
    subreddit_subscribers: number;
    permalink: string;
    thumbnail: string;
    [key: string]: any;
  };
}

export interface ProcessedPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  subreddit: string;
  score: number;
  ups: number;
  downs: number;
  created_utc: number;
  url: string;
  num_comments: number;
  subreddit_subscribers: number;
  permalink: string;
  thumbnail: string;
  date: string; // YYYY-MM-DD
  datetime: Date;
  full_text: string;
  sentiment_score: number;
  sentiment_label: 'Positive' | 'Negative' | 'Neutral';
  topic?: number;
  domain?: string;
  [key: string]: any;
}

export interface FilterState {
  dateRange: [Date, Date];
  sentiments: string[];
  searchQuery: string;
}
