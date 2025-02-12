import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Chat from './pages/Chat';
import Login from './pages/Login';
import Market from './pages/Market';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/chat" element={<Chat />} />
        <Route exact path="/" element={<Login />}/>
        <Route exact path="/market" element={<Market />}/>
      </Routes>
    </BrowserRouter>
  );
}