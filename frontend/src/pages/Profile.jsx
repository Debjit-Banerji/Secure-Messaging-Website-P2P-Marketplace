import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { FaPen, FaCheck, FaTrash, FaTimes } from "react-icons/fa";
import { getUserData, updateProfile } from "../store/slices/user-slice";
import DefaultProfilePic from "../assets/profileicon.png";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user.user); // Encrypted user data

  const [isEditable, setIsEditable] = useState({
    username: false,
    email: false,
    contactno: false,
    password: false,
  });

  const [tempUser, setTempUser] = useState(null);

  useEffect(() => {
    dispatch(getUserData()); // Fetch encrypted user data
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setTempUser({...userData});
  }, [userData]);

  const handleEditToggle = (field) => {
    setIsEditable((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
          const base64String = reader.result.split(",")[1]; // Remove Base64 prefix
          setTempUser((prev) => ({ ...prev, profile_pic: base64String })); // Store in tempUser
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async (field) => {
    try {
      dispatch(updateProfile({[field]: tempUser[field]})); // Store updated data in Redux
      setIsEditable((prev) => ({ ...prev, [field]: false }));
    } catch (error) {
      console.error("Encryption failed:", error);
    }
  };

  const handleDiscardChanges = (field) => {
    setTempUser((prev) => ({
      ...prev,
      [field]: userData[field],
    }));
    setIsEditable((prev) => ({ ...prev, [field]: false }));
  };

  const navigate = useNavigate();
  const handleCloseClick = () => {
    navigate("/chat");
  };

  return (
    <ProfileContainer>
      <div className="close"><FaTimes onClick={handleCloseClick} /></div>
      <h2>Profile</h2>
      <div className="profile-section">
        <div className="profile-picture-container">
          <img src={(tempUser !== null && tempUser.profile_pic !== null)? `data:image/png;base64:${tempUser.profile_pic}`: DefaultProfilePic} alt="Profile" className="profile-picture" />
          <label className="edit-icon">
            <input type="file" accept="image/*" onChange={handleProfilePictureChange} style={{ display: "none" }} />
            <FaPen />
          </label>
        </div>
      </div>
      <hr />
      <DescriptionContainer>
        <label>Description</label>
        <textarea
          value={tempUser !== null ? tempUser.bio : ""}
          onChange={(e) => setTempUser((prev) => ({ ...prev, bio: e.target.value }))}
          disabled={!isEditable.bio}
          rows={tempUser ? tempUser.bio.split("\n").length : 1}
        />
        <div className="icons">
          {!isEditable.bio ? (
            <FaPen className="edit-icon" onClick={() => handleEditToggle("bio")} />
          ) : (
            <>
              <FaCheck className="save-icon" onClick={() => handleSaveChanges("bio")} />
              <FaTrash className="delete-icon" onClick={() => handleDiscardChanges("bio")} />
            </>
          )}
        </div>
      </DescriptionContainer>
      <FormContainer>
        <div className="form-grid">
          {Object.entries({ username: "UserName", name: "Name", email: "Email", phone: "Contact No" }).map(([key, label]) => (
            <div key={key} className="form-group">
              <label>{label}</label>
              <input
                type="text"
                value={tempUser ? tempUser[key] : ""}
                onChange={(e) => setTempUser((prev) => ({ ...prev, [key]: e.target.value }))}
                disabled={!isEditable[key]}
              />
              {key !== "username" && <div className="icons">
                {!isEditable[key] ? (
                  <FaPen className="edit-icon" onClick={() => handleEditToggle(key)} />
                ) : (
                  <>
                    <FaCheck className="save-icon" onClick={() => handleSaveChanges(key)} />
                    <FaTrash className="delete-icon" onClick={() => handleDiscardChanges(key)} />
                  </>
                )}
              </div>}
            </div>
          ))}
        </div>
      </FormContainer>
    </ProfileContainer>
  );
}

// Styled Component
const ProfileContainer = styled.div`
  width: 100vw;
  min-height: 100vh;
  padding: 2rem;
  background-color: #1a1a5a; /* Dark blue background */
  color: white; /* White text for better contrast */

  .close{
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 20px;
    right: 20px;
    width: 30px;
    height: 30px;
    border: 2px solid white;
    border-radius: 50%;
    font-size: 1.2rem;
    cursor: pointer;
    color: white;
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }
  }

  h2 {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 2rem;
    color: white;
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
        border: 2px solid white;
        object-fit: cover;
      }

      .edit-icon {
        position: absolute;
        bottom: 5px;
        right: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        background-color: #007bff; /* Blue background */
        border: 2px solid white;
        border-radius: 50%;
        color: white;
        transition: all 0.3s ease;
        
        &:hover {
          background-color: #0056b3; /* Darker blue */
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
          transform: scale(1.1);
        }
      }
    }
  }

  hr {
    width: 80vw;
    margin: 2rem auto;
    border: none;
    border-top: 1px solid white;
  }
`;

const DescriptionContainer = styled.div`
  position: relative;
  align-items: center;
  justify-content: center;
  width: 80vw;
  margin: 20px auto;

  label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: white;
  }

  textarea {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border-radius: 5px;
    outline: none;
    background-color:rgb(153, 141, 243);
    color: black;
    cursor: not-allowed;

    &:not(:disabled) {
      background-color:rgb(178, 180, 216);
      border: 2px solid #007bff;
      cursor: text;
    }
  }

  .icons {
    position: absolute;
    top: 60%;
    right: -20px;
    transform: translateY(-50%);
    display: flex;
    gap: 0.5rem;

    svg{
      width: 12px;
      height: 12px;
    }

    .edit-icon {
      background: #007bff;
      color: white;
      width: 30px;
      height: 30px;
      border: 2px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background-color: #0056b3; /* Darker blue */
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        transform: scale(1.1);
      }
    }
    
    .save-icon {
      background: #28a745;
      color: white;
      width: 30px;
      height: 30px;
      border: 2px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background-color: #1e7e34;
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        transform: scale(1.1);
      }
    }
    
    .delete-icon {
      background: #dc3545;
      color: white;
      width: 30px;
      height: 30px;
      border: 2px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background-color: #a71d2a;
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        transform: scale(1.1);
      }
    }
  }
`;

const FormContainer = styled.div`
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
        color: white;
      }

      input {
        width: 100%;
        padding: 0.75rem;
        font-size: 1rem;
        border-radius: 5px;
        outline: none;
        background-color:rgb(153, 141, 243);
        color: black;
        cursor: not-allowed;

        &:not(:disabled) {
          background-color:rgb(178, 180, 216);
          border: 2px solid #007bff;
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

        svg{
          width: 12px;
          height: 12px;
        }

        .edit-icon {
          background: #007bff;
          color: white;
          width: 30px;
          height: 30px;
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background-color: #0056b3; /* Darker blue */
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
            transform: scale(1.1);
          }
        }
        
        .save-icon {
          background: #28a745;
          color: white;
          width: 30px;
          height: 30px;
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background-color: #1e7e34;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
            transform: scale(1.1);
          }
        }
        
        .delete-icon {
          background: #dc3545;
          color: white;
          width: 30px;
          height: 30px;
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background-color: #a71d2a;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
            transform: scale(1.1);
          }
        }
      }
    }
  }
`;