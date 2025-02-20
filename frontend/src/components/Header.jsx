import React from "react";
import styled from "styled-components";
import logo from "../assets/logo.png"; // Import the logo image

export default function Header () {
  return (
    <Container>
      <Logo src={logo} alt="App Logo" />
    </Container>
  );
};

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 5rem;
  background-color: rgb(41, 51, 84);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 50;
  box-sizing: border-box;
`;

const Logo = styled.img`
  height: 60px;
  max-width: 200px;
  object-fit: contain;
`;