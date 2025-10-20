
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  function initializeApp() {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      console.error("Root element not found");
      return;
    }
    
    try {
      createRoot(rootElement).render(<App />);
    } catch (error) {
      console.error("Error rendering app:", error);
    }
  }

  // Ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
  