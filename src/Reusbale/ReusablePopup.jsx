import React from 'react';

const ReusablePopup = ({ isOpen, onClose, title = "Success!", message, type = "success" }) => {
  if (!isOpen) return null;

  const isSuccess = type === "success";

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 rp-overlay" 
      onClick={onClose}
      style={{ zIndex: 9999 }}
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

      <style>{`
        .rp-overlay {
          background-color: rgba(15, 23, 42, 0.5); 
          backdrop-filter: blur(4px); 
        }

        .rp-container {
          border-radius: 16px;
          width: 100%;
          max-width: 384px; 
          padding: 2rem; 
          animation: popup-fade-in 0.3s ease-out forwards;
        }

        @keyframes popup-fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .rp-icon-wrapper {
          height: 4rem; 
          width: 4rem;
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
        }

        .rp-icon {
          height: 2rem; 
          width: 2rem;
        }

        .rp-title {
          font-size: 1.5rem; 
          letter-spacing: -0.025em;
        }

        .rp-message {
          font-size: 1rem; 
          color: #4b5563; 
          line-height: 1.5;
        }

        .rp-button {
          padding: 0.75rem 1rem; 
          font-size: 1rem; 
          border-radius: 12px; 
          transition: all 0.2s ease-in-out;
        }

        .rp-button:active {
          transform: scale(0.95); 
        }

        .rp-icon-wrapper.success { background-color: #dcfce7; color: #16a34a; }
        .rp-button.success { background-color: #16a34a; }
        .rp-button.success:hover { background-color: #15803d; }

        .rp-icon-wrapper.error { background-color: #fee2e2; color: #dc2626; }
        .rp-button.error { background-color: #dc2626; }
        .rp-button.error:hover { background-color: #b91c1c; }

        @media screen and (max-width: 768px) {
          .rp-container {
            max-width: 340px;
            padding: 1.75rem;
          }
          .rp-title { font-size: 1.25rem; }
          .rp-message { font-size: 0.95rem; }
          .rp-icon-wrapper { height: 3.5rem; width: 3.5rem; }
        }

        @media screen and (max-width: 480px) {
          .rp-container {
            max-width: 300px;
            padding: 1.25rem;
            border-radius: 14px;
          }
          .rp-icon-wrapper {
            height: 3rem;
            width: 3rem;
            margin-bottom: 1rem;
          }
          .rp-icon {
            height: 1.5rem;
            width: 1.5rem;
          }
          .rp-title {
            font-size: 1.15rem;
          }
          .rp-message {
            font-size: 0.85rem;
            margin-bottom: 1.5rem;
          }
          .rp-button {
            padding: 0.6rem 1rem;
            font-size: 0.9rem;
            border-radius: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default ReusablePopup;