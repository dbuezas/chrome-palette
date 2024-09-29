import "./index.scss";

import { render } from "solid-js/web";

import App from "./App";

// if (import.meta.env.DEV) {
//   await import("solid-devtools");
// }

const appContainer = document.querySelector("#app-container");
if (!appContainer) {
  throw new Error("Can not find AppContainer");
}

render(App, appContainer);
