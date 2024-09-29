import { defineManifest } from "@crxjs/vite-plugin";

import packageJson from "../package.json";

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = "0"] = packageJson.version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, "")
  // split into version parts
  .split(/[.-]/);

const manifest = defineManifest(async () => ({
  manifest_version: 3,
  name: packageJson.displayName ?? packageJson.name,
  version: `${major}.${minor}.${patch}.${label}`,
  description: packageJson.description,
  // options_page: "src/pages/options/index.html",
  background: { service_worker: "src/pages/background/index.ts" },
  action: {
    default_popup: "src/pages/popup/index.html",
    default_icon: "icons/32x32.png",
  },
  // chrome_url_overrides: {
  //   newtab: "src/pages/popup/index.html",
  // },
  icons: {
    "32": "icons/32x32.png",
    "128": "icons/128x128.png",
  },
  commands: {
    _execute_action: {
      suggested_key: {
        windows: "Ctrl+Shift+P",
        mac: "Command+Shift+P",
        chromeos: "Ctrl+Shift+P",
        linux: "Ctrl+Shift+P",
      },
    },
  },
  permissions: [
    "alarms",
    "tabs",
    "sessions",
    "bookmarks",
    // "processes",
    "history",
    "favicon",
  ],
  web_accessible_resources: [
    {
      resources: [
        "_favicon/*",
        "assets/js/*.js",
        "assets/css/*.css",
        "assets/img/*",
      ],
      matches: ["*://*/*"],
      extension_ids: ["*"],
    },
  ],
}));

export default manifest;
