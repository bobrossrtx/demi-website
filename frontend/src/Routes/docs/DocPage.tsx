import React, { useState, useEffect } from 'react'
import Markdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import parseMD from '@demi-lang/parse-md'

import "./DocPage.css"
import "./Highlighting.css"
import "../Errors/Errors.css"
import { Link } from 'react-router-dom'
import { refreshPage } from '../../helpers/helpers'

type Props = {

}

export default function DocPage(props: Props) {
    const [markdownData, setMarkdown] = useState("");
    const [statusCode, setStatusCode] = useState(0);
    const [loaded, setLoaded] = useState(false);

    const queryParameters = new URLSearchParams(window.location.search)
    const page = queryParameters.get('page')
    
    interface Page {
        title:       string;
        showTitle:   string;
        description: string;
        page:        string;
        tags:        string[];
        category:    string;
    }    

    const [jsonData, setJsonData] = useState<Page[]>([]);
    const categories: Array<string> = []
    
    useEffect(() => {
        fetch(`/api/docs`, {method: "GET", headers: { 'Accept': 'application/json' }})
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } throw new Error("Documentation data cannot be located.")
        })
        .then(data => setJsonData(data))
    }, [])

    useEffect(() => {
        setTimeout(() => {
            if (statusCode !== 200) {
                fetch(`/api/docs/${page}.md`, { method: "GET"})
                .then(response => {
                    if (response.status === 200) {
                        setStatusCode(response.status);
                        setLoaded(true);
                        return response.text();
                    } else {
                        setStatusCode(response.status);
                        setLoaded(true);
                        return response.text();
                    }
                })
                .then(data => setMarkdown(data))
            }
        }, 500);
    }, [statusCode, page]);

    for (let i = 0; i < jsonData.length; i++) {
        if (!categories.includes(jsonData[i].category))
            categories.push(jsonData[i].category);
    }

    if (typeof page == "string" && page.length > 0)
        if (statusCode === 200) {
            const markdown = parseMD(markdownData);
            return (
                <div className='container'>
                    <h1>{markdown.metadata["title"]}</h1>
                    <p>{markdown.metadata["description"]}</p>
                    <hr />
                    <Markdown rehypePlugins={[rehypeHighlight]}>{markdown.content}</Markdown>
                </div>
            );
        } else {
            return (
                <>
                    {!loaded ? (
                        <div className='container-text-center'>
                            <h1>Loading...</h1>
                            <h1><i className="fas fa-spinner fa-spin"></i></h1>
                        </div>
                    ) : (
                        <div className='container-text-center'>
                            <h1 className='error-title'>404</h1>
                            <p className='error-reason'>Documentation Page Not Found!</p>
                        </div>
                    )}
                </>
            )
        }
    else {
        return (
            <div className="documentation-page">
                <h1 className="documentation-page-title">Documentation</h1>
                {categories.map(category => (
                    <div className="category-container">
                        <h3>{category}</h3>
                        <ul>
                            {jsonData.map(page => {
                                if (page.category === category) return (
                                    <a href={"../docs?page="+page.page}>
                                        <li>
                                            <h4>{page.title[0].toUpperCase() + page.title.substring(1)} - {page.description}</h4>
                                        </li>
                                    </a>
                                )
                                return <></>
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        )
    }
}