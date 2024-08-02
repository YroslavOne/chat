import React, {
  ChangeEvent,
  FormEvent,
  useRef,
  useEffect,
  useState,
} from "react";
import io from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Chat.module.css";
import Messages from "../messages/Messages";
import Button from "../button/Button";
import UserWindow from "../usersWindow/UsersWindow";
import { UserWindowProps } from "../usersWindow/UsersWindow.props";

interface User {
  name: string;
}

interface Message {
  user: User;
  message: string;
}

interface Params {
  room: string;
  name: string;
}

interface RoomData {
  users: User[];
}

const socket = io.connect("http://localhost:9999/");

function Chat() {
  const queryParams = new URLSearchParams(window.location.search);
  const name = queryParams.get("name");
  const room = queryParams.get("room");
  const { search } = useLocation();
  const [roomInfo, setRoomInfo] = useState<UserWindowProps>();
  const navigate = useNavigate();
  const [params, setParams] = useState<Params>({ room: "", name: "" });
  const [state, setState] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const [users, setUsers] = useState<number>(0);
  const [usersWindowOpen, setUsersWindowOpen] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (room) {
      socket.emit("getRoomInfo", room, (data) => {
        if (data.success) {
          setRoomInfo(data.room);
        }
      });
    }
  }, [room]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo(0, messagesRef.current.scrollHeight);
    }
  }, [state]);

  useEffect(() => {
    const searchParams: Params = Object.fromEntries(
      new URLSearchParams(search)
    ) as Params;
    setParams(searchParams);
  }, [search]);

  useEffect(() => {
    if (params.room && params.name) {
      socket.emit("join", params);

      return () => {
        socket.emit("leftRoom", params);
        socket.off("message");
        socket.off("room");
      };
    }
  }, [params]);

  useEffect(() => {
    const messageListener = ({ data }: { data: Message }) => {
      if (data.user && data.message) {
        setState((prevState) => [...prevState, data]);
      }
    };

    socket.on("message", messageListener);

    return () => {
      socket.off("message", messageListener);
    };
  }, []);

  useEffect(() => {
    const roomListener = ({ data: { users } }: { data: RoomData }) => {
      setUsers(users.length);
    };

    socket.on("room", roomListener);

    return () => {
      socket.off("room", roomListener);
    };
  }, []);

  const leftRoom = () => {
    socket.emit("leftRoom", { params });
    navigate(`/myaccount?name=${name}`);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setMessage(e.target.value);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message) return;
    socket.emit("sendMessage", { message, params });
    setMessage("");
  };

  const openUserWindow = () => {
    setUsersWindowOpen(true);
  };

  socket.on("removedFromRoom", ({ message }) => {
    alert(message);
    leftRoom();
  });

  return (
    <div className={styles.wrap}>
      {usersWindowOpen && (
        <div className={styles.userwindow}>
          <UserWindow
            setUsersWindowOpen={setUsersWindowOpen}
            users={roomInfo}
          />
        </div>
      )}
      <div className={styles.header}>
        <div className={styles.title}>
          <span>Room:</span> {params.room}
        </div>
        <div className={styles.users} onClick={openUserWindow}>
          {users} users in this room
        </div>
        <Button onClick={leftRoom} type="submit" view="close">
          Left the room
        </Button>
      </div>

      <div ref={messagesRef} className={styles.messages}>
        <Messages messages={state} name={params.name} />
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.input}>
          <input
            type="text"
            name="message"
            placeholder="What do you want to say?"
            value={message}
            onChange={handleChange}
            autoComplete="off"
            required
          />
        </div>

        <div onSubmit={handleSubmit}>
          <Button type="submit" view="send">
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}

export default Chat;
