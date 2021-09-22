// adapted from https://github.com/ssundarraj/commander/blob/master/src/js/actions.js

import { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { resetHistory } from "../last-used";
import { parseInputCommand } from "./parseInputCommand";
import { UseSuggestionParam } from "./websitesSuggestions";
export type Command = {
  name: string;
  icon?: string;
  category?: string;
  shortcut?: string;
  timeAgo?: string;
  keyword?: string;
  command: Function;
  onHighlighted?: Function;
};

function useCommandSuggestions({
  setInputValue,
  inputValue,
}: UseSuggestionParam) {
  const [commands, setCommands] = useState<Command[]>([]);
  useEffect(() => {
    const commands: Command[] = [
      {
        name: "New Tab",
        category: "Command",
        shortcut: "⌘ t",
        command: async function () {
          await browser.tabs.create({});
        },
      },
      {
        name: "New Window",
        shortcut: "⌘ n",
        category: "Command",
        command: async function () {
          await browser.windows.create({});
        },
      },
      {
        name: "Open History Page",
        category: "Command",
        shortcut: "⌘ y",
        command: async function () {
          await browser.tabs.create({ url: "chrome://history" });
        },
      },
      {
        name: "Open Downloads",
        category: "Command",
        shortcut: "⌘⇧ d",
        command: async function () {
          await browser.tabs.create({ url: "chrome://downloads" });
        },
      },
      {
        name: "Open Extensions",
        category: "Command",
        command: async function () {
          await browser.tabs.create({ url: "chrome://extensions" });
        },
      },
      {
        name: "Open Bookmark Manager",
        category: "Command",
        shortcut: "⌘⌥ b",
        command: async function () {
          await browser.tabs.create({ url: "chrome://bookmarks" });
        },
      },
      {
        name: "Show/hide Bookmarks Bar",
        category: "Command",
        shortcut: "⌘⇧ b",
        command: async function () {
          setInputValue("Unsupported. Use [⌘⇧ b] instead.");
        },
      },
      {
        name: "Open Settings",
        category: "Command",
        shortcut: "⌘ ,",
        command: async function () {
          await browser.tabs.create({ url: "chrome://settings" });
        },
      },
      {
        name: "Close Current Tab",
        category: "Command",
        shortcut: "⌘ w",
        command: async function () {
          const windowId = browser.windows.WINDOW_ID_CURRENT;
          const [currentTab] = await browser.tabs.query({
            active: true,
            windowId,
          });
          await browser.tabs.remove(currentTab.id!);
        },
      },
      {
        name: "Reload Tab",
        category: "Command",
        shortcut: "⌘ r",
        command: async function () {
          await browser.tabs.reload();
          window.close();
        },
      },
      {
        name: "Reload All Tabs",
        category: "Command",
        command: async function () {
          const windowId = browser.windows.WINDOW_ID_CURRENT;
          const allTabs = await browser.tabs.query({ windowId });
          for (const tab of allTabs) {
            await browser.tabs.reload(tab.id);
          }
          window.close();
        },
      },
      {
        name: "Clear Cache and Reload Tab",
        category: "Command",
        shortcut: "⌘⇧ r",
        command: async function () {
          await browser.tabs.reload(undefined, { bypassCache: true });
          window.close();
        },
      },
      {
        name: "Toggle Pin",
        category: "Command",
        command: async function () {
          const windowId = browser.windows.WINDOW_ID_CURRENT;
          const [currentTab] = await browser.tabs.query({
            active: true,
            windowId,
          });
          await browser.tabs.update({ pinned: !currentTab.pinned });
          window.close();
        },
      },
      {
        name: "Duplicate Tab",
        category: "Command",
        command: async function () {
          const windowId = browser.windows.WINDOW_ID_CURRENT;
          const [currentTab] = await browser.tabs.query({
            active: true,
            windowId,
          });
          await browser.tabs.duplicate(currentTab.id!);
        },
      },
      {
        name: "New Incognito Window",
        category: "Command",
        shortcut: "⌘⇧ n",
        command: async function () {
          await browser.windows.create({ incognito: true });
        },
      },
      {
        name: "Close Other Tabs",
        category: "Command",
        command: async function () {
          const windowId = browser.windows.WINDOW_ID_CURRENT;
          const otherTabs = await browser.tabs.query({
            active: false,
            windowId,
          });
          const otherTabIds = otherTabs.map(({ id }) => id!);
          await browser.tabs.remove(otherTabIds);
          window.close();
        },
      },
      {
        name: "Close Tabs To Right",
        category: "Command",
        command: async function () {
          const windowId = browser.windows.WINDOW_ID_CURRENT;
          const [currentTab] = await browser.tabs.query({
            active: true,
            windowId,
          });
          const otherTabs = await browser.tabs.query({
            active: false,
            windowId,
          });
          const otherTabIds = otherTabs
            .filter((tab) => tab.index > currentTab.index)
            .map(({ id }) => id!);
          await browser.tabs.remove(otherTabIds);
          window.close();
        },
      },
      {
        name: "Close Tabs To Left",
        category: "Command",
        command: async function () {
          const windowId = browser.windows.WINDOW_ID_CURRENT;
          const [currentTab] = await browser.tabs.query({
            active: true,
            windowId,
          });
          const otherTabs = await browser.tabs.query({
            active: false,
            windowId,
          });
          const otherTabIds = otherTabs
            .filter((tab) => tab.index < currentTab.index)
            .map(({ id }) => id!);
          await browser.tabs.remove(otherTabIds);
          window.close();
        },
      },
      {
        name: "Mute/Unmute Tab",
        category: "Command",
        command: async function () {
          const windowId = browser.windows.WINDOW_ID_CURRENT;
          const [currentTab] = await browser.tabs.query({
            active: true,
            windowId,
          });
          const isMuted = currentTab.mutedInfo!.muted;
          await browser.tabs.update({ muted: !isMuted });
          window.close();
        },
      },
      {
        name: "Move Tab To Start",
        category: "Command",
        command: async function () {
          const windowId = browser.windows.WINDOW_ID_CURRENT;
          const [currentTab] = await browser.tabs.query({
            active: true,
            windowId,
          });
          await browser.tabs.move(currentTab.id!, { index: 0 });
          window.close();
        },
      },
      {
        name: "Move Tab To End",
        category: "Command",
        command: async function () {
          const windowId = browser.windows.WINDOW_ID_CURRENT;
          const [currentTab] = await browser.tabs.query({
            active: true,
            windowId,
          });
          await browser.tabs.move(currentTab.id!, { index: -1 });
          window.close();
        },
      },
      {
        name: "Move Tab Left",
        category: "Command",
        command: async function () {
          const windowId = browser.windows.WINDOW_ID_CURRENT;
          const [currentTab] = await browser.tabs.query({
            active: true,
            windowId,
          });
          await browser.tabs.move(currentTab.id!, {
            index: currentTab.index - 1,
          });
          window.close();
        },
      },
      {
        name: "Move Tab Right",
        category: "Command",
        command: async function () {
          const windowId = browser.windows.WINDOW_ID_CURRENT;
          const [currentTab] = await browser.tabs.query({
            active: true,
            windowId,
          });
          await browser.tabs.move(currentTab.id!, {
            index: currentTab.index + 1,
          });
          window.close();
        },
      },
      {
        name: "Reopen/Unclose Tab",
        category: "Command",
        shortcut: "⌘⇧ t",
        command: async function () {
          return await browser.sessions.restore();
        },
      },
      {
        name: "Deattach Tab (Move to New Window)",
        category: "Command",
        command: async function () {
          const [tab] = await browser.tabs.query({
            currentWindow: true,
            active: true,
          });
          console.log(tab);
          await browser.windows.create({ tabId: tab.id });
        },
      },
      {
        name: "Reattach Tab (Move Tab to Previous Window)",
        category: "Command",
        command: async function () {
          const [currentTab] = await browser.tabs.query({
            currentWindow: true,
            active: true,
          });
          const currentWindow = await browser.windows.getCurrent({
            // windowTypes: ["normal"],
          });
          const allWindows = await browser.windows.getAll({
            windowTypes: ["normal"],
          });
          const otherWindows = allWindows.filter(
            (win) => win.id !== currentWindow.id
          );
          const prevWindow = otherWindows[0];
          await browser.windows.update(prevWindow.id!, { focused: true });
          await browser.tabs.move(currentTab.id!, {
            windowId: prevWindow.id,
            index: -1,
          });
          await browser.tabs.update(currentTab.id!, { highlighted: true });
        },
      },
      {
        name: "Toggle full screen",
        category: "Command",
        shortcut: "⌃⌘ f",
        command: async function () {
          const currWindow = await browser.windows.getCurrent();
          const state =
            currWindow.state === "fullscreen" ? "normal" : "fullscreen";
          browser.windows.update(currWindow.id!, {
            state,
          });
          window.close();
        },
      },
      {
        name: "Reset command history",
        category: "Command",
        command: async function () {
          setTimeout(() => {
            // otherwise this command will be stored
            resetHistory();
            window.location.reload();
          }, 0);
        },
      },
    ];
    if (process.env.NODE_ENV !== "production") {
      commands.push({
        name: "Throw error",
        category: "Dev",
        command: async function () {
          throw new Error("on purpose");
        },
      });
    }
    setCommands(commands);
  }, [setInputValue]);
  const { didMatch } = parseInputCommand(inputValue);
  if (didMatch) return [];
  return commands;
}
export default useCommandSuggestions;
