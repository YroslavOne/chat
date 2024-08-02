import { Routes, Route } from "react-router-dom";

import Main from "../main/Main";
import Chat from "../chat/Chat";
import Myaccount from "../myaccount/Myaccount";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Main />} />
    <Route path="/myaccount" element={<Myaccount />} />
    <Route path="/chat" element={<Chat />} />
  </Routes>
);

export default AppRoutes;
