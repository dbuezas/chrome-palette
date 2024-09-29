import { createEffect, createMemo, createSignal } from "solid-js";

import { createStoredSignal, matchCommand, setInput } from "~/util/signals";

import { Command } from "./general";

const KEYWORD = "theme";

const THEMES = ["Set by OS", "Dark", "Light"] as const;
type Theme = (typeof THEMES)[number];

const getOsTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "Dark" : "Light";
const [osTheme, setOsTheme] = createSignal(getOsTheme());

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", function () {
    setOsTheme(getOsTheme());
  });

const [themeConfig, setThemeConfig] = createStoredSignal<Theme>(
  "theme",
  "Set by OS"
);

export const theme = createMemo(() => {
  if (themeConfig() === "Set by OS") return osTheme();
  return themeConfig();
});

createEffect(() => {
  document.body.setAttribute("theme", theme());
});

const commands = (): Command[] =>
  THEMES.map((aTheme) => ({
    title: aTheme,
    subtitle: themeConfig() == aTheme ? "\nSelected" : "",
    command: async function () {
      setThemeConfig(aTheme);
    },
  }));

const base: Command[] = [
  {
    title: "Chrome Palette Themes",
    command: async function () {
      setInput(KEYWORD + ">");
    },
    keyword: KEYWORD + ">",
  },
];

export default function themeSuggestions(): Command[] {
  const { isMatch, isCommand } = matchCommand(KEYWORD);
  if (isMatch) return commands();
  if (isCommand) return [];
  return base;
}
