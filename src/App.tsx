import React, { useRef, useState } from "react";
import useDefaultCommands, { Command } from "./commands";
//@ts-ignore
import CommandPalette from "react-command-palette";
import "react-command-palette/dist/themes/chrome.css";
import "react-command-palette/dist/themes/atom.css";
import "react-command-palette/dist/themes/sublime.css";
import "./App.css";
import SampleAtomCommand from "./SampleAtomCommand";
import {
  useHistorySuggestions,
  useShortcut,
  useSwitchTabSuggestions,
} from "./hooks";
import browser from "./browser";
import { storeLastUsed } from "./last-used";

function App() {
  const commandPalette = useRef<any>(null);
  const [isUsingSwitchTab, setIsUsingSwitchTab] = useState(false);
  const [isUsingHistory, setIsUsingHistory] = useState(false);
  const [isUsingGoogleDrive, setIsUsingGoogleDrive] = useState(false);
  const [googleDriveCommand, setGoogleDriveCommand] = useState<Command[]>([]);

  const shortcut = useShortcut();
  const switchTabSuggestions = useSwitchTabSuggestions();
  const historySuggestions = useHistorySuggestions();
  const defaultCommands = useDefaultCommands({
    setInputValue: (newValue: string) => {
      commandPalette.current.onChange(
        { targt: { value: newValue } },
        {
          newValue,
        }
      );
    },
    getInputValue: () => commandPalette.current.commandPaletteInput.input.value,
  });
  const commands = isUsingGoogleDrive
    ? googleDriveCommand
    : isUsingSwitchTab
    ? switchTabSuggestions
    : isUsingHistory
    ? historySuggestions
    : defaultCommands;

  return (
    <>
      <CommandPalette
        ref={commandPalette}
        // alwaysRenderCommands
        // closeOnSelect={false}
        commands={commands}
        // defaultInputValue={inputValue}
        display="inline"
        filterSearchQuery={(query: string) => {
          if (["t>", "h>"].some((prefix) => query.startsWith(prefix))) {
            return query.slice(2);
          }
          return query;
        }}
        getSuggestionValue={() => {
          // hack to avoid that highlighting changes the value of the input
          return commandPalette.current.commandPaletteInput.input.value;
        }}
        header={
          <div
            style={{
              color: "rgb(172, 172, 172)",
              display: "inline-block",
              fontFamily: "arial",
              fontSize: "12px",
              marginBottom: "6px",
            }}
          >
            <span style={{ paddingRight: "32px" }}>Search for a command</span>
            <span style={{ paddingRight: "32px" }}>
              <kbd
                style={{
                  backgroundColor: "rgb(23, 23, 23)",
                  borderRadius: "4px",
                  color: "#b9b9b9",
                  fontSize: "12px",
                  marginRight: "6px",
                  padding: "2px 4px",
                }}
              >
                ↑↓
              </kbd>{" "}
              to navigate
            </span>
            <span style={{ paddingRight: "32px" }}>
              <kbd
                style={{
                  backgroundColor: "rgb(23, 23, 23)",
                  borderRadius: "4px",
                  color: "#b9b9b9",
                  fontSize: "12px",
                  marginRight: "6px",
                  padding: "2px 4px",
                }}
              >
                enter
              </kbd>{" "}
              to select
            </span>
            <span style={{ paddingRight: "32px" }}>
              <kbd
                style={{
                  backgroundColor: "rgb(23, 23, 23)",
                  borderRadius: "4px",
                  color: "#b9b9b9",
                  fontSize: "12px",
                  marginRight: "6px",
                  padding: "2px 4px",
                }}
              >
                esc
              </kbd>{" "}
              to dismiss
            </span>
          </div>
        }
        // header={null}
        // highlightFirstSuggestion
        // hotKeys="command+shift+p"
        maxDisplayed={400}
        // onAfterOpen={function noRefCheck(){}}
        onChange={(_0: any, val: string | null) => {
          if (val !== null) {
            setIsUsingSwitchTab(val.startsWith("t>"));
            setIsUsingHistory(val.startsWith("h>"));
            const gd = val.startsWith("gd>");
            setIsUsingGoogleDrive(gd);
            if (gd) {
              const query =
                commandPalette.current.commandPaletteInput.input.value.slice(3);
              setGoogleDriveCommand([
                {
                  name: "Search Google Drive: " + query,
                  category: "Modifier",
                  command: async function () {
                    await browser.tabs.create({
                      url: `https://drive.google.com/drive/search?q=${query}`,
                    });
                  },
                },
              ]);
            }
          }
        }}
        // onHighlight={function noRefCheck(){}}
        onRequestClose={() => {
          window.close();
        }}
        onSelect={(command: Command) => {
          storeLastUsed(command);
        }}
        // options={{
        //   allowTypo: true,
        //   key: 'name',
        //   keys: [
        //     'name'
        //   ],
        //   limit: 7,
        //   scoreFn: null,
        //   threshold: -Infinity
        // }}
        placeholder="Type 't>' to search open tabs, or 'h>' to search history history"
        // reactModalParentSelector="body"
        renderCommand={SampleAtomCommand}
        // resetInputOnOpen={false}
        // shouldReturnFocusAfterClose
        showSpinnerOnSelect={false}
      />
      <span style={{ color: "gray", float: "right" }}>
        shortcut: &nbsp;
        <a
          style={{ color: "white" }}
          href="_blank"
          onClick={() =>
            browser.tabs.create({ url: "chrome://extensions/shortcuts" })
          }
        >
          {shortcut}
        </a>
      </span>
    </>
  );
}

export default App;
