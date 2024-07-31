const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
  res.send("Это только мой мир.");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let rooms = [{
  admin: "admin",
  room: "1",
  users: ["admin", "12"]
}];

let users = [];
let allUsers = ["admin", '12', '1'];

const trimStr = (str) => str.trim().toLowerCase();

const getUsersNotInRoom = (roomName) => {
  const room = rooms.find(r => r.room === roomName);
  if (!room) {
    return [];
  }
  const roomUsersSet = new Set(room.users);
  const usersNotInRoom = allUsers.filter(user => !roomUsersSet.has(user));
  return usersNotInRoom;
};

const findUser = (user) => {
  if (!user || !user.name || !user.room) {
    return undefined;
  }
  const userName = trimStr(user.name);
  const userRoom = trimStr(user.room);
  return users.find(
    (u) => trimStr(u.name) === userName && trimStr(u.room) === userRoom
  );
};

const addUser = (user) => {
  if (!user || !user.name || !user.room) {
    return { isExist: false, user: null };
  }
  const isExist = findUser(user);
  if (!isExist) {
    users.push(user);
    if (!allUsers.includes(user.name)) {
      allUsers.push(user.name);
    }
  }
  const currentUser = isExist || user;
  return { isExist: !!isExist, user: currentUser };
};

const getRoomUsers = (room) => {
  if (!room) {
    return [];
  }
  return users.filter((u) => trimStr(u.room) === trimStr(room));
};

const removeUser = (user) => {
  if (!user || !user.name || !user.room) {
    return null;
  }
  const found = findUser(user);
  if (found) {
    users = users.filter(
      ({ room, name }) => !(room === found.room && name === found.name)
    );
  }
  return found;
};

const getRoomInfo = (roomName) => {
  return rooms.find(r => r.room === roomName);
};

io.on("connection", (socket) => {
  let currentUser = null;

  socket.on("join", ({ name, room }) => {
    if (!name || !room) {
      return;
    }
    socket.join(room);
    const { user, isExist } = addUser({ name, room });
    currentUser = user;
    socket.user = user; 
    if (!user) {
      return;
    }
    const userMessage = isExist
      ? `${user.name}, here you go again`
      : `Hey ${user.name}!`;
    socket.emit("message", {
      data: { user: { name: "Admin" }, message: userMessage },
    });
    socket.broadcast.to(user.room).emit("message", {
      data: { user: { name: "Admin" }, message: `${user.name} has joined` },
    });
    io.to(user.room).emit("room", {
      data: { users: getRoomUsers(user.room) },
    });
    socket.emit("rooms", {
      rooms: rooms.filter(r => r.users.includes(name)),
    });
  });

  socket.on("createRoom", (room) => {
    if (currentUser && !rooms.some(r => r.room === room)) {
      rooms.push({ admin: currentUser.name, room, users: [currentUser.name] });
      addUser({ name: currentUser.name, room });
      socket.join(room);
      io.to(room).emit("message", {
        data: { user: { name: "Admin" }, message: `Room ${room} created` },
      });
      socket.emit("rooms", {
        rooms: rooms.filter(r => r.users.includes(currentUser.name)),
      });
    }
  });

  socket.on("sendMessage", ({ message, params }) => {
    if (!message || !params) {
      return;
    }
    const user = findUser(params);
    if (user) {
      io.to(user.room).emit("message", { data: { user, message } });
    }
  });

  socket.on("leftRoom", ({ params }) => {
    if (!params) {
      return;
    }
    const user = removeUser(params);
    if (user) {
      const { room, name } = user;
      io.to(room).emit("message", {
        data: { user: { name: "Admin" }, message: `${name} has left` },
      });
      io.to(room).emit("room", {
        data: { users: getRoomUsers(room) },
      });
    }
  });

  socket.on("removeUserFromRoom", ({ name, room }) => {
    const roomFilter = rooms.find(r => r.room === room);
    if (roomFilter) {
      roomFilter.users = roomFilter.users.filter(user => user !== name);
      const socketToKick = [...io.sockets.sockets.values()].find(s => s.user && s.user.name === name && s.user.room === room);
      if (socketToKick) {
        socketToKick.leave(room);
        socketToKick.emit("removedFromRoom", { message: `You have been removed from room ${room}` });
      }
    }
    rooms = rooms.map(r => (r.room === room ? roomFilter : r));
    io.to(room).emit("room", { data: { users: getRoomUsers(room) } }); 
  });

  socket.on("getRoomInfo", (roomName, callback) => {
    const room = getRoomInfo(roomName);
    if (room) {
      callback({ success: true, room });
    } else {
      callback({ success: false, message: "Room not found" });
    }
  });

	socket.on("getUsersNotInRoom", (roomName, callback) => {
    const usersNotInRoom = getUsersNotInRoom(roomName);
    console.log(`Users not in room ${roomName}:`, usersNotInRoom);
    callback(usersNotInRoom);
  });

	socket.on("addUserToRoom", ({ userName, room }, callback) => {
    const roomInfo = getRoomInfo(room);
    if (roomInfo && allUsers.includes(userName) && !roomInfo.users.includes(userName)) {
      roomInfo.users.push(userName);
      addUser({ name: userName, room });
      io.to(room).emit("room", { data: { users: getRoomUsers(room) } });
      callback({ success: true });
    } else {
      callback({ success: false, message: "Failed to add user to room" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnect");
  });
});

server.listen(9999, () => {
  console.log("Server is running on port 9999");
});
