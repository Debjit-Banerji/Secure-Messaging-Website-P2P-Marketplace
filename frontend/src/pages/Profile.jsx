import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { FaPen, FaCheck, FaTrash } from "react-icons/fa";
import CloseButton from 'react-bootstrap/CloseButton';
import { updateExistingUser } from "../store/user-store";

export default function ProfilePage() {

  const dispatch = useDispatch();

  const [profilePicture, setProfilePicture] = useState("");

  const [isEditable, setIsEditable] = useState({
    name: false,
    email: false,
    chatGPTKey: false,
    password: false,
  });

  const currentUser = useSelector((state) => state.user.selectedUser);

  // Temporary state to hold changes
  const [temp, setTemp] = useState(
    currentUser
  );

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the page when the component is mounted
  }, []);

  const handleEditToggle = (field) => {
    setIsEditable((prev) => ({ ...prev, [field]: !prev[field] }));
    if (isEditable[field] === false) {
      setTemp((prev) => ({
        ...prev,
        [field]: currentUser[field],
      }));
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicture(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = (field) => {
    if (field === "name" || field === "email" || field === "gptkey") {
      console.log(currentUser);
      console.log(temp);
      dispatch(updateExistingUser({ email: currentUser.email, userData: temp })); // Dispatching action to update user data
    }
    setIsEditable((prev) => ({ ...prev, [field]: false }));
  };

  const handleDiscardChanges = (field) => {
    setTemp((prev) => ({
      ...prev,
      [field]: currentUser[field],
    }));
    setIsEditable((prev) => ({ ...prev, [field]: false }));
  };

  const navigate = useNavigate();

  const handleCloseClick = () => {
    navigate("/home");
  };

  return (
    <ProfileContainer>
      <CloseButton onClick={handleCloseClick} />
      <h2>Profile</h2>
      <div className="profile-section">
        <div className="profile-picture-container">
          <img
            src={profilePicture || "https://via.placeholder.com/150"}
            alt="Profile"
            className="profile-picture"
          />
          <label className="edit-icon">
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              style={{ display: "none" }}
            />
            <FaPen />
          </label>
        </div>
      </div>
      <hr />
      <div className="form-section">
        <div className="form-grid">
          {[
            {
              label: "Name",
              value: temp.name,
              setValue: (value) => setTemp((prev) => ({ ...prev, name: value })),
              field: "name",
            },
            {
              label: "Email",
              value: temp.email,
              setValue: (value) => setTemp((prev) => ({ ...prev, email: value })),
              field: "email",
            },
            {
              label: "ChatGPT User Key",
              value: temp.gptkey,
              setValue: (value) => setTemp((prev) => ({ ...prev, chatGPTKey: value })),
              field: "chatGPTKey",
            },
            {
              label: "Password",
              value: temp.password,
              setValue: (value) => setTemp((prev) => ({ ...prev, password: value })),
              field: "password",
            },
          ].map(({ label, value, setValue, field }) => (
            <div key={field} className="form-group">
              <label>{label}</label>
              <input
                type={field === "password" ? "password" : "text"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={!isEditable[field]}
              />
              <div className="icons">
                {!isEditable[field] ? (
                  <div
                    className="edit-icon"
                    onClick={() => handleEditToggle(field)}
                  >
                    <FaPen />
                  </div>
                ) : (
                  <>
                    <div
                      className="save-icon"
                      onClick={() => handleSaveChanges(field)}
                    >
                      <FaCheck />
                    </div>
                    <div
                      className="delete-icon"
                      onClick={() => handleDiscardChanges(field)}
                    >
                      <FaTrash />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProfileContainer>
  );
}

// Styled Component
const ProfileContainer = styled.div`
  width: 100vw;
  height: 100vh;
  padding: 2rem;
  background-color: white;

  h2 {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 2rem;
    color: black;
  }

  .profile-section {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;

    .profile-picture-container {
      position: relative;
      width: 150px;
      height: 150px;

      .profile-picture {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px solid #ddd;
        object-fit: cover;
      }

      .edit-icon {
        position: absolute;
        bottom: 5px;
        right: 5px;
        background: white;
        color: blue;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);

        &:hover {
          background: grey;
        }
      }
    }
  }

  hr {
    width: 80vw;
    margin: 2rem auto;
    border: none;
    border-top: 1px solid black;
  }

  .form-section {
    display: flex;
    justify-content: center;

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      width: 80%;

      .form-group {
        position: relative;

        label {
          display: block;
          font-weight: bold;
          margin-bottom: 0.5rem;
          color: #555;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 5px;
          outline: none;
          background-color: #f5f5f5;
          color: #333;
          cursor: not-allowed;

          &:not(:disabled) {
            background-color: white;
            cursor: text;
          }
        }

        .icons {
          position: absolute;
          top: 70%;
          right: -20px;
          transform: translateY(-50%);
          display: flex;
          gap: 0.5rem;

          .edit-icon{
            background: white;
            color: blue;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);

            &:hover {
              background: grey;
            }
          }
          .save-icon{
            background: white;
            color: green;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);

            &:hover {
              background: grey;
            }
          }
          .delete-icon {
            background: white;
            color: red;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);

            &:hover {
              background: grey;
            }
          }

          .delete-icon {
            color: red;
          }
        }
      }
    }
  }
`;