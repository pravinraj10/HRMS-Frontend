import React from "react";

const ReusableConfirm = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{ background: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }} // Increased z-index to stay above other modals
    >
      <style>{`
        .confirm-content-custom {
          width: 100%;
          max-width: 400px;
          margin: 0 20px;
          padding: 24px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          animation: slideDown 0.3s ease-out;
          border-radius: 12px !important;
        }

        .custom-title {
          margin-top: 0;
          margin-bottom: 12px;
          font-size: 1.25rem;
          color: #1e293b;
          font-weight: 600;
        }

        .custom-message {
          color: #64748b;
          margin-bottom: 24px;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .custom-cancel-btn,
        .custom-delete-btn {
          padding: 8px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .custom-cancel-btn {
          background-color: #ffffff;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .custom-cancel-btn:hover {
          background-color: #f8fafc;
          border-color: #cbd5e1;
        }

        .custom-delete-btn {
          background-color: #ef4444;
          color: #ffffff;
          border: none;
        }

        .custom-delete-btn:hover {
          background-color: #dc2626;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* --- Responsive Behavior --- */
        @media (max-width: 768px) {
          .confirm-content-custom {
            padding: 20px;
            max-width: 350px;
          }
          .custom-title {
            font-size: 1.15rem;
          }
          .custom-message {
            font-size: 0.875rem;
            margin-bottom: 20px;
          }
          .custom-cancel-btn,
          .custom-delete-btn {
            padding: 8px 16px;
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .confirm-content-custom {
            padding: 16px;
            margin: 0 15px;
          }
          .custom-title {
            font-size: 1.1rem;
          }
          .custom-message {
            font-size: 0.85rem;
          }
          /* Stack buttons on very small screens */
          .custom-actions {
            flex-direction: column-reverse;
            gap: 10px !important;
          }
          .custom-cancel-btn,
          .custom-delete-btn {
            width: 100%;
            padding: 10px;
          }
        }
      `}</style>

      <div className="bg-white rounded confirm-content-custom">
        <h3 className="custom-title">{title}</h3>
        <p className="custom-message">{message}</p>
        
        <div className="d-flex justify-content-end gap-2 custom-actions">
          <button className="btn custom-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn custom-delete-btn" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReusableConfirm;