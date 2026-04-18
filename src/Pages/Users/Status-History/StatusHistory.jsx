import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiPlus, FiChevronDown } from "react-icons/fi";
import { BiExport } from "react-icons/bi";
import { MdModeEditOutline } from "react-icons/md";
import ReusableDropdown from "../../../Reusbale/ReusableDropdown";
import ReusableSearch from "../../../Reusbale/ReusableSearch";
import ReusableTable from "../../../Reusbale/ReusableTable";
import profileImg from "../../../asset/image/profile.jpg";
import "./StatusHistory.css";

const StatusHistory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    role: "",
    status: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const [isFetching, setIsFetching] = useState(false);

  // Initial loading shimmer effect
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const dummyRecords = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: `EMP${String(i + 1).padStart(3, "0")}`,
      name: i % 2 === 0 ? "Sophia Clark" : "Ethan Bennett",
      department: ["Marketing", "Sales", "Finance", "HR", "IT"][i % 5],
      designation: ["Marketing Manager", "Sales Representative", "Financial Analyst", "HR Specialist", "IT Support"][i % 5],
      email: i % 2 === 0 ? "sophia.clark@example.com" : "ethan.bennett@example.com",
      phone: "+91 90555 00123",
      status: i % 3 === 0 ? "Approved" : "Pending"
    }));
  }, []);

  const filteredData = useMemo(() => {
    return dummyRecords.filter((item) => {
      const matchSearch =
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDepartment = !filters.department || item.department === filters.department;
      const matchRole = !filters.role || item.designation.toLowerCase().includes(filters.role.toLowerCase());
      const matchStatus = !filters.status || item.status === filters.status;
      return matchSearch && matchDepartment && matchRole && matchStatus;
    });
  }, [searchTerm, filters, dummyRecords]);

  const paginatedData = filteredData.slice(0, visibleCount);

  const loadMore = () => {
    if (visibleCount >= filteredData.length) return;
    setIsFetching(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 10);
      setIsFetching(false);
    }, 1000);
  };

  const columns = [
    { key: "id", label: "Employee ID", className: "col-id" },
    { key: "name", label: "Name", className: "col-name" },
    { key: "department", label: "Department", className: "col-generic" },
    { key: "designation", label: "Designation", className: "col-generic" },
    { key: "email", label: "Email", className: "col-generic" },
    { key: "phone", label: "Phone", className: "col-generic" },
    {
      key: "history",
      label: "History",
      className: "col-action",
      render: (row) => (
        <span className="view-link" style={{ cursor: 'pointer' }} onClick={() => navigate(`/employee/status/view/${row.id}`)}>view</span>
      ),
    },
  ];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const departmentOptions = [
    { label: "Marketing", value: "Marketing" },
    { label: "Sales", value: "Sales" },
    { label: "Finance", value: "Finance" },
    { label: "HR", value: "HR" },
    { label: "IT", value: "IT" },
  ];

  const roleOptions = [
    { label: "Manager", value: "Manager" },
    { label: "Representative", value: "Representative" },
    { label: "Analyst", value: "Analyst" },
  ];

  const statusOptions = [
    { label: "Pending", value: "Pending" },
    { label: "Approved", value: "Approved" },
  ];

  return (
    <div className="status-history-wrapper">
      {/* Breadcrumbs */}
      <div className="d-flex justify-content-between align-items-center mb-4 header-top-row">
        <div>
          <h2 className="page-main-title">Status & History</h2>
          <div className="d-flex align-items-center gap-2 breadcrumb-container">
            <FiHome size={14} /> / <span>Employee Management</span> / <span className="fw-medium text-dark">Status & History</span>
          </div>
        </div>
        <button type="button" className="btn-export-top">
          <BiExport size={16} /> Export <FiChevronDown size={14} />
        </button>
      </div>

      {/* Stats Header Card */}
      <div className="stats-header-card mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="stats-profile-img">
              <img src={profileImg} alt="Profile" />
            </div>
            <div>
              <h3 className="welcome-text mb-1">
                Welcome Back, Adrian <MdModeEditOutline className="edit-icon-small" />
              </h3>
              <p className="stats-subtext mb-0">
                You have <span className="highlight-blue">21</span> Pending Approvals & <span className="highlight-blue">14</span> Leave Requests
              </p>
            </div>
          </div>
          <div className="header-action-buttons d-flex gap-2">
            <button className="btn-header-action btn-job">
              <FiPlus /> Add Job Post
            </button>
            <button className="btn-header-action btn-emp" onClick={() => navigate('/employee/add')}>
              <FiPlus /> Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="status-history-card">
        {/* Filters and Search */}
        <div className="table-controls-row mb-4">
          <div className="controls-left">
            <div className="dropdown-item-wrap">
              <ReusableDropdown
                placeholder="Department"
                options={departmentOptions}
                value={filters.department}
                onChange={(val) => handleFilterChange("department", val)}
              />
            </div>
            <div className="dropdown-item-wrap">
              <ReusableDropdown
                placeholder="Role"
                options={roleOptions}
                value={filters.role}
                onChange={(val) => handleFilterChange("role", val)}
              />
            </div>
            <div className="dropdown-item-wrap">
              <ReusableDropdown
                placeholder="Status"
                options={statusOptions}
                value={filters.status}
                onChange={(val) => handleFilterChange("status", val)}
              />
            </div>
          </div>
          <div className="controls-right">
            <ReusableSearch
              placeholder="Search employee by name or ID"
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
        </div>

        {/* Reusable Table */}
        <div className="status-table-container">
            <ReusableTable
              columns={columns}
              data={loading ? [] : paginatedData}
              isFetching={loading || isFetching}
              onLoadMore={loadMore}
            />
        </div>
      </div>
    </div>
  );
};

export default StatusHistory;