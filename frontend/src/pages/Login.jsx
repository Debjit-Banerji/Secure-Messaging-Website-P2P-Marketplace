  import React, { useState, useEffect } from "react";
  import styled from "styled-components";
  import { useNavigate } from "react-router-dom";
  import { useDispatch, useSelector } from "react-redux";
  import { loginUser, registerUser } from "../store/slices/user-slice.js";
  import { generateKeypair } from "../utils/crypto.js";

  export default function Login() {
    const [activeTab, setActiveTab] = useState("login");
    const [message, setMessage] = useState("");
    const [password, setPassword] = useState("");
    const [Username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
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
      setError(""); // Clear previous errors
      try {
        const userData = { username: Username, password: password};
        await dispatch(loginUser({ ...userData })).unwrap();
        setMessage(`Welcome!`);
        navigate("/chat");
      } catch (error) {
        setError("Invalid username or password");
        setPassword(""); // Clear password field on error
      }
    };

    const handleSignupSubmit = async (e) => {
      e.preventDefault();
      if (password !== confirmPassword) {
        setMessage("Passwords do not match!");
        return;
      }

      try {
        let keyPair = await generateKeypair(password);
        // Ensure the structure is correct
        const userData = { 
          username: Username,
          email: email,
          password: password,
          public_key: keyPair.publicKey,
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
          <FormTitle>Welcome Back</FormTitle>
          <TabsContainer>
            <TabButton
              isActive={activeTab === "login"}
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
            </TabButton>
            <TabButton
              isActive={activeTab === "signup"}
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
            </TabButton>
          </TabsContainer>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {message && <SuccessMessage>{message}</SuccessMessage>}
          
          {activeTab === "login" && (
            <StyledForm onSubmit={handleLoginSubmit}>
              <InputGroup>
                <Label>Username</Label>
                <Input
                  type="text"
                  placeholder="Enter your username"
                  required
                  value={Username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </InputGroup>
              <InputGroup>
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </InputGroup>
              <SubmitButton type="submit">Login</SubmitButton>
            </StyledForm>
          )}
          
          {activeTab === "signup" && (
            <StyledForm onSubmit={handleSignupSubmit}>
              <InputGroup>
                <Label>Username</Label>
                <Input
                  type="text"
                  placeholder="Username"
                  required
                  value={Username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </InputGroup>
              <InputGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputGroup>
              <InputGroup>
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </InputGroup>
              <InputGroup>
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </InputGroup>
              <SubmitButton type="submit">SignUp</SubmitButton>
            </StyledForm>
          )}
        </Content>
      </Container>
    );
  }

  const Container = styled.div`
    min-height: 100vh;
    min-width: 100%;
    padding-top: 5rem;
    padding-botttom: 5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, rgb(16, 16, 46) 0%, rgb(26, 26, 76) 100%);
    overflow: hidden;
  `;

  const Content = styled.div`
    background-color: rgba(255, 255, 255, 0.95);
    width: 100%;
    max-width: 450px;
    padding: 2.5rem;
    border-radius: 15px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  `;

  const FormTitle = styled.h1`
    font-size: 2rem;
    color: rgb(16, 16, 46);
    margin-bottom: 1.5rem;
    text-align: center;
  `;

  const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  `;

  const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  `;

  const Label = styled.label`
    font-size: 0.9rem;
    color: rgb(16, 16, 46);
    font-weight: 500;
  `;

  const Input = styled.input`
    padding: 0.8rem;
    font-size: 1rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    outline: none;
    transition: all 0.3s ease;

    &:focus {
      border-color: rgb(16, 16, 46);
      box-shadow: 0 0 0 2px rgba(16, 16, 46, 0.1);
    }
  `;

  const SubmitButton = styled.button`
    background-color: rgb(16, 16, 46);
    color: white;
    font-size: 1rem;
    padding: 1rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;

    &:hover {
      background-color: rgb(26, 26, 76);
      transform: translateY(-1px);
    }
  `;

  const ErrorMessage = styled.div`
    color: #dc3545;
    background-color: #ffe6e6;
    padding: 0.8rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    text-align: center;
    font-size: 0.9rem;
  `;

  const SuccessMessage = styled.div`
    color: #198754;
    background-color: #d1e7dd;
    padding: 0.8rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    text-align: center;
    font-size: 0.9rem;
  `;

  const TabsContainer = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    justify-content: center;
  `;

  const TabButton = styled.button`
    padding: 0.8rem 2rem;
    font-size: 1rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    background-color: ${props => props.isActive ? 'rgb(16, 16, 46)' : 'transparent'};
    color: ${props => props.isActive ? 'white' : 'rgb(16, 16, 46)'};
    border: 2px solid rgb(16, 16, 46);

    &:hover {
      background-color: ${props => props.isActive ? 'rgb(26, 26, 76)' : 'rgba(16, 16, 46, 0.1)'};
      transform: translateY(-1px);
    }
  `;