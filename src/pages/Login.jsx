import React, { useState, useEffect } from "react";
import styled from "styled-components";
// import { auth } from "../utils/firebase-config"; // Import Firebase auth functions
// import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
// import Header from "../components/Header.jsx"
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// import { createNewUser, fetchUserById } from "../store/user-store";

export default function Login() {
  const [activeTab, setActiveTab] = useState("login");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // const currentUser = useSelector((state) => state.user.selectedUser);
  
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the page when the component is mounted
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create user in Firebase
      // await signInWithEmailAndPassword(auth, email, password);
      // await dispatch(fetchUserById(email)).unwrap();

      setMessage(`Welcome!`);
      navigate("/home"); // Switch to the login tab after signup
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  // useEffect(() => {
  //   // You can now log currentUser after it's updated
  //   if (currentUser) {
  //     console.log(currentUser); // Logs the current user after it is fetched
  //   }
  // }, [currentUser]); 

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      // Create user in Firebase
      // const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // const user = userCredential.user;
  
      // Dispatch the createNewUser thunk to add the user to MongoDB
      // const userData = { name, email, password };
      // await dispatch(createNewUser(userData)).unwrap();
  
      setMessage("Registration successful! Go to the Login tab to login.");
      setActiveTab("login"); // Switch to the login tab after signup
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <Container>
      <Content>
        <div className="tabs">
          <button
            className={`tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("login");
              setMessage("");
            }}
          >
            Login
          </button>
          <button
            className={`tab ${activeTab === "signup" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("signup");
              setMessage("");
            }}
          >
            SignUp
          </button>
        </div>
        {message && <div className="message active">{message}</div>}
        {activeTab === "login" && (
          <form className="form" onSubmit={handleLoginSubmit}>
            <input
              type="text"
              placeholder="Username"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
        )}
        {activeTab === "signup" && (
          <form className="form" onSubmit={handleSignupSubmit}>
            <input
              type="text"
              placeholder="Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button type="submit">SignUp</button>
          </form>
        )}
      </Content>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  min-width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background-color: rgb(16, 16, 46);
`;

const Content = styled.div`
  background-color: rgba(255, 255, 255, 0.7);
  width: 400px;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
  text-align: center;

  .tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .tab {
    background: none;
    border: none;
    font-size: 1.2rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    color: black;
  }

  .tab.active {
    font-weight: bold;
    border-bottom: 2px solid black;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  input {
    padding: 0.8rem;
    font-size: 1rem;
    border: 1px solid black;
    border-radius: 5px;
    outline: none;
    transition: border 0.3s;
  }

  input:focus {
    border: 1px solid black;
  }

  button {
    background-color: black;
    color: white;
    font-size: 1rem;
    padding: 0.8rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
  }

  button:hover {
    background-color: grey;
  }

  .message {
    margin-bottom: 1rem;
    color: black;
    font-size: 1rem;
  }
`;