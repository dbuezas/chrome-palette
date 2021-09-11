let browser: typeof import("webextension-polyfill");
if (process.env.NODE_ENV === "production") {
  browser = require("webextension-polyfill");
}

export default browser!;
