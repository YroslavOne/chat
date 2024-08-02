const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("./config/corsConfig");
const socketHandlers = require("./sockets/socketHandlers");

const app = express();
app.use(cors);

const routes = require("./routes/index");
app.use(routes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socketHandlers(io, socket);
});

server.listen(9999, () => {
  console.log("Server is running on port 9999");
});
