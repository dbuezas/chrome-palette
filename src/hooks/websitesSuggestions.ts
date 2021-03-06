import { parseInputCommand } from "./parseInputCommand";
import browser from "webextension-polyfill";
import { useMemo } from "react";
import useShortcut from "./useShortcut";

export type UseSuggestionParam = {
  setInputValue: (a: string) => void;
  inputValue: string;
};

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
  const searchTemplates = useMemo(
    () =>
      templates.map((template) => {
        const shortcut = useShortcut(template.keyword, {
          setInputValue,
        });
        return {
          name: `Search ${template.name}`,
          category: "Search",
          command: async function () {
            setInputValue(template.keyword + ">");
          },
          keyword: template.keyword + ">",
          shortcut,
        };
      }),
    []
  );
  const { didMatch, keyword, query } = parseInputCommand(inputValue);
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
    return searchTemplates;
  }

  return [];
}
