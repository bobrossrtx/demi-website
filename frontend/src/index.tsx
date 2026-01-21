import * as React from "react";
import * as ReactDom from "react-dom/client";
import {
  RouterProvider,
} from "react-router-dom";
import router from "./Routes/routes";
import { initTheme } from "./helpers/themeManager";

// Global css
import 'bootstrap/dist/css/bootstrap.css'
import "./global.scss";

// Initialize theme before render
initTheme();

ReactDom.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);