import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// ищем <div id="root"></div> в твоём index.html
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
