import React, { useState } from "react";
import { FiHome, FiChevronDown } from "react-icons/fi";
import { FaFileAlt } from "react-icons/fa";
import { BiExport } from "react-icons/bi";
import { useNavigate, useParams } from "react-router-dom";
import profileImg from "../../../asset/image/profile.jpg";
import { useCrudEmployee } from "../../../hooks/useCrudEmployee";
import "./ViewEmployee.css";

const ViewEmployee = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Personal Info");
  const { getById } = useCrudEmployee();
  
  const employee = getById(id);

  if (!employee) {
    return (
      <div className="view-employee-wrapper d-flex justify-content-center align-items-center" style={{ height: "70vh" }}>
        <p className="text-muted fw-medium">Loading employee details...</p>
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
        <button type="button" className="btn-export-top">
          <BiExport size={16} /> Export <FiChevronDown size={14} />
        </button>
      </div>

      <div className="view-employee-scroll">
        
        {/* Top Profile Card */}
        <div className="profile-hero-card mb-4 d-flex align-items-center gap-4">
          <img 
            src={employee.profilePhoto ? (employee.profilePhoto.startsWith('http') ? employee.profilePhoto : `http://localhost:4000/${employee.profilePhoto}`) : profileImg} 
            onError={(e) => { e.target.onerror = null; e.target.src = profileImg; }}
            alt="Profile" 
            className="hero-avatar" 
          />
          <div className="hero-info">
            <h3 className="hero-name">{employee.name} {employee.id ? `(${employee.id})` : ''}</h3>
            <p className="hero-designation text-muted mb-2">{employee.designation}, {employee.department}</p>
            <p className="hero-subtext text-muted mb-0">
              Joined on: {employee.joiningDate || "N/A"} &nbsp;|&nbsp; {employee.email} &nbsp;|&nbsp; {employee.phone}
            </p>
          </div>
        </div>

        <div className="row g-4 mb-4">
          
          {/* Left Column (Tabs + Content) */}
          <div className="col-lg-8">
            <div className="view-section-card h-100">
              
              {/* Custom Tabs */}
              <div className="custom-tabs-container mb-4">
                {["Personal Info", "Job Info", "Documents", "History"].map((tab) => (
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
                <div className="tab-content-area flex-grow-1">
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
                          <p>{employee.id || "-"}</p>
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
                          <label>Personal Email</label>
                          <p>{employee.email || "-"}</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-block">
                          <label>Office Email</label>
                          <p>{employee.officeEmail || employee.email || "-"}</p>
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
                <div className="tab-content-area flex-grow-1">
                  <div className="d-flex flex-column gap-3">
                    {employee.idProofs && employee.idProofs.length > 0 ? (
                      employee.idProofs.map((docObj, idx) => {
                        const docKey = Object.keys(docObj)[0];
                        const docFile = docObj[docKey];
                        return (
                          <div key={idx} className="document-view-item p-3 border rounded d-flex align-items-center justify-content-between bg-light-subtle">
                             <div className="d-flex align-items-center gap-3">
                                <FaFileAlt size={24} className="text-primary" />
                                <div>
                                  <p className="mb-0 fw-medium">{docKey}</p>
                                  <small className="text-muted">{docFile}</small>
                                </div>
                             </div>
                             <button className="btn btn-sm btn-outline-primary shadow-sm px-3">View PDF</button>
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
              
              {(activeTab === "Job Info" || activeTab === "History") && (
                <div className="tab-empty-state text-center text-muted p-5">
                  <p>Details for {activeTab} will be available soon.</p>
                </div>
              )}

            </div>
          </div>

          {/* Right Column (Actions + Details) */}
          <div className="col-lg-4 d-flex flex-column gap-4">
            
            {/* Quick Action Card */}
            <div className="view-section-card">
              <h4 className="card-sub-title mb-4">Quick Action</h4>
              <div className="d-flex flex-column gap-3">
                <button 
                  className="btn-action-blue"
                  onClick={() => navigate(`/employee/edit/${id || 'emp123'}`)}
                >
                  Edit Employee
                </button>
                <button className="btn-action-red">
                  Deactivate Employee
                </button>
                <button className="btn-action-outline">
                  View Punch In/Out
                </button>
              </div>
            </div>

            {/* Job Details Sidebar Card */}
            <div className="view-section-card flex-grow-1">
              <h4 className="card-sub-title mb-4">Job Details</h4>
              <div className="d-flex flex-column gap-3">
                <div className="job-detail-row">
                  <span className="job-label">Employment Type</span>
                  <span className="job-value">Full-Time</span>
                </div>
                <div className="job-detail-row">
                  <span className="job-label">Reporting Manager</span>
                  <span className="job-value">{employee.manager || "-"}</span>
                </div>
                <div className="job-detail-row">
                  <span className="job-label">Work Location</span>
                  <span className="job-value">New York Office</span>
                </div>
                <div className="job-detail-row">
                  <span className="job-label">Salary</span>
                  <span className="job-value text-success">Confidential</span>
                </div>
                <div className="job-detail-row border-0 pb-0">
                  <span className="job-label">Contact Number</span>
                  <span className="job-value">{employee.phone || "-"}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ViewEmployee;
