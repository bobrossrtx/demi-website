import * as React from "react";
import {
    createBrowserRouter,
    Outlet
} from "react-router-dom";

// Layouts
import Layout from "../Components/Layout/Layout";
import { AuthProvider } from "../context/AuthContext";

// ROUTE IMPORTS
import Index from "./Index/Index";
import About from "./About/About";
import Contact from "./Contact/Contact";
import Search from "./docs/Search";
import Downloads from "./Downloads/Downloads";
import DocPage from "./docs/DocPage";
import ErrorNotFound from "./Errors/ErrorNotFound";
import Sent from "./Contact/Sent";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import AdminRoute from "../Components/Admin/AdminRoute";
import Unauthorized from "./Auth/Unauthorized";
import AdminPage from "./Admin/AdminPage";
import Logout from "./Auth/Logout";
import ForgotPassword from "./Auth/ForgotPassword";
import Profile from "./profile/Profile";

const router = createBrowserRouter([
    {
        element: (
            <AuthProvider>
                <Layout>
                    <Outlet />
                </Layout>
            </AuthProvider>
        ),
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
                path: "/contact/sent",
                element: <Sent />
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
            },
            {
                path: "/login",
                element: <Login />
            },
            {
                path: "/register",
                element: <Register />
            },
            {
                path: "/forgot-password",
                element: <ForgotPassword />
            },
            {
                path: "/logout",
                element: <Logout />
            },
            {
                path: "/unauthorized",
                element: <Unauthorized />
            },
            {
                path: "/profile",
                element: <Profile />
            },
            {
                path: "/admin/*",
                element: <AdminRoute><AdminPage /></AdminRoute>
            }
        ]
    }
]);

export default router;