import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// پشتیبانی از دیپ‌لینک‌ها در GitHub Pages:
// بازدید مستقیم از مسیرهایی مثل /product/... ابتدا به 404.html می‌خورد که
// مسیر را در sessionStorage ذخیره و به ریشه برمی‌گرداند؛ اینجا مسیر بازیابی می‌شود.
const spaRedirect = sessionStorage.getItem("spa-redirect");
if (spaRedirect) {
  sessionStorage.removeItem("spa-redirect");
  window.history.replaceState(null, "", spaRedirect);
}

createRoot(document.getElementById("root")!).render(<App />);
