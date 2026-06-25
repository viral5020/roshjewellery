import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store.js";
import { Toaster } from "./components/ui/toaster.jsx";

// Global fetch interceptor to inject API URL for relative requests
const originalFetch = window.fetch;
window.fetch = function (url, options) {
  if (typeof url === 'string' && url.startsWith('/api')) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    url = `${baseUrl}${url}`;
  }
  return originalFetch(url, options);
};

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
      <Toaster />
    </Provider>
  </BrowserRouter>
);
