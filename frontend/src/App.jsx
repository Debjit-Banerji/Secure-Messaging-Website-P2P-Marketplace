import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Chat from './pages/Chat.jsx';
import Login from './pages/Login.jsx';
import Market from './pages/Market.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Chat />} />
        <Route exact path="/profile" element={<Profile />} />
        <Route exact path="/login" element={<Login />}/>
        <Route exact path="/market" element={<Market />}/>
      </Routes>
    </BrowserRouter>
  );
}