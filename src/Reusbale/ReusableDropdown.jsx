import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

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

      <style>{`
        .rd-header {
          height: 42px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          background-color: #fff;
          cursor: pointer;
          transition: border-color 0.2s, background-color 0.2s;
          color: #475569;
        }

        .rd-header:hover {
          border-color: #1a56a6;
        }

        .rd-header-text {
          font-size: 14px;
        }

        .rd-chevron {
          color: #94a3b8;
        }

        .rd-error {
          border-color: #d32f2f !important;
        }

        .rd-disabled {
          background-color: #f5f5f5 !important;
          cursor: not-allowed !important;
          opacity: 0.7;
        }

        .rd-body {
  top: calc(100% + 5px);
  z-index: 9999 !important; 
  background-color: white;
  border-radius: 8px;
  animation: fadeIn 0.2s ease-out;
}

        .rd-search-input {
          font-size: 13px;
        }

        .rd-options-container {
          max-height: 200px;
        }

        .dropdown-item-custom {
          cursor: pointer !important;
          font-size: 14px;
          transition: all 0.2s ease;
          user-select: none;
          border-bottom: 1px solid #f1f5f9;
        }

        .dropdown-item-custom:hover {
          background-color: #f8fafc !important;
          color: #1a56a6 !important;
        }

        .active-option {
          background-color: #eff6ff !important;
          color: #1a56a6 !important;
          font-weight: 600;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .rd-header {
            height: 38px;
          }
          .rd-header-text, .dropdown-item-custom {
            font-size: 13px !important;
          }
          .rd-search-input {
            font-size: 12px !important;
          }
        }

        @media (max-width: 480px) {
          .rd-header {
            height: 36px;
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          .rd-header-text, .dropdown-item-custom {
            font-size: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReusableDropdown;