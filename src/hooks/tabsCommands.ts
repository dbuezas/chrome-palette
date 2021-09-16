import { useEffect, useState } from "react";
import { Command } from "./commands";
import { formatDistance } from "date-fns";
import { parseCommand } from "./parseCommand";
import browser from "webextension-polyfill";
import { UseSuggestionParam } from "./websitesCommands";

export function useSwitchTabSuggestions(
  KEYWORD: string,
  { setInputValue, inputValue }: UseSuggestionParam
) {
  const [commands, setCommands] = useState<Command[]>([]);
  const { didMatch, keyword } = parseCommand(inputValue);
  const myMatch = keyword === KEYWORD;
  if (myMatch && commands.length === 0) {
    const fetch = async () => {
      if (!browser) return;
      const allTabs = await browser.tabs.query({});
      const actions = allTabs.map(({ title, url, id, windowId }) => {
        url ||= "";
        const niceUrl =
          url.length <= 80 ? url : url.slice(0, 40) + "..." + url.slice(-37);
        return {
          name: `${title}\n${niceUrl}`,
          icon: "chrome://favicon/" + url,
          category: "Tab",
          command: () => {
            browser.tabs.update(id, { highlighted: true });
            browser.windows.update(windowId!, { focused: true });
            window.close();
          },
        };
      });
      setCommands(actions);
    };
    fetch();
  }
  if (myMatch) return commands;
  if (didMatch) return [];
  return [
    {
      name: "Search Tabs",
      category: "Search",
      command: async function () {
        setInputValue(KEYWORD + ">");
      },
      keyword: KEYWORD + ">",
    },
  ];
}
