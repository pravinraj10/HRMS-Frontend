import React from 'react';
import "./ReusablePopup.css";

const ReusablePopup = ({ isOpen, onClose, title = "Success!", message, type = "success" }) => {
  if (!isOpen) return null;

  const isSuccess = type === "success";

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 rp-overlay" 
      onClick={onClose}
    >
      <div 
        className="bg-white text-center shadow-lg rp-container" 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Dynamic Icon Wrapper */}
        <div className={`mx-auto d-flex align-items-center justify-content-center rounded-circle rp-icon-wrapper ${type}`}>
          {isSuccess ? (
            <svg className="rp-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="rp-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        
        <h3 className="fw-bold text-dark m-0 mb-2 rp-title">
          {title}
        </h3>
        
        <p className="m-0 mb-4 rp-message">
          {message}
        </p>
        
        <button
          onClick={onClose}
          className={`w-100 text-white fw-medium border-0 shadow-sm rp-button ${type}`}
        >
          {isSuccess ? "Continue" : "Close"}
        </button>
        
      </div>
    </div>
  );
};

export default ReusablePopup;