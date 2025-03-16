import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { FaPen, FaCheck, FaTrash, FaTimes, FaPlus, FaUser, FaTag, FaInfoCircle } from "react-icons/fa";
import { getUserData, updateProfile, sendOTP, verifyOTP } from "../store/slices/user-slice";
import DefaultProfilePic from "../assets/profileicon.png";
import { fetchProductsByUser, createProduct, deleteProduct } from "../store/slices/product-slice";
import UserProductCard from "../components/UserProductCard.jsx";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user.user); // Encrypted user data
  const user_products = useSelector((state) => state.product.user_products);

  const [isEditable, setIsEditable] = useState({
    username: false,
    email: false,
    phone: false,
    bio: false,
    name: false,
  });

  const [activeTab, setActiveTab] = useState("profile");
  const [tempUser, setTempUser] = useState(null);
  const [otp, setOTP] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState(null);
  const [otpField, setOtpField] = useState(null);
  const [showOTPOverlay, setShowOTPOverlay] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [userProducts, setUserProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    image: null,
    imagePreview: null,
  });
  const [fieldToBeUpdated, setFieldToBeUpdated] = useState("");

  useEffect(() => {
    dispatch(getUserData()); // Fetch encrypted user data
  }, [dispatch]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    dispatch(fetchProductsByUser({...userData}));
  }, []);

  useEffect(() => {
    if (userData) {
      setTempUser({...userData});
    }
  }, [userData]);

  useEffect(() => {
    if(user_products) setUserProducts(user_products);
  }, [user_products]);

  const handleEditToggle = (field) => {
    setIsEditable((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const base64String = reader.result.split(",")[1]; // Remove Base64 prefix
        console.log(base64String);
        setTempUser((prev) => ({ ...prev, profile_pic: base64String })); // Store in tempUser
        dispatch(updateProfile({ profile_pic: base64String })); // Update Redux store
      });
      reader.readAsDataURL(file);
    }
  };

  const handleOTPSubmit = () => {
    dispatch(verifyOTP({ email: userData.email, otp: otpField }))
    .unwrap()
    .then(() => {
      setShowOTPOverlay(false);
      dispatch(updateProfile({ [fieldToBeUpdated]: tempUser[fieldToBeUpdated] }));
    })
    .catch(error => {
      console.error('Failed to verify OTP:', error);
    });
  };

  const handleSaveChanges = async (field) => {
    try {
      if (field === "email" || field === "phone") {
        dispatch(sendOTP(userData.email))
        .unwrap()
        .then(() => {
          setShowOTPOverlay(true);
          setFieldToBeUpdated(field);
        })
        .catch(error => {
          console.error('Failed to send OTP:', error);
        });
      } else {
        dispatch(updateProfile({ [field]: tempUser[field] }));
        setIsEditable((prev) => ({ ...prev, [field]: false }));
      }
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

  const handleCloseClick = () => {
    navigate("/chat");
  };

  const handleNewProductImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct((prev) => ({
        ...prev,
        image: file, // ✅ Store actual File object
        imagePreview: URL.createObjectURL(file), // ✅ Show preview
      }));
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
        alert("Please fill all required fields and upload an image.");
        return;
    }

    console.log("Submitting Product:", newProduct);
    // console.log(newProduct.image);

    // Create FormData to send file properly
    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("price", parseFloat(newProduct.price.replace("Rs.", ""))); 
    formData.append("description", newProduct.description);
    formData.append("image", newProduct.image); // ✅ This must be a File object
    formData.append("user", userData.id); // ✅ Send user ID (pk), not username

    dispatch(createProduct(formData)); // ✅ Pass FormData instead of raw object

    // Reset form and close modal
    setNewProduct({
        name: "",
        price: "",
        description: "",
        image: null,
        imagePreview: null,
    });

    setShowAddProductModal(false);
  };

  const handleDeleteProduct = (productId) => {
    dispatch(deleteProduct(productId));
  };

  return (
    <PageContainer>
      <ProfileContainer>
        <CloseButton onClick={handleCloseClick}>
          <FaTimes />
        </CloseButton>
        
        <ProfileHeader>
          <div className="profile-picture-container">
            <img 
              src={(tempUser?.profile_pic)
                ? `${tempUser.profile_pic}`
                : DefaultProfilePic} 
              alt="Profile"
            />
            <label className="edit-icon">
              <input type="file" accept="image/*" onChange={handleProfilePictureChange} style={{ display: "none" }} />
              <FaPen />
            </label>
          </div>
          
          <div className="user-info">
            <h1>{tempUser?.name || "User"}</h1>
            <p>@{tempUser?.username || "username"}</p>
          </div>
        </ProfileHeader>

        <TabNavigation>
          <TabButton 
            active={activeTab === "profile"} 
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </TabButton>
          <TabButton 
            active={activeTab === "products"} 
            onClick={() => setActiveTab("products")}
          >
            My Product Posts
          </TabButton>
        </TabNavigation>

        {activeTab === "profile" ? (
          <ProfileContent>
            <SectionTitle>Bio</SectionTitle>
            <DescriptionContainer>
              <textarea
                value={tempUser?.bio || ""}
                onChange={(e) => setTempUser((prev) => ({ ...prev, bio: e.target.value }))}
                disabled={!isEditable.bio}
                rows={tempUser ? Math.max(2, (tempUser.bio?.split("\n").length || 1)) : 2}
                placeholder="Tell us about yourself..."
              />
              <div className="action-icons">
                {!isEditable.bio ? (
                  <ActionButton className="edit" onClick={() => handleEditToggle("bio")}>
                    <FaPen />
                  </ActionButton>
                ) : (
                  <>
                    <ActionButton className="save" onClick={() => handleSaveChanges("bio")}>
                      <FaCheck />
                    </ActionButton>
                    <ActionButton className="delete" onClick={() => handleDiscardChanges("bio")}>
                      <FaTimes />
                    </ActionButton>
                  </>
                )}
              </div>
            </DescriptionContainer>

            <SectionTitle>Personal Information</SectionTitle>
            <FormContainer>
              <div className="form-grid">
                {Object.entries({
                  name: "Full Name",
                  username: "Username",
                  email: "Email Address",
                  phone: "Phone Number"
                }).map(([key, label]) => (
                  <div key={key} className="form-group">
                    <label>{label}</label>
                    <InputGroup>
                      <input
                        type={key === "email" ? "email" : "text"}
                        value={tempUser ? tempUser[key] || "" : ""}
                        onChange={(e) => setTempUser((prev) => ({ ...prev, [key]: e.target.value }))}
                        disabled={!isEditable[key]}
                        placeholder={`Enter your ${label.toLowerCase()}`}
                      />
                      <div className="action-icons">
                        {key !== "username" && (
                          !isEditable[key] ? (
                            <ActionButton className="edit" onClick={() => handleEditToggle(key)}>
                              <FaPen />
                            </ActionButton>
                          ) : (
                            <>
                              <ActionButton className="save" onClick={() => handleSaveChanges(key)}>
                                <FaCheck />
                              </ActionButton>
                              <ActionButton className="delete" onClick={() => handleDiscardChanges(key)}>
                                <FaTimes />
                              </ActionButton>
                            </>
                          )
                        )}
                      </div>
                    </InputGroup>
                  </div>
                ))}
              </div>
            </FormContainer>
          </ProfileContent>
        ) : (
          <ProductsContent>
            <ProductsHeader>
              <div>
                <SectionTitle>My Product Posts</SectionTitle>
                <p>Manage products that you have listed in the marketplace</p>
              </div>
              <AddButton onClick={() => setShowAddProductModal(true)}>
                <FaPlus />
                <span>Add Product</span>
              </AddButton>
            </ProductsHeader>
            
            {userProducts && userProducts.length === 0 ? (
              <EmptyState>
                <div className="empty-icon">📦</div>
                <h3>No products yet</h3>
                <p>Start selling by adding your first product to the marketplace</p>
                <button onClick={() => setShowAddProductModal(true)}>Add Your First Product</button>
              </EmptyState>
            ) : (
              <ProductGrid>
                {userProducts.map(product => (
                  <UserProductCard key={product.id} product={product} onDelete={handleDeleteProduct} />
                ))}
              </ProductGrid>
            )}
          </ProductsContent>
        )}
      </ProfileContainer>
      
      {/* OTP Verification Modal */}
      {showOTPOverlay && (
        <ModalOverlay onClick={() => setShowOTPOverlay(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>Verification Required</h3>
              <FaTimes onClick={() => setShowOTPOverlay(false)} />
            </ModalHeader>
            <ModalBody>
              <p>We've sent a 6-digit code to your {otpField === "email" ? "email address" : "phone number"}</p>
              <OTPDisplay>{otp}</OTPDisplay>
              <OTPHelp>Enter the 6-digit code below</OTPHelp>
              <Keypad>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                  <KeypadButton 
                    key={num} 
                    onClick={() => setOTP((prev) => (prev.length < 6 ? prev + num : prev))}
                  >
                    {num}
                  </KeypadButton>
                ))}
                <KeypadButton special onClick={() => setOTP(otp.slice(0, -1))}>
                  ⌫
                </KeypadButton>
              </Keypad>
              <VerifyButton 
                onClick={handleOTPSubmit}
                disabled={otp.length !== 6}
              >
                Verify
              </VerifyButton>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
      
      {/* Add Product Modal */}
      {showAddProductModal && (
        <ModalOverlay onClick={() => setShowAddProductModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()} wider>
            <ModalHeader>
              <h3>Add New Product</h3>
              <FaTimes onClick={() => setShowAddProductModal(false)} />
            </ModalHeader>
            <ModalBody>
              <ProductFormGrid>
                <div className="image-upload">
                  <label>
                    {newProduct.imagePreview ? (
                      <img src={newProduct.imagePreview} alt="Product preview" />
                    ) : (
                      <div className="upload-placeholder">
                        <FaPlus />
                        <span>Upload Image</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleNewProductImage}
                      style={{ display: "none" }} 
                    />
                  </label>
                </div>
                
                <div className="product-details">
                  <div className="form-group">
                    <label>Product Name</label>
                    <input 
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter product name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Price</label>
                    <input 
                      type="text"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="Enter price (e.g. 299.99)"
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      rows="4"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your product..."
                    />
                  </div>
                </div>
              </ProductFormGrid>
              
              <ModalActions>
                <CancelButton onClick={() => setShowAddProductModal(false)}>
                  Cancel
                </CancelButton>
                <SaveButton onClick={handleAddProduct}>
                  Add Product
                </SaveButton>
              </ModalActions>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
}

// Styled Components
const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0e123a 0%, #141a4d 100%);
  color: white;
  padding: 20px;
`;

const ProfileContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  background: rgba(26, 30, 64, 0.95);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  position: relative;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 40px;
  background: linear-gradient(to right, rgba(93, 139, 252, 0.3), rgba(67, 97, 238, 0.3));
  
  .profile-picture-container {
    position: relative;
    width: 120px;
    height: 120px;
    margin-right: 30px;
    
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    }
    
    .edit-icon {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 32px;
      height: 32px;
      background: #5d8bfc;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      
      &:hover {
        background: #4361ee;
        transform: scale(1.1);
      }
    }
  }
  
  .user-info {
    h1 {
      font-size: 1.8rem;
      margin-bottom: 5px;
      font-weight: 600;
    }
    
    p {
      color: rgba(255, 255, 255, 0.7);
      font-size: 1rem;
    }
  }
`;

const TabNavigation = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const TabButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.6)'};
  font-size: 1rem;
  font-weight: ${props => props.active ? '600' : '400'};
  padding: 16px 30px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    width: 100%;
    background: ${props => props.active ? 'linear-gradient(to right, #5d8bfc, #4361ee)' : 'transparent'};
    transform: ${props => props.active ? 'scaleX(1)' : 'scaleX(0)'};
    transform-origin: left;
    transition: transform 0.3s ease;
  }
  
  &:hover {
    color: white;
    
    &:after {
      transform: scaleX(1);
      background: linear-gradient(to right, #5d8bfc, #4361ee);
    }
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: white;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -6px;
    width: 0px;
    height: 3px;
    background: linear-gradient(to right, #5d8bfc, #4361ee);
    border-radius: 3px;
  }
`;

const ProfileContent = styled.div`
  padding: 30px 40px;
`;

const ProductsContent = styled.div`
  padding: 30px 40px;
`;

const ProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  
  p {
    color: rgba(255, 255, 255, 0.7);
    margin-top: 5px;
  }
`;

const DescriptionContainer = styled.div`
  position: relative;
  margin-bottom: 40px;
  
  textarea {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 15px;
    color: white;
    font-size: 1rem;
    resize: vertical;
    transition: all 0.3s ease;
    
    &:disabled {
      opacity: 0.8;
      cursor: not-allowed;
    }
    
    &:not(:disabled) {
      border-color: #5d8bfc;
      background: rgba(93, 139, 252, 0.1);
    }
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(93, 139, 252, 0.3);
    }
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }
  
  .action-icons {
    position: absolute;
    top: 15px;
    right: 15px;
    display: flex;
    gap: 10px;
  }
`;

const FormContainer = styled.div`
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 25px;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  .form-group {
    margin-bottom: 10px;
    
    label {
      display: block;
      margin-bottom: 8px;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.8);
    }
  }
`;

const InputGroup = styled.div`
  position: relative;
  
  input {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 12px 15px;
    color: white;
    font-size: 1rem;
    transition: all 0.3s ease;
    
    &:disabled {
      opacity: 0.8;
      cursor: not-allowed;
    }
    
    &:not(:disabled) {
      border-color: #5d8bfc;
      background: rgba(93, 139, 252, 0.1);
    }
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(93, 139, 252, 0.3);
    }
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }
  
  .action-icons {
    position: absolute;
    top: 50%;
    right: 15px;
    transform: translateY(-50%);
    display: flex;
    gap: 10px;
  }
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 0.9rem;
  
  &.edit {
    background: rgba(93, 139, 252, 0.9);
    color: white;
    
    &:hover {
      background: #5d8bfc;
      transform: scale(1.1);
    }
  }
  
  &.save {
    background: rgba(40, 167, 69, 0.9);
    color: white;
    
    &:hover {
      background: #28a745;
      transform: scale(1.1);
    }
  }
  
  &.delete {
    background: rgba(220, 53, 69, 0.9);
    color: white;
    
    &:hover {
      background: #dc3545;
      transform: scale(1.1);
    }
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  background: linear-gradient(90deg, #5d8bfc, #4361ee);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(93, 139, 252, 0.3);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(93, 139, 252, 0.4);
  }
  
  svg {
    margin-right: 8px;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 20px;
  }
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
  
  p {
    color: rgba(255, 255, 255, 0.7);
    text-align: center;
    max-width: 400px;
    margin-bottom: 25px;
  }
  
  button {
    background: linear-gradient(90deg, #5d8bfc, #4361ee);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 15px rgba(93, 139, 252, 0.4);
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

const ModalContent = styled.div`
  background: #1a1e40;
  border-radius: 12px;
  width: ${props => props.wider ? '700px' : '400px'};
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h3 {
    font-size: 1.2rem;
    font-weight: 600;
  }
  
  svg {
    cursor: pointer;
    transition: all 0.3s;
    font-size: 1.1rem;
    
    &:hover {
      color: #dc3545;
      transform: scale(1.1);
    }
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const OTPDisplay = styled.div`
  font-size: 1.8rem;
  text-align: center;
  letter-spacing: 3px;
  margin: 20px 0;
  font-family: monospace;
  color: white;
  font-weight: bold;
`;

const OTPHelp = styled.p`
  text-align: center;
  margin-bottom: 15px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const Keypad = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
`;

const KeypadButton = styled.button`
  background: ${props => props.special ? '#dc3545' : 'rgba(255, 255, 255, 0.1)'};
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1.2rem;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: ${props => props.special ? '#c82333' : 'rgba(255, 255, 255, 0.2)'};
  }
`;

const VerifyButton = styled.button`
  width: 100%;
  background: linear-gradient(90deg, #5d8bfc, #4361ee);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &:not(:disabled):hover {
    box-shadow: 0 4px 12px rgba(93, 139, 252, 0.4);
  }
`;

const ProductFormGrid = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 650px) {
    grid-template-columns: 1fr;
  }
  
  .image-upload {
    label {
      display: block;
      width: 100%;
      height: 200px;
      background: rgba(255, 255, 255, 0.05);
      border: 2px dashed rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      cursor: pointer;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .upload-placeholder {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: rgba(255, 255, 255, 0.6);
        
        svg {
          font-size: 1.5rem;
          margin-bottom: 10px;
        }
      }
      
      &:hover {
        border-color: #5d8bfc;
      }
    }
  }
  
  .product-details {
    display: flex;
    flex-direction: column;
    gap: 15px;
    
    .form-group {
      label {
        display: block;
        margin-bottom: 8px;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.8);
      }
      
      input, textarea {
        width: 100%;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 12px 15px;
        color: white;
        font-size: 1rem;
        
        &:focus {
          outline: none;
          border-color: #5d8bfc;
          box-shadow: 0 0 0 2px rgba(93, 139, 252, 0.3);
        }
      }
      
      &.full-width {
        grid-column: span 2;
      }
    }
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
`;

const CancelButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const SaveButton = styled.button`
  background: linear-gradient(90deg, #5d8bfc, #4361ee);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(93, 139, 252, 0.4);
  }
`;