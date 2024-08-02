import { useEffect, useState } from "react";
import { UserWindowProps } from "./UsersWindow.props";
import styles from "./UsersWindow.module.css";
import Button from "../button/Button";
import { io } from "socket.io-client";
import Input from "../input/Input";
import AddUser from "../addUser/AddUser";

function UserWindow({ users, setUsersWindowOpen }: UserWindowProps) {
  const [currentUsers, setCurrentUsers] = useState(users);
  const [fiterUser, setFiterUser] = useState(users.users);
  const [windowAddUser, setWindowAddUser] = useState(false);
  const [search, setSearch] = useState("");
  const queryParams = new URLSearchParams(window.location.search);
  const name = queryParams.get("name");
  const room = queryParams.get("room");

  useEffect(() => {
    update();
  }, []);
  function update() {
    const socket = io.connect("http://localhost:9999/");

    socket.emit("getRoomInfo", room, (data) => {
      if (data.success) {
        setCurrentUsers(data.room);
      }
    });

    socket.on("room", ({ data }) => {
      setCurrentUsers(data);
    });
    return () => {
      socket.disconnect();
    };
  }

  const closeUserWindow = () => {
    setUsersWindowOpen(false);
  };

  const deleteUser = (userName: string, userRoom: string) => {
    const socket = io.connect("http://localhost:9999/");
    socket.emit("removeUserFromRoom", { name: userName, room: userRoom });
    update();
  };
  const openWondowAddUser = () => {
    setWindowAddUser(true);
  };
  useEffect(() => {
    if (search !== "") {
      const filterCurrentUser = currentUsers.users?.filter((u) =>
        u.includes(String(search))
      );
      setFiterUser(filterCurrentUser);
    } else {
      setFiterUser(currentUsers?.users);
    }
  }, [search, currentUsers]);
  return (
    currentUsers && (
      <div className={styles["div"]}>
        {windowAddUser && (
          <AddUser
            roomUsers={currentUsers.admin}
            roomName={currentUsers.room}
            setWindowAddUser={setWindowAddUser}
          />
        )}
        <Button onClick={closeUserWindow} className={styles["button"]}>
          &#215;
        </Button>
        {!windowAddUser && (
          <Button onClick={openWondowAddUser} view={"send"}>
            + User
          </Button>
        )}
        <Input
          placeholder="Searsh user"
          value={search}
          className={styles["input"]}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ul className={styles["ul"]}>
          {fiterUser.map((u, index) => (
            <li className={styles["li"]} key={index}>
              <div>{u}</div>
              {currentUsers.admin === name && name !== u && (
                <Button onClick={() => deleteUser(u, room)}>delete</Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    )
  );
}

export default UserWindow;
