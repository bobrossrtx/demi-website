import React, { useState } from 'react'
import Markdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import parseMD from 'parse-md'

import "./DocPage.css"
import "./Highlighting.css"
import "../Errors/Errors.css"

type Props = {

}

export default function DocPage(props: Props) {
    const [markdownData, setMarkdown] = useState("");
    const [statusCode, setStatusCode] = useState("");

    const queryParameters = new URLSearchParams(window.location.search)
    const page = queryParameters.get('page')


    fetch(`/api/docs/${page}.md`, { method: "GET"})
        .then(response => {
            if (response.status === 200) {
                setStatusCode("200");
                return response.text();
            } else {
                setStatusCode(response.status.toString());
                return response.text();
            }
        })
        .then(data => setMarkdown(data))


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
            <div className='container-text-center'>
                <h1 className='error-title'>404</h1>
                <p className='error-reason'>Documentation Page Not Found!</p>
            </div>
        )
    }
}