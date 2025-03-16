import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaSearch, FaTimes, FaTag, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import NavBar from "../components/NavBar";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsByQuery, fetchProductsByUser } from "../store/slices/product-slice";
import { addContacts, fetchContacts } from "../store/slices/user-slice";

export default function MarketPlace() {
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const search_products = useSelector((state) => state.product.search_products);
  const currentUser = useSelector((state) => state.user.currentUser);
  const curfriends = useSelector((state) => state.user.contacts);

  useEffect(() => {
    dispatch(fetchContacts());
  }, [])

  useEffect(() => {
    setFilteredProducts(search_products);
  }, [search_products])

  const handleSearch = () => {
    dispatch(fetchProductsByQuery({...search}));
  };

  const clearSearch = () => {
    const temp = "";
    dispatch(fetchProductsByQuery({searchQuery: temp}));
  };

  const handleContactClick = (username) => {  
    // Check if seller is already in contacts
    const isAlreadyContact = curfriends.some(
      friend => friend.username === username
    );

    if (!isAlreadyContact && username !== "Anonymous") {
      dispatch(addContacts({ contactId: username }))
        .then(() => {
          navigate("/chat");
        })
        .catch(error => {
          console.error("Failed to add contact:", error);
        });
    } else {
      navigate("/chat");
    }
  };

  return (
    <PageWrapper>
      <NavBar />
      <Container>
        <Header>
          <h1>P2P Marketplace</h1>
          <p>Find the best products from your peers</p>
        </Header>
        
        <SearchBarContainer>
          <SearchBar>
            <input 
              type="text" 
              placeholder="Search for a product..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {search && (
              <FaTimes 
                className="clear-icon" 
                onClick={clearSearch} 
              />
            )}
            <SearchButton onClick={handleSearch}>
              <FaSearch className="search-icon" />
              <span>Search</span>
            </SearchButton>
          </SearchBar>
        </SearchBarContainer>
        
        <ContentSection>
          {filteredProducts.length === 0 ? (
            <EmptyState>
              <div className="empty-icon">🔍</div>
              <h3>No products found</h3>
              <p>Try a different search term or browse all products</p>
              <button onClick={clearSearch}>Show All Products</button>
            </EmptyState>
          ) : (
            <ProductGrid>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} setSelectedProduct={setSelectedProduct} />
              ))}
            </ProductGrid>
          )}
        </ContentSection>
        
        {selectedProduct && <ProductOverlay product={selectedProduct} setSelectedProduct={setSelectedProduct} navigate={navigate} handleContactClick={handleContactClick(selectedProduct.user)} />}
      </Container>
    </PageWrapper>
  );
}

function ProductOverlay({ product, setSelectedProduct, navigate, handleContactClick }) {
  return (
    <Overlay onClick={() => setSelectedProduct(null)}>
      <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={(e) => {e.stopPropagation(); setSelectedProduct(null)}}>
          <FaTimes />
        </CloseButton>
        
        <ProductDetails>
          <div className="image-container">
            <img src={product.image} alt={product.name} />
          </div>
          
          <div className="details">
            <h2>{product.name}</h2>
            
            <div className="seller-info">
              <FaUserCircle />
              <span>Sold by <b>{product.user}</b></span>
            </div>
            
            <div className="price-tag">
              <FaTag />
              <span>{product.price}</span>
            </div>
            
            <div className="description">
              <h4>Description</h4>
              <p>{product.description}</p>
            </div>
            
            <div className="actions">
              {product.user !== "Anonymous" && <button className="contact" onClick={handleContactClick}>
                Contact Seller
              </button>} 
              <button className="buy" onClick={() => navigate("/payment")}>
                Buy Now
              </button>
            </div>
          </div>
        </ProductDetails>
      </div>
    </Overlay>
  );
}

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: #0a0e1f;
`;

const Container = styled.div`
  width: 90%;
  max-width: 1200px;
  margin-left: 7rem;
  padding: 2rem 0;
  color: white;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    background: linear-gradient(90deg, #5d8bfc, #4361ee);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    color: #a0a3b1;
    font-size: 1.1rem;
  }
`;

const SearchBarContainer = styled.div`
  margin-bottom: 2.5rem;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: #181c38;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
  border: 1px solid #282d4f;
  transition: all 0.3s ease;
  position: relative;

  &:focus-within {
    border-color: #5d8bfc;
    box-shadow: 0 6px 20px rgba(93, 139, 252, 0.15);
  }

  input {
    flex: 1;
    padding: 0.75rem;
    font-size: 1rem;
    background: transparent;
    border: none;
    color: white;
    outline: none;
    
    &::placeholder {
      color: #5c6178;
    }
  }

  .clear-icon {
    color: #5c6178;
    cursor: pointer;
    transition: color 0.2s;
    
    &:hover {
      color: #ff6b6b;
    }
  }
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  background: linear-gradient(90deg, #5d8bfc, #4361ee);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.25rem;
  margin-left: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
  
  .search-icon {
    margin-right: 0.5rem;
  }
`;

const ContentSection = styled.div`
  min-height: 300px;
`;

const ResultsInfo = styled.div`
  margin-bottom: 1.5rem;
  color: #a0a3b1;
  font-size: 0.95rem;
  
  span {
    color: #5d8bfc;
    font-weight: 600;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: #a0a3b1;
  text-align: center;
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: white;
  }
  
  p {
    margin-bottom: 1.5rem;
  }
  
  button {
    background: linear-gradient(90deg, #5d8bfc, #4361ee);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      opacity: 0.9;
      transform: translateY(-2px);
    }
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  .overlay-content {
    background: #12162f;
    width: 85%;
    max-width: 900px;
    border-radius: 12px;
    color: white;
    position: relative;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
    border: 1px solid #282d4f;
    overflow: hidden;
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 107, 107, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  transition: all 0.2s;
  
  &:hover {
    background: #ff6b6b;
    transform: rotate(90deg);
  }
`;

const ProductDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
  
  .image-container {
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0d1022;
    
    img {
      width: 100%;
      height: auto;
      max-height: 300px;
      object-fit: contain;
      border-radius: 8px;
      transition: transform 0.3s;
      
      &:hover {
        transform: scale(1.05);
      }
    }
  }
  
  .details {
    padding: 2rem;
    
    h2 {
      font-size: 1.8rem;
      margin-bottom: 1.5rem;
      background: linear-gradient(90deg, #ffffff, #d8d8d8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .seller-info, .price-tag {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      
      svg {
        margin-right: 0.5rem;
        color: #5d8bfc;
      }
    }
    
    .price-tag {
      span {
        font-size: 1.5rem;
        font-weight: bold;
        color: #4CAF50;
      }
    }
    
    .description {
      margin: 1.5rem 0;
      padding: 1.5rem 0;
      border-top: 1px solid #282d4f;
      border-bottom: 1px solid #282d4f;
      
      h4 {
        margin-bottom: 0.5rem;
        color: #a0a3b1;
      }
      
      p {
        line-height: 1.6;
      }
    }
    
    .actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
      
      button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover {
          transform: translateY(-2px);
        }
      }
      
      .contact {
        background: linear-gradient(90deg, #5d8bfc, #4361ee);
        color: white;
        flex: 1;
        
        &:hover {
          box-shadow: 0 4px 15px rgba(93, 139, 252, 0.3);
        }
      }
      
      .buy {
        background: linear-gradient(90deg, #4CAF50, #2E7D32);
        color: white;
        flex: 1;
        
        &:hover {
          box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
        }
      }
    }
  }
`;