import React, { useState, useEffect, useRef } from "react";
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
    const [headings, setHeadings] = useState<Array<{id: string, text: string, level: number}>>([]);
    const [activeHeading, setActiveHeading] = useState<string>("");
    const [copiedCode, setCopiedCode] = useState<string>("");

    const [click, setClick] = useState(false);
    const handleClick = () => setClick(!click);
    
    // Extract headings from markdown
    const extractHeadings = (markdown: string) => {
        const headingRegex = /^(#{1,6})\s+(.+)$/gm;
        const headings: Array<{id: string, text: string, level: number}> = [];
        let match;
        
        while ((match = headingRegex.exec(markdown)) !== null) {
            const level = match[1].length;
            const text = match[2];
            const id = text.toLowerCase().replace(/[^\w]+/g, '-');
            headings.push({ id, text, level });
        }
        
        return headings;
    };
    
    // Copy code to clipboard
    const copyCode = async (code: string, id: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(id);
            setTimeout(() => setCopiedCode(""), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

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
        
        const currentPageData = sortedPages[currentIndex];

        return (
            <>
                <div className="doc-navigation">
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
                                <i className="fas fa-arrow-left"></i>
                                <div className="nav-content">
                                    <span className="nav-label">Previous</span>
                                    <span className="nav-title">{prevPage.title}</span>
                                </div>
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
                                <div className="nav-content">
                                    <span className="nav-label">Next</span>
                                    <span className="nav-title">{nextPage.title}</span>
                                </div>
                                <i className="fas fa-arrow-right"></i>
                            </a>
                        )}
                    </div>
                </div>
                {currentPageData && currentPageData.tags && currentPageData.tags.length > 0 && (
                    <div className="doc-tags">
                        <h4><i className="fas fa-tags"></i> Tags</h4>
                        <div className="doc-tag-list">
                            {currentPageData.tags.map((tag, index) => (
                                <a 
                                    key={index}
                                    href={`/search?query=${encodeURIComponent(tag)}`}
                                    className="doc-tag"
                                >
                                    #{tag}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </>
        );
    };
    
    // Get breadcrumb path
    const getBreadcrumbs = (page: string) => {
        const parts = page.split('/');
        const breadcrumbs = [];
        let path = '';
        
        for (let i = 0; i < parts.length; i++) {
            path = i === 0 ? parts[i] : `${path}/${parts[i]}`;
            const label = parts[i].split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            breadcrumbs.push({ label, path: i === parts.length - 1 ? null : path });
        }
        
        return breadcrumbs;
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
                        .then((data) => {
                            setMarkdown(data);
                            setHeadings(extractHeadings(data));
                        });
                }
            }
        }, 500);
    }, [statusCode, page]);
    
    // Scroll spy for table of contents
    useEffect(() => {
        const handleScroll = () => {
            const headingElements = headings.map(h => document.getElementById(h.id));
            const scrollPosition = window.scrollY + 150;
            
            for (let i = headingElements.length - 1; i >= 0; i--) {
                const element = headingElements[i];
                if (element && element.offsetTop <= scrollPosition) {
                    setActiveHeading(headings[i].id);
                    break;
                }
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [headings]);

    for (let i = 0; i < jsonData.length; i++) {
        if (!categories.includes(jsonData[i].category))
            categories.push(jsonData[i].category);
    }

    if (typeof page == "string" && page.length > 0)
        if (statusCode === 200) {
            const markdown = parseMD(markdownData);
            const breadcrumbs = getBreadcrumbs(page);
            
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
                            {/* Breadcrumbs */}
                            <nav className="breadcrumb-nav">
                                <a href="/docs"><i className="fas fa-home"></i> Docs</a>
                                {breadcrumbs.map((crumb, index) => (
                                    <span key={index}>
                                        <i className="fas fa-chevron-right"></i>
                                        {crumb.path ? (
                                            <a href={`/docs?page=${crumb.path}`}>{crumb.label}</a>
                                        ) : (
                                            <span className="current">{crumb.label}</span>
                                        )}
                                    </span>
                                ))}
                            </nav>
                            
                            {/* Document Header */}
                            <div className="document-header">
                                <h1 className="document-title">
                                    {markdown.metadata["title"]}
                                </h1>
                                <p className="document-description">
                                    {markdown.metadata["description"]}
                                </p>
                            </div>
                            
                            <div className="doc-content-wrapper">
                                {/* Table of Contents */}
                                {headings.length > 0 && (
                                    <aside className="toc-sidebar">
                                        <div className="toc-container">
                                            <h4><i className="fas fa-list"></i> On This Page</h4>
                                            <nav className="toc-nav">
                                                {headings.map((heading, index) => (
                                                    <a
                                                        key={index}
                                                        href={`#${heading.id}`}
                                                        className={`toc-link toc-level-${heading.level} ${activeHeading === heading.id ? 'active' : ''}`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                                                        }}
                                                    >
                                                        {heading.text}
                                                    </a>
                                                ))}
                                            </nav>
                                        </div>
                                    </aside>
                                )}
                                
                                {/* Main Content */}
                                <article className="document-content">
                                    <Markdown 
                                        rehypePlugins={[rehypeHighlight]}
                                        components={{
                                            // Add custom rendering for headings with IDs
                                            h1: ({node, ...props}) => <h1 id={props.children?.toString().toLowerCase().replace(/[^\w]+/g, '-')} {...props} />,
                                            h2: ({node, ...props}) => <h2 id={props.children?.toString().toLowerCase().replace(/[^\w]+/g, '-')} {...props} />,
                                            h3: ({node, ...props}) => <h3 id={props.children?.toString().toLowerCase().replace(/[^\w]+/g, '-')} {...props} />,
                                            h4: ({node, ...props}) => <h4 id={props.children?.toString().toLowerCase().replace(/[^\w]+/g, '-')} {...props} />,
                                            // Custom code block with copy button
                                            pre: ({node, children, ...props}) => {
                                                const codeContent = node?.children?.[0];
                                                const codeText = codeContent?.type === 'element' && codeContent.children?.[0]?.type === 'text' 
                                                    ? codeContent.children[0].value 
                                                    : '';
                                                const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
                                                
                                                return (
                                                    <div className="code-block-wrapper">
                                                        <button 
                                                            className={`code-copy-btn ${copiedCode === codeId ? 'copied' : ''}`}
                                                            onClick={() => copyCode(codeText, codeId)}
                                                        >
                                                            <i className={`fas ${copiedCode === codeId ? 'fa-check' : 'fa-copy'}`}></i>
                                                            {copiedCode === codeId ? 'Copied!' : 'Copy'}
                                                        </button>
                                                        <pre {...props}>{children}</pre>
                                                    </div>
                                                );
                                            },
                                            // Enhanced blockquotes for callouts
                                            blockquote: ({node, children, ...props}) => {
                                                const content = children?.toString() || '';
                                                let type = 'info';
                                                let icon = 'fa-info-circle';
                                                
                                                if (content.startsWith('⚠') || content.toLowerCase().includes('warning')) {
                                                    type = 'warning';
                                                    icon = 'fa-exclamation-triangle';
                                                } else if (content.startsWith('❌') || content.toLowerCase().includes('danger')) {
                                                    type = 'danger';
                                                    icon = 'fa-times-circle';
                                                } else if (content.startsWith('✅') || content.toLowerCase().includes('success')) {
                                                    type = 'success';
                                                    icon = 'fa-check-circle';
                                                } else if (content.startsWith('💡') || content.toLowerCase().includes('tip')) {
                                                    type = 'tip';
                                                    icon = 'fa-lightbulb';
                                                }
                                                
                                                return (
                                                    <blockquote className={`callout callout-${type}`} {...props}>
                                                        <i className={`fas ${icon} callout-icon`}></i>
                                                        <div className="callout-content">{children}</div>
                                                    </blockquote>
                                                );
                                            }
                                        }}
                                    >
                                        {markdown.content}
                                    </Markdown>
                                    
                                    {/* Document Footer */}
                                    <div className="document-footer">
                                        <div className="footer-meta">
                                            <a 
                                                href={`https://github.com/bobrossrtx/demi-lang/edit/master/docs/${page}.md`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="edit-link"
                                            >
                                                <i className="fab fa-github"></i> Edit this page on GitHub
                                            </a>
                                        </div>
                                    </div>

                                    {getPrevNextButtons(jsonData, page)}
                                </article>
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
                    <div className="welcome-hero">
                        <div className="welcome-icon">
                            <i className="fas fa-book-open"></i>
                        </div>
                        <h1 className="documentation-page-title">Welcome to Demi Documentation</h1>
                        <p className="hero-subtitle">
                            Your comprehensive guide to mastering the Demi programming language
                        </p>
                    </div>
                    
                    <div className="welcome-content">
                        <div className="feature-grid">
                            <div className="feature-card">
                                <i className="fas fa-rocket"></i>
                                <h3>Fast Execution</h3>
                                <p>Lightning-fast compilation and runtime performance</p>
                            </div>
                            <div className="feature-card">
                                <i className="fas fa-code"></i>
                                <h3>Modern Syntax</h3>
                                <p>JavaScript-like syntax with powerful additions</p>
                            </div>
                            <div className="feature-card">
                                <i className="fas fa-shield-alt"></i>
                                <h3>Built-in Security</h3>
                                <p>Secure by default with Deno's security features</p>
                            </div>
                        </div>
                        
                        <div className="getting-started-section">
                            <h2><i className="fas fa-play-circle"></i> Ready to Get Started?</h2>
                            <p>
                                Follow our step-by-step guide to begin your journey with Demi. 
                                Whether you're a beginner or an experienced developer, our documentation 
                                will help you make the most of Demi's features.
                            </p>
                            <div className="cta-buttons">
                                <a 
                                    className="cta-btn primary" 
                                    href="/docs?page=getting-started/introduction"
                                >
                                    <i className="fas fa-book"></i> Start Learning
                                </a>
                                <a 
                                    className="cta-btn secondary" 
                                    href="/docs?page=getting-started/installation"
                                >
                                    <i className="fas fa-download"></i> Installation Guide
                                </a>
                            </div>
                        </div>
                        
                        <div className="quick-links">
                            <h3>Popular Topics</h3>
                            <div className="link-grid">
                                <a href="/docs?page=getting-started/first-program" className="quick-link">
                                    <i className="fas fa-file-code"></i>
                                    <span>Your First Program</span>
                                </a>
                                <a href="/docs?page=basics/variables" className="quick-link">
                                    <i className="fas fa-cube"></i>
                                    <span>Variables & Types</span>
                                </a>
                                <a href="/docs?page=basics/functions" className="quick-link">
                                    <i className="fas fa-function"></i>
                                    <span>Functions</span>
                                </a>
                                <a href="/docs?page=basics/control-flow" className="quick-link">
                                    <i className="fas fa-route"></i>
                                    <span>Control Flow</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
