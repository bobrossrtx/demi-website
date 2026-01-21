import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './SearchBar.scss'
import { smartSearch, SearchableItem, SearchResult } from '../../helpers/searchUtil'
import { faqItems } from '../../helpers/searchData'

type Props = {
    children?: any,
    placeholder?: string
};

export default function SearchBar(props: Props) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SearchableItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch docs and FAQ data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docsResponse = await fetch('/api/docs', {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
        const docsData = docsResponse.ok ? await docsResponse.json() : [];

        // Transform docs to searchable format
        const docsItems: SearchableItem[] = (docsData && Array.isArray(docsData)) ? 
          docsData.map((doc: any) => ({
            id: doc.page,
            title: doc.title || doc.showTitle || '',
            description: doc.description || '',
            tags: doc.tags || [],
            category: doc.category || 'docs',
            type: 'doc',
            url: `/docs?page=${doc.page}`,
          })) : [];

        // Combine docs and FAQ items
        const allItems = [...docsItems, ...faqItems];
        setItems(allItems);
      } catch (error) {
        console.error('Failed to fetch search data:', error);
        // Fall back to just FAQ items
        setItems(faqItems);
      }
    };

    fetchData();
  }, []);

  // Handle live search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        setLoading(true);
        const searchResults = smartSearch(items, searchQuery, 8);
        setResults(searchResults);
        setShowDropdown(true);
        setLoading(false);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [searchQuery, items]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    setShowDropdown(false);
    setSearchQuery('');
    
    // Handle FAQ navigation - navigate to FAQ page and scroll to item
    if (result.type === 'faq') {
      navigate(`/faq#${result.id}`, { replace: false });
      // Scroll to the element after navigation
      setTimeout(() => {
        const element = document.getElementById(result.id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      // Handle doc navigation
      navigate(result.url);
    }
  };

  const handleViewAll = () => {
    navigate(`/docs/search?query=${searchQuery}`);
    setShowDropdown(false);
    setSearchQuery('');
  };

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      handleViewAll();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="search-container" ref={dropdownRef}>
        <input 
          onChange={onSearchChange} 
          className="search-bar" 
          placeholder={props.placeholder}
          value={searchQuery}
          onFocus={() => searchQuery && setShowDropdown(true)}
        />
        {showDropdown && (
          <div className="search-dropdown">
            {loading && <div className="search-loading">Searching...</div>}
            {!loading && results.length > 0 && (
              <>
                <div className="search-results">
                  {results.map((result, index) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      className="search-result-item"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="result-header">
                        <span className="result-title">{result.title}</span>
                        <span className={`result-type ${result.type}`}>{result.type === 'doc' ? 'Doc' : 'FAQ'}</span>
                      </div>
                      <div className="result-description">
                        {result.description.substring(0, 100)}...
                      </div>
                      {result.tags && result.tags.length > 0 && (
                        <div className="result-tags">
                          {result.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="search-footer">
                  <button
                    type="button"
                    className="view-all-btn"
                    onClick={handleViewAll}
                  >
                    View all results ({results.length})
                  </button>
                </div>
              </>
            )}
            {!loading && results.length === 0 && searchQuery.trim() && (
              <div className="search-no-results">
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>
    </form>
  )
}
