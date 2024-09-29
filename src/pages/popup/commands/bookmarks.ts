import { createLazyResource, matchCommand, setInput } from "~/util/signals";

import { Command } from "./general";

const KEYWORD = "b";

const traverse = (
  nodes: chrome.bookmarks.BookmarkTreeNode[],
  breadcrumb = ""
): Command[] => {
  return nodes
    .sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0))
    .flatMap(({ children, url, title, dateAdded }) => {
      const path = breadcrumb ? breadcrumb + "/" + title : title;
      if (children) {
        return traverse(children, path);
      }
      url ||= "";
      return {
        title: `${title} > ${breadcrumb}`,
        icon: "chrome://favicon/" + url,
        lastVisitTime: dateAdded,
        url,
      };
    });
};
const commands = createLazyResource([], async () => {
  ("fetching bookmarks");
  const root = await chrome.bookmarks.getTree();
  return traverse(root);
});

const base: Command[] = [
  {
    title: "Search Bookmarks",
    command: async function () {
      setInput(KEYWORD + ">");
    },
    icon: "chrome://bookmarks/",
    keyword: KEYWORD + ">",
  },
];
export default function bookmarkSuggestions(): Command[] {
  const { isMatch, isCommand } = matchCommand(KEYWORD);
  if (isMatch) return commands();
  if (isCommand) return [];
  return base;
}
