import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Button from '../button/Button';
import styles from './AddUser.module.css';

const socket = io.connect("http://localhost:9999/");

function AddUser({ roomUsers, roomName, setWindowAddUser}) {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);

  useEffect(() => {
    socket.emit('getUsersNotInRoom', roomName, (data) => {
      setAvailableUsers(data);
    });
  }, [selectedUser]);

  const handleAddUser = (u) => {
    if (u) {
			setSelectedUser(u)
      socket.emit('addUserToRoom', { userName: u, room: roomName }, (response) => {
        if (response.success) {
          setAvailableUsers((prev) => prev.filter((u) => u.name !== u));
        } else {
          alert(response.message);
        }
      });
    }
			setSelectedUser("")

  };
const closeWindow = ()=>{
	setWindowAddUser(false)
}
  return (
    <div className={styles['div']}>
      <ul className={styles['ul']}>
        {availableUsers && availableUsers.map((u, index) => (
          <li className={styles['li']} key={index}>
            {u}
            <Button onClick={() => handleAddUser(u)}>Select</Button>
          </li>
        ))}
      </ul>
       
        <Button onClick={closeWindow}>Close</Button>
    </div>
  );
}

export default AddUser;
