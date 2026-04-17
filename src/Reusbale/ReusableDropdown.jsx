import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import "./ReusableDropdown.css";

const ReusableDropdown = ({
  placeholder,
  options = [],
  value,
  onChange,
  disabled = false,
  error = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef();

  const selectedLabel = options.find((opt) => opt.value === value)?.label || "";
  const filteredOptions = options.filter((opt) =>
    (opt.label || "").toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="position-relative w-100" ref={dropdownRef}>
      <div
        className={`d-flex align-items-center px-3 rd-header ${error ? "rd-error" : ""} ${disabled ? "rd-disabled" : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="flex-grow-1 text-truncate pe-2 rd-header-text">
          {selectedLabel || placeholder}
        </span>
        <ChevronDown size={18} className="rd-chevron" />
      </div>

      {isOpen && (
        <div className="position-absolute w-100 bg-white border overflow-hidden shadow-lg rd-body">
          <input
            type="text"
            placeholder="Search..."
            className="form-control border-0 border-bottom rounded-0 shadow-none px-3 py-2 rd-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          
          <div className="overflow-auto rd-options-container">
            <div
              className="px-3 py-2 border-bottom dropdown-item-custom text-muted"
              onClick={() => { onChange(""); setIsOpen(false); setSearch(""); }}
            >
              {placeholder}
            </div>

            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`px-3 py-2 dropdown-item-custom ${value === opt.value ? 'active-option' : ''}`}
                  onClick={() => { onChange(opt.value); setIsOpen(false); setSearch(""); }}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-muted small text-center">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReusableDropdown;