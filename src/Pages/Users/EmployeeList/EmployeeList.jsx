import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiPlus, FiChevronDown, FiSearch, FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import { BiExport } from "react-icons/bi";

import ReusableDropdown from "../../../Reusbale/ReusableDropdown";
import ReusableSearch from "../../../Reusbale/ReusableSearch";
import ReusableTable from "../../../Reusbale/ReusableTable";
import ReusableConfirm from "../../../Reusbale/ReusableConfirm";
import ReusablePopup from "../../../Reusbale/ReusablePopup";
import { useCrudEmployee } from "../../../hooks/useCrudEmployee";
import api from "../../../api/api";
import "./EmployeeList.css";


const statusOptions = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

const EmployeeList = () => {
  const navigate = useNavigate();
  const { employees, loading, searchLoading, remove, toggleStatus, search } = useCrudEmployee();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    role: "",
    status: "",
  });

  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);

  const [visibleCount, setVisibleCount] = useState(10);
  const [isFetching, setIsFetching] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [popupState, setPopupState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  // Fetch filter dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [deptRes, desigRes] = await Promise.all([
          api.get("/Department"),
          api.get("/Designation")
        ]);
        
        const getArray = (res) => {
          if (Array.isArray(res)) return res;
          if (res?.$values) return res.$values;
          if (res?.data) return res.data;
          return [];
        };

        setDepartments(getArray(deptRes.data).map(d => ({ label: d.departmentName, value: d.departmentName })));
        setRoles(getArray(desigRes.data).map(d => ({ label: d.designationName, value: d.designationName })));
      } catch (err) {
        console.error("Failed to fetch dropdown data", err);
      }
    };
    fetchDropdownData();
  }, []);

  // Backend Search implementation
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        search(searchTerm);
      } else {
        search(""); 
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, search]);

  const showPopup = (title, message, type = "success") => {
    setPopupState({ isOpen: true, title, message, type });
  };

  const handleDelete = (row) => {
    setDeleteItem(row);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    const res = await remove(deleteItem.id);
    if (res.success) {
      showPopup("Success!", "Employee deleted successfully!");
    } else {
      showPopup("Error!", "Failed to delete employee.", "error");
    }
    setIsConfirmOpen(false);
    setDeleteItem(null);
  };

  const handleToggleStatus = async (row) => {
    // Clear status filter so the row stays visible after its status changes
    setFilters((prev) => ({ ...prev, status: "" }));
    const res = await toggleStatus(row.id, row.status);
    if (res.success) {
      const newStatus = row.status === "Active" ? "Inactive" : "Active";
      showPopup("Success!", `Employee status updated to ${newStatus} successfully!`);
    } else {
      showPopup("Error!", "Failed to update employee status.", "error");
    }
  };

  const columns = [
    { key: "employeeId", label: "Employee ID", className: "emp-id-td" },
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
          <label className="ios-toggle" title="Toggle Status">
            <input
              type="checkbox"
              checked={row.status === "Active"}
              onChange={() => handleToggleStatus(row)}
            />
            <span className="ios-slider"></span>
          </label>
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
      const matchRole = !filters.role || item.designation === filters.role;
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
                options={departments}
                value={filters.department}
                onChange={(val) => handleFilterChange("department", val)}
              />
            </div>
            <div className="filter-dropdown-wrapper">
              <ReusableDropdown
                placeholder="Role"
                options={roles}
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
              className="btn-filter-action btn-clear-emp"
              onClick={() => {
                setFilters({ department: "", role: "", status: "" });
                setSearchTerm("");
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
          {filteredData.length > 0 || loading || searchLoading ? (
            <ReusableTable 
              columns={columns} 
              data={paginatedData} 
              isFetching={loading || searchLoading || isFetching}
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

export default EmployeeList;