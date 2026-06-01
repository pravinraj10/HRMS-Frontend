import React from "react";
import { FiAlertTriangle } from "react-icons/fi";
import "./ReusableConfirm.css";

const ReusableConfirm = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "Delete",
  cancelText = "Cancel",
  confirmBtnClass = "custom-delete-btn"
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center rc-overlay"
    >
      <div className="bg-white rounded-3 shadow-lg confirm-content-custom">
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="rounded-circle bg-danger-subtle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', color: '#ef4444', backgroundColor: '#fee2e2' }}>
            <FiAlertTriangle size={24} />
          </div>
          <h3 className="custom-title m-0">{title}</h3>
        </div>
        <p className="custom-message">{message}</p>
        
        <div className="d-flex justify-content-end gap-2 custom-actions">
          <button className="btn custom-cancel-btn" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`btn ${confirmBtnClass}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReusableConfirm;