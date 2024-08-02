import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import styles from "./Myaccount.module.css";
import Button from "../button/Button";
import Input from "../input/Input";

const socket = io.connect("http://localhost:9999/");

const Myaccount = () => {
  const [rooms, setRooms] = useState<string[]>([]);
  const [newRoom, setNewRoom] = useState("");
  const [username, setUsername] = useState("");
  const queryParams = new URLSearchParams(window.location.search);
  const name = queryParams.get("name");
  const navigate = useNavigate();

  useEffect(() => {
    if (name) {
      setUsername(name);
      socket.emit("join", { name, room: "default" });

      socket.on("rooms", ({ rooms }) => {
        if (Array.isArray(rooms)) {
          setRooms(rooms.map((room) => room));
        }
      });

      socket.on("room", ({ data }) => {
        if (data && data.users && data.room) {
          setRooms((prevRooms) => {
            const updatedRooms = [...prevRooms];
            if (!updatedRooms.includes(data)) {
              updatedRooms.push(data);
            }
            return updatedRooms;
          });
        }
      });
    }

    return () => {
      socket.off("rooms");
      socket.off("room");
    };
  }, [name]);

  const handleCreateRoom = () => {
    if (newRoom) {
      socket.emit("createRoom", newRoom);
      setNewRoom("");
    }
  };

  const exit = () => {
    navigate(`/`);
  };

  return (
    <div className={styles["div"]}>
      <div className={styles["top-menu"]}>
        <h2 className={styles["h2"]}>Welcome, {username}</h2>

        <Button onClick={exit}>Exit</Button>
      </div>
      <h3 className={styles["h3"]}>Your Rooms:</h3>
      <ul className={styles["ul"]}>
        {rooms.map((room, index) => (
          <li className={styles["li"]} key={index}>
            {room.room}
            <Link to={`/chat?name=${username}&room=${room.room}`}>
              <Button view="send">Перейти</Button>
            </Link>
          </li>
        ))}
      </ul>
      <div className={styles["create-room"]}>
        <Input
          type="text"
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          placeholder="New Room Name"
        />

        <Button view="send" onClick={handleCreateRoom}>
          Create Room
        </Button>
      </div>
    </div>
  );
};

export default Myaccount;
