import { spawn } from "node:child_process";

const server = spawn("node", ["dist/cli.js"], { stdio: ["pipe", "pipe", "pipe"] });
await new Promise(r => server.stdout.on("data", d => { if (d.toString().includes("listening")) r(); }));

const BASE = "http://localhost:3000/mcp";

const res = await fetch(BASE, {
  method: "POST",
  headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
  body: JSON.stringify({
    jsonrpc: "2.0", id: 1, method: "initialize",
    params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "example", version: "1.0.0" } },
  }),
});
const sessionId = res.headers.get("mcp-session-id");
console.log("Session:", sessionId);

// Search
const res2 = await fetch(BASE, {
  method: "POST",
  headers: { "Content-Type": "application/json", "mcp-session-id": sessionId, Accept: "application/json, text/event-stream" },
  body: JSON.stringify({
    jsonrpc: "2.0", id: 2, method: "tools/call",
    params: { name: "searxng_web_search", arguments: { query: "latest node.js version 2026" } },
  }),
});
const text2 = await res2.text();
for (const line of text2.split("\n")) {
  if (line.startsWith("data: ")) {
    const data = JSON.parse(line.slice(6));
    console.log(data.result?.content?.[0]?.text || JSON.stringify(data, null, 2));
  }
}

server.kill();
