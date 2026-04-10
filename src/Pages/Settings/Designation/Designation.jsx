import React, { useState, useEffect, useMemo } from "react";
import { FiEdit2, FiTrash2, FiPlus, FiHome, FiEye, FiX } from "react-icons/fi";
import api from "../../../api/api";
import ReusableTable from "../../../Reusbale/ReusableTable";
import ReusableSearch from "../../../Reusbale/ReusableSearch";
import ReusableConfirm from "../../../Reusbale/ReusableConfirm";
import ReusablePopup from "../../../Reusbale/ReusablePopup";
import ReusableDropdown from "../../../Reusbale/ReusableDropdown";
import ResuableForm from "../../../Reusbale/ReusableForm";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import { useForm, Controller } from "react-hook-form";
import "./Designation.css";

const Designation = () => {
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [allDesignations, setAllDesignations] = useState([]);
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
    control,
    formState: { errors },
  } = useForm();

  const fetchData = async (term) => {
    setLoading(true);
    try {
      const endpoint = term ? `/Designation/search?keyword=${term}` : "/Designation";
      const response = await api.get(endpoint);
      const data = response.data?.$values || response.data || [];
      setDesignations(data);
    } catch (error) {
      console.error("Error fetching designations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/Department");
      const data = response.data?.$values || response.data || [];
      setDepartments(data.filter(d => d.isActive));
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchAllDesignationsForFilter = async () => {
    try {
      const response = await api.get("/Designation");
      const data = response.data?.$values || response.data || [];
      setAllDesignations(data);
    } catch (error) {
      console.error("Error fetching all designations for filter:", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchAllDesignationsForFilter();
  }, []);

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
    setValue("designationName", row.designationName);
    setValue("departmentId", row.departmentId);
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
      await api.delete(`/Designation/${deleteItem.id}`);
      showPopup("Success!", "Designation deleted successfully!");
      fetchData(searchTerm);
      fetchAllDesignationsForFilter();
    } catch (error) {
      showPopup("Error!", "Failed to delete designation.", "error");
    } finally {
      setIsConfirmOpen(false);
      setDeleteItem(null);
    }
  };

  const onSubmit = async (data) => {
    const payload = {
      designationName: data.designationName,
      departmentId: parseInt(data.departmentId),
      description: data.description,
    };

    try {
      if (editingItem) {
        await api.put("/Designation", { ...payload, id: editingItem.id });
        showPopup("Success!", "Designation updated successfully!");
      } else {
        await api.post("/Designation", payload);
        showPopup("Success!", "Designation added successfully!");
      }
      setIsModalOpen(false);
      reset();
      setEditingItem(null);
      fetchData(searchTerm);
      fetchAllDesignationsForFilter();
    } catch (error) {
      showPopup("Error!", "Failed to save designation.", "error");
    }
  };

  const handleToggleStatus = async (row) => {
    const newStatus = !row.isActive;
    try {
      await api.put(`/Designation/set-active/${row.id}?isActive=${newStatus}`);
      showPopup("Success!", `Designation ${newStatus ? "activated" : "deactivated"} successfully!`);
      fetchData(searchTerm);
    } catch (error) {
      showPopup("Error!", "Failed to update status.", "error");
    }
  };

  const filteredData = useMemo(() => {
    return designations.filter((item) => {
      const matchesStatus = 
        statusFilter === "" || 
        (statusFilter === "Active" && item.isActive) || 
        (statusFilter === "Inactive" && !item.isActive);

      const matchesDesignation = 
        designationFilter === "" || 
        item.designationName === designationFilter;

      const matchesDepartment = 
        departmentFilter === "" || 
        item.departmentId === parseInt(departmentFilter);

      return matchesStatus && matchesDesignation && matchesDepartment;
    });
  }, [designations, statusFilter, designationFilter, departmentFilter]);

  const designationOptions = useMemo(() => {
    const uniqueNames = [...new Set(allDesignations.map(d => d.designationName))].sort();
    return uniqueNames.map(name => ({ label: name, value: name }));
  }, [allDesignations]);

  const columns = [
    { key: "designationName", label: "Designation Name" },
    { 
      key: "description", 
      label: "Description",
      render: (row) => <span className="description-text">{row.description || "N/A"}</span>
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className="d-inline-flex align-items-center justify-content-center text-white fw-bold status-badge-style"
          style={{
            backgroundColor: row.isActive ? "#22c55e" : "#ef4444",
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
        <div className="d-flex justify-content-center gap-3 align-items-center action-icons-container">
          <FiEye className="action-icon icon-view" onClick={() => handleView(row)} title="View" />
          <FiEdit2 className="action-icon icon-edit" onClick={() => handleEdit(row)} title="Edit" />
          <FiTrash2 className="action-icon icon-delete" onClick={() => handleDelete(row)} title="Delete" />
          <label className="ios-toggle" title="Toggle Status" style={{ margin: 0 }}>
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
    <div className="designation-page">
      <div className="designation-header">
        <div className="header-left">
          <h2 className="page-title">Designations</h2>
          <div className="breadcrumbs">
            <FiHome size={14} /> / Settings / <span className="current-page">Designation</span>
          </div>
        </div>
        <button
          className="add-btn"
          onClick={() => {
            reset();
            setEditingItem(null);
            setIsModalOpen(true);
          }}
        >
          <FiPlus /> Add Designation
        </button>
      </div>

      <div className="designation-content card">
        <div className="filter-bar">
          <div className="filter-item">
            <ReusableDropdown
              placeholder="All Department"
              options={departments.map(d => ({ label: d.departmentName, value: d.id.toString() }))}
              value={departmentFilter}
              onChange={(val) => setDepartmentFilter(val)}
            />
          </div>
          <div className="filter-item">
            <ReusableDropdown
              placeholder="All Designation"
              options={designationOptions}
              value={designationFilter}
              onChange={(val) => setDesignationFilter(val)}
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
          <div className="search-item">
            <ReusableSearch
              placeholder="Search by designation name"
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
        </div>

        <ReusableTable
          columns={columns}
          data={loading ? [] : filteredData}
          isFetching={loading}
        />
      </div>

      {/* Add/Edit Modal */}
      <ResuableForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
          setEditingItem(null);
        }}
        title={editingItem ? "Edit Designation" : "Add Designation"}
        submitText={editingItem ? "Update Designation" : "Create Designation"}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="form-group mb-3">
          <label className="form-label">Designation Name</label>
          <TextField
            placeholder="Enter Designation Name"
            fullWidth
            size="small"
            {...register("designationName", { required: "Designation name is required" })}
            error={!!errors.designationName}
            helperText={errors.designationName?.message}
          />
        </div>
        <div className="form-group mb-3">
          <label className="form-label">Department Name</label>
          <Controller
            name="departmentId"
            control={control}
            rules={{ required: "Department is required" }}
            defaultValue=""
            render={({ field }) => (
              <FormControl fullWidth size="small" error={!!errors.departmentId}>
                <Select
                  {...field}
                  displayEmpty
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="" disabled>
                    <span style={{ fontStyle: 'normal', color: '#94a3b8' }}>Choose the department</span>
                  </MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.departmentName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.departmentId && (
                  <p style={{ color: '#d32f2f', fontSize: '0.75rem', marginTop: '3px', marginLeft: '14px' }}>
                    {errors.departmentId.message}
                  </p>
                )}
              </FormControl>
            )}
          />
        </div>
        <div className="form-group mb-3">
          <label className="form-label">Description</label>
          <TextField
            placeholder="Enter Here..."
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
        title="View Designation"
        submitText="Close"
        onSubmit={() => setIsViewModalOpen(false)}
      >
        {viewingItem && (
          <div className="view-details">
            <div className="detail-item mb-3">
              <label>Designation Name:</label>
              <p>{viewingItem.designationName}</p>
            </div>
            <div className="detail-item mb-3">
              <label>Department:</label>
              <p>{departments.find(d => d.id === viewingItem.departmentId)?.departmentName || "N/A"}</p>
            </div>
            <div className="detail-item mb-3">
              <label>Description:</label>
              <p>{viewingItem.description || "No description provided."}</p>
            </div>
            <div className="detail-item mb-3">
              <label>Status:</label>
              <span className={`status-badge ${viewingItem.isActive ? "active" : "inactive"}`}>
                {viewingItem.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        )}
      </ResuableForm>

      <ReusableConfirm
        isOpen={isConfirmOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${deleteItem?.designationName}"?`}
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

export default Designation;
