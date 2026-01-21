/**
 * Smart search utility with relevance scoring
 */

export interface SearchableItem {
  id: string;
  title: string;
  description: string;
  content?: string;
  tags: string[];
  category: string;
  type: 'doc' | 'faq';
  url: string;
}

export interface SearchResult extends SearchableItem {
  score: number;
  matchedFields: string[];
}

/**
 * Calculate relevance score for a search result
 * Considers exact matches, partial matches, and field importance
 */
export const calculateRelevanceScore = (
  item: SearchableItem,
  query: string
): { score: number; matchedFields: string[] } => {
  const queryLower = query.toLowerCase().trim();
  const words = queryLower.split(/\s+/).filter(w => w.length > 0);

  let score = 0;
  const matchedFields: string[] = [];

  // Title matches (highest priority)
  if (item.title.toLowerCase().includes(queryLower)) {
    score += 100;
    matchedFields.push('title');
  } else {
    // Partial word matches in title
    words.forEach(word => {
      if (item.title.toLowerCase().includes(word)) {
        score += 50;
        if (!matchedFields.includes('title')) matchedFields.push('title');
      }
    });
  }

  // Tags exact matches (high priority)
  item.tags.forEach(tag => {
    if (tag.toLowerCase() === queryLower) {
      score += 80;
      if (!matchedFields.includes('tags')) matchedFields.push('tags');
    } else if (tag.toLowerCase().includes(queryLower)) {
      score += 40;
      if (!matchedFields.includes('tags')) matchedFields.push('tags');
    }
  });

  // Category exact match
  if (item.category.toLowerCase() === queryLower) {
    score += 60;
    matchedFields.push('category');
  }

  // Description matches (medium priority)
  if (item.description.toLowerCase().includes(queryLower)) {
    score += 30;
    matchedFields.push('description');
  } else {
    words.forEach(word => {
      if (item.description.toLowerCase().includes(word)) {
        score += 15;
        if (!matchedFields.includes('description')) matchedFields.push('description');
      }
    });
  }

  // Content matches (lower priority)
  if (item.content) {
    if (item.content.toLowerCase().includes(queryLower)) {
      score += 10;
      matchedFields.push('content');
    } else {
      words.forEach(word => {
        if (item.content!.toLowerCase().includes(word)) {
          score += 5;
          if (!matchedFields.includes('content')) matchedFields.push('content');
        }
      });
    }
  }

  return { score, matchedFields };
};

/**
 * Perform smart search across items
 */
export const smartSearch = (
  items: SearchableItem[],
  query: string,
  limit?: number
): SearchResult[] => {
  if (!query.trim()) {
    return [];
  }

  const results: SearchResult[] = items
    .map(item => {
      const { score, matchedFields } = calculateRelevanceScore(item, query);
      return {
        ...item,
        score,
        matchedFields
      };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit || 10);

  return results;
};

/**
 * Highlight matching text in content
 */
export const highlightMatch = (text: string, query: string): string => {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

/**
 * Get preview text with highlights
 */
export const getPreviewText = (text: string, query: string, length: number = 150): string => {
  const queryLower = query.toLowerCase();
  const index = text.toLowerCase().indexOf(queryLower);
  
  let preview: string;
  if (index > -1) {
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + length);
    preview = (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');
  } else {
    preview = text.substring(0, length) + (text.length > length ? '...' : '');
  }
  
  return preview;
};
