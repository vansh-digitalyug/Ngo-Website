const http = require("http");
const fs = require("fs");
const path = require("path");

// @endpoint GET /health
const server = http.createServer((req, res) => {
  const { method, url } = req;
  if (method === "GET" && url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
