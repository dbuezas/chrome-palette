import { useEffect, useState } from "react";
import { Command } from "./commands";
import { formatDistance } from "date-fns";

let browser: typeof import("webextension-polyfill");
if (process.env.NODE_ENV === "production") {
  browser = require("webextension-polyfill");
}

export function useSwitchTabSuggestions(
  setInputValue: (a: string) => void,
  inputValue: string
) {
  const [commands, setCommands] = useState<Command[]>([]);
  useEffect(() => {
    const fetch = async () => {
      if (!browser) return;
      const allTabs = await browser.tabs.query({});
      const actions = allTabs.map(({ title, url, id, windowId }) => ({
        name: `${title} ${url?.slice(0, 100)}`,
        icon: "chrome://favicon/" + url,
        category: "Tab",
        command: () => {
          browser.tabs.update(id, { active: true });
          browser.windows.update(windowId!, { focused: true });
        },
      }));
      setCommands(actions);
    };
    fetch().catch((e) => console.log(e));
  }, []);

  const query = inputValue.match(/^t>(.*)/)?.[1];
  if (query !== undefined) return commands;
  return [];
}
function isDefined<T>(a: T | null): a is T {
  return Boolean(a);
}
export function useHistorySuggestions(
  setInputValue: (a: string) => void,
  inputValue: string
) {
  const [commands, setCommands] = useState<Command[]>([]);
  useEffect(() => {
    const fetch = async () => {
      if (!browser) return;
      const list = await browser.history.search({
        text: "",
        startTime: 0,
        maxResults: 0,
      }); // fetch all
      const actions = list
        .map(({ url, title, lastVisitTime }) => {
          if (!url) return null;
          const niceUrl =
            url.length <= 100 ? url : url.slice(0, 50) + "..." + url.slice(-47);
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
    fetch().catch();
  }, []);
  const query = inputValue.match(/^h>(.*)/)?.[1];
  if (query !== undefined) return commands;
  return [];
}

type Template = {
  name: string;
  url: (query: string) => string;
  keyword: string;
};
const templates: Template[] = [
  {
    name: "Google Drive",
    url: (query) => `https://drive.google.com/drive/search?q=${query}`,
    keyword: "gd",
  },
  {
    name: "Youtube",
    url: (query) => `https://www.youtube.com/results?search_query=${query}`,
    keyword: "y",
  },
  {
    name: "Google",
    url: (query) => `https://www.google.com/search?q=${query}`,
    keyword: "g",
  },
  {
    name: "Wikipedia",
    url: (query) => `https://en.wikipedia.org/w/index.php?search=${query}`,
    keyword: "w",
  },
];

export function useTemplatedSuggestions(
  setInputValue: (a: string) => void,
  inputValue: string
) {
  const [matched, keyword, query] =
    inputValue.match(/^([a-z]{1,2})>(.*)/) || [];
  if (matched) {
    for (const template of templates) {
      if (keyword === template.keyword) {
        return [
          {
            name: `Search ${template.name}: ${query}`,
            category: "Search",
            command: async function () {
              await browser.tabs.create({
                url: template.url(query),
              });
            },
          },
        ];
      }
    }
  } else {
    return templates.map((template) => ({
      name: `Search ${template.name}`,
      category: "Search",
      command: async function () {
        setInputValue(template.keyword + ">");
      },
      keyword: template.keyword + ">",
    }));
  }

  return [];
}
