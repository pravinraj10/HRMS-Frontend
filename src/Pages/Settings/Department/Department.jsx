import React, { useState, useEffect, useMemo } from "react";
import { FiEdit2, FiTrash2, FiPlus, FiHome, FiEye } from "react-icons/fi";
import api from "../../../api/api";
import ReusableTable from "../../../Reusbale/ReusableTable";
import ReusableSearch from "../../../Reusbale/ReusableSearch";
import ReusableConfirm from "../../../Reusbale/ReusableConfirm";
import ReusablePopup from "../../../Reusbale/ReusablePopup";
import ResuableForm from "../../../Reusbale/ReusableForm";
import ReusableDropdown from "../../../Reusbale/ReusableDropdown";
import TextField from "@mui/material/TextField";
import { useForm } from "react-hook-form";
import "./Department.css";

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentNameFilter, setDepartmentNameFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [popupState, setPopupState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const fetchData = async (term) => {
    setLoading(true);
    try {
      const endpoint = term ? `/Department/search?searchTerm=${term}` : "/Department";
      const response = await api.get(endpoint);
      const data = response.data?.$values || response.data || [];
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchTerm) {
      fetchData("");
      return;
    }

    const timer = setTimeout(() => {
      fetchData(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const showPopup = (title, message, type = "success") => {
    setPopupState({ isOpen: true, title, message, type });
  };

  const handleEdit = (row) => {
    setEditingItem(row);
    setValue("departmentName", row.departmentName);
    setValue("description", row.description);
    setIsModalOpen(true);
  };

  const handleView = (row) => {
    setViewingItem(row);
    setIsViewModalOpen(true);
  };

  const handleDelete = (row) => {
    setDeleteItem(row);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/Department/${deleteItem.id}`);
      showPopup("Success!", "Department deleted successfully!");
      fetchData(searchTerm);
    } catch (error) {
      showPopup("Error!", "Failed to delete department.", "error");
    } finally {
      setIsConfirmOpen(false);
      setDeleteItem(null);
    }
  };

  const onSubmit = async (data) => {
    const payload = {
      departmentName: data.departmentName,
      description: data.description,
    };

    try {
      if (editingItem) {
        await api.put("/Department", { ...payload, id: editingItem.id, isActive: editingItem.isActive });
        showPopup("Success!", "Department updated successfully!");
      } else {
        await api.post("/Department", payload);
        showPopup("Success!", "Department added successfully!");
      }
      setIsModalOpen(false);
      reset();
      setEditingItem(null);
      fetchData(searchTerm);
    } catch (error) {
      showPopup("Error!", "Failed to save department.", "error");
    }
  };

  const handleToggleStatus = async (row) => {
    const newStatus = !row.isActive;
    try {
      await api.put(`/Department/set-active/${row.id}?isActive=${newStatus}`);
      showPopup("Success!", `Department ${newStatus ? "activated" : "deactivated"} successfully!`);
      fetchData(searchTerm);
    } catch (error) {
      showPopup("Error!", "Failed to update status.", "error");
    }
  };

  const filteredData = useMemo(() => {
    return departments.filter((item) => {
      const matchesStatus = 
        statusFilter === "" || 
        (statusFilter === "Active" && item.isActive) || 
        (statusFilter === "Inactive" && !item.isActive);

      const matchesDepartment = 
        departmentNameFilter === "" || 
        item.departmentName === departmentNameFilter;

      return matchesStatus && matchesDepartment;
    });
  }, [departments, statusFilter, departmentNameFilter]);

  const columns = [
    { key: "departmentName", label: "Department Name" },
    { 
      key: "description", 
      label: "Description",
      render: (row) => <span className="description-text">{row.description || "N/A"}</span>
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) => (
        <span
          className="d-inline-flex align-items-center justify-content-center text-white fw-bold status-badge-style"
          style={{
            backgroundColor: row.isActive ? "#06A84D" : "#E3B80C",
          }}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <div className="d-flex justify-content-center gap-3 align-items-center">
          <FiEye className="action-icon icon-view" onClick={() => handleView(row)} title="View" />
          <FiEdit2 className="action-icon icon-edit" onClick={() => handleEdit(row)} title="Edit" />
          <FiTrash2 className="action-icon icon-delete" onClick={() => handleDelete(row)} title="Delete" />
          <label className="ios-toggle" title="Toggle Status">
            <input
              type="checkbox"
              checked={row.isActive}
              onChange={() => handleToggleStatus(row)}
            />
            <span className="ios-slider"></span>
          </label>
        </div>
      ),
    },
  ];

  const statusOptions = [
    { label: "All Status", value: "" },
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ];

  return (
    <div className="department-page">
      <div className="department-header">
        <div className="header-left">
          <h2 className="general-title mb-0">Departments</h2>
          <div className="d-flex align-items-center gap-2 breadcrumb-container">
            <FiHome size={14} /> / Settings / <span className="fw-medium text-dark">Department</span>
          </div>
        </div>
        <button
          className="btn text-white d-flex align-items-center gap-2 border-0 shadow-sm add-btn add-btn-custom"
          onClick={() => {
            reset();
            setEditingItem(null);
            setIsModalOpen(true);
          }}
        >
          <FiPlus /> Add Department
        </button>
      </div>

      <div className="department-content card">
        <div className="filter-bar">
          <div className="filter-item">
            <ReusableDropdown
              placeholder="All Department"
              options={departments.filter(d => d.isActive).map(d => ({ label: d.departmentName, value: d.departmentName }))}
              value={departmentNameFilter}
              onChange={(val) => setDepartmentNameFilter(val)}
            />
          </div>
          <div className="filter-item">
             <ReusableDropdown
              placeholder="All Types"
              options={[]}
              value={""}
              onChange={() => {}}
            />
          </div>
          <div className="filter-item">
            <ReusableDropdown
              placeholder="All Status"
              options={statusOptions}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
            />
          </div>
          <button
            className="btn-filter-action btn-clear-emp"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("");
              setDepartmentNameFilter("");
            }}
          >
            Clear
          </button>
          <div className="search-item">
            <ReusableSearch
              placeholder="Search by department name"
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
        </div>

        {filteredData.length > 0 || loading ? (
          <ReusableTable
            columns={columns}
            data={loading ? [] : filteredData}
            isFetching={loading}
          />
        ) : (
          <div className="text-center py-5 rounded-3 bg-light text-muted">
            No records found
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <ResuableForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
          setEditingItem(null);
        }}
        title={editingItem ? "Edit Department" : "Add Department"}
        submitText={editingItem ? "Update Department" : "Create Department"}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mb-3">
          <label className="form-label">Department Name</label>
          <TextField
            placeholder="Enter Department Name"
            fullWidth
            size="small"
            {...register("departmentName", { required: "Department name is required" })}
            error={!!errors.departmentName}
            helperText={errors.departmentName?.message}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <TextField
            placeholder="Enter description..."
            fullWidth
            size="small"
            multiline
            rows={4}
            {...register("description")}
          />
        </div>
      </ResuableForm>

      {/* View Modal */}
      <ResuableForm
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="View Department"
        footer={false}
      >
        {viewingItem && (
          <div className="view-details">
            <div className="detail-row">
              <span className="detail-label">Department Name:</span>
              <span className="detail-value">{viewingItem.departmentName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Description:</span>
              <p className="detail-value">{viewingItem.description || "No description provided."}</p>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className={`detail-value ${viewingItem.isActive ? "status-active" : "status-inactive"}`}>
                {viewingItem.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        )}
        <div className="mt-4 text-end">
          <button className="btn btn-secondary" style={{ borderRadius: '8px', padding: '8px 20px', backgroundColor: '#64748b', border: 'none', color: 'white' }} onClick={() => setIsViewModalOpen(false)}>Close</button>
        </div>
      </ResuableForm>

      <ReusableConfirm
        isOpen={isConfirmOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${deleteItem?.departmentName}"?`}
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

export default Department;
