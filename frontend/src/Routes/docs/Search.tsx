import React, { useState, useEffect } from "react";
import "./Search.css";

type Props = {};

export default function Search(props: Props) {
    interface Page {
        title: string;
        showTitle: string;
        description: string;
        page: string;
        tags: string[];
        category: string;
    }

    const [activeFilters, setActiveFilters] = useState<{
        categories: string[];
        tags: string[];
    }>({ categories: [], tags: [] });

    const [showFilters, setShowFilters] = useState(false);

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const [jsonData, setJsonData] = useState<Page[]>([]);
    const [statusCode, setStatusCode] = useState("");

    const queryParameters = new URLSearchParams(window.location.search);
    const searchQuery = queryParameters.get("query") || "";

    useEffect(() => {
        fetch(`/api/docs`, {
            method: "GET",
            headers: { Accept: "application/json" },
        })
            .then((response) => {
                if (response.status === 200) {
                    setStatusCode("200");
                    return response.json();
                }
                throw new Error("Documentation data cannot be located.");
            })
            .then((data) => setJsonData(data));
    }, []);

    // Get unique filter options from data
    const uniqueCategories = [
        ...Array.from(new Set(jsonData.map((page) => page.category))),
    ];
    const uniqueTags = [
        ...Array.from(new Set(jsonData.flatMap((page) => page.tags))),
    ];

    const handleFilterToggle = (type: "categories" | "tags", value: string) => {
        setActiveFilters((prev) => ({
            ...prev,
            [type]: prev[type].includes(value)
                ? prev[type].filter((item) => item !== value)
                : [...prev[type], value],
        }));
    };

    // const results = jsonData.filter(
    //     (page: Page) =>
    //         page.title.toLowerCase().includes(searchQuery.toLowerCase()) || // Exact match the title
    //         page.description
    //             .toLowerCase()
    //             .includes(searchQuery.toLowerCase()) || // partial match the description
    //         page.tags.indexOf(searchQuery.toLowerCase()) > -1 || // either one of the element exact match
    //         page.category === searchQuery.toLowerCase(), // Exact match the category names
    // );
    const results = jsonData.filter((page: Page) => {
        const matchesSearch =
            searchQuery.trim() === "" ||
            page.title.toLowerCase().includes(searchQuery.toLowerCase()) || // Exact match the title
            page.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) || // partial match the description
            page.tags.some(
                (tag) => tag.toLowerCase() === searchQuery.toLowerCase(),
            ) || // either one of the element exact match
            page.category.toLowerCase() === searchQuery.toLowerCase(); // Exact match the category names
        const matchesCategory =
            activeFilters.categories.length === 0 ||
            activeFilters.categories.includes(page.category);
        const matchesTags =
            activeFilters.tags.length === 0 ||
            page.tags.some((tag) => activeFilters.tags.includes(tag));

        return matchesSearch && matchesCategory && matchesTags;
    });

    const [fade, setFade] = useState(false);
    const fadeChevron = () => setFade(false); // TODO: fix the multiple chevron issue + repeat
    const unfadeChevron = () => setFade(false);

    return (
        <div>
            <div className="search-results-container">
                <div className="search-header">
                    <h1 className="search-results-title">
                        Search Results for: {searchQuery}
                    </h1>
                    <button
                        className="filter-button"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        {showFilters ? "Hide Filters" : "Show Filters"}
                    </button>
                </div>
                {showFilters && (
                    <div className="filter-dropdown">
                        <h4 className="filter-label">Categories</h4>
                        <div className="filter-group">
                            {uniqueCategories.map((category) => (
                                <label key={category} className="filter-option">
                                    <input
                                        type="checkbox"
                                        checked={activeFilters.categories.includes(
                                            category,
                                        )}
                                        onChange={() =>
                                            handleFilterToggle(
                                                "categories",
                                                category,
                                            )
                                        }
                                    />
                                    {category}
                                </label>
                            ))}
                        </div>

                        <h4 className="filter-label">Tags</h4>
                        <div className="filter-group">
                            {uniqueTags.map((tag) => (
                                <label key={tag} className="filter-option">
                                    <input
                                        type="checkbox"
                                        checked={activeFilters.tags.includes(
                                            tag,
                                        )}
                                        onChange={() =>
                                            handleFilterToggle("tags", tag)
                                        }
                                    />
                                    {tag}
                                </label>
                            ))}
                        </div>
                    </div>
                )}{" "}
                {/* New container for results */}
                {results.length > 0 ? (
                    results.map((page) => (
                        <a
                            className="search-result-link"
                            href={"/docs?page=" + page.page}
                        >
                            <div
                                className="search-result-container"
                                onMouseEnter={fadeChevron}
                                onMouseLeave={unfadeChevron}
                            >
                                <h2 className="search-page-title">
                                    {page.category[0].toUpperCase() +
                                        page.category.substring(1)}{" "}
                                    <i
                                        className={
                                            fade
                                                ? "small-fa-icon fas fa-chevron-right beat-fade"
                                                : "small-fa-icon fas fa-chevron-right"
                                        }
                                    ></i>{" "}
                                    {page.showTitle}
                                </h2>
                                <h3 className="search-page-tags-label">
                                    Tags:{" "}
                                </h3>
                                {page.tags.map((tag) => (
                                    <a
                                        href={"?query=" + tag}
                                        className="search-page-tags"
                                    >
                                        {tag} •
                                    </a>
                                ))}
                                <p className="search-page-description">
                                    {page.description}
                                </p>
                            </div>
                        </a>
                    ))
                ) : (
                    <div className="container-text-center">
                        <h1>No Results Found!</h1>
                    </div>
                )}
            </div>{" "}
            {/* End of results container */}
        </div>
    );
}
