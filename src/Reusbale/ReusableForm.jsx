import React from "react";
import { FiX, FiPlus } from "react-icons/fi";

const ResuableForm = ({ isOpen, onClose, title, children, onSubmit, submitText }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center reusable-modal-overlay" 
      style={{ background: "rgba(0, 0, 0, 0.4)", zIndex: 1050 }}
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

      <style>{`
        .rf-container {
          width: 95%; 
          max-width: 450px;
          max-height: 90vh; 
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
        }

        .rf-header { padding: 16px 20px; border-bottom: 1px solid #eee !important; }
        .rf-title { color: #11429b; font-size: 18px; }
        .rf-close-icon { font-size: 20px; color: #11429b; cursor: pointer; }

        .rf-body { padding: 20px; gap: 16px; }

        .rf-footer {
          gap: 12px;
          padding: 16px 20px;
          background: #f8fafc;
        }

        .rf-cancel-btn, .rf-submit-btn {
          padding: 10px 20px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          border-radius: 8px !important;
        }

        .rf-cancel-btn { border: 1px solid #e2e8f0; color: #64748b; background: white; }
        .rf-submit-btn { background: #11429b; gap: 6px; }

        .reusable-modal-overlay .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 10px;
        }

        .reusable-modal-overlay .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: #334155;
        }

        .reusable-modal-overlay .form-group input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          font-size: 14px;
          outline: none;
        }

        .reusable-modal-overlay .form-group input:focus {
          border-color: #11429b;
        }

        @media screen and (max-width: 768px) {
          .rf-container { max-width: 400px; }
          .rf-header { padding: 14px 18px; }
          .rf-title { font-size: 16px; }
          .rf-body { padding: 16px; gap: 12px; }
          .rf-footer { padding: 14px 18px; }
          .rf-cancel-btn, .rf-submit-btn { font-size: 13px; padding: 8px 16px; }
          .reusable-modal-overlay .form-group label,
          .reusable-modal-overlay .form-group input { font-size: 13px; }
        }

        @media screen and (max-width: 480px) {
          .rf-container { width: 92%; max-height: 85vh; }
          .rf-header { padding: 12px 15px; }
          .rf-title { font-size: 15px; }
          .rf-close-icon { font-size: 18px; }
          .rf-body { padding: 14px; gap: 10px; }
          .rf-footer { 
            padding: 12px 15px; 
            flex-direction: column-reverse; 
            gap: 8px; 
          }
          .rf-cancel-btn, .rf-submit-btn { 
            width: 100%; 
            font-size: 12px; 
            padding: 10px; 
          }
          .reusable-modal-overlay .form-group label,
          .reusable-modal-overlay .form-group input { font-size: 12px; }
          .reusable-modal-overlay .form-group input { padding: 8px 12px; }
        }
      `}</style>
    </div>
  );
};

export default ResuableForm;