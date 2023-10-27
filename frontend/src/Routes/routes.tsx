import * as React from "react";
import {
    createBrowserRouter,
    Outlet
} from "react-router-dom";

// Layouts
import Layout from "../Components/Layout/Layout";

// ROUTE IMPORTS
import Index from "./Index/Index";
import About from "./About/About";
import Contact from "./Contact/Contact";
import Search from "./docs/Search";
import Downloads from "./Downloads/Downloads";
import DocPage from "./docs/DocPage";
import ErrorNotFound from "./Errors/ErrorNotFound";

const router = createBrowserRouter([
    {
        element: <Layout><Outlet /></Layout>,
        children: [
            {
                path: "/",
                element: <Index />
            },
            {
                path: "/about",
                element: <About />
            },
            {
                path: "/contact",
                element: <Contact />
            },
            {
                path: "/docs",
                element: <DocPage />
            },
            {
                path: "/docs/search",
                element: <Search />
            },
            {
                path: "/downloads",
                element: <Downloads />
            },
            {
                path: "/*",
                element: <ErrorNotFound />
            }
        ]
    }
]);

export default router;