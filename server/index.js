import http2 from "http2";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/** serves static assets (used under the hood in 'serve' package) */
import handler from "serve-handler";

/** A lightweight, fixed-size value buffer. */
import nanobuffer from "nanobuffer";

let connections = [];

const msg = new nanobuffer(50);
function getMsgs() {
  return Array.from(msg).reverse();
}
msg.push({
  user: "adam",
  text: "hello lunch and learn",
  time: Date.now(),
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const server = http2.createSecureServer({
  cert: fs.readFileSync(path.join(__dirname, "/../server.crt")),
  key: fs.readFileSync(path.join(__dirname, "/../key.pem")),
});

// HTTP/2 only
server.on("stream", (stream, headers) => {
  const path = headers[":path"];
  const method = headers[":method"];
  // streams open for every request from browser
  if (path === "/msgs" && method === "GET") {
    console.log(`connected a stream ${stream.id}`)
    stream.respond({ ":status": 200, "content-type": "text/plain; charset=utf-8" })
    // write first response
    stream.write(JSON.stringify({msg: getMsgs()}))

    // handle close
    stream.on("close", () => {
      console.log(`disconnected ${stream.id}`)
    })
  }
})

// HTTP/1.1 HTTP/2
server.on("request", async (req, res) => {
  const path = req.headers[":path"];
  const method = req.headers[":method"];

  if (path !== "/msgs") {
    // handle the static assets for anything not on msgs path
    return handler(req, res, {
      public: "./client",
    });
  } else if (method === "POST") {
    // get data out of post (like body parser in express)
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const data = Buffer.concat(buffers).toString();
    const { user, text } = JSON.parse(data);

    /*
     *
     * some code goes here
     *
     */
  }
});

// start listening
const port = process.env.PORT || 8000;
server.listen(port, () =>
  console.log(
    `Server running at https://localhost:${port} - make sure you're on httpS, not http`
  )
);