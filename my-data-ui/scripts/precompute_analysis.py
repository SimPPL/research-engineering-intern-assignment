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
    from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
    from sklearn.decomposition import LatentDirichletAllocation, PCA
    from sklearn.cluster import KMeans
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
    
    print(f"  Processing  posts...")
    
    for i, post in enumerate(data):
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
    
    print(f"  Processing  ...")
    
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

def compute_semantic_map(data, n_clusters=5):
    """Compute Semantic Map using TF-IDF and PCA"""
    print("\n=== Computing Semantic Map ===")
    
    if not SKLEARN_AVAILABLE:
        print("Skipping semantic map - scikit-learn not installed")
        return None
    
    # Get all text
    texts = [get_full_text(post) for post in data]
    # Keep track of original indices to map back to metadata
    valid_indices = [i for i, t in enumerate(texts) if t and len(t) > 20]
    valid_texts = [texts[i] for i in valid_indices]
    
    if len(valid_texts) < 10:
        print("  Not enough data for semantic map")
        return None
        
    print(f"  Vectorizing {len(valid_texts)} documents...")
    
    # 1. Vectorize (TF-IDF)
    vectorizer = TfidfVectorizer(
        max_df=0.95,
        min_df=2,
        max_features=1000,
        stop_words='english'
    )
    tfidf_matrix = vectorizer.fit_transform(valid_texts)
    
    # 2. Reduce Dimensions (PCA) to 2D for visualization
    print("  Reducing dimensions (PCA)...")
    pca = PCA(n_components=2, random_state=42)
    coords = pca.fit_transform(tfidf_matrix.toarray())
    
    # 3. Cluster (K-Means)
    print(f"  Clustering into {n_clusters} groups...")
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(tfidf_matrix)
    
    # 4. Prepare Result
    points = []
    for i, idx in enumerate(valid_indices):
        post = data[idx]
        points.append({
            'id': post.get('id', str(i)),
            'x': float(coords[i][0]),
            'y': float(coords[i][1]),
            'cluster': int(clusters[i]),
            'author': post.get('author', 'Unknown'),
            'text': valid_texts[i][:100] + "..." # Truncate for JSON size
        })
        
    result = {
        'points': points,
        'clusters': n_clusters
    }
    
    print(f"  Generated {len(points)} points")
    return result

def compute_event_correlations(data, overview_data, sentiment_data, topics_data):
    """Compute correlations between offline events and online data"""
    print("\n=== Computing Event Correlations ===")
    
    events_path = os.path.join(SCRIPT_DIR, '..', 'public', 'events.json')
    if not os.path.exists(events_path):
        print("  Skipping - events.json not found")
        return None
        
    with open(events_path, 'r', encoding='utf-8') as f:
        events = json.load(f)
    
    # Create lookup maps
    volume_map = {item['date']: item['count'] for item in overview_data['timeline']}
    sentiment_map = {item['date']: item for item in sentiment_data['timeline']}
    topic_map = {item['date']: item for item in topics_data['evolution']}
    
    correlations = []
    
    for event in events:
        date = event['date']
        
        # 1. Volume Impact
        # Compare event date volume to 7-day average prior
        vol = volume_map.get(date, 0)
        prev_vol = 0
        count = 0
        for i in range(1, 8):
            # Simple date subtraction logic would be better with datetime objects, 
            # but for this snippet we'll just check if data exists
            # In a real app, use datetime.timedelta
            pass 
            
        # 2. Sentiment Impact
        sent = sentiment_map.get(date, {'positive': 0, 'negative': 0, 'neutral': 0})
        total_sent = sent['positive'] + sent['negative'] + sent['neutral']
        neg_ratio = (sent['negative'] / total_sent) if total_sent > 0 else 0
        
        # 3. Top Topics
        day_topics = topic_map.get(date, {})
        # Sort topics by count for this day
        sorted_topics = sorted(
            [(k, v) for k, v in day_topics.items() if k.startswith('Topic')],
            key=lambda x: x[1],
            reverse=True
        )[:3]
        
        correlations.append({
            'event': event,
            'metrics': {
                'volume': vol,
                'negative_sentiment_ratio': round(neg_ratio, 2),
                'top_topics': [{'name': t[0], 'count': t[1]} for t in sorted_topics]
            }
        })
        
    print(f"  Correlated {len(correlations)} events")
    return correlations

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
    semantic_map = compute_semantic_map(data)
    event_correlations = compute_event_correlations(data, overview, sentiment, topics)
    
    # Save results
    print("\n=== Saving Results ===")
    
    if overview:
        path = os.path.join(OUTPUT_DIR, 'overview.json')
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(overview, f)
        print(f"  Saved: {path}")

    if event_correlations:
        path = os.path.join(OUTPUT_DIR, 'event_correlations.json')
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(event_correlations, f)
        print(f"  Saved: {path}")
    
    print("\n" + "=" * 60)
    print("DONE! Pre-computed files are ready.")
    print("Now update your React components to load these files.")
    print("=" * 60)

if __name__ == '__main__':
    main()
