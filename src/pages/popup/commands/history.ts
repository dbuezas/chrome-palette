import { createLazyResource, matchCommand, setInput } from "~/util/signals";

import { Command } from "./general";

const KEYWORD = "h";

export function isDefined<T>(a: T | null): a is T {
  return Boolean(a);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const commands = createLazyResource<Command[]>([], async (setVal) => {
  let list: Command[] = [];
  Promise.resolve().then(async () => {
    let endTime = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    let done = false;
    // const MAX = 10000;
    const MAX = Number.POSITIVE_INFINITY;
    while (!done) {
      const startTime = endTime - ONE_DAY;
      const history = await chrome.history.search({
        text: "",
        startTime,
        endTime,
        maxResults: 1000,
      }); // fetch all
      const more: Command[] = history
        .map(({ url, title, lastVisitTime }) => {
          if (!url) return null;
          return {
            title: title || "Untitled",
            lastVisitTime,
            icon: url,
            url,
          };
        })
        .filter(isDefined);
      list = [...list, ...more];
      setVal(list);
      endTime = startTime;
      done = history.length === 0 || list.length > MAX;
      await sleep(10);
    }
  });
  return list;
});

const base: Command[] = [
  {
    title: "Search History",
    icon: "chrome://history/",
    command: async function () {
      setInput(KEYWORD + ">");
    },
    keyword: KEYWORD + ">",
  },
];
export default function historySuggestions(): Command[] {
  const { isMatch, isCommand } = matchCommand(KEYWORD);
  if (isMatch) return commands();
  if (isCommand) return [];
  return base;
}
