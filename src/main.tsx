import React from "react";
import ReactDOM from "react-dom/client";
import "./style/bass.css";
import "./style/index.css";

import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
