import React, { useEffect, useRef, useState } from "react";
import useDefaultCommands, { Command } from "./hooks/commands";
//@ts-expect-error
import CommandPalette from "react-command-palette";
import "react-command-palette/dist/themes/chrome.css";
import "react-command-palette/dist/themes/atom.css";
import "react-command-palette/dist/themes/sublime.css";
import "./App.css";
import Header from "./Header";
import SampleAtomCommand from "./SampleAtomCommand";
import {
  useAudibleTabSuggestions,
  useHistorySuggestions,
  useSwitchTabSuggestions,
  useTemplatedSuggestions,
} from "./hooks/searchCommands";

import { sortByUsed, storeLastUsed } from "./last-used";
import usePaletteInput from "./hooks/usePaletteInput";
import { parseCommand } from "./hooks/parseCommand";

function App() {
  const [, forceRender] = useState({});
  const commandPalette = useRef<any>(null);
  const input = usePaletteInput(commandPalette);
  const commands = sortByUsed([
    ...useAudibleTabSuggestions(input),
    ...useSwitchTabSuggestions(input),
    ...useHistorySuggestions(input),
    ...useDefaultCommands(input),
    ...useTemplatedSuggestions(input),
  ]);

  useEffect(() => {
    // blur + focus hack to let the lib know that it should recompute the matches
    // even after changing only the commands
    // When the commands reference changes,
    // the CommandPalette component does not fuzzyfilter the suggestions and shows all of them instead.
    // this fixes that
    input.element?.blur();
    input.element?.focus();
  });
  return (
    <CommandPalette
      ref={commandPalette}
      commands={commands}
      display="inline"
      filterSearchQuery={(inputValue: string) => {
        const { didMatch, query } = parseCommand(inputValue);
        if (didMatch) return query;
        return inputValue;
      }}
      onChange={() => {
        // force rerender in case commands are input dependant
        forceRender({});
      }}
      getSuggestionValue={() => {
        // hack to avoid that highlighting changes the value of the input
        return commandPalette.current.commandPaletteInput.input.value;
      }}
      options={{
        threshold: -10000, //-Infinity, // Don't return matches worse than this (higher is faster)
        limit: 100, // Don't return more results than this (lower is faster)
        allowTypo: false, //true, // Allwos a snigle transpoes (false is faster)
        key: "name", // For when targets are objects (see its example usage)
        keys: ["name"], // For when targets are objects (see its example usage)
        scoreFn: null, // For use with `keys` (see its example usage)
      }}
      header={<Header />}
      maxDisplayed={100}
      onRequestClose={() => {
        window.close();
      }}
      onSelect={(command: Command) => {
        storeLastUsed(command);
      }}
      onHighlight={(command?: Command) => {
          command?.onHighlighted?.();
      }}
      placeholder="Search for a command"
      renderCommand={SampleAtomCommand}
      showSpinnerOnSelect={false}
    />
  );
}

export default App;
