var WebSocketServer = require("ws").Server
var http = require("http")
var express = require("express")
var app = express()
var port = process.env.PORT || 5000

app.use(express.static(__dirname + "/"))

var server = http.createServer(app)
server.listen(port)

console.log("http server listening on %d", port)

var wss = new WebSocketServer({server: server})
console.log("websocket server created")

wss.on("connection", function(ws) {
  var id = setInterval(function() {
    ws.send(JSON.stringify(new Date()), function() {  })
  }, 1000)

  console.log("websocket connection open")

  ws.on("close", function() {
    console.log("websocket connection close")
    clearInterval(id)
  })
})


app.get("/", function (req, res) {
  res.send("<pre>Hello World!</pre>");
});


/* var bodyParser = require("body-parser");
var express = require("express");
var app = express();
var xhub = require("express-x-hub");
var WebSocketServer = require("ws").Server;

app.set("port", process.env.PORT || 5000);
app.listen(app.get("port"));

app.use(xhub({ algorithm: "sha1", secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

var token = process.env.TOKEN || "token";
var received_updates = [];

app.get("/", function (req, res) {
  console.log(req);
  res.send("<pre>" + JSON.stringify(received_updates, null, 2) + "</pre>");
});

app.get(["/facebook", "/instagram"], function (req, res) {
  if (
    req.query["hub.mode"] == "subscribe" &&
    req.query["hub.verify_token"] == token
  ) {
    res.send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(400);
  }
});

app.post("/facebook", function (req, res) {
  console.log("Facebook request body:", req.body);
  whenMessageIsReceived(req.body.toString());

  if (!req.isXHubValid()) {
    console.log(
      "Warning - request header X-Hub-Signature not present or invalid"
    );
    res.sendStatus(401);
    return;
  }

  console.log("request header X-Hub-Signature validated");
  // Process the Facebook updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.post("/instagram", function (req, res) {
  console.log("Instagram request body:");
  console.log(req.body);
  // Process the Instagram updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

var wss = new WebSocketServer({ server: app });
console.log("websocket server created");

wss.on("connection", function (ws) {
  var id = setInterval(function () {
    ws.send(JSON.stringify(new Date()), function () {});
  }, 1000);

  console.log("websocket connection open");

  ws.on("close", function () {
    console.log("websocket connection close");
    clearInterval(id);
  });
});

function whenMessageIsReceived(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(data);
    }
  });
}

app.listen();
 */


