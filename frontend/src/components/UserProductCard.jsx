import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaPen, FaTrash, FaUser, FaTag, FaInfoCircle } from 'react-icons/fa';
import { editProduct } from '../store/slices/product-slice';
import { useDispatch } from 'react-redux';

export default function UserProductCard ({ product, onDelete, onEdit }){
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState({...product});
  const dispatch = useDispatch();

  useEffect(() => {
    console.log(product);
    console.log(product.image);
  }, []);

  const handleEdit = () => {
    dispatch(editProduct({ productId: product.id, productData: editedProduct }));
    setIsEditing(false);
  };

  return (
    <Card 
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <ImageWrapper>
        <img src={product.image} alt={product.name} />
        <PriceTag>
          <FaTag />
          <span>{`Rs. ${product.price}`}</span>
        </PriceTag>
        
        {showActions && (
          <CardActions>
            <ActionButton 
              className="edit" 
              title="Edit Product"
              onClick={() => setIsEditing(true)}
            >
              <FaPen />
            </ActionButton>
            <ActionButton 
              className="delete" 
              title="Delete Product"
              onClick={() => onDelete(product.id)}
            >
              <FaTrash />
            </ActionButton>
          </CardActions>
        )}
      </ImageWrapper>
      
      <CardContent>
        {isEditing ? (
          <EditForm>
            <input
              value={editedProduct.name}
              onChange={(e) => setEditedProduct({...editedProduct, name: e.target.value})}
            />
            <input
              value={editedProduct.price}
              onChange={(e) => setEditedProduct({...editedProduct, price: e.target.value})}
            />
            <textarea
              value={editedProduct.description}
              onChange={(e) => setEditedProduct({...editedProduct, description: e.target.value})}
            />
            <button onClick={handleEdit}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </EditForm>
        ) : (
          <>
            <h3>{product.name}</h3>
            <SellerInfo>
              <FaUser />
              <span>{product.user}</span>
            </SellerInfo>
            <CardDescription>
              <FaInfoCircle />
              <span>{product.description.substring(0, 60)}{product.description.length > 60 ? '...' : ''}</span>
            </CardDescription>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Styled Components
const Card = styled.div`
  background: rgba(26, 30, 64, 0.8);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  height: 140px;
  overflow: hidden;
  background: #0d1022;
`;

const PriceTag = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(18, 22, 47, 0.85);
  backdrop-filter: blur(5px);
  color: #4CAF50;
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  border: 1px solid rgba(76, 175, 80, 0.3);
`;

const CardActions = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: rgba(18, 22, 47, 0.85);
  border: none;
  border-radius: 4px;
  padding: 5px;
  cursor: pointer;
  transition: background 0.2s;
  
  &.edit {
    color: #2196F3;
    
    &:hover {
      background: rgba(33, 150, 243, 0.1);
    }
  }
  
  &.delete {
    color: #f44336;
    
    &:hover {
      background: rgba(244, 67, 54, 0.1);
    }
  }
`;

const CardContent = styled.div`
  padding: 15px;
  
  h3 {
    font-size: 1rem;
    margin-bottom: 10px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const SellerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  margin-bottom: 10px;
`;

const CardDescription = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 5px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  line-height: 1.4;
  
  svg {
    margin-top: 3px;
    flex-shrink: 0;
  }
`;

const EditForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  input, textarea {
    padding: 8px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  button {
    padding: 8px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    background: #2196F3;
    color: white;
    
    &:last-child {
      background: #f44336;
    }
  }
`;