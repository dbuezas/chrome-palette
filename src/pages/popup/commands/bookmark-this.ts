import { createLazyResource, matchCommand, setInput } from "~/util/signals";

import { Command } from "./general";

const KEYWORD = "bt";

const traverse = (
  nodes: chrome.bookmarks.BookmarkTreeNode[],
  breadcrumb = ""
): Command[] => {
  return nodes.flatMap(({ id, children, url, title, dateAdded }) => {
    const path = breadcrumb ? breadcrumb + " / " + title : title;
    const list: Command[] = [];
    if (!url && path !== "") {
      list.push({
        title: path,
        icon: "chrome://favicon/",
        lastVisitTime: dateAdded,
        command: async function () {
          const [tab] = await chrome.tabs.query({
            currentWindow: true,
            active: true,
          });
          await chrome.bookmarks.create({
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

const base: Command[] = [
  {
    title: "Bookmark this tab",
    command: async function () {
      setInput(KEYWORD + ">");
    },
    keyword: KEYWORD + ">",
  },
];

const commands = createLazyResource([], async () => {
  const root = await chrome.bookmarks.getTree();
  return traverse(root);
});

export default function bookmarkThisSuggestions(): Command[] {
  const { isMatch, isCommand } = matchCommand(KEYWORD);
  if (isMatch) return commands();
  if (isCommand) return [];
  return base;
}
