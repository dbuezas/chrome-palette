import { useEffect, useRef, useState } from "react";
import { Command } from "./commandsSuggestions";
import { formatDistance } from "date-fns";
import { parseInputCommand } from "./parseInputCommand";
import browser from "webextension-polyfill";
import { UseSuggestionParam } from "./websitesSuggestions";

export function isDefined<T>(a: T | null): a is T {
  return Boolean(a);
}
export function useHistorySuggestions(
  KEYWORD: string,
  { setInputValue, inputValue }: UseSuggestionParam
) {
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
          const niceUrl =
            url.length <= 80 ? url : url.slice(0, 40) + "..." + url.slice(-37);
          return {
            name: `${title}\n${niceUrl}`,
            category: "History",
            // keyword: url.slice(0, 100),
            timeAgo: formatDistance(lastVisitTime!, new Date(), {
              addSuffix: true,
            }),
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
    },
  ];
}
