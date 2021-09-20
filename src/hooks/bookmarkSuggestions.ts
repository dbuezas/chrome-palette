import { useEffect, useRef, useState } from "react";
import { Command } from "./commandsSuggestions";
import { formatDistance } from "date-fns";
import { parseInputCommand } from "./parseInputCommand";
import browser from "webextension-polyfill";
import { UseSuggestionParam } from "./websitesSuggestions";
import { isDefined } from "./historySuggestions";

const traverse = (
  nodes: browser.Bookmarks.BookmarkTreeNode[],
  breadcrumb = ""
): (Command & { dateAdded: number })[] => {
  return nodes
    .flatMap(({ children, url, title, dateAdded }) => {
      const path = breadcrumb ? breadcrumb + "/" + title : title;
      if (children) {
        return traverse(children, path);
      }
      url ||= "";
      const niceUrl =
        url.length <= 80 ? url : url.slice(0, 40) + "..." + url.slice(-37);

      return {
        name: `${title} > ${breadcrumb}\n${niceUrl}`,
        icon: "chrome://favicon/" + url,
        category: "Bookmark",
        dateAdded: dateAdded || 0,
        timeAgo:
          dateAdded &&
          formatDistance(new Date(dateAdded || 0), new Date(), {
            addSuffix: true,
          }),
        command: async function () {
          await browser.tabs.create({ url });
        },
      };
    })
    .sort((a, b) => b.dateAdded - a.dateAdded);
};

export function useBookmarkSuggestions(
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
      const root = await browser.bookmarks.getTree();
      setCommands(traverse(root));
    };
    fetch();
  }

  if (myMatch) return commands;
  if (didMatch) return [];
  return [
    {
      name: "Bookmarked Tabs",
      category: "Search",
      command: async function () {
        setInputValue(KEYWORD + ">");
      },
      keyword: KEYWORD + ">",
    },
  ];
}
