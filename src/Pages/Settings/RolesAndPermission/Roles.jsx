import React, { useState, useMemo, useEffect } from "react";
import { FiEdit2, FiTrash2, FiPlus, FiHome, FiEye } from "react-icons/fi";
import ReusableTable from "../../../Reusbale/ReusableTable";
import ReusableSearch from "../../../Reusbale/ReusableSearch";
import ReusableDropdown from "../../../Reusbale/ReusableDropdown";
import ReusableConfirm from "../../../Reusbale/ReusableConfirm";
import ReusablePopup from "../../../Reusbale/ReusablePopup";
import ResuableForm from "../../../Reusbale/ReusableForm";
import { useCrud } from "../../../hooks/useCrud";
import api from "../../../api/api";
import { useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";
import "./Roles.css";


const Roles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState({
    department: "",
    type: "",
    status: "",
  });

  const [visibleCount, setVisibleCount] = useState(10);
  const [isFetching, setIsFetching] = useState(false);
  const [assignedUserCountsByRoleId, setAssignedUserCountsByRoleId] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const [popupState, setPopupState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const { roles, displayedRoles, departments: apiDepartments, loading: crudLoading, create, update, remove, toggleStatus, searchRole } = useCrud();
  const apiData = displayedRoles || roles || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const normalizeKey = (value) =>
    String(value ?? "")
      .trim()
      .toLowerCase();

  const fetchAssignedUsersCount = async () => {
    try {
      const response = await api.get("/Employee");

      const employees = Array.isArray(response.data)
        ? response.data
        : response.data?.$values || [];

      const roleCounts = {};
      const roleNameToId = {};
      (roles || []).forEach((role) => {
        if (role?.name) {
          roleNameToId[normalizeKey(role.name)] = role.id;
        }
      });

      employees.forEach((emp) => {
        const roleId =
          emp.reportingManagerId ??
          emp.reportingManager ??
          emp.reportingManagerID;

        if (roleId !== null && roleId !== undefined && roleId !== "") {
          roleCounts[roleId] = (roleCounts[roleId] || 0) + 1;
          return;
        }

        // Backward compatibility: older records may only have manager name text.
        const managerName =
          emp.reportingManagerName ||
          emp.roleName ||
          emp.manager ||
          emp.reportingManagerLabel ||
          "";
        const mappedRoleId = roleNameToId[normalizeKey(managerName)];
        if (mappedRoleId !== null && mappedRoleId !== undefined) {
          roleCounts[mappedRoleId] = (roleCounts[mappedRoleId] || 0) + 1;
        }
      });

      setAssignedUserCountsByRoleId(roleCounts);
    } catch (error) {
      console.error("Assigned user count error:", error);
    }
  };

  useEffect(() => {
    fetchAssignedUsersCount();
  }, [roles.length, displayedRoles.length]);

  useEffect(() => {
    const handleWindowFocus = () => fetchAssignedUsersCount();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchAssignedUsersCount();
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    // Keep counts fresh if assignments are changed in another tab/window.
    const intervalId = setInterval(fetchAssignedUsersCount, 30000);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(intervalId);
    };
  }, []);

  const getAssignedUsersCount = (row) => {
    return assignedUserCountsByRoleId[row.id] || 0;
  };


  const showPopup = (title, message, type = "success") => {
    setPopupState({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
    setEditingId(null);
  };

  const handleView = (row) => {
    setViewingItem(row);
    setIsViewModalOpen(true);
  };

  const handleToggleStatus = async (row) => {
    const newIsActive = row.status !== "Active";
    try {
      await toggleStatus("Role", row.id, newIsActive);
      showPopup(
        "Success!",
        `Role ${newIsActive ? "activated" : "deactivated"} successfully!`,
        "success"
      );
    } catch (error) {
      console.error("Toggle error:", error);
      showPopup("Error!", "Failed to update status. Please try again.", "error");
    }
  };

  const handleEdit = (row) => {
    setValue("name", row.name);
    setValue("department", row.department);
    setValue("departmentId", row.departmentId);
    setValue("type", row.type);
    setValue("description", row.description);
    setValue("status", row.status);
    setEditingId(row.id);
    setIsModalOpen(true);
  };

  const handleDelete = (row) => {
    setDeleteItem(row);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    try {
      await remove("roles", deleteItem);
      showPopup("Success!", "Role deleted successfully!", "success");
    } catch (error) {
      console.error("Delete error:", error);
      showPopup("Error!", "Failed to delete role. Please try again.", "error");
    } finally {
      setIsConfirmOpen(false);
      setDeleteItem(null);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmOpen(false);
    setDeleteItem(null);
  };

  const onSubmit = async (data) => {
    const selectedDept = (apiDepartments || []).find(
      (d) => d.departmentName === data.department
    );

    const payload = {
      ...data,
      departmentId: selectedDept?.id || data.departmentId || null,
      status: data.status || "Active",
    };

    try {
      if (editingId) {
        await update("roles", editingId, payload);
        showPopup("Success!", "Role updated successfully!", "success");
      } else {
        await create("roles", payload);
        showPopup("Success!", "Role added successfully!", "success");
      }
      closeModal();
    } catch (error) {
      console.error("Save error:", error);
      showPopup("Error!", "Failed to save role. Please try again.", "error");
    }
  };

  const StatusBadge = ({ status }) => {
    const isActive = status === "Active";
    return (
      <span
        className={`status-badge-style d-inline-flex align-items-center justify-content-center fw-bold text-white ${
          isActive ? "status-badge-active" : "status-badge-inactive"
        }`}
      >
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: "name",
      label: "Roles Name",
      className: "fw-semibold text-role-name",
      headerClassName: "text-white",
    },
    { key: "department", label: "Department", className: "text-secondary" },
    { key: "description", label: "Description", className: "text-secondary" },
    {
      key: "users",
      label: "Assigned User",
      className: "text-center",
      render: (row) => {
        const assignedUsersCount = getAssignedUsersCount(row);
        return (
          <span className="assigned-user-badge">
            {assignedUsersCount}
          <span className="assigned-user-label">
              {assignedUsersCount === 1 ? " Employee" : " Employees"}
            </span>
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <div className="d-flex justify-content-center align-items-center gap-2">
          <FiEye
            className="action-icon icon-view"
            onClick={() => handleView(row)}
            title="View"
          />
          <FiEdit2
            className="action-icon icon-edit"
            onClick={() => handleEdit(row)}
            title="Edit"
          />
          <FiTrash2
            className="action-icon icon-delete"
            onClick={() => handleDelete(row)}
            title="Delete"
          />
          <label className="ios-toggle" title={row.status === "Active" ? "Deactivate" : "Activate"} style={{ margin: 0 }}>
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

  const departmentOptions = (apiDepartments || [])
    .filter(d => d.isActive)
    .map((d) => ({ label: d.departmentName, value: d.departmentName }));

  const formFields = [
    {
      name: "name",
      label: "Role Name",
      type: "text",
      placeholder: "Enter Role Name",
    },
    {
      name: "department",
      label: "Department",
      type: "select",
      placeholder: "Select Department",
      options: departmentOptions,
    },
    {
      name: "type",
      label: "Role Type",
      type: "text",
      placeholder: "Enter Role Type",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Enter Here...",
    },
  ];

  const handleFilterChange = (key, value) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const filteredData = useMemo(() => {
    const data = apiData.filter((item) => {
      const matchSearch =
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchFilter = Object.entries(filterValues).every(([key, val]) =>
        !val ? true : item[key] === val,
      );

      return matchSearch && matchFilter;
    });

    return data.sort((a, b) => a.name.localeCompare(b.name));
  }, [apiData, searchTerm, filterValues]);

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
    <div
      className="p-3 p-md-4 min-vh-100"
      style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="header-titles">
          <h2
            className="title-custom fw-bold text-dark mb-1"
            style={{ fontSize: "24px" }}
          >
            Roles & Permission
          </h2>

          <div
            className="d-flex align-items-center gap-2"
            style={{ fontSize: "12px", color: "#94a3b8" }}
          >
            <FiHome size={14} /> / Configuration /{" "}
            <span className="fw-medium text-dark">Roles & Permission</span>
          </div>
        </div>

        <button
          className="btn custom-primary-btn d-flex align-items-center justify-content-center gap-2 fw-medium border-0 px-4"
          style={{ height: "42px", borderRadius: "8px" }}
          onClick={() => {
            reset();
            setEditingId(null);
            setIsModalOpen(true);
          }}
        >
          <FiPlus /> Add Role
        </button>
      </div>

      {/* Content Card */}
      <div
        className="card border-0 shadow-sm bg-white"
        style={{ borderRadius: "12px", padding: "20px" }}
      >
        {/* Filter & Search Bar Section */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          {/* Left Side: Dropdowns */}
          <div className="d-flex flex-wrap gap-2">
            <div style={{ width: "180px" }}>
              <ReusableDropdown
                placeholder="All Department"
                options={departmentOptions}
                value={filterValues.department}
                onChange={(val) => handleFilterChange("department", val)}
              />
            </div>
            <div style={{ width: "160px" }}>
              <ReusableDropdown
                placeholder="All Types"
                options={[
                  { label: "Full-Time", value: "Full-Time" },
                  { label: "Part-Time", value: "Part-Time" },
                ]}
                value={filterValues.type}
                onChange={(val) => handleFilterChange("type", val)}
              />
            </div>
            <div style={{ width: "160px" }}>
              <ReusableDropdown
                placeholder="All Status"
                options={[
                  { label: "Active", value: "Active" },
                  { label: "InActive", value: "InActive" },
                ]}
                value={filterValues.status}
                onChange={(val) => handleFilterChange("status", val)}
              />
            </div>
          </div>

          {/* Right Side: Search Bar */}
          <div className="search-container" style={{ minWidth: "320px" }}>
            <ReusableSearch
              placeholder="Search Role"
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val);
                if (searchRole) searchRole(val);
              }}
            />
          </div>
        </div>

        {/* Table Section */}
        {filteredData && filteredData.length > 0 ? (
          <ReusableTable
            columns={columns}
            data={crudLoading ? [] : paginatedData}
            isFetching={crudLoading || isFetching}
            onLoadMore={loadMore}
          />
        ) : (
          <div className="text-center p-5 text-secondary">
            <p className="mb-0">No records found</p>
          </div>
        )}
      </div>

      <ResuableForm
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? "Edit Role" : "Add New Roles"}
        submitText={editingId ? "Update Role" : "Create Role"}
        onSubmit={handleSubmit(onSubmit)}
      >
        {formFields.map((field, index) => (
          <div className="mb-3" key={index}>
            <label
              className="form-label text-dark fw-medium mb-1"
              style={{ fontSize: "14px" }}
            >
              {field.label}
            </label>

            {field.type === "text" || field.type === "textarea" ? (
              <TextField
                placeholder={field.placeholder}
                fullWidth
                size="small"
                variant="outlined"
                multiline={field.type === "textarea"}
                rows={field.type === "textarea" ? 3 : 1}
                error={!!errors[field.name]}
                helperText={errors[field.name]?.message}
                {...register(field.name, {
                  required: `${field.label} is required`,
                })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                    "& fieldset": { borderColor: "#d1d5db" },
                    "&:hover fieldset": { borderColor: "#9ca3af" },
                    "&.Mui-focused fieldset": { borderColor: "#1e5baf" },
                  },
                  "& .MuiInputBase-input": {
                    padding: "10px 12px",
                    fontSize: "14px",
                    color: "#374151",
                  },
                  "& .MuiInputBase-multiline": {
                    padding: "10px 12px",
                  },
                }}
              />
            ) : (
              <div className="d-flex flex-column">
                <input
                  type="hidden"
                  {...register(field.name, {
                    required: `${field.label} is required`,
                  })}
                />
                <ReusableDropdown
                  placeholder={field.placeholder}
                  options={field.options}
                  value={watch(field.name) || ""}
                  error={!!errors[field.name]}
                  onChange={(val) => {
                    setValue(field.name, val, { shouldValidate: true });
                  }}
                />
                {errors[field.name] && (
                  <span
                    className="text-danger mt-1 ms-2"
                    style={{
                      fontSize: "12px",
                      fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
                    }}
                  >
                    {errors[field.name]?.message}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </ResuableForm>

      <ResuableForm
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="View Role"
        footer={false}
      >
        {viewingItem && (
          <div className="view-details">
            <div className="detail-row">
              <span className="detail-label">Role Name:</span>
              <span className="detail-value">{viewingItem.name || "N/A"}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Department:</span>
              <span className="detail-value">{viewingItem.department || "N/A"}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Role Type:</span>
              <span className="detail-value">{viewingItem.type || "N/A"}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Description:</span>
              <span className="detail-value">{viewingItem.description || "N/A"}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Assigned User:</span>
              <span className="detail-value">{getAssignedUsersCount(viewingItem)}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span>
                <StatusBadge status={viewingItem.status || "Inactive"} />
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 text-end">
          <button
            className="btn btn-secondary view-close-btn"
            onClick={() => setIsViewModalOpen(false)}
          >
            Close
          </button>
        </div>
      </ResuableForm>

      <ReusableConfirm
        isOpen={isConfirmOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${deleteItem?.name || "this role"}?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
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

export default Roles;
