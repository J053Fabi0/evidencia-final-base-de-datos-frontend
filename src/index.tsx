import App from "./App";
import theme from "./theme";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";

const root = createRoot(document.getElementById("root")!);

root.render(
  <StrictMode>
    <CssBaseline />

    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StrictMode>
);
