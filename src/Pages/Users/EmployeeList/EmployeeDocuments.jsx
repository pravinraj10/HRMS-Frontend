import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { FiHome, FiChevronDown, FiEye, FiDownload, FiTrash2 } from "react-icons/fi";
import { BiExport } from "react-icons/bi";
import { LuCloudUpload } from "react-icons/lu";
import ReusableTable from "../../../Reusbale/ReusableTable";
import "./EmployeeDocuments.css";

const EmployeeDocuments = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [uploadedDocs, setUploadedDocs] = useState([
    { name: "Passport.pdf", date: "2023-10-26", status: "Verified" },
    { name: "Passport.pdf", date: "2023-10-26", status: "Verified" },
    { name: "Passport.pdf", date: "2023-10-26", status: "Pending" },
    { name: "Passport.pdf", date: "2023-10-26", status: "Pending" },
    { name: "Passport.pdf", date: "2023-10-26", status: "Verified" },
  ]);

  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    processFiles(files);
  };

  const processFiles = (files) => {
    if (files && files.length > 0) {
      const newDocs = Array.from(files).map((file) => ({
        name: file.name,
        date: new Date().toISOString().split("T")[0],
        status: "Pending",
      }));
      setUploadedDocs((prev) => [...newDocs, ...prev]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    processFiles(files);
  };



  const requiredDocs = [
    { title: "ID Proof", status: "Completed" },
    { title: "Address Proof", status: "Completed" },
    { title: "Experience Certificate", status: "Pending" },
    { title: "Educational Certificate", status: "Pending" },
    { title: "Educational Certificate", status: "Completed" },
  ];

  const columns = [
    { key: "name", label: "Document Name", className: "doc-name-col" },
    { key: "date", label: "Uploaded Date", className: "doc-date-col" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`status-text ${row.status === "Verified" ? "status-verified" : "status-pending"}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "actions-col",
      render: () => (
        <div className="d-flex gap-3 align-items-center justify-content-center">
          <FiEye className="action-icon icon-view" />
          <FiDownload className="action-icon icon-download" />
          <FiTrash2 className="action-icon icon-delete" />
        </div>
      ),
    },

  ];

  return (
    <div className="employee-docs-wrapper">
      {/* Header */}
      <div className="docs-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="docs-title">Employee Documents</h2>
          <div className="d-flex align-items-center gap-2 breadcrumb-container">
            <FiHome size={14} /> / <span>Employee Management</span> / <span className="fw-medium text-dark">Document</span>
          </div>
        </div>
        <button type="button" className="btn-export-top">
          <BiExport size={16} /> Export <FiChevronDown size={14} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="employee-docs-scroll">
        {/* Upload Area */}
        <div 
          className="upload-section-card mb-4"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleUploadClick}
          style={{ cursor: "pointer" }}
        >
          <div className="upload-content text-center">
             <h4 className="upload-main-text">Drag & Drop Files here or Click to upload</h4>
             <p className="upload-sub-text">PDF, JPG, PNG Accepted. Max file size 10MB</p>

             <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: "none" }} 
                multiple
                onChange={handleFileChange}
             />
             <button className="btn-upload-primary">
                <LuCloudUpload size={18} /> Upload
             </button>

          </div>
        </div>

        <div className="row">
          {/* Left Table Section */}
          <div className="col-lg-8">
             <div className="docs-list-card h-100">
                <h3 className="section-card-title mb-4">Upload Documents</h3>
                <div className="docs-table-container">
                  <ReusableTable 
                    columns={columns}
                    data={uploadedDocs}
                  />
                </div>
             </div>
          </div>

          {/* Right Sidebar Section */}
          <div className="col-lg-4">
             <div className="required-docs-card h-100">
                <h3 className="section-card-title mb-4">Required Documents</h3>
                <div className="required-list">
                   {requiredDocs.map((doc, index) => (
                     <div key={index} className="required-item d-flex justify-content-between align-items-center mb-3">
                        <span className="required-title">{doc.title}</span>
                        <span className={`required-status ${doc.status === "Completed" ? "status-completed" : "status-pending-text"}`}>
                          {doc.status}
                        </span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default EmployeeDocuments;
