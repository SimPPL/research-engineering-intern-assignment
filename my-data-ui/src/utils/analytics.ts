import type { RedditPost, ProcessedPost } from '../types';
import { format } from 'date-fns';
// @ts-ignore
import lda from 'lda';
// @ts-ignore
import Vader from 'vader-sentiment';

const Sentiment = Vader.SentimentIntensityAnalyzer;

const extractDomain = (url: string | undefined): string => {
  if (!url) return 'self';
  try {
    // Handle reddit self posts
    if (url.startsWith('/r/')) return 'self.reddit';
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
};

export const processData = (rawData: any[]): ProcessedPost[] => {
  const posts = rawData as RedditPost[];
  
  return posts.map(post => {
    const p = post.data;
    const full_text = (p.title || '') + " " + (p.selftext || '');
    const sentiment_score = Sentiment.polarity_scores(full_text).compound;
    let sentiment_label: 'Positive' | 'Negative' | 'Neutral' = 'Neutral';
    if (sentiment_score > 0.05) sentiment_label = 'Positive';
    else if (sentiment_score < -0.05) sentiment_label = 'Negative';

    const date = new Date(p.created_utc * 1000);
    
    return {
      ...p,
      date: format(date, 'yyyy-MM-dd'),
      datetime: date,
      full_text,
      sentiment_score,
      sentiment_label,
      domain: extractDomain(p.url)
    };
  });
};

export const performTopicModeling = (posts: ProcessedPost[], nTopics: number = 5) => {
  try {
    const documents = posts.map(p => p.full_text).filter(t => t && t.length > 10);
    if (documents.length < 10) {
      console.log("Not enough documents for LDA:", documents.length);
      return [];
    }

    console.log("Running LDA on", documents.length, "documents");
    
    // LDA expects an array of strings.
    // The library returns an array of topics, where each topic is an array of terms.
    const result = lda(documents, nTopics, 5);
    
    console.log("LDA result:", result);
    
    if (!result || !Array.isArray(result)) {
      console.log("LDA returned invalid result");
      return [];
    }
    
    return result;
  } catch (err) {
    console.error("LDA error:", err);
    return [];
  }
};
