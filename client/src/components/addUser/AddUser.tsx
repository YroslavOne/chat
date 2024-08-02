import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Button from "../button/Button";
import styles from "./AddUser.module.css";
import { AddUserProps } from "./AddUser.props";

interface User {
  name: string;
}

const socket = io.connect("http://localhost:9999/");

function AddUser({ roomName, setWindowAddUser }: AddUserProps) {
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState([]);

  useEffect(() => {
    socket.emit("getUsersNotInRoom", roomName, (data: User[]) => {
      setAvailableUsers(data);
    });
  }, [selectedUser, roomName]);

  const handleAddUser = (userName: string) => {
    if (userName) {
      setSelectedUser(userName);
      socket.emit(
        "addUserToRoom",
        { userName, room: roomName },
        (response: { success: boolean; message?: string }) => {
          if (response.success) {
            setAvailableUsers((prev) =>
              prev.filter((u) => u.name !== userName)
            );
          } else {
            alert(response.message);
          }
        }
      );
    }
    setSelectedUser("");
  };

  const closeWindow = () => {
    setWindowAddUser(false);
  };

  return (
    <div className={styles["div"]}>
      <ul className={styles["ul"]}>
        {availableUsers &&
          availableUsers.map((u, index) => (
            <li className={styles["li"]} key={index}>
              {u.name}
              <Button onClick={() => handleAddUser(u.name)}>Select</Button>
            </li>
          ))}
      </ul>
      <Button onClick={closeWindow}>Close</Button>
    </div>
  );
}

export default AddUser;
