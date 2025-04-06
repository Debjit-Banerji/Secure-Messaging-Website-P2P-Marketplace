import React, { useState } from "react";
import styled from "styled-components";

export default function ReportDialog({ isOpen, onClose, onBlock, onReportAndBlock }) {
  const [showReportReason, setShowReportReason] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const handleYesClick = () => {
    setShowReportReason(true);
  };

  const handleNoClick = () => {
    // Just block without reporting
    onBlock();
    onClose();
  };

  const handleReportAndBlock = () => {
    onReportAndBlock(reportReason);
    onClose();
  };

  const handleCancel = () => {
    setShowReportReason(false);
  };

  if (!isOpen) return null;

  return (
    <DialogOverlay>
      <DialogContent>
        {!showReportReason ? (
          <>
            <h3>Block Contact</h3>
            <p>Would you like to report this contact?</p>
            <ButtonGroup>
              <Button primary onClick={handleYesClick}>Yes</Button>
              <Button onClick={handleNoClick}>No</Button>
            </ButtonGroup>
          </>
        ) : (
          <>
            <h3>Report Contact</h3>
            <p>Please provide a reason for reporting:</p>
            <TextArea 
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Enter reason for reporting..."
              rows="4"
            />
            <ButtonGroup>
              <Button 
                primary 
                onClick={handleReportAndBlock}
                disabled={!reportReason.trim()}
              >
                Report & Block
              </Button>
              <Button onClick={handleCancel}>Cancel</Button>
            </ButtonGroup>
          </>
        )}
      </DialogContent>
    </DialogOverlay>
  );
};

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const DialogContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  min-width: 300px;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);

  h3 {
    margin-top: 0;
    color: #333;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  background-color: ${props => props.primary ? "#4a7dff" : "#e0e0e0"};
  color: ${props => props.primary ? "white" : "#333"};
  
  &:hover {
    background-color: ${props => props.primary ? "#3a6ad4" : "#d0d0d0"};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
  resize: vertical;
  margin-top: 0.5rem;
`;