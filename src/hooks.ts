import { useEffect, useState } from "react";
import { Command } from "./commands";
import { formatDistance } from "date-fns";
import { sortByUsed } from "./last-used";

let browser: typeof import("webextension-polyfill");
if (process.env.NODE_ENV === "production") {
  browser = require("webextension-polyfill");
}

export function useSwitchTabSuggestions() {
  const [commands, setCommands] = useState<Command[]>([]);
  useEffect(() => {
    const fetch = async () => {
      if (!browser) return;
      const allTabs = await browser.tabs.query({});
      console.log(allTabs);
      const actions = allTabs.map(({ title, url, id, windowId }) => ({
        name: `${title} ${url?.slice(0, 100)}`,
        icon: "chrome://favicon/" + url,
        category: "Tab",
        command: () => {
          browser.tabs.update(id, { active: true });
          browser.windows.update(windowId!, { focused: true });
        },
      }));
      setCommands(sortByUsed(actions));
    };
    fetch().catch((e) => console.log(e));
  }, []);
  return commands;
}
function isDefined<T>(a: T | null): a is T {
  return Boolean(a);
}
export function useHistorySuggestions() {
  const [commands, setCommands] = useState<Command[]>([]);
  useEffect(() => {
    const fetch = async () => {
      if (!browser) return;
      const list = await browser.history.search({
        text: "",
        startTime: 0,
        maxResults: 0,
      }); // fetch all
      console.log(list);
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
      setCommands(sortByUsed(actions));
    };
    fetch().catch();
  }, []);
  return commands;
}

export function useShortcut() {
  const [shortcut, setShortcut] = useState("unset");
  useEffect(() => {
    browser?.commands.getAll().then((commands) => {
      const mainCommand = commands.find(
        ({ name }) => name === "_execute_browser_action"
      );
      if (mainCommand?.shortcut) setShortcut(mainCommand.shortcut);
    });
  }, []);
  return shortcut;
}
