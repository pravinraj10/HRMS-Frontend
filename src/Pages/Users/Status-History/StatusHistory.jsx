import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiPlus, FiChevronDown } from "react-icons/fi";
import { BiExport } from "react-icons/bi";
import { MdModeEditOutline } from "react-icons/md";
import ReusableDropdown from "../../../Reusbale/ReusableDropdown";
import ReusableSearch from "../../../Reusbale/ReusableSearch";
import ReusableTable from "../../../Reusbale/ReusableTable";
import profileImg from "../../../asset/image/profile.jpg";
import { useCrudEmployee } from "../../../hooks/useCrudEmployee";
import "./StatusHistory.css";

const StatusHistory = () => {
  const navigate = useNavigate();
  const { employees, loading } = useCrudEmployee();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    designation: "",
    status: "",
  });
  const [visibleCount, setVisibleCount] = useState(10);
  const [isFetching, setIsFetching] = useState(false);

  // Build dynamic filter options from backend data
  const departmentOptions = useMemo(() => {
    const unique = [...new Set(employees.map((e) => e.department).filter(Boolean))];
    return unique.map((d) => ({ label: d, value: d }));
  }, [employees]);

  const designationOptions = useMemo(() => {
    const unique = [...new Set(employees.map((e) => e.designation).filter(Boolean))];
    return unique.map((d) => ({ label: d, value: d }));
  }, [employees]);

  const statusOptions = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ];

  const filteredData = useMemo(() => {
    return employees.filter((item) => {
      const matchSearch =
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDepartment =
        !filters.department || item.department === filters.department;
      const matchDesignation =
        !filters.designation ||
        item.designation?.toLowerCase().includes(filters.designation.toLowerCase());
      const matchStatus = !filters.status || item.status === filters.status;
      return matchSearch && matchDepartment && matchDesignation && matchStatus;
    });
  }, [searchTerm, filters, employees]);

  const paginatedData = filteredData.slice(0, visibleCount);

  const loadMore = () => {
    if (visibleCount >= filteredData.length) return;
    setIsFetching(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 10);
      setIsFetching(false);
    }, 600);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setVisibleCount(10);
  };

  const columns = [
    { key: "employeeId", label: "Employee ID", className: "col-id" },
    { key: "name", label: "Name", className: "col-name" },
    { key: "department", label: "Department", className: "col-generic" },
    { key: "designation", label: "Designation", className: "col-generic" },
    { key: "email", label: "Email", className: "col-generic" },
    { key: "phone", label: "Phone", className: "col-generic" },
    {
      key: "status",
      label: "Status",
      className: "col-generic",
      render: (row) => (
        <span
          className={`status-pill ${row.status === "Active" ? "pill-active" : "pill-inactive"}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "history",
      label: "History",
      className: "col-action",
      render: (row) => (
        <span
          className="view-link"
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`/employee/status/view/${row.id}`)}
        >
          view
        </span>
      ),
    },
  ];

  return (
    <div className="status-history-wrapper">
      {/* Breadcrumbs */}
      <div className="d-flex justify-content-between align-items-center mb-4 header-top-row">
        <div>
          <h2 className="page-main-title">Status &amp; History</h2>
          <div className="d-flex align-items-center gap-2 breadcrumb-container">
            <FiHome size={14} /> / <span>Employee Management</span> /{" "}
            <span className="fw-medium text-dark">Status &amp; History</span>
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
                Employee Status &amp; History <MdModeEditOutline className="edit-icon-small" />
              </h3>
              <p className="stats-subtext mb-0">
                Total{" "}
                <span className="highlight-blue">{employees.length}</span>{" "}
                employees &nbsp;|&nbsp; Active:{" "}
                <span className="highlight-blue">
                  {employees.filter((e) => e.status === "Active").length}
                </span>{" "}
                &nbsp;|&nbsp; Inactive:{" "}
                <span className="highlight-blue">
                  {employees.filter((e) => e.status === "Inactive").length}
                </span>
              </p>
            </div>
          </div>
          <div className="header-action-buttons d-flex gap-2">
            <button className="btn-header-action btn-job">
              <FiPlus /> Add Job Post
            </button>
            <button
              className="btn-header-action btn-emp"
              onClick={() => navigate("/employee/add")}
            >
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
                placeholder="Designation"
                options={designationOptions}
                value={filters.designation}
                onChange={(val) => handleFilterChange("designation", val)}
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
              placeholder="Search by name or Employee ID"
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val);
                setVisibleCount(10);
              }}
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