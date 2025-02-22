import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Header from "../components/Header.jsx";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser } from "../store/slices/user-slice.js";
import { encryptData, deriveAESKey, hashPasswordSHA256 } from "../utils/cryptoUtils.js"; // Import AES encryption function

export default function Login() {
  const [activeTab, setActiveTab] = useState("login");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [Username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const loginError = useSelector((state) => state.user.error);

  const curPass = useSelector((state) => state.user.password);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    console.log(curPass);
  }, [curPass]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const hashedPassword = await hashPasswordSHA256(password);
      const userData = { username: Username, password: hashedPassword, actual_password: password };
      console.log(userData);
      await dispatch(loginUser({ ...userData })).unwrap();
      setMessage(`Welcome!`);
      navigate("/chat");
    } catch (error) {
      // if(loginError) setMessage(`${loginError.error}`);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      // Generate RSA keys for encryption
      // const rsaKeys = await generateRSAKeyPair();
      // const publicKey = await window.crypto.subtle.exportKey("spki", rsaKeys.publicKey);
      // const privateKey = await window.crypto.subtle.exportKey("pkcs8", rsaKeys.privateKey);

      // Generate ECDH keys for key exchange
      // const dhKeys = await generateDHKeys();
      // const dhPublicKey = await window.crypto.subtle.exportKey("spki", dhKeys.publicKey);
      // const dhPrivateKey = await window.crypto.subtle.exportKey("pkcs8", dhKeys.privateKey);

      // Store private keys locally (client-side only)
      // localStorage.setItem("rsaPrivateKey", Buffer.from(privateKey).toString("base64"));
      // localStorage.setItem("dhPrivateKey", Buffer.from(dhPrivateKey).toString("base64"));

      const key = await deriveAESKey(password);

      // Wait for encryption to finish
      const encryptedEmail = await encryptData(key, email);

      const hashedPassword = await hashPasswordSHA256(password);

      // Ensure the structure is correct
      const userData = { 
        username: Username, 
        email_cipher: encryptedEmail, 
        password: hashedPassword,
        // rsa_public_key: Buffer.from(publicKey).toString("base64"),
        // dh_public_key: Buffer.from(dhPublicKey).toString("base64"),
      };

      await dispatch(registerUser(userData)).unwrap();
      
      setMessage("Registration successful! Go to the Login tab to login.");
      setActiveTab("login"); // Switch to the login tab after signup
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

    } catch (error) {
      console.error("Error during registration:", error);
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
              setUsername("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
            }}
          >
            Login
          </button>
          <button
            className={`tab ${activeTab === "signup" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("signup");
              setMessage("");
              setUsername("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
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
              value={Username}
              onChange={(e) => setUsername(e.target.value)}
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
              placeholder="Username"
              required
              value={Username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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