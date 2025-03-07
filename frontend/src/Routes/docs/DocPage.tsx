import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import parseMD from "@demi-lang/parse-md";
import { Link } from "react-router-dom";

import "./DocPage.css";
import "./Highlighting.css";
import "../Errors/Errors.css";

import DocSideBar from "../../Components/doc-sidebar/DocSideBar";

type Props = {};

export default function DocPage(props: Props) {
    const [markdownData, setMarkdown] = useState("");
    const [statusCode, setStatusCode] = useState(0);
    const [loaded, setLoaded] = useState(false);

    const [click, setClick] = useState(false);
    const handleClick = () => setClick(!click);

    const queryParameters = new URLSearchParams(window.location.search);
    const page = queryParameters.get("page");

    interface Page {
        title: string;
        showTitle: string;
        description: string;
        page: string;
        tags: string[];
        category: string;
        order: number;
        catid: number;
    }

    const [jsonData, setJsonData] = useState<Page[]>([]);
    const categories: Array<string> = [];

    const getPrevNextButtons = (pages: Page[], currentPage: string) => {
        // Sort pages by category and order
        const sortedPages = [...pages].sort((a, b) => {
            if (a.catid !== b.catid) {
                return a.catid - b.catid;
            }
            return (a.order || 0) - (b.order || 0);
        });

        // Find the current page index
        const currentIndex = sortedPages.findIndex(
            (p) => p.page === currentPage,
        );

        if (currentIndex === -1) return null;

        const prevPage =
            currentIndex > 0 ? sortedPages[currentIndex - 1] : null;
        const nextPage =
            currentIndex < sortedPages.length - 1
                ? sortedPages[currentIndex + 1]
                : null;

        return (
            <>
                <div
                    className="doc-nav-prev"
                    onClick={() => {
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    }}
                >
                    {prevPage && (
                        <a href={`/docs?page=${prevPage.page}`}>
                            <i className="fas fa-arrow-left"></i> Previous:{" "}
                            {prevPage.title}
                        </a>
                    )}
                </div>
                <div
                    className="doc-nav-next"
                    onClick={() => {
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    }}
                >
                    {nextPage && (
                        <a href={`/docs?page=${nextPage.page}`}>
                            Next: {nextPage.title}{" "}
                            <i className="fas fa-arrow-right"></i>
                        </a>
                    )}
                </div>
                <div className="doc-tags">
                    {prevPage && prevPage.tags && prevPage.tags.length > 0 && (
                        <div>
                            <h4>Tags:</h4>
                            <ul>
                                {prevPage.tags.map((tag, index) => (
                                    <li key={index}>{tag}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </>
        );
    };

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
            .then((data) => setJsonData(data));
    }, []);

    useEffect(() => {
        setTimeout(() => {
            if (page != null) {
                if (statusCode !== 200) {
                    fetch(`/api/docs/${page}.md`, { method: "GET" })
                        .then((response) => {
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
                        .then((data) => setMarkdown(data));
                }
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
                <>
                    <div className="documentation-page">
                        <DocSideBar
                            click={click}
                            handleClick={handleClick}
                            categories={categories}
                            jsonData={jsonData}
                        />
                        <div className="documentation-page-container-document">
                            <h1 className="document-title">
                                {markdown.metadata["title"]}
                            </h1>
                            <p className="document-description">
                                {markdown.metadata["description"]}
                            </p>
                            <hr />
                            <Markdown rehypePlugins={[rehypeHighlight]}>
                                {markdown.content}
                            </Markdown>

                            <div className="doc-navigation">
                                {getPrevNextButtons(jsonData, page)}
                            </div>
                        </div>
                    </div>
                </>
            );
        } else {
            return (
                <>
                    <div className="documentation-page">
                        <DocSideBar
                            click={click}
                            handleClick={handleClick}
                            categories={categories}
                            jsonData={jsonData}
                        />
                        <div className="documentation-page-container-temp">
                            {!loaded ? (
                                <div className="doc-temp">
                                    <h3>
                                        Loading{" "}
                                        <i className="fas fa-spinner fa-spin"></i>
                                    </h3>
                                </div>
                            ) : (
                                <div className="doc-temp">
                                    <h3 className="error-title">404</h3>
                                    <p className="error-reason">
                                        Documentation Page Not Found!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            );
        }
    else {
        return (
            <div className="documentation-page">
                <DocSideBar
                    click={click}
                    handleClick={handleClick}
                    categories={categories}
                    jsonData={jsonData}
                />
                <div className="documentation-page-container">
                    <h1 className="documentation-page-title">Documentation</h1>
                    <p>
                        Welcome to Demi, here you can learn the basics and the
                        fundamentals to programming in Demi. Demi is a fast Deno
                        runtime featuring different syntax If you would like to
                        install Demi please follow this{" "}
                        <a
                            className="default-link"
                            href="/docs?page=getting-started/installation"
                        >
                            Guide
                        </a>
                        !
                    </p>
                </div>
            </div>
        );
    }
}
