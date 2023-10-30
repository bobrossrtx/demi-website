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
    const [statusCode, setStatusCode] = useState("");
    const [loaded, setLoaded] = useState(false);

    const queryParameters = new URLSearchParams(window.location.search)
    const page = queryParameters.get('page')


    useEffect(() => {
        setTimeout(() => {
            fetch(`/api/docs/${page}.md`, { method: "GET"})
                .then(response => {
                    if (response.status === 200) {
                        setStatusCode("200");
                        setLoaded(true);
                        return response.text();
                    } else {
                        setStatusCode(response.status.toString());
                        return response.text();
                    }
                })
                .then(data => setMarkdown(data))
        }, 2000)
    }, []);

    if (statusCode === "200") {
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
}