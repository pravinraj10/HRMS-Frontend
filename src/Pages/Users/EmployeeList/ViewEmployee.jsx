import React, { useState,useEffect } from "react";
import { FiHome, FiChevronDown, FiArrowLeft } from "react-icons/fi";
import { FaFileAlt } from "react-icons/fa";
import { BiExport } from "react-icons/bi";
import { useNavigate, useParams } from "react-router-dom";
import profileImg from "../../../asset/image/profile.jpg";
import api from "../../../api/api";
import ReusableConfirm from "../../../Reusbale/ReusableConfirm";
import ReusablePopup from "../../../Reusbale/ReusablePopup";
import "./ViewEmployee.css";

const ViewEmployee = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Personal Info");
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [popupState, setPopupState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const showPopup = (title, message, type = "success") => {
    setPopupState({ isOpen: true, title, message, type });
  };

  const handleConfirmToggleActive = async () => {
    setIsConfirmOpen(false);
    const newActiveStatus = !employee.isActive;

    try {
      await api.put(`/Employee/set-active/${id}?isActive=${newActiveStatus}`);
      
      setEmployee(prev => ({
        ...prev,
        isActive: newActiveStatus
      }));

      showPopup(
        "Success!",
        `Employee "${employee.name}" has been ${newActiveStatus ? "activated" : "deactivated"} successfully.`,
        "success"
      );
    } catch (error) {
      console.error("Error setting active status:", error);
      showPopup(
        "Error!",
        `Failed to ${newActiveStatus ? "activate" : "deactivate"} employee. Please try again.`,
        "error"
      );
    }
  };

useEffect(() => {
  const fetchEmployee = async () => {
    try {
      const res = await api.get(`/Employee/${id}`);
      const emp = res.data;

      setEmployee({
        id: emp.id,
        employeeId: emp.employeeCode,
        name: emp.fullName,

        gender: emp.gender || "-",

        dob: emp.dateOfBirth
          ? new Date(emp.dateOfBirth).toLocaleDateString("en-GB")
          : "-",

        joiningDate: emp.joiningDate
          ? new Date(emp.joiningDate).toLocaleDateString("en-GB")
          : "-",

        email: emp.personalEmail,
        officeEmail: emp.officeEmail || "-",
        phone: emp.personalPhone,

        address: emp.address || "-",

        department: emp.departmentName,
        designation: emp.designationName,

        manager: emp.reportingManagerName || (emp.reportingManagerId ? `Manager ID: ${emp.reportingManagerId}` : "-"),

        shift: emp.shift,

        profilePhoto: emp.profilePhoto,
        isActive: emp.isActive,

        idProofs: emp.idProof
          ? [{ "ID Proof": emp.idProof }]
          : []
      });

    } catch (err) {
      console.error("Employee fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchEmployee();
}, [id]);

  if (loading) {
    return (
      <div className="view-employee-wrapper d-flex flex-column justify-content-center align-items-center" style={{ height: "70vh" }}>
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="text-muted fw-medium">Fetching employee details...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="view-employee-wrapper d-flex flex-column justify-content-center align-items-center" style={{ height: "70vh" }}>
        <h3 className="text-danger mb-2">Employee Not Found</h3>
        <p className="text-muted mb-4">We couldn't find any record for ID: {id}</p>
        <button className="btn-action-blue" onClick={() => navigate('/employee/list')}>Back to List</button>
      </div>
    );
  }

  return (
    <div className="view-employee-wrapper">
      
      {/* Header section */}
      <div className="d-flex justify-content-between align-items-center mb-4 header-actions-flex">
        <div>
          <h2 className="view-employee-title">Profile Overview</h2>
          <div className="d-flex align-items-center gap-2 breadcrumb-container">
            <FiHome size={14} /> / <span>Employee Management</span> / <span className="fw-medium text-dark">Profile Overview</span>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn-back-top"
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft size={16} /> Back
          </button>
          {/* <button type="button" className="btn-export-top">
            <BiExport size={16} /> Export <FiChevronDown size={14} />
          </button> */}
        </div>
      </div>

      <div className="view-employee-scroll">
        
        {/* Top Profile Card */}
        <div className="profile-hero-card mb-4 d-flex align-items-center gap-4">
          <img 
            className="hero-avatar"
            src={employee.profilePhoto
             ? (employee.profilePhoto.startsWith('http')
             ? employee.profilePhoto
             : `https://localhost:44306${employee.profilePhoto}`)
             : profileImg}
            alt={employee.name}
          />
          <div className="hero-info">
            <h3 className="hero-name">{employee.name} {employee.employeeId ? `(${employee.employeeId})` : ''}</h3>
            <p className="hero-designation text-muted mb-3">{employee.designation}, {employee.department}</p>
            <div className="hero-subtext">
              <span>Joined on: {employee.joiningDate || "N/A"}</span>
              <span className="separator">|</span>
              <span>{employee.email}</span>
              <span className="separator">|</span>
              <span>{employee.phone}</span>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          
          {/* Left Column (Tabs + Content) */}
          <div className="col-lg-8">
            <div className="view-section-card">
              
              {/* Custom Tabs */}
              <div className="custom-tabs-container">
                {["Personal Info", "Documents"].map((tab) => (
                  <button
                    key={tab}
                    className={`custom-tab ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === "Personal Info" && (
                <div className="tab-content-area">
                  <div className="info-row-seperated">
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="info-block">
                          <label>Full Name</label>
                          <p>{employee.name || "-"}</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-block">
                          <label>Employee ID</label>
                          <p>{employee.employeeId || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="info-row-seperated">
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="info-block">
                          <label>DOB</label>
                          <p>{employee.dob || "-"}</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-block">
                          <label>Gender</label>
                          <p>{employee.gender || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="info-row-seperated">
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="info-block">
                          <label>Department</label>
                          <p>{employee.department || "-"}</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-block">
                          <label>Designation</label>
                          <p>{employee.designation || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="info-row-seperated">
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="info-block">
                          <label>Email</label>
                          <p>{employee.email || "-"}</p>
                        </div>
                      </div>
                       <div className="col-md-6">
                        <div className="info-block">
                          <label>Office Email</label>
                          <p>{employee.officeEmail || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="info-row-seperated border-0">
                    <div className="row g-4">
                      <div className="col-12">
                        <div className="info-block border-0 mb-0">
                          <label>Address</label>
                          <p>{employee.address || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Documents" && (
                <div className="tab-content-area">
                  <div className="d-flex flex-column gap-3">
                    {employee.idProofs && employee.idProofs.length > 0 ? (
                      employee.idProofs.map((docObj, idx) => {
                        const docKey = Object.keys(docObj)[0];
                        const docFile = docObj[docKey];
                        const isPdf = docFile?.toLowerCase().endsWith(".pdf");
                        const buttonText = isPdf ? "View PDF" : docFile?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? "View Image" : "View Document";
                        
                        const handleViewFile = () => {
                          if (!docFile) return;
                          const fileUrl = docFile.startsWith("http")
                            ? docFile
                            : `https://localhost:44306${docFile}`;
                          window.open(fileUrl, "_blank", "noopener,noreferrer");
                        };

                        return (
                          <div key={idx} className="document-view-item p-3 d-flex align-items-center justify-content-between">
                             <div className="d-flex align-items-center gap-3">
                                <FaFileAlt size={24} className="text-primary" />
                                <div>
                                  <p className="mb-0 fw-bold text-dark">{docKey}</p>
                                  <small className="text-muted">{docFile}</small>
                                </div>
                             </div>
                             <button 
                               className="btn btn-sm btn-outline-primary px-3 fw-bold rounded-pill"
                               onClick={handleViewFile}
                             >
                               {buttonText}
                             </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center p-5 text-muted">
                        <p>No documents uploaded for this employee.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}


            </div>
          </div>

          {/* Right Column (Actions + Details) */}
          <div className="col-lg-4 d-flex flex-column gap-4">
            
            {/* Quick Action Card */}
            <div className="view-section-card">
              <h4 className="card-sub-title">Quick Action</h4>
              <div className="d-flex flex-column gap-3">
                <button 
                  className="btn-action-blue"
                  onClick={() => navigate(`/employee/edit/${id}`)}
                >
                  Edit Employee
                </button>
                <button 
                  className={employee.isActive ? "btn-action-red" : "btn-action-blue"}
                  onClick={() => setIsConfirmOpen(true)}
                >
                  {employee.isActive ? "Deactivate Employee" : "Activate Employee"}
                </button>
                <button className="btn-action-outline">
                  View Punch In/Out
                </button>
              </div>
            </div>

            {/* Job Details Sidebar Card */}
            <div className="view-section-card">
              <h4 className="card-sub-title">Job Details</h4>
              <div className="d-flex flex-column">
                <div className="job-detail-row">
                  <span className="job-label">Employment Type</span>
                  <span className="job-value">{employee.employmentType || "Full-Time"}</span>
                </div>
                <div className="job-detail-row">
                  <span className="job-label">Reporting Manager</span>
                  <span className="job-value">{employee.manager || "-"}</span>
                </div>
                <div className="job-detail-row">
                  <span className="job-label">Work Location</span>
                  <span className="job-value">{employee.workLocation || "New York Office"}</span>
                </div>
                <div className="job-detail-row">
                  <span className="job-label">Salary</span>
                  <span className="job-value text-success">Confidential</span>
                </div>
                <div className="job-detail-row">
                  <span className="job-label">Contact Number</span>
                  <span className="job-value">{employee.phone || "-"}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      <ReusableConfirm
        isOpen={isConfirmOpen}
        title={employee.isActive ? "Confirm Deactivation" : "Confirm Activation"}
        message={`Are you sure you want to ${employee.isActive ? "deactivate" : "activate"} "${employee.name}"?`}
        onConfirm={handleConfirmToggleActive}
        onCancel={() => setIsConfirmOpen(false)}
        confirmText={employee.isActive ? "Deactivate" : "Activate"}
        confirmBtnClass={employee.isActive ? "custom-delete-btn" : "custom-activate-btn"}
      />

      <ReusablePopup
        isOpen={popupState.isOpen}
        onClose={() => setPopupState((prev) => ({ ...prev, isOpen: false }))}
        title={popupState.title}
        message={popupState.message}
        type={popupState.type}
      />
    </div>
  );
};

export default ViewEmployee;
