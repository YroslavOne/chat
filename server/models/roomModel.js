let rooms = [
    {
      admin: "admin",
      room: "1",
      users: ["admin", "12"],
    },
  ];
  
  const getRoomInfo = (roomName) => {
    return rooms.find((r) => r.room === roomName);
  };
  
  const addUserToRoom = (userName, room) => {
    const roomInfo = getRoomInfo(room);
    if (roomInfo && !roomInfo.users.includes(userName)) {
      roomInfo.users.push(userName);
    }
    return roomInfo;
  };
  
  module.exports = {
    getRoomInfo,
    addUserToRoom,
    rooms,
  };
  