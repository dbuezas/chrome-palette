import { useMemo, useRef, useState } from "react";
import { Command } from "./commandsSuggestions";
import { formatDistanceToNow } from "date-fns";
import { parseInputCommand } from "./parseInputCommand";
import browser from "webextension-polyfill";
import { UseSuggestionParam } from "./websitesSuggestions";
import useShortcut from "./useShortcut";

const traverse = (
  nodes: browser.Bookmarks.BookmarkTreeNode[],
  breadcrumb = ""
): Command[] => {
  return nodes.flatMap(({ id, children, url, title, dateAdded }) => {
    const path = breadcrumb ? breadcrumb + " / " + title : title;
    const list: Command[] = [];
    if (!url && path !== "") {
      list.push({
        name: path,
        icon: "chrome://favicon/",
        category: "Add Bookmark",
        timeAgo:
          dateAdded !== 0
            ? undefined
            : formatDistanceToNow(new Date(dateAdded || 0)),
        command: async function () {
          const [tab] = await browser.tabs.query({
            currentWindow: true,
            active: true,
          });
          await browser.bookmarks.create({
            index: 0,
            url: tab.url,
            title: tab.title,
            parentId: id,
          });
          window.close();
        },
      });
    }
    if (children) {
      list.push(...traverse(children, path));
    }
    return list;
  });
};

export function useBookmarkThisSuggestions(
  KEYWORD: string,
  { setInputValue, inputValue }: UseSuggestionParam
) {
  const shortcut = useShortcut(KEYWORD, { setInputValue });
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
  const bookmarkThis = useMemo(
    () => [
      {
        name: "Bookmark this tab",
        category: "Add Bookmark",
        command: async function () {
          setInputValue(KEYWORD + ">");
        },
        keyword: KEYWORD + ">",
      },
    ],
    []
  );
  if (myMatch) return commands;
  if (didMatch) return [];
  return bookmarkThis
}
