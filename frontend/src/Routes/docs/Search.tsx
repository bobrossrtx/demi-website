import React, { useState, useEffect } from 'react'

import './Search.css'
import { Link, Navigate, redirect } from 'react-router-dom';

type Props = {}

export default function Search(props: Props) {
    
    
    interface Page {
        title:       string;
        showTitle:   string;
        description: string;
        page:        string;
        tags:        string[];
        category:    string;
    }
    

    const [jsonData, setJsonData] = useState<Page[]>([]);
    const [statusCode, setStatusCode] = useState("");

    const queryParameters = new URLSearchParams(window.location.search)
    const searchQuery = queryParameters.get('query') || ""
    
    useEffect(() => {
        fetch(`/api/docs`, {method: "GET", headers: { 'Accept': 'application/json' }})
        .then(response => {
            if (response.status === 200) {
                setStatusCode("200");
                return response.json();
            } throw new Error("Documentation data cannot be located.")
        })
        .then(data => setJsonData(data))
    }, [])

    const results = jsonData.filter((page: Page) =>
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) // Exact match the title
        || page.description.toLowerCase().includes(searchQuery.toLowerCase()) // partial match the description
        || page.tags.indexOf(searchQuery.toLowerCase()) > -1 // either one of the element exact match
        || page.category === searchQuery.toLowerCase() // Exact match the category names
    );

    const [fade, setFade] = useState(false);
    const fadeChevron = () => setFade(false); // TODO: fix the multiple chevron issue + repeat
    const unfadeChevron = () => setFade(false);

    return (
        <div>
            {results.length > 0 ? (
                results.map((page) => (
                    <a className='search-result-link' href={"/docs?page="+page.page}>
                    <div className='search-result-container' onMouseEnter={fadeChevron} onMouseLeave={unfadeChevron} >
                        <h2 className='search-page-title'>{page.category[0].toUpperCase() + page.category.substring(1)} <i className={fade ? "small-fa-icon fas fa-chevron-right beat-fade" : "small-fa-icon fas fa-chevron-right"}></i> {page.showTitle}</h2>
                        <h3 className='search-page-tags-label'>Tags: </h3>{page.tags.map(tag => <a href={"?query="+tag} className="search-page-tags">{tag} •</a>)}
                        <p className='search-page-description'>{page.description}</p>
                    </div>
                    </a>
                ))
            ) : (
                <div className='container-text-center'>
                    <h1>No Results Found!</h1>
                </div>
            )}
        </div> 
    )
}