import { Command } from "./commands";

export function storeLastUsed(command: Command) {
  let store: string[] = JSON.parse(localStorage.lastUsed || "[]");
  store.unshift(command.name);
  store = store.slice(0, 10);
  localStorage.lastUsed = JSON.stringify(store);
}
export function sortByUsed(commands: Command[]) {
  let store: string[] = JSON.parse(localStorage.lastUsed || "[]");
  return commands.sort((a, b) => {
    const a_idx = store.indexOf(a.name);
    const b_idx = store.indexOf(b.name);
    const a_idx2 = commands.indexOf(a);
    const b_idx2 = commands.indexOf(b);
    if (a_idx === -1 && b_idx === -1) return a_idx2 - b_idx2;
    if (a_idx === -1) return 1;
    if (b_idx === -1) return -1;

    return a_idx - b_idx;
  });
}
