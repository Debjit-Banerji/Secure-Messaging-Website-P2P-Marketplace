import React, {useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMessageSquare, FiShoppingBag, FiSearch, FiUser, FiLogOut } from "react-icons/fi";
import styled from "styled-components";

export default function Navbar () {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("User logged out");
    navigate("/login");
  };

  return (
    <NavbarContainer>
      {/* Top Icons */}
      <NavGroup>
        <NavItem to="/chats" icon={<FiMessageSquare />} tooltip="Chats" />
        <NavItem to="/market" icon={<FiShoppingBag />} tooltip="Market" />
        <NavItem to="/search" icon={<FiSearch />} tooltip="Search" />
      </NavGroup>

      {/* Bottom Icons */}
      <NavGroup>
        <NavItem to="/profile" icon={<FiUser />} tooltip="Profile" />
        <LogoutButton onClick={handleLogout}>
          <FiLogOut />
          <Tooltip>Logout</Tooltip>
        </LogoutButton>
      </NavGroup>
    </NavbarContainer>
  );
};

const NavItem = ({ to, icon, tooltip }) => (
  <StyledLink to={to}>
    {icon}
    <Tooltip>{tooltip}</Tooltip>
  </StyledLink>
);


// Styled Components
const NavbarContainer = styled.div`
  height: 100vh;
  width: 4rem;
  background-color: #111827;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
`;

const NavGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const StyledLink = styled(Link)`
  position: relative;
  color: #9ca3af;
  font-size: 1.5rem;
  transition: color 0.2s;

  &:hover {
    color: white;
  }

  &:hover span {
    opacity: 1;
    transform: translateX(0);
  }
`;

const LogoutButton = styled.button`
  position: relative;
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 1.5rem;
  transition: color 0.2s;
  cursor: pointer;

  &:hover {
    color: white;
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