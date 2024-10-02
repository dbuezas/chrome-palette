import { createLazyResource, matchCommand, setInput } from "~/util/signals";

import { faviconURL } from "../Entry";
import { Command } from "./general";

const KEYWORD = "e";

const commands = createLazyResource<Command[]>([], async (setVal) => {
  return (await chrome.management.getAll()).map(
    ({ name, icons, id, enabled, version, description }) => {
      return {
        title: `${name} (${version})`,
        subtitle: description,
        icon:
          icons
            ?.map((o) => o?.url)
            .filter(Boolean)
            .at(-1) ?? "chrome://extensions/",
        url: `chrome://extensions/?id=${id}`,
        enabled,
      };
    }
  );
});

const base: Command[] = [
  {
    title: "Search Extensions",
    icon: faviconURL("chrome://extensions/"),
    command: async function () {
      setInput(KEYWORD + ">");
    },
    keyword: KEYWORD + ">",
  },
];

export default function extensionSuggestions(): Command[] {
  const { isMatch, isCommand } = matchCommand(KEYWORD);
  if (isMatch) return commands();
  if (isCommand) return [];
  return base;
}
