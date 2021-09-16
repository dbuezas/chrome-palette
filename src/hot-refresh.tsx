import React, { useEffect } from "react";

export default function HotRefresh() {
  if (process.env.NODE_ENV !== "production") {
    useEffect(() => {
      const socket = new WebSocket("ws://localhost:8081");
      socket.addEventListener("connection", (event) => {
        console.log("connected ", event);
      });
      socket.addEventListener("message", async (event) => {
        console.log("Message from server ", event);
        const { action, payload } = JSON.parse(event.data);
        if (action === "update-app") window.location.reload();
      });
      return () => socket.close();
    }, []);
  }
  return <></>;
}
