import http from "node:http";
http.createServer((request, response) => {
  if (request.url === "/health") { response.end("ok"); return; }
  const token = /accessToken=([^;]+)/.exec(request.headers.cookie || "")?.[1];
  const role = token?.replace("e2e-", "");
  response.setHeader("Content-Type", "application/json");
  if (role === "unavailable") { response.writeHead(503); response.end("{}"); return; }
  if (request.url === "/api/v1/users/me" && ["ADMIN", "CUSTOMER", "COURIER"].includes(role)) {
    response.end(JSON.stringify({ success: true, data: { role } })); return;
  }
  response.writeHead(401); response.end(JSON.stringify({ success: false }));
}).listen(5101, "127.0.0.1");
