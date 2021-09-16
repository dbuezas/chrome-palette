import { useEffect, useState } from "react";
import { Command } from "./commands";
import browser from "webextension-polyfill";
import { UseSuggestionParam } from "./websitesCommands";
import { parseCommand } from "./parseCommand";

export function useAudibleTabSuggestions({
  setInputValue,
  inputValue,
}: UseSuggestionParam) {
  const [commands, setCommands] = useState<Command[]>([]);
  useEffect(() => {
    const fetch = async () => {
      if (!browser) return;
      const allTabs = await browser.tabs.query({ audible: true });
      const actions: Command[] = allTabs.map(
        ({ title, url, id, windowId }) => ({
          name: `Sound/Audio tab: ${title}`,
          icon: "chrome://favicon/" + url,
          category: "Tab",
          command: () => {
            browser.tabs.update(id, { highlighted: true });
            browser.windows.update(windowId!, { focused: true });
            window.close();
          },
        })
      );
      if (actions.length === 0) {
        actions.push({
          name: `Sound/Audio tab: [none]`,
          category: "Tab",
          command: () => {
            window.close();
          },
        });
      }
      setCommands(actions);
    };
    fetch().catch((e) => console.log(e));
  }, []);
  const { didMatch } = parseCommand(inputValue);
  if (didMatch) return [];
  return commands;
}
