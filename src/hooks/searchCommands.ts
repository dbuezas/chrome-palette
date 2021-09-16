import { useEffect, useState } from "react";
import { Command } from "./commands";
import { formatDistance } from "date-fns";
import { parseCommand } from "./parseCommand";
import browser from "webextension-polyfill";

export type UseSuggestionParam = {
  setInputValue: (a: string) => void;
  inputValue: string;
};

export function useAudibleTabSuggestions({
  setInputValue,
  inputValue,
}: UseSuggestionParam) {
  const [commands, setCommands] = useState<Command[]>([]);
  useEffect(() => {
    const fetch = async () => {
      if (!browser) return;
      const allTabs = await browser.tabs.query({ audible:true });
      const actions:Command[] = allTabs.map(({ title, url, id, windowId }) => ({
        name: `Sound/Audio tab: ${title}`,
        icon: "chrome://favicon/" + url,
        category: "Tab",
        command: () => {
          browser.tabs.update(id, { highlighted: true });
          browser.windows.update(windowId!, { focused: true });
          window.close();
        },
      }));
      if (actions.length === 0){
        actions.push({
          name: `Sound/Audio tab: [none]`,
          category: "Tab",
          command: () => {
            window.close();
          },
        })
      }
      setCommands(actions);
    };
    fetch().catch((e) => console.log(e));
  }, []);
  return commands
}

export function useSwitchTabSuggestions({
  setInputValue,
  inputValue,
}: UseSuggestionParam) {
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
          browser.tabs.update(id, { highlighted: true });
          browser.windows.update(windowId!, { focused: true });
          window.close();
        },
      }));
      setCommands(actions);
    };
    fetch().catch((e) => console.log(e));
  }, []);
  const { keyword } = parseCommand(inputValue);
  if (keyword === "t") return commands;
  return [];
}
function isDefined<T>(a: T | null): a is T {
  return Boolean(a);
}
export function useHistorySuggestions({
  setInputValue,
  inputValue,
}: UseSuggestionParam) {
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
  const { keyword } = parseCommand(inputValue);
  if (keyword === "h") return commands;
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

export function useTemplatedSuggestions({
  setInputValue,
  inputValue,
}: UseSuggestionParam) {
  const { didMatch, keyword, query } = parseCommand(inputValue);
  if (didMatch) {
    for (const template of templates) {
      if (keyword.toLowerCase() === template.keyword.toLowerCase()) {
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
