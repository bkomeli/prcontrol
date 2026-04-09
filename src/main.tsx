import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ActivationProvider } from "./context/ActivationContext";
import { DateFilterProvider } from "./context/DateFilterContext";
import App from "./App.tsx";
import "./index.css";
// force reload

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ActivationProvider>
        <DateFilterProvider>
          <App />
        </DateFilterProvider>
      </ActivationProvider>
    </BrowserRouter>
  </React.StrictMode>
);
