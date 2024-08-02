import styles from "./Messages.module.css";

interface User {
  name: string;
}

interface Message {
  user: User;
  message: string;
}

interface Props {
  messages: Message[];
  name: string;
}

const Messages = ({ messages, name }: Props) => {
  return (
    <div className={styles.messages}>
      {messages.map((messageObj: Message, i: number) => {
        const { user, message } = messageObj;
        const itsMe =
          user.name.trim().toLowerCase() === name.trim().toLowerCase();
        const className = itsMe ? styles.me : styles.user;

        return (
          <div key={i} className={`${styles.message} ${className}`}>
            <span className={styles.user}>{user.name}</span>

            <div className={styles.text}>{message}</div>
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
