const { rooms, getRoomInfo, addUserToRoom } = require("../models/roomModel");
const { getRoomUsers } = require("../models/userModel");

const handleCreateRoom = (io, socket, currentUser, room) => {
  if (currentUser && !rooms.some(r => r.room === room)) {
    rooms.push({ admin: currentUser.name, room, users: [currentUser.name] })
    addUserToRoom(currentUser.name, room);
    socket.join(room);
    io.to(room).emit("message", {
      data: { user: { name: "Admin" }, message: `Room ${room} created` },
    });
    socket.emit("rooms", {
      rooms: rooms.filter((r) => r.users.includes(currentUser.name)),
    });
  }
};

const handleAddUserToRoom = (io, socket, userName, room, callback) => {
  const roomInfo = addUserToRoom(userName, room);
  if (roomInfo) {
    io.to(room).emit("room", { data: { users: getRoomUsers(room) } });
    callback({ success: true });
  } else {
    callback({ success: false, message: "Failed to add user to room" });
  }
};

module.exports = {
  handleCreateRoom,
  handleAddUserToRoom,
};
