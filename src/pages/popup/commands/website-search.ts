import { matchCommand, parsedInput, setInput } from "~/util/signals";

import { Command } from "./general";

type Template = {
  title: string;
  url: (query: string) => string;
  icon: string;
  keyword: string;
};
const templates: Template[] = [
  {
    title: "Google Drive",
    url: (query) => `https://drive.google.com/drive/search?q=${query}`,
    icon: "https://drive.google.com",
    keyword: "gd",
  },
  {
    title: "Youtube",
    url: (query) => `https://www.youtube.com/results?search_query=${query}`,
    icon: "https://www.youtube.com",
    keyword: "y",
  },
  {
    title: "Google",
    url: (query) => `https://www.google.com/search?q=${query}`,
    icon: "https://www.google.com",
    keyword: "g",
  },
  {
    title: "Wikipedia",
    url: (query) => `https://en.wikipedia.org/w/index.php?search=${query}`,
    icon: "https://en.wikipedia.org",
    keyword: "w",
  },
];

const base: Command[] = templates.map((template) => ({
  title: `Search ${template.title}`,
  icon: template.icon,
  command: async function () {
    setInput(template.keyword + ">");
  },
  keyword: template.keyword + ">",
}));

export default function websitesSuggestions(): Command[] {
  for (const template of templates) {
    const { isMatch, query } = matchCommand(template.keyword);
    if (isMatch)
      return [
        {
          title: `Search ${template.title}: ${query}`,
          url: template.url(query),
        },
      ];
  }

  const { isCommand } = parsedInput();
  if (isCommand) return [];
  return base;
}
