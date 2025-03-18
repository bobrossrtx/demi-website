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
import EditProfile from "./profile/EditProfile";

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
            {   // This is the main route for the application
                path: "/",
                element: <Index />
            },
            {   // This is the route for the about page
                path: "/about",
                element: <About />
            },
            {   // This is the route for the contact page
                path: "/contact",
                element: <Contact />
            },
            {   // This is the route for the contact page after the form is submitted
                path: "/contact/sent",
                element: <Sent />
            },
            {   // This is the route for the documentation page
                path: "/docs",
                element: <DocPage />
            },
            {   // This is the route for the documentation page with a specific document
                path: "/docs/search",
                element: <Search />
            },
            {   // This is the route for the demi downloads
                path: "/downloads",
                element: <Downloads />
            },
            {   // This is the route for 404 errors
                path: "/*",
                element: <ErrorNotFound />
            },
            {   // This is the route for the login page
                path: "/login",
                element: <Login />
            },
            {   // This is the route for the register page
                path: "/register",
                element: <Register />
            },
            {   // This is the route for the password reset
                path: "/forgot-password",
                element: <ForgotPassword />
            },
            {   // This is the route for the logout page
                path: "/logout",
                element: <Logout />
            },
            {   // This is the route for unauthorized access
                path: "/unauthorized",
                element: <Unauthorized />
            },
            {   // This is the route for the users profile page
                path: "/profile",
                element: <Profile />
            },
            {   // This is the route for the users profile page when editing
                path: "/profile/edit",
                element: <EditProfile />
            },
            {   // This is the route for the users profile page when viewing another users profile
                path: "/profile/:username",
                element: <Profile />
            },
            {   // This is the route for the admin pages
                path: "/admin/*",
                element: <AdminRoute><AdminPage /></AdminRoute>
            }
        ]
    }
]);

export default router;