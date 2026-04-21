import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiPlus, FiChevronDown, FiSearch, FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import { BiExport } from "react-icons/bi";

import ReusableDropdown from "../../../Reusbale/ReusableDropdown";
import ReusableSearch from "../../../Reusbale/ReusableSearch";
import ReusableTable from "../../../Reusbale/ReusableTable";
import ReusableConfirm from "../../../Reusbale/ReusableConfirm";
import { useCrudEmployee } from "../../../hooks/useCrudEmployee";
import "./EmployeeList.css";

const departmentOptions = [
  { label: "Marketing", value: "Marketing" },
  { label: "Sales", value: "Sales" },
  { label: "Finance", value: "Finance" },
  { label: "HR", value: "HR" },
  { label: "IT", value: "IT" },
  { label: "Operations", value: "Operations" },
  { label: "Customer Service", value: "Customer Service" },
  { label: "Product", value: "Product" },
  { label: "Legal", value: "Legal" },
  { label: "Research", value: "Research" },
];

const roleOptions = [
  { label: "Manager", value: "Manager" },
  { label: "Representative", value: "Representative" },
  { label: "Analyst", value: "Analyst" },
  { label: "Specialist", value: "Specialist" },
  { label: "Support", value: "Support" },
  { label: "Coordinator", value: "Coordinator" },
  { label: "Agent", value: "Agent" },
  { label: "Counsel", value: "Counsel" },
  { label: "Developer", value: "Developer" },
];

const statusOptions = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

const EmployeeList = () => {
  const navigate = useNavigate();
  const { employees, loading, remove, searchEmployee } = useCrudEmployee();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    role: "",
    status: "",
  });

  const [visibleCount, setVisibleCount] = useState(10);
  const [isFetching, setIsFetching] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const handleDelete = (row) => {
    setDeleteItem(row);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    await remove(deleteItem.id);
    setIsConfirmOpen(false);
    setDeleteItem(null);
  };

  const columns = [
    { key: "id", label: "Employee ID", className: "emp-id-td" },
    { key: "name", label: "Name", className: "emp-name-td" },
    { key: "department", label: "Department", className: "emp-other-td" },
    { key: "designation", label: "Designation", className: "emp-other-td" },
    { key: "email", label: "Email", className: "emp-other-td" },
    { key: "phone", label: "Phone", className: "emp-other-td" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`emp-status-badge ${row.status === "Active" ? "emp-status-active" : "emp-status-inactive"}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="d-flex gap-2 align-items-center justify-content-center">
          <FiEye 
            className="emp-action-icon icon-view-blue" 
            title="View" 
            onClick={() => navigate(`/employee/view/${row.id}`)}
          />
          <FiEdit2 
            className="emp-action-icon icon-edit-green" 
            title="Edit" 
            onClick={() => navigate(`/employee/edit/${row.id}`)}
          />
          <FiTrash2 
            className="emp-action-icon icon-delete-red" 
            title="Delete" 
            onClick={() => handleDelete(row)}
          />
        </div>
      ),
    },
  ];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const filteredData = useMemo(() => {
    return (employees || []).filter((item) => {
      const matchDepartment = !filters.department || item.department === filters.department;
      const matchRole = !filters.role || item.designation?.toLowerCase().includes(filters.role.toLowerCase());
      const matchStatus = !filters.status || item.status === filters.status;

      return matchDepartment && matchRole && matchStatus;
    });
  }, [filters, employees]);

  const paginatedData = filteredData.slice(0, visibleCount);

  const loadMore = () => {
    if (visibleCount >= filteredData.length) return;
    setIsFetching(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 10);
      setIsFetching(false);
    }, 1000);
  };

  return (
    <div className="employee-list-page container-fluid">
      {/* Header Section */}
      <div className="employee-header-top flex-wrap">
        <div className="mb-2 mb-md-0">
          <h2 className="employee-page-title">Employee List</h2>
          <div className="d-flex align-items-center gap-2 breadcrumb-container">
            <FiHome size={14} /> / Employee Management / <span className="fw-medium text-dark">Employee List</span>
          </div>
        </div>
        <div className="employee-header-actions">
          <button className="btn-emp btn-add-job">
            <FiPlus size={16} /> Add Job Post
          </button>
          <button className="btn-emp btn-add-employee" onClick={() => navigate('/employee/add')}>
            <FiPlus size={16} /> Add Employee
          </button>
          <button type="button" className="btn-export-top">
            <BiExport size={16} /> Export <FiChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="employee-card">
        {/* Filters Row */}
        <div className="filter-controls-row">
          <div className="filter-group-left">
            <div className="filter-dropdown-wrapper">
              <ReusableDropdown
                placeholder="Department"
                options={departmentOptions}
                value={filters.department}
                onChange={(val) => handleFilterChange("department", val)}
              />
            </div>
            <div className="filter-dropdown-wrapper">
              <ReusableDropdown
                placeholder="Role"
                options={roleOptions}
                value={filters.role}
                onChange={(val) => handleFilterChange("role", val)}
              />
            </div>
            <div className="filter-dropdown-wrapper">
              <ReusableDropdown
                placeholder="Status"
                options={statusOptions}
                value={filters.status}
                onChange={(val) => handleFilterChange("status", val)}
              />
            </div>
            <button 
              className="btn-filter-action btn-search-emp"
              onClick={() => searchEmployee(searchTerm)}
            >
              <FiSearch /> Search
            </button>
            <button
              className="btn-filter-action btn-clear-emp"
              onClick={() => {
                setFilters({ department: "", role: "", status: "" });
                setSearchTerm("");
                searchEmployee("");
              }}
            >
              Clear
            </button>
          </div>

          <div className="search-bar-container">
            <ReusableSearch
              placeholder="Search employee by name or ID"
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="emp-table-wrapper">
          {filteredData.length > 0 || loading ? (
            <ReusableTable 
              columns={columns} 
              data={paginatedData} 
              isFetching={loading || isFetching}
              onLoadMore={loadMore}
            />
          ) : (
            <div className="text-center py-5 rounded-3 bg-light text-muted">
              No employees found 
            </div>
          )}
        </div>
      </div>

      <ReusableConfirm
        isOpen={isConfirmOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${deleteItem?.name || "this employee"}?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default EmployeeList;