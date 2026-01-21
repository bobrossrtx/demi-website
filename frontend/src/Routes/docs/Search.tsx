import React, { useState, useEffect } from "react";
import "./Search.scss";
import { smartSearch, SearchableItem, SearchResult } from "../../helpers/searchUtil";
import { faqItems } from "../../helpers/searchData";

type Props = {};

interface DocsPage {
    title: string;
    showTitle: string;
    description: string;
    page: string;
    tags: string[];
    category: string;
}

export default function Search(props: Props) {
    const [activeFilters, setActiveFilters] = useState<{
        categories: string[];
        tags: string[];
        types: string[];
    }>({ categories: [], tags: [], types: [] });

    const [showFilters, setShowFilters] = useState(false);
    const [jsonData, setJsonData] = useState<DocsPage[]>([]);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

    const queryParameters = new URLSearchParams(window.location.search);
    const searchQuery = queryParameters.get("query") || "";

    useEffect(() => {
        fetch(`/api/docs`, {
            method: "GET",
            headers: { Accept: "application/json" },
        })
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                throw new Error("Documentation data cannot be located.");
            })
            .then((data) => setJsonData(data))
            .catch(() => setJsonData([]));
    }, []);

    // Convert docs to searchable format
    const docsItems: SearchableItem[] = (jsonData && Array.isArray(jsonData)) ? 
      jsonData.map((doc) => ({
        id: doc.page,
        title: doc.title || doc.showTitle || '',
        description: doc.description || '',
        tags: doc.tags || [],
        category: doc.category || 'docs',
        type: 'doc',
        url: `/docs?page=${doc.page}`,
      })) : [];

    // Combine all searchable items
    const allItems = [...docsItems, ...faqItems];

    // Perform smart search
    useEffect(() => {
        if (searchQuery.trim()) {
            const results = smartSearch(allItems, searchQuery);
            setSearchResults(results);
        } else {
            // Show first 10 items if no query with default score and matched fields
            const defaultResults: SearchResult[] = allItems.slice(0, 10).map(item => ({
                ...item,
                score: 0,
                matchedFields: []
            }));
            setSearchResults(defaultResults);
        }
    }, [searchQuery, allItems]);

    // Get unique filter options
    const uniqueCategories = [
        ...Array.from(new Set(allItems.map((item) => item.category))),
    ];
    const uniqueTags = [
        ...Array.from(new Set(allItems.flatMap((item) => item.tags))),
    ];
    const uniqueTypes = [
        ...Array.from(new Set(allItems.map((item) => item.type))),
    ];

    const handleFilterToggle = (type: "categories" | "tags" | "types", value: string) => {
        setActiveFilters((prev) => ({
            ...prev,
            [type]: prev[type].includes(value)
                ? prev[type].filter((item) => item !== value)
                : [...prev[type], value],
        }));
    };

    // Apply filters to search results
    const filteredResults = searchResults.filter((result) => {
        const matchesCategory =
            activeFilters.categories.length === 0 ||
            activeFilters.categories.includes(result.category);
        const matchesTags =
            activeFilters.tags.length === 0 ||
            result.tags.some((tag) => activeFilters.tags.includes(tag));
        const matchesType =
            activeFilters.types.length === 0 ||
            activeFilters.types.includes(result.type);

        return matchesCategory && matchesTags && matchesType;
    });

    return (
        <div>
            <div className="search-results-container">
                <div className="search-header">
                    <h1 className="search-results-title">
                        Search Results {searchQuery && `for: "${searchQuery}"`}
                    </h1>
                    <button
                        className="filter-button"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        {showFilters ? "Hide Filters ▲" : "Show Filters ▼"}
                    </button>
                </div>

                <div className={`filter-dropdown ${showFilters ? 'open' : ''}`}>
                    <h4 className="filter-label">Content Type</h4>
                    <div className="filter-group">
                        {uniqueTypes.map((type) => (
                            <label key={type} className="filter-option">
                                <input
                                    type="checkbox"
                                    checked={activeFilters.types.includes(type)}
                                    onChange={() => handleFilterToggle("types", type)}
                                />
                                {type === 'doc' ? 'Documentation' : 'FAQ'}
                            </label>
                        ))}
                    </div>

                    <h4 className="filter-label">Categories</h4>
                    <div className="filter-group">
                        {uniqueCategories.map((category) => (
                            <label key={category} className="filter-option">
                                <input
                                    type="checkbox"
                                    checked={activeFilters.categories.includes(category)}
                                    onChange={() =>
                                        handleFilterToggle("categories", category)
                                    }
                                />
                                {category.charAt(0).toUpperCase() +
                                    category.slice(1).replace('-', ' ')}
                            </label>
                        ))}
                    </div>

                    <h4 className="filter-label">Tags</h4>
                    <div className="filter-group">
                        {uniqueTags.map((tag) => (
                            <label key={tag} className="filter-option">
                                <input
                                    type="checkbox"
                                    checked={activeFilters.tags.includes(tag)}
                                    onChange={() => handleFilterToggle("tags", tag)}
                                />
                                {tag}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Search Results */}
                {filteredResults.length > 0 ? (
                    <div className="search-results-list">
                        <div className="results-info">
                            <p>
                                Found <strong>{filteredResults.length}</strong> result
                                {filteredResults.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        {filteredResults.map((result) => (
                            <a
                                key={`${result.type}-${result.id}`}
                                href={result.url}
                                className="search-result-link"
                            >
                                <div className="search-result-container">
                                    <div className="result-header-section">
                                        <span className={`result-type-badge ${result.type}`}>
                                            {result.type === 'doc' ? 'Documentation' : 'FAQ'}
                                        </span>
                                        <h2 className="search-page-title">
                                            {result.title}
                                            <i className="small-fa-icon fas fa-chevron-right"></i>
                                        </h2>
                                    </div>
                                    <p className="search-page-description">
                                        {result.description}
                                    </p>
                                    {result.tags && result.tags.length > 0 && (
                                        <div className="search-page-tags-container">
                                            <div className="tags-list">
                                                {result.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="search-page-tags"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="result-meta">
                                        <span className="meta-category">
                                            {result.category.charAt(0).toUpperCase() +
                                                result.category.slice(1).replace('-', ' ')}
                                        </span>
                                        {result.matchedFields.length > 0 && (
                                            <span className="matched-fields">
                                                Matched in: {result.matchedFields.join(', ')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="container-text-center no-results">
                        <i className="fas fa-search"></i>
                        <h1>No Results Found</h1>
                        <p>
                            {searchQuery
                                ? `No results found for "${searchQuery}". Try adjusting your search terms or filters.`
                                : 'Try searching for something to get started.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
