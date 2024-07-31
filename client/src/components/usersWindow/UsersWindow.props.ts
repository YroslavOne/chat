interface User {
    admin: string;
    room: string;
    users: string[];
}

export interface UserWindowProps {
    users?: User[];
		setUsersWindowOpen: React.Dispatch<React.SetStateAction<boolean>>;
}