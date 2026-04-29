import { render } from "solid-js/web";
import App from "./App.jsx";
import "./styles.css";

render(() => <App />, document.getElementById("root"));

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        registration.active?.postMessage({ type: "CACHE_FRAMES" });
      })
      .catch(() => undefined);
  });
}
