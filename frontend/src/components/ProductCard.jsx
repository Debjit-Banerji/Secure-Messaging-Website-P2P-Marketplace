import React from "react";
import styled from "styled-components";
import { FaUser, FaTag, FaStar } from "react-icons/fa";

export default function ProductCard({ product, setSelectedProduct, handleBuyProduct }) {
  return (
    <Card onClick={() => setSelectedProduct(product)}>
      <ImageWrapper>
        <img src={product.image} alt={product.name} />
        <PriceTag>
          <FaTag />
          <span>{`Rs. ${product.price}`}</span>
        </PriceTag>
      </ImageWrapper>
      
      <CardContent>
        <h3>{product.name}</h3>
        
        <SellerInfo>
          <FaUser />
          <span>{product.user}</span>
        </SellerInfo>
        
        <CardFooter>
          <Rating>
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar className="inactive" />
          </Rating>
          
          <ViewButton onClick={(e) => {e.stopPropagation(); setSelectedProduct(product)}}>View Details</ViewButton>
        </CardFooter>
      </CardContent>
    </Card>
  );
}

const Card = styled.div`
  background: #181c38;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  border: 1px solid #282d4f;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px #5d8bfc50;
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  height: 180px;
  overflow: hidden;
  background: #0d1022;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
  }
  
  ${Card}:hover & img {
    transform: scale(1.1);
  }
`;

const PriceTag = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(18, 22, 47, 0.85);
  backdrop-filter: blur(5px);
  color: #4CAF50;
  font-weight: bold;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #282d4f;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  
  svg {
    font-size: 0.8rem;
  }
`;

const CardContent = styled.div`
  padding: 1.25rem;
  
  h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: white;
    transition: color 0.2s;
    
    ${Card}:hover & {
      color: #5d8bfc;
    }
  }
`;

const SellerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #a0a3b1;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  
  svg {
    color: #5d8bfc;
    font-size: 0.8rem;
  }
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
`;

const Rating = styled.div`
  display: flex;
  gap: 2px;
  
  svg {
    color: #FFD700;
    font-size: 0.9rem;
    
    &.inactive {
      color: #282d4f;
    }
  }
`;

const ViewButton = styled.div`
  background: linear-gradient(90deg, #5d8bfc30, #4361ee30);
  color: #5d8bfc;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0;
  transform: translateY(5px);
  transition: all 0.3s;
  border: 1px solid #5d8bfc50;
  
  ${Card}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
  
  &:hover {
    background: linear-gradient(90deg, #5d8bfc50, #4361ee50);
  }
`;