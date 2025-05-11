import { createRoot } from "react-dom/client";
import "bootstrap/dist/js/bootstrap.bundle.min";
import App from "./App.jsx";
import "./index.css";
import 'bootstrap-icons/font/bootstrap-icons.css'	
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ToastProvider } from "./contexts/ToastContext.jsx";
import { CartProvider } from "./contexts/CartContext.jsx";
createRoot(document.getElementById("root")).render(
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
);
