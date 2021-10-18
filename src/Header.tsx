import { useEffect, useState } from "react";
import "./Header.css";
import browser from "webextension-polyfill";

function useShortcut() {
  const [shortcut, setShortcut] = useState("unset");
  useEffect(() => {
    browser?.commands.getAll().then((commands) => {
      const mainCommand = commands.find(
        ({ name }) => name === "_execute_browser_action"
      );
      if (mainCommand?.shortcut) setShortcut(mainCommand.shortcut);
    });
  }, []);
  return shortcut === "unset" ? "set shortcut" : shortcut;
}

export default function Header() {
  const shortcut = useShortcut();

  return (
    <div className="header">
      <span
        style={{
          textDecoration: "underline",
          cursor: "pointer",
          color: "#4d78cc",
        }}
        onClick={() =>
          browser.tabs.create({
            url: "https://github.com/dbuezas/chrome-palette",
          })
        }
      >
        Chrome Palette
      </span>
      <span>
        <kbd>↑↓</kbd> to navigate
      </span>
      <span>
        <kbd>enter</kbd> to select
      </span>
      <span>
        <kbd>esc</kbd> to dismiss
      </span>
      <span>
        <kbd
          style={{
            textDecoration: "underline",
            cursor: "pointer",
            color: "#4d78cc",
          }}
          onClick={() =>
            browser.tabs.create({ url: "chrome://extensions/shortcuts" })
          }
        >
          {shortcut}
        </kbd>
        shortcut
      </span>
    </div>
  );
}
