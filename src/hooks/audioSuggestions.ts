import { useEffect, useState } from "react";
import { Command } from "./commandsSuggestions";
import browser from "webextension-polyfill";
import { UseSuggestionParam } from "./websitesSuggestions";
import { parseInputCommand } from "./parseInputCommand";

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
    fetch();
  }, []);
  const { didMatch } = parseInputCommand(inputValue);
  if (didMatch) return [];
  return commands;
}
