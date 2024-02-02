import React, { useState, useEffect } from 'react'
import Markdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import parseMD from '@demi-lang/parse-md'

import "./DocPage.css"
import "./Highlighting.css"
import "../Errors/Errors.css"

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
        catid:       number;
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

    // let pages: {showTitle: string, catid: number}[];

    if (typeof page == "string" && page.length > 0)
        if (statusCode === 200) {
            const markdown = parseMD(markdownData);
            return (
                <>
                <div className="documentation-page">
                    <div className="documentation-page-sidebar">
                        {categories.map(category => (
                            <>
                            <h4>{category}</h4>
                            <ul>
                                {jsonData.map(page => {
                                    if (page.category === category) return (
                                        <a href={"../docs?page="+page.page}>
                                            <li>
                                                <p className='document-page-sidebar-item'>{page.showTitle}</p>
                                            </li>
                                        </a>
                                    )
                                    
                                    // pages.push({"showTitle": page.showTitle, catid: page.catid})

                                    return <></>
                                })}
                            </ul>
                            </>
                        ))}
                    </div>
                    <div className="documentation-page-container-document">
                        <h1 className="document-title">{markdown.metadata["title"]}</h1>
                        <p className="document-description">{markdown.metadata["description"]}</p>
                        <hr />
                        <Markdown rehypePlugins={[rehypeHighlight]}>{markdown.content}</Markdown>
                                
                    </div>
                </div>
                </>
            );
        } else {
            return (
                <>
                <div className="documentation-page">
                    <div className="documentation-page-sidebar">
                        {categories.map(category => (
                            <>
                            <h4>{category}</h4>
                            <ul>
                                {jsonData.map(page => {
                                    if (page.category === category) return (
                                        <a href={"../docs?page="+page.page}>
                                            <li>
                                                <p className='document-page-sidebar-item'>{page.showTitle}</p>
                                            </li>
                                        </a>
                                    )
                                    return <></>
                                })}
                            </ul>
                            </>
                        ))}
                    </div>
                    <div className="documentation-page-container-temp">
                        {!loaded ? (
                            <div className='doc-temp'>
                                <h3>Loading <i className="fas fa-spinner fa-spin"></i></h3>
                            </div>
                        ) : (
                            <div className='doc-temp'>
                                <h3 className='error-title'>404</h3>
                                <p className='error-reason'>Documentation Page Not Found!</p>
                            </div>
                        )}
                    </div>
                </div>
                </>
            )
        }
    else {
        return (
            <div className="documentation-page">
                <div className="documentation-page-sidebar">
                    {categories.map(category => (
                        <>
                        <h4>{category}</h4>
                        <ul>
                            {jsonData.map(page => {
                                if (page.category === category) return (
                                    <a href={"../docs?page="+page.page}>
                                        <li>
                                            <p className='document-page-sidebar-item'>{page.showTitle}</p>
                                        </li>
                                    </a>
                                )
                                return <></>
                            })}
                        </ul>
                        </>
                    ))}
                </div>
                <div className="documentation-page-container">
                    <h1 className="documentation-page-title">Documentation</h1>
                    {/* {categories.map(category => (
                        <div className="category-container">
                            <h3>{category}</h3>
                            <ul>
                                {jsonData.map(page => {
                                    if (page.category === category) return (
                                        <a href={"../docs?page="+page.page}>
                                            <li>
                                                <h4>{page.showTitle} - {page.description}</h4>
                                            </li>
                                        </a>
                                    )
                                    return <></>
                                })}
                            </ul>
                        </div>
                    ))} */} {/* Un-neccesary code for time being */}
                    <p>
                        The documentation to Demi is a work in progress. (THIS PAGE TO BE COMPLETE)
                    </p>
                </div>
            </div>
        )
    }
}