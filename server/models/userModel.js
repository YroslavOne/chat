const { rooms } = require("../models/roomModel");

let users = [];
let allUsers = ["admin", "12", "1"];

const trimStr = (str) => str.trim().toLowerCase();

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

const getRoomUsers = (room) => {
  if (!room) {
    return [];
  }
  return users.filter((u) => trimStr(u.room) === trimStr(room));
};

const getUsersNotInRoom = (roomName) => {
  const room = rooms.find((r) => r.room === roomName);
  if (!room) {
    return [];
  }
  const roomUsersSet = new Set(room.users);
  const usersNotInRoom = allUsers.filter(user => !roomUsersSet.has(user));
  return usersNotInRoom;
};

module.exports = {
  findUser,
  addUser,
  removeUser,
  getRoomUsers,
  getUsersNotInRoom,
  users,
  allUsers,
};
