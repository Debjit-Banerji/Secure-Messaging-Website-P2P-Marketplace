import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMessageSquare, FiShoppingBag, FiSearch, FiUser, FiLogOut } from "react-icons/fi";
import styled from "styled-components";
import SearchPeople from "./SearchPeople";
import { logoutUser } from "../store/slices/user-slice";
import { logoutChats } from "../store/slices/chat-slice";
import { useDispatch } from "react-redux";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showSearch, setShowSearch] = useState(false);

  const handleLogout = async () => {
    console.log("User logged out");
    await dispatch(logoutUser());
    await dispatch(logoutChats());
    navigate("/");
  };

  const handelCloseSearch = () => {
    setShowSearch(!showSearch);
  };

  return (
    <>
      <NavbarContainer>
        {/* Top Icons */}
        <NavGroup>
          <NavItem to="/chat" icon={<FiMessageSquare />} tooltip="Chats" />
          <NavItem to="/market" icon={<FiShoppingBag />} tooltip="Market" />
          <NavItem icon={<FiSearch />} tooltip="Search" onClick={() => setShowSearch(true)} />
        </NavGroup>

        {/* Bottom Icons */}
        <NavGroup>
          <NavItem to="/profile" icon={<FiUser />} tooltip="Profile" />
          <NavItem to="/" icon={<FiLogOut />} tooltip="Logout" onClick={handleLogout} />
        </NavGroup>
      </NavbarContainer>
      
      {/* Render SearchPeople Component when search is clicked */}
      {showSearch && <SearchPeople onClose={handelCloseSearch}/>}
    </>
  );
}

const NavItem = ({ to, icon, tooltip, onClick }) => (
  <StyledLink to={to || "#"} onClick={onClick}>
    {icon}
    <Tooltip>{tooltip}</Tooltip>
  </StyledLink>
);

// Styled Components
const NavbarContainer = styled.div`
  position: fixed;
  top: 0; /* Changed from 5rem to 0 to move the navbar up */
  left: 0;
  width: 4rem;
  height: 100vh; /* Changed from calc(100vh - 5rem) to 100vh */
  background-color: #111827;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  box-sizing: border-box;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
`;

const NavGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const StyledLink = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background-color: #1f2937;
  border-radius: 50%;
  color: #9ca3af;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    color: white;
    transform: scale(1.05);
    box-shadow: 0px 4px 10px rgba(255, 255, 255, 0.2);
  }

  &:hover span {
    opacity: 1;
    transform: translateX(0);
  }
`;

const Tooltip = styled.span`
  position: absolute;
  left: 2.5rem;
  top: 50%;
  transform: translateY(-50%) translateX(-10px);
  background: #1f2937;
  color: white;
  font-size: 0.75rem;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  opacity: 0;
  white-space: nowrap;
  transition: opacity 0.2s, transform 0.2s;
`;