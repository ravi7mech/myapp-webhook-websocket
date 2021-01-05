var WebSocketServer = require("ws").Server
var http = require("http")
var bodyParser = require("body-parser")
var xhub = require("express-x-hub");
var express = require("express")
var app = express()
var port = process.env.PORT || 5000
var token = process.env.TOKEN || "token";

app.use(express.static(__dirname + "/"))
app.use(xhub({ algorithm: "sha1", secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

var server = http.createServer(app)
server.listen(port)

console.log("http server listening on %d", port)

var received_updates = [];
// Web socket related
var wss = new WebSocketServer({server: server})
console.log("websocket server created")

wss.getUniqueID = function () {
  function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4();
};


wss.on("connection", function(ws) {
  console.log("websocket connection Initiated ")
  ws.id = wss.getUniqueID();

  wss.clients.forEach(function each(client) {
      console.log('Client.ID: ' + client.id);
  });

  ws.send(JSON.stringify({clientId: ws.id}));

  ws.on("close", function() {
    console.log("websocket connection close : "+ws.id)
  })
})

function whenMessageIsReceived(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(data);
    }
  });
}

// http endpoints related
app.get("/", function (req, res) {
  res.send("<pre>Hello World!</pre>");
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
// Request body validation
app.post("/facebook", function (req, res) {
  console.log("Facebook request body:", req.body.toString());

  if (!req.isXHubValid()) {
    console.log(
      "Warning - request header X-Hub-Signature not present or invalid"
    );
    res.sendStatus(401);
    return;
  }

  console.log("request header X-Hub-Signature validated");
  whenMessageIsReceived(JSON.stringify(req.body));
  // Process the Facebook updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

