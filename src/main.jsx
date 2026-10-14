import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext";
import{BrowserRouter} from 
"react-router-dom";
import "./index.css";
import App from "./App.jsx";

registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
  <AuthProvider>
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  </AuthProvider>
  </ThemeProvider>
);