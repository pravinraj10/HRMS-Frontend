import React from "react";
import { FiSearch } from "react-icons/fi";
import "./ReusableSearch.css";

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

    </div>
  );
};

export default ReusableSearch;