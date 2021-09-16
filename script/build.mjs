// @ts-check
import WebSocket, { WebSocketServer } from "ws";
import chokidar from "chokidar";
import { execSync } from "child_process";
import esbuild from "esbuild";

const date = new Date().toString();
const isProd = process.env.NODE_ENV === "production";

const synchPublic = async () => {
  execSync("cp public/* dist/");
};
const watchOptn = {
  // awaitWriteFinish: {stabilityThreshold:100, pollInterval:50},
  ignoreInitial: true,
};
async function build() {
  execSync("rm -rf dist/");
  execSync("mkdir dist");
  await synchPublic();
  console.time("build");
  const result = await esbuild.build({
    entryPoints: ["src/index.tsx"],
    bundle: true,
    minify: isProd,
    metafile: true,
    sourcemap: isProd ? false : "inline",
    outfile: "dist/bundle.js",
    incremental: !isProd,
    define: {
      NODE_ENV: process.env.NODE_ENV,
      "process.env.NODE_ENV": `"${process.env.NODE_ENV}"`,
      "process.env.REACT_APP_BUILD_TIME": `"${date}"`,
    },
  });
  console.timeEnd("build");

  let text =
    result.metafile && (await esbuild.analyzeMetafile(result.metafile));
  console.log(text);

  if (isProd) {
    execSync("rm -f chrome-palette.zip");
    execSync("zip -r chrome-palette.zip dist/");
  } else {
    const wss = new WebSocketServer({ port: 8081 });
    wss.on("connection", () => console.log(wss.clients.size));
    wss.on("close", () => console.log(wss.clients.size));
    const sendToClients = (/** @type {{ action: string; }} */ message) => {
      wss.clients.forEach(function each(
        /** @type {{ readyState: number; send: (arg0: string) => void; }} */ client
      ) {
        if (client.readyState === WebSocket.OPEN) {
          console.log("sending");
          client.send(JSON.stringify(message));
        }
      });
    };
    chokidar.watch("public", watchOptn).on("all", async (...args) => {
      console.log(args);
      await synchPublic();
      sendToClients({ action: "update-app" });
    });
    chokidar.watch("src", watchOptn).on("all", async (...args) => {
      console.log(args);
      await result.rebuild?.();
      sendToClients({ action: "update-app" });
    });
  }
}

build();
