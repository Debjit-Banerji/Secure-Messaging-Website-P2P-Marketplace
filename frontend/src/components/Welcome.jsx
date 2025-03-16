import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Robot from "../assets/robot.gif";
import { useDispatch, useSelector } from "react-redux";
import { getUserData } from "../store/slices/user-slice";

export default function Welcome() {
  const curUser = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUserData());
  }, []);

  // useEffect(async () => {
  //   setUserName(
  //     await JSON.parse(
  //       localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
  //     ).username
  //   );
  // }, []);
  return (
    <Container>
      <TextWrapper>
        <h1>
          Welcome, <span>{curUser && curUser.username}!</span>
        </h1>
        <h3>Please select a chat to Start messaging.</h3>
      </TextWrapper>
      <img src={Robot} alt="" />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  flex-direction: row;
  padding-left: 5rem;
  img {
    height: 20rem;
  }
  span {
    color: #4e0eff;
  }
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;