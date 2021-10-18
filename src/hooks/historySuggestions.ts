import { useRef, useState } from "react";
import { Command } from "./commandsSuggestions";
import { formatDistanceToNow } from "date-fns";
import { parseInputCommand } from "./parseInputCommand";
import browser from "webextension-polyfill";
import { UseSuggestionParam } from "./websitesSuggestions";
import niceUrl from "./niceUrl";
import useShortcut from "./useShortcut";

export function isDefined<T>(a: T | null): a is T {
  return Boolean(a);
}
export function useHistorySuggestions(
  KEYWORD: string,
  { setInputValue, inputValue }: UseSuggestionParam
) {
  const shortcut = useShortcut(KEYWORD, { setInputValue, inputValue });

  const [commands, setCommands] = useState<Command[]>([]);
  const { didMatch, keyword } = parseInputCommand(inputValue);
  const myMatch = keyword === KEYWORD;
  const didFetch = useRef(false);
  if (myMatch && !didFetch.current) {
    didFetch.current = true;
    const fetch = async () => {
      if (!browser) return;
      const list = await browser.history.search({
        text: "",
        startTime: 0,
        maxResults: 1000,
      }); // fetch all
      const actions = list
        .map(({ url, title, lastVisitTime }) => {
          if (!url) return null;
          return {
            name: `${title}\n${niceUrl(url)}`,
            category: "History",
            // keyword: url.slice(0, 100),
            timeAgo: formatDistanceToNow(lastVisitTime || 0),
            icon: "chrome://favicon/" + url,
            command: async function () {
              await browser.tabs.create({ url });
            },
          };
        })
        .filter(isDefined);
      setCommands(actions);
    };
    fetch();
  }

  if (myMatch) return commands;
  if (didMatch) return [];
  return [
    {
      name: "Search History",
      category: "Search",
      command: async function () {
        setInputValue(KEYWORD + ">");
      },
      keyword: KEYWORD + ">",
      shortcut,
    },
  ];
}
