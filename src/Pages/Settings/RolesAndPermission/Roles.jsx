import React, { useState, useMemo, useEffect } from "react";
import { FiEdit2, FiTrash2, FiPlus, FiHome, FiEye } from "react-icons/fi";
import ReusableTable from "../../../Reusbale/ReusableTable";
import ReusableSearch from "../../../Reusbale/ReusableSearch";
import ReusableDropdown from "../../../Reusbale/ReusableDropdown";
import ReusableConfirm from "../../../Reusbale/ReusableConfirm";
import ReusablePopup from "../../../Reusbale/ReusablePopup";
import ResuableForm from "../../../Reusbale/ReusableForm";
import { useCrud } from "../../../hooks/useCrud";
import { useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";

// const getDepartments = () => ["Engineer", "HR", "Sales", "Product", "Finance"];
// const departments = getDepartments();

const mockRolesData = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Senior Software Engineer`,
  // department: departments[i % departments.length],
  type: "Full-Time",
  description: "Lead technical implementation and architecture decisions",
  users: Math.floor(Math.random() * 50) + 1,
  status: i % 3 === 0 ? "InActive" : "Active",
}));

const Roles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState({
    department: "",
    type: "",
    status: "",
  });

  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const [isFetching, setIsFetching] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const [popupState, setPopupState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const { roles, departments: apiDepartments, loading: crudLoading, create, update, remove } = useCrud();
  const apiData = roles && roles.length > 0 ? roles : mockRolesData;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1200);
  }, []);

  const showPopup = (title, message, type = "success") => {
    setPopupState({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
    setEditingId(null);
  };

  const handleView = (row) => console.log("View", row);

  const handleEdit = (row) => {
    Object.keys(row).forEach((key) => {
      setValue(key, row[key]);
    });
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
    const payload = {
      ...data,
      status: data.status || "Active",
      users: data.users || 0,
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
        className="badge-custom d-inline-flex align-items-center justify-content-center fw-bold text-white rounded"
        style={{
          backgroundColor: isActive ? "#06A84D" : "#E3B80C",
          borderRadius: "8px",
        }}
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
    },
    { key: "department", label: "Department", className: "text-secondary" },
    { key: "description", label: "Description", className: "text-secondary" },
    {
      key: "users",
      label: "Assigned User",
      className: "text-center text-secondary",
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
        <div className="d-flex align-items-center action-icons-container">
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
      <style>{`
      .text-role-name { color: #212121 !important; }
        .custom-primary-btn {
          background-color: #1e5baf;
          color: #ffffff;
          padding: 0.625rem 1.25rem;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: background-color 0.2s;
        }
        .custom-primary-btn:hover {
          background-color: #15468a;
          color: #ffffff;
        }
        .title-custom { font-size: 1.5rem; }
        .breadcrumb-custom { font-size: 12px; color: #94a3b8; }
        .breadcrumb-custom span { color: #4b5563; }
        .badge-custom {
          padding: 6px 16px;
          font-size: 13px;
          min-width: 100px;
          height: 32px;
          letter-spacing: 0.3px;
        }
        .action-icons-container { gap: 1rem; }
        .action-icon {
          cursor: pointer;
          width: 1.125rem;
          height: 1.125rem;
          transition: opacity 0.2s, transform 0.1s;
        }
        .action-icon:active { transform: scale(0.9); }
        .icon-view { color: #136DEC; }
        .icon-edit { color: #6b7280; }
        .icon-delete { color: #ef4444; }
        
       
      `}</style>

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
              onChange={setSearchTerm}
            />
          </div>
        </div>

        {/* Table Section */}
        {filteredData && filteredData.length > 0 ? (
          <ReusableTable
            columns={columns}
            data={loading ? [] : paginatedData}
            isFetching={loading || isFetching}
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
