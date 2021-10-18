import { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { UseSuggestionParam } from "./websitesSuggestions";
import { useHotkeys } from "react-hotkeys-hook";

export default function useShortcut(
  KEYWORD: string,
  { setInputValue }: UseSuggestionParam
) {
  const [shortcut, setShortcut] = useState("unset");
  useEffect(() => {
    browser?.commands.getAll().then((commands) => {
      const mainCommand = commands.find(({ name }) => name === KEYWORD);
      if (mainCommand?.shortcut) setShortcut(mainCommand.shortcut);
    });
  }, []);
  const shortcut2 = shortcut
    .split("")
    .map((s) =>
      s
        .replace("⇧", "shift")
        .replace("⌘", "command")
        .replace("⌃", "ctrl")
        .replace("⌥", "alt")
    )
    .join("+");
  useHotkeys(
    shortcut2,
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setInputValue(KEYWORD + ">");
    },
    {
      enableOnTags: ["INPUT"],
    }
  );
  return shortcut;
}
