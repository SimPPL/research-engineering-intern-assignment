"""
Pre-compute Analysis Script
Generates JSON files for the React dashboard to consume.
This processes ALL data efficiently using Python libraries.
"""

import json
import os
from collections import defaultdict
from datetime import datetime
import re

# You may need to install these: pip install scikit-learn vaderSentiment networkx
try:
    from sklearn.feature_extraction.text import CountVectorizer
    from sklearn.decomposition import LatentDirichletAllocation
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("Warning: scikit-learn not installed. Run: pip install scikit-learn")

try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    VADER_AVAILABLE = True
except ImportError:
    VADER_AVAILABLE = False
    print("Warning: vaderSentiment not installed. Run: pip install vaderSentiment")

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(SCRIPT_DIR, '..', 'public', 'data.json')
OUTPUT_DIR = os.path.join(SCRIPT_DIR, '..', 'public', 'precomputed')

def load_data():
    """Load the main data.json file"""
    print(f"Loading data from {DATA_PATH}...")
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)
    
    # Handle nested Reddit data structure: [{kind: "t3", data: {...}}, ...]
    data = []
    for item in raw_data:
        if isinstance(item, dict):
            if 'data' in item and 'kind' in item:
                # Nested structure
                data.append(item['data'])
            else:
                # Flat structure
                data.append(item)
    
    print("processing")
    return data

def extract_date(post):
    """Extract date from post"""
    created = post.get('created_utc') or post.get('created') or post.get('date', '')
    if isinstance(created, (int, float)):
        return datetime.fromtimestamp(created).strftime('%Y-%m-%d')
    elif isinstance(created, str):
        return created[:10] if len(created) >= 10 else created
    return ''

def get_full_text(post):
    """Get combined text from post"""
    title = post.get('title', '') or ''
    selftext = post.get('selftext', '') or ''
    body = post.get('body', '') or ''
    return f"{title} {selftext} {body}".strip()

def compute_sentiment(data):
    """Compute sentiment for all posts using VADER"""
    print("\n=== Computing Sentiment Analysis ===")
    
    if not VADER_AVAILABLE:
        print("Skipping sentiment - vaderSentiment not installed")
        return None
    
    analyzer = SentimentIntensityAnalyzer()
    
    sentiment_by_date = defaultdict(lambda: {'positive': 0, 'negative': 0, 'neutral': 0, 'total': 0})
    sentiment_distribution = {'positive': 0, 'negative': 0, 'neutral': 0}
    post_sentiments = []  # Store per-post sentiment
    
    for i, post in enumerate(data):
        if i % 5000 == 0:
            print(f"  Processing sentiment: {i}/{len(data)}")
        
        text = get_full_text(post)
        if not text:
            post_sentiments.append({'id': post.get('id', ''), 'sentiment': 'neutral', 'score': 0})
            continue
            
        scores = analyzer.polarity_scores(text)
        compound = scores['compound']
        
        if compound >= 0.05:
            sentiment = 'positive'
        elif compound <= -0.05:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        
        sentiment_distribution[sentiment] += 1
        
        date = extract_date(post)
        if date:
            sentiment_by_date[date][sentiment] += 1
            sentiment_by_date[date]['total'] += 1
        
        post_sentiments.append({
            'id': post.get('id', ''),
            'sentiment': sentiment,
            'score': compound
        })
    
    # Convert to sorted list
    timeline = []
    for date in sorted(sentiment_by_date.keys()):
        counts = sentiment_by_date[date]
        timeline.append({
            'date': date,
            'positive': counts['positive'],
            'negative': counts['negative'],
            'neutral': counts['neutral'],
            'total': counts['total']
        })
    
    result = {
        'distribution': sentiment_distribution,
        'timeline': timeline,
        'post_sentiments': post_sentiments
    }
    
    print(f"  Sentiment distribution: {sentiment_distribution}")
    return result

def compute_topics(data, n_topics=5, n_top_words=10):
    """Compute LDA topic modeling"""
    print("\n=== Computing Topic Modeling (LDA) ===")
    
    if not SKLEARN_AVAILABLE:
        print("Skipping topics - scikit-learn not installed")
        return None
    
    # Get all text
    texts = [get_full_text(post) for post in data]
    texts = [t for t in texts if t and len(t) > 20]  # Filter empty/short texts
    
    print(f"  Processing {len(texts)} documents...")
    
    # Vectorize
    vectorizer = CountVectorizer(
        max_df=0.95,  # Ignore terms in >95% of docs
        min_df=5,     # Ignore terms in <5 docs
        max_features=5000,
        stop_words='english'
    )
    
    try:
        doc_term_matrix = vectorizer.fit_transform(texts)
    except ValueError as e:
        print(f"  Error vectorizing: {e}")
        return None
    
    print(f"  Vocabulary size: {len(vectorizer.get_feature_names_out())}")
    
    # LDA
    print(f"  Running LDA with {n_topics} topics...")
    lda = LatentDirichletAllocation(
        n_components=n_topics,
        max_iter=20,
        learning_method='online',
        random_state=42,
        n_jobs=-1  # Use all CPU cores
    )
    lda.fit(doc_term_matrix)
    
    # Extract topics
    feature_names = vectorizer.get_feature_names_out()
    topics = []
    
    for topic_idx, topic in enumerate(lda.components_):
        top_indices = topic.argsort()[:-n_top_words-1:-1]
        top_words = [{'term': feature_names[i], 'weight': float(topic[i])} for i in top_indices]
        topics.append({
            'id': topic_idx + 1,
            'name': f"Topic {topic_idx + 1}",
            'words': top_words
        })
        print(f"  Topic {topic_idx + 1}: {', '.join([w['term'] for w in top_words[:5]])}")
    
    # Compute topic evolution over time
    print("  Computing topic evolution...")
    topic_by_date = defaultdict(lambda: {f"Topic {i+1}": 0 for i in range(n_topics)})
    
    for post in data:
        text = get_full_text(post)
        date = extract_date(post)
        if not text or not date:
            continue
        
        # Check which topics this post matches (simple keyword matching)
        for topic in topics:
            top_terms = [w['term'] for w in topic['words'][:3]]
            text_lower = text.lower()
            if any(term in text_lower for term in top_terms):
                topic_by_date[date][topic['name']] += 1
    
    evolution = []
    for date in sorted(topic_by_date.keys()):
        entry = {'date': date}
        entry.update(topic_by_date[date])
        evolution.append(entry)
    
    result = {
        'topics': topics,
        'evolution': evolution
    }
    
    return result

def compute_network(data, max_nodes=500):
    """Compute network graph data (author interactions)"""
    print("\n=== Computing Network Graph ===")
    
    # Build author interaction network
    # Connect authors who post in the same subreddit on the same day
    
    author_subreddit_date = defaultdict(set)
    author_post_count = defaultdict(int)
    
    for post in data:
        author = post.get('author', '')
        subreddit = post.get('subreddit', '')
        date = extract_date(post)
        
        if author and author != '[deleted]' and subreddit and date:
            author_subreddit_date[(subreddit, date)].add(author)
            author_post_count[author] += 1
    
    # Build edges
    edge_weights = defaultdict(int)
    
    for (subreddit, date), authors in author_subreddit_date.items():
        authors = list(authors)
        for i in range(len(authors)):
            for j in range(i + 1, len(authors)):
                edge = tuple(sorted([authors[i], authors[j]]))
                edge_weights[edge] += 1
    
    # Get top authors by post count
    top_authors = sorted(author_post_count.items(), key=lambda x: -x[1])[:max_nodes]
    top_author_set = set(a[0] for a in top_authors)
    
    # Build nodes
    nodes = []
    for author, count in top_authors:
        nodes.append({
            'id': author,
            'name': author,
            'val': count,  # Size by post count
            'posts': count
        })
    
    # Build links (only between top authors)
    links = []
    for (a1, a2), weight in edge_weights.items():
        if a1 in top_author_set and a2 in top_author_set and weight >= 2:
            links.append({
                'source': a1,
                'target': a2,
                'value': weight
            })
    
    result = {
        'nodes': nodes,
        'links': links
    }
    
    print(f"  Network: {len(nodes)} nodes, {len(links)} links")
    return result

def compute_overview(data):
    """Compute overview statistics"""
    print("\n=== Computing Overview Statistics ===")
    
    # Timeline
    posts_by_date = defaultdict(int)
    author_post_count = defaultdict(int)
    subreddit_count = defaultdict(int)
    
    for post in data:
        date = extract_date(post)
        author = post.get('author', '')
        subreddit = post.get('subreddit', '')
        
        if date:
            posts_by_date[date] += 1
        if author and author != '[deleted]':
            author_post_count[author] += 1
        if subreddit:
            subreddit_count[subreddit] += 1
    
    # Timeline data
    timeline = [{'date': d, 'count': c} for d, c in sorted(posts_by_date.items())]
    
    # Top authors
    top_authors = [{'author': a, 'count': c} for a, c in sorted(author_post_count.items(), key=lambda x: -x[1])[:20]]
    
    # Top subreddits
    top_subreddits = [{'subreddit': s, 'count': c} for s, c in sorted(subreddit_count.items(), key=lambda x: -x[1])[:10]]
    
    # Stats
    stats = {
        'totalPosts': len(data),
        'uniqueAuthors': len(author_post_count),
        'uniqueSubreddits': len(subreddit_count),
        'dateRange': {
            'start': min(posts_by_date.keys()) if posts_by_date else '',
            'end': max(posts_by_date.keys()) if posts_by_date else ''
        }
    }
    
    result = {
        'stats': stats,
        'timeline': timeline,
        'topAuthors': top_authors,
        'topSubreddits': top_subreddits
    }
    
    print(f"  Stats: {stats}")
    return result

def main():
    """Main function to run all computations"""
    print("=" * 60)
    print("PRE-COMPUTING ANALYSIS FOR REACT DASHBOARD")
    print("=" * 60)
    
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Output directory: {OUTPUT_DIR}")
    
    # Load data
    data = load_data()
    
    # Compute all analyses
    overview = compute_overview(data)
    sentiment = compute_sentiment(data)
    topics = compute_topics(data)
    network = compute_network(data)
    
    # Save results
    print("\n=== Saving Results ===")
    
    if overview:
        path = os.path.join(OUTPUT_DIR, 'overview.json')
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(overview, f)
        print(f"  Saved: {path}")
    
    if sentiment:
        path = os.path.join(OUTPUT_DIR, 'sentiment.json')
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(sentiment, f)
        print(f"  Saved: {path}")
    
    if topics:
        path = os.path.join(OUTPUT_DIR, 'topics.json')
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(topics, f)
        print(f"  Saved: {path}")
    
    if network:
        path = os.path.join(OUTPUT_DIR, 'network.json')
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(network, f)
        print(f"  Saved: {path}")
    
    print("\n" + "=" * 60)
    print("DONE! Pre-computed files are ready.")
    print("Now update your React components to load these files.")
    print("=" * 60)

if __name__ == '__main__':
    main()
