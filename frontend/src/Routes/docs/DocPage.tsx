import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import parseMD from "@demi-lang/parse-md";

// Change import from CSS to SCSS
import "./DocPage.scss";
import "./Highlighting.scss";
import "../Errors/Errors.scss";

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
                        <div className={click ? "documentation-page-container-document sidebar-active" : "documentation-page-container-document sidebar-inactive"}>
                            <h1 className="document-title">
                                {markdown.metadata["title"]}:
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
                        <div className={click ? "documentation-page-container-temp sidebar-active" : "documentation-page-container-temp sidebar-inactive"}>
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
                <div className={click ? "documentation-page-container sidebar-active" : "documentation-page-container sidebar-inactive"}>
                    <h1 className="documentation-page-title">Welcome to Demi Documentation</h1>
                    <p>
                        Welcome to Demi, a modern programming language designed for simplicity and performance.
                        Here you'll find comprehensive documentation covering everything from basic concepts to
                        advanced features that make Demi unique.
                    </p>
                    <p>
                        Demi runs on the powerful Deno runtime, offering:
                        <ul style={{ listStyleType: 'none',}}>
                            <li>Fast execution and compilation times</li>
                            <li>Modern JavaScript-like syntax with powerful additions</li>
                            <li>Built-in security features from Deno</li>
                        </ul>
                    </p>
                    <p>
                        Ready to get started? Follow our{" "}
                        <a
                            className="default-link"
                            href="/docs?page=getting-started/introduction"
                        >
                            Introduction
                        </a>{" "}
                        to begin your journey with Demi. Whether you're a beginner or an experienced developer,
                        our documentation will help you make the most of Demi's features.
                    </p>
                </div>
            </div>
        );
    }
}
