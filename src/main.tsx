import { createRoot } from "react-dom/client";
import { FpjsProvider } from "@fingerprintjs/fingerprintjs-pro-react";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <FpjsProvider
    loadOptions={{
      apiKey: "knXOS0VrOdWznvb5KMt8",
      region: "us",
    }}
  >
    <App />
  </FpjsProvider>
);
