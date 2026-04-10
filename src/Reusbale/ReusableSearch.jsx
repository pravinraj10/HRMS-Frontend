import React from "react";
import { FiSearch } from "react-icons/fi";

const ReusableSearch = ({ placeholder = "Search", value, onChange, className = "" }) => {
  return (
    <div className={`d-flex align-items-center bg-white rs-box ${className}`}>
      <FiSearch className="flex-shrink-0 rs-icon" />
      <input
        type="text"
        className="border-0 bg-transparent w-100 rs-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <style>{`
       .rs-box {
    border: 1px solid #e2e8f0; 
    border-radius: 10px;
    padding: 0 14px;
    width: 100%; 
    height: 42px; 
    transition: all 0.2s ease-in-out;
    box-sizing: border-box;
    display: flex;
  }

        .rs-box:focus-within {
          border-color: #1a56a6;
          box-shadow: 0 0 0 1px #1a56a6;
        }

        .rs-icon {
          color: #202C4B;
          font-size: 18px;
          margin-right: 4px;
        }

        .rs-input {
          outline: none;
          padding: 0 8px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #334155;
        }

        .rs-input::placeholder {
          color: #94a3b8;
        }

        @media screen and (max-width: 768px) {
          .rs-box {
           
            height: 40px;
            padding: 0 12px;
          }
          .rs-input {
            font-size: 13px; 
          }
          .rs-icon {
            font-size: 16px;
          }
        }

        @media screen and (max-width: 480px) {
          .rs-box {
           
            height: 38px;
            padding: 0 10px;
            border-radius: 8px;
          }
          .rs-input {
            font-size: 12px;
            padding: 0 6px;
          }
          .rs-icon {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default ReusableSearch;