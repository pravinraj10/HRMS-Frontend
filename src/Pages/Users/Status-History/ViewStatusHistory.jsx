import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiHome, FiChevronDown, FiFlag } from "react-icons/fi";
import { BiBuilding } from "react-icons/bi";
import { MdBadge, MdWorkHistory } from "react-icons/md";
import api from "../../../api/api";
import profileImg from "../../../asset/image/profile.jpg";
import "./ViewStatusHistory.css";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ViewStatusHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/Employee/${id}`);
        const emp = res.data;
        setEmployee({
          id: emp.id,
          employeeCode: emp.employeeCode || "-",
          name: emp.fullName || "-",
          department: emp.departmentName || "-",
          designation: emp.designationName || "-",
          manager: emp.reportingManagerName || "-",
          joiningDate: emp.joiningDate,
          status: emp.isActive ? "Active" : "Inactive",
          profilePhoto: emp.profilePhoto || null,
          shift: emp.shift || "-",
          email: emp.personalEmail || "-",
          phone: emp.personalPhone || "-",
        });
      } catch (err) {
        console.error("Employee fetch error:", err);
        setError("Failed to load employee details.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  if (loading) {
    return (
      <div className="view-status-history-wrapper d-flex justify-content-center align-items-center" style={{ height: "70vh" }}>
        <div className="spinner-border text-primary me-3" role="status" />
        <span className="text-muted fw-medium">Loading employee history...</span>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="view-status-history-wrapper d-flex flex-column justify-content-center align-items-center" style={{ height: "70vh" }}>
        <h3 className="text-danger mb-2">Employee Not Found</h3>
        <p className="text-muted mb-4">{error || `No record found for ID: ${id}`}</p>
        <button
          className="btn-deactivate"
          onClick={() => navigate("/employee/status")}
        >
          Back to Status &amp; History
        </button>
      </div>
    );
  }

  const photoSrc = employee.profilePhoto
    ? employee.profilePhoto.startsWith("http")
      ? employee.profilePhoto
      : `https://localhost:44306${employee.profilePhoto}`
    : profileImg;

  // Timeline derived from real employee data
  const timeline = [
    {
      icon: <MdBadge size={18} />,
      colorClass: "gold",
      date: formatDate(employee.joiningDate),
      title: `Joined as ${employee.designation}`,
      desc: `Joined the company in the ${employee.department} department.`,
    },
    {
      icon: <BiBuilding size={18} />,
      colorClass: "blue",
      date: formatDate(employee.joiningDate),
      title: `Assigned to ${employee.department}`,
      desc: `Employee assigned to ${employee.department} department under ${employee.manager}.`,
    },
    {
      icon: <MdWorkHistory size={18} />,
      colorClass: "gray",
      date: "-",
      title: "Work Shift",
      desc: `Shift: ${employee.shift}`,
    },
    {
      icon: <FiFlag size={18} />,
      colorClass: employee.status === "Active" ? "green" : "red",
      date: "-",
      title: `Current Status: ${employee.status}`,
      desc:
        employee.status === "Active"
          ? "Employee is currently active in the organization."
          : "Employee has been marked as inactive.",
    },
  ];

  return (
    <div className="view-status-history-wrapper">
      {/* Breadcrumb Header */}
      <div className="vsh-header">
        <h2 className="page-main-title">Status &amp; History</h2>
        <div className="d-flex align-items-center gap-2 breadcrumb-container">
          <FiHome size={14} /> / <span>Employee Management</span> /{" "}
          <span className="fw-medium text-dark">Status &amp; History</span>
        </div>
      </div>

      <div className="vsh-scroll-container">
        {/* Profile Section */}
        <div className="vsh-profile-section">
          <div className="vsh-profile-info">
            <img src={photoSrc} alt={employee.name} className="vsh-profile-img" />
            <div className="vsh-profile-details">
              <h3 className="current-status-title">
                {employee.name}{" "}
                <span
                  className={`status-dot ${employee.status === "Active" ? "dot-active" : "dot-inactive"}`}
                />
              </h3>
              <p className="emp-id-text">EMP ID: {employee.employeeCode}</p>
              <p className="emp-dept-text">
                {employee.designation} &mdash; {employee.department}
              </p>
              <p className="emp-contact-text">
                {employee.email} &nbsp;|&nbsp; {employee.phone}
              </p>
            </div>
          </div>
          <button
            className="btn-deactivate"
            onClick={() => navigate("/employee/status")}
          >
            Back to List <FiChevronDown size={16} style={{ transform: "rotate(90deg)" }} />
          </button>
        </div>

        {/* History Section */}
        <div className="vsh-history-section">
          <h4>Employment History</h4>
          <div className="vsh-timeline">
            {timeline.map((item, idx) => (
              <div key={idx} className="vsh-timeline-item">
                <div className={`vsh-timeline-icon ${item.colorClass}`}>
                  {item.icon}
                </div>
                <div className="vsh-timeline-card">
                  <div className="vsh-timeline-date">{item.date}</div>
                  <div className="vsh-timeline-title">{item.title}</div>
                  <div className="vsh-timeline-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStatusHistory;