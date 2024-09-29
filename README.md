<div align="center">
<img width="128" src="/src/assets/img/logo.svg" alt="logo"/>
<h1> Command Palette for Chrome<br/>Fast, no server, no ads, no telemetry.</h1>

![](https://img.shields.io/badge/Typescript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![](https://badges.aleen42.com/src/vitejs.svg)

<!-- ![GitHub action badge](https://github.com/fuyutarow/solid-chrome-extension-template/actions/workflows/build.yml/badge.svg) -->

<!-- > This project is listed in the [Awesome Vite](https://github.com/vitejs/awesome-vite) -->

</div>

## Installation

[Chrome Web Store](https://chrome.google.com/webstore/detail/chrome-palette/hjkpneggcnclhpkddehdhlkeljclcnbo)

Or you can unzip [chrome-palette.zip](https://github.com/dbuezas/chrome-palette/raw/master/chrome-palette.zip) and load it unpacked from [chrome://extensions](chrome://extensions)

> The focus is performance, minimal size and ease of use.

## Features <a name="features"></a>

- Commands sorted by usage
- Fuzzy search of commands
- Search sub commands (open tabs, bookmarks, history, etc)
- Dark mode
- See standard shortcuts

## Command list

- New Tab
- New Window
- Open History Page
- Open Passwords Page
- Open Downloads
- Open Extensions
- Open Extension Shortcuts
- Open Bookmark Manager
- Show/hide Bookmarks Bar
- Open Settings
- Close Current Tab
- Terminate Current Tab
- Reload Tab
- Reload All Tabs
- Clear Cache and Reload Tab
- Toggle Pin
- Duplicate Tab
- New Incognito Window
- Close Other Tabs
- Close Tabs To Right
- Close Tabs To Left
- Mute/Unmute Tab
- Move Tab To Start
- Move Tab To End
- Move Tab Left
- Move Tab Right
- Reopen/Unclose Tab
- Deattach Tab (Move to New Window)
- Reattach Tab (Move Tab to Previous Window)
- Toggle full screen
- Clear browsing history, cookies and cache
- Open Chrome SignIn internals
- Open Chrome Apps
- Configure Chrome internal flags
- Configure Third-party Cookies
- Configure Ad privacy
- Configure Sync and Google Services
- Configure Chrome Profile
- Import Bookmarks & Settings
- Configure Addresses
- Configure Autofill & Passwords
- Configure Payment Methods
- Configure Site Settings & Permissions
- Configure Security
- Configure Privacy and security
- Configure Search engine
- Configure Default browser
- Configure on Start-up
- Configure Languages
- Configure Accessibility
- Configure System & Proxy
- Reset chrome settings
- About chrome
- Print page
- Reset command history

## Development

- Made using SolidJS

```bash
npm install
npm start
```

> PRs welcome!

## Full Manual testing

Import the `dist` folder as an unpacked extension in chrome. This folder is rebuilt on changes when using `npm start`

## History

| Version       | View Framework | Bundler | Manifest | Command Palette lib          | Total size | Compressed | Startup time |
| ------------- | -------------- | ------- | -------- | ---------------------------- | ---------- | ---------- | ------------ |
| v2.0.0 (2023) | SolidJS        | Vite    | V3       | Self Made                    | 79kb       | 38Kb       | 99ms         |
| v1.2.1 (2022) | Preact         | ESBuild | V2       | Forked react-command-palette | 180kb      | 60Kb       | 220ms        |
| v1.0.0 (2021) | React          | Webpack | V2       | react-command-palette        | 287kb      | 93Kb       | 350ms        |

# Previous art

- Commander: https://github.com/ssundarraj/commander
