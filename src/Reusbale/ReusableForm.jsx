import React from "react";
import { FiX, FiPlus } from "react-icons/fi";
import "./ReusableForm.css";

const ResuableForm = ({ isOpen, onClose, title, children, onSubmit, submitText }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center reusable-modal-overlay rf-overlay" 
    >
      <div className="bg-white mx-auto d-flex flex-column overflow-hidden shadow rf-container">
        <div className="d-flex justify-content-between align-items-center border-bottom rf-header">
          <h3 className="m-0 fw-semibold rf-title">{title}</h3>
          <FiX className="fw-bold rf-close-icon" onClick={onClose} />
        </div>

        <div className="d-flex flex-column overflow-y-auto flex-grow-1 rf-body">
          {children}
        </div>

        <div className="d-flex justify-content-end rf-footer border-top">
          <button className="bg-white rounded rf-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="border-0 text-white d-flex align-items-center justify-content-center rounded rf-submit-btn" onClick={onSubmit}>
            <FiPlus /> {submitText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResuableForm;