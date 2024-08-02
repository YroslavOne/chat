const {
    findUser,
    addUser,
    removeUser,
    getRoomUsers,
    getUsersNotInRoom,
  } = require("../models/userModel");
  
  const {
    handleCreateRoom,
    handleAddUserToRoom,
  } = require("../controllers/roomController");
  
  const { rooms, getRoomInfo } = require("../models/roomModel");
  
  module.exports = (io, socket) => {
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
        rooms: rooms.filter((r) => r.users.includes(name)),
      });
    });
  
    socket.on("createRoom", (room) => {
      handleCreateRoom(io, socket, currentUser, room);
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
      const roomFilter = getRoomInfo(room);
      if (roomFilter) {
        roomFilter.users = roomFilter.users.filter((user) => user !== name);
        const socketToKick = [...io.sockets.sockets.values()].find(
          (s) => s.user && s.user.name === name && s.user.room === room
        );
        if (socketToKick) {
          socketToKick.leave(room);
          socketToKick.emit("removedFromRoom", {
            message: `You have been removed from room ${room}`,
          });
        }
      }
      rooms.splice(rooms.findIndex(r => r.room === room), 1, roomFilter);
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
      handleAddUserToRoom(io, socket, userName, room, callback);
    });
  
    socket.on("disconnect", () => {
      console.log("Disconnect");
    });
  };
  