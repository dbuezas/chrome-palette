import { createLazyResource, parsedInput } from "~/util/signals";

import { Command } from "./general";

const baseCommands = [
  {
    title: `Sound/Audio tab: [none]`,
    command: () => {},
  },
];
const commands = createLazyResource(baseCommands, async () => {
  const allTabs = await chrome.tabs.query({ audible: true });
  const actions: Command[] = allTabs.map(({ title, url, id, windowId }) => ({
    title: `Sound/Audio tab: ${title}`,
    icon: url,
    command: () => {
      chrome.tabs.update(id!, { highlighted: true });
      chrome.windows.update(windowId!, { focused: true });
      window.close();
    },
  }));
  if (actions.length === 0) return baseCommands;
  return actions;
});

export default function audibleTabSuggestions(): Command[] {
  const { isCommand } = parsedInput();
  if (isCommand) return [];
  return commands();
}
