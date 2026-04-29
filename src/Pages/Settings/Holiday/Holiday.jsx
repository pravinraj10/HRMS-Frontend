import React, { useState, useEffect, useMemo } from "react";
import { FiEdit2, FiTrash2, FiPlus, FiHome, FiEye } from "react-icons/fi";
import api from "../../../api/api";
import ReusableTable from "../../../Reusbale/ReusableTable";
import ReusableSearch from "../../../Reusbale/ReusableSearch";
import ReusableConfirm from "../../../Reusbale/ReusableConfirm";
import ReusablePopup from "../../../Reusbale/ReusablePopup";
import ResuableForm from "../../../Reusbale/ReusableForm";
import TextField from "@mui/material/TextField";
import { useForm } from "react-hook-form";
import "./Holiday.css";

const Holiday = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const response = await api.get("/Holiday");
      const data = response.data?.$values || response.data || [];
      setHolidays(data);
    } catch (error) {
      console.error("Error fetching holidays:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const showPopup = (title, message, type = "success") => {
    setPopupState({ isOpen: true, title, message, type });
  };

  const handleEdit = (row) => {
    setEditingItem(row);
    setValue("title", row.title);
    
    let formattedDate = "";
    if (row.date) {
      const parts = row.date.split(/[\/-]/);
      if (parts.length === 3) {
        formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    
    setValue("holidayDate", formattedDate);
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
      await api.delete(`/Holiday/${deleteItem.id}`);
      showPopup("Success!", "Holiday deleted successfully!");
      fetchHolidays();
    } catch (error) {
      showPopup("Error!", "Failed to delete holiday.", "error");
    } finally {
      setIsConfirmOpen(false);
      setDeleteItem(null);
    }
  };

  const onSubmit = async (data) => {
    const payload = {
      title: data.title,
      holidayDate: data.holidayDate,
      description: data.description,
      createdBy: "Admin",
      updatedBy: "Admin",
    };

    try {
      if (editingItem) {
        await api.put("/Holiday", { ...payload, id: editingItem.id });
        showPopup("Success!", "Holiday updated successfully!");
      } else {
        await api.post("/Holiday", payload);
        showPopup("Success!", "Holiday added successfully!");
      }
      setIsModalOpen(false);
      reset();
      setEditingItem(null);
      fetchHolidays();
    } catch (error) {
      showPopup("Error!", "Failed to save holiday.", "error");
    }
  };

  const handleToggleStatus = async (row) => {
    const newStatus = row.status !== "Active";
    try {
      await api.put(`/Holiday/set-active/${row.id}?isActive=${newStatus}`);
      showPopup("Success!", `Holiday ${newStatus ? "activated" : "deactivated"} successfully!`);
      fetchHolidays();
    } catch (error) {
      showPopup("Error!", "Failed to update status.", "error");
    }
  };

  const filteredData = useMemo(() => {
    return holidays.filter((item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [holidays, searchTerm]);

  const columns = [
    { key: "title", label: "Title" },
    { key: "date", label: "Date" },
    { 
      key: "description", 
      label: "Description",
      render: (row) => <span className="description-text">{row.description}</span>
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className="d-inline-flex align-items-center justify-content-center text-white fw-bold status-badge-style"
          style={{
            backgroundColor: row.status === "Active" ? "#06A84D" : "#E3B80C",
          }}
        >
          {row.status}
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
              checked={row.status === "Active"}
              onChange={() => handleToggleStatus(row)}
            />
            <span className="ios-slider"></span>
          </label>
        </div>
      ),
    },
  ];

  return (
    <div className="holiday-page">
      <div className="holiday-header">
        <div className="header-left">
          <h2 className="general-title mb-0">Holidays</h2>
          <div className="d-flex align-items-center gap-2 breadcrumb-container">
            <FiHome size={14} /> / Settings / <span className="fw-medium text-dark">Holidays</span>
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
          <FiPlus /> Add Holidays
        </button>
      </div>

      <div className="holiday-content card">
        <div className="filter-controls-row">
          <div className="filter-group-left">
            <button
              className="btn-filter-action btn-clear-emp"
              onClick={() => setSearchTerm("")}
            >
              Clear
            </button>
          </div>
          <div className="search-bar-container">
            <ReusableSearch
              placeholder="Search Holiday..."
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
        title={editingItem ? "Edit Holiday" : "Add Holiday"}
        submitText={editingItem ? "Update Holiday" : "Create Holiday"}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mb-3">
          <label className="form-label">Title</label>
          <TextField
            placeholder="Enter Title"
            fullWidth
            size="small"
            {...register("title", { required: "Title is required" })}
            error={!!errors.title}
            helperText={errors.title?.message}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Date</label>
          <TextField
            type="date"
            fullWidth
            size="small"
            {...register("holidayDate", { required: "Date is required" })}
            error={!!errors.holidayDate}
            helperText={errors.holidayDate?.message}
            InputLabelProps={{ shrink: true }}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <TextField
            placeholder="Enter Description"
            fullWidth
            size="small"
            multiline
            rows={3}
            {...register("description")}
          />
        </div>
      </ResuableForm>

      {/* View Modal */}
      <ResuableForm
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="View Holiday"
        footer={false}
      >
        {viewingItem && (
          <div className="view-details">
            <div className="detail-row">
              <span className="detail-label">Title:</span>
              <span className="detail-value">{viewingItem.title}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date:</span>
              <span className="detail-value">{viewingItem.date}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Description:</span>
              <span className="detail-value">{viewingItem.description}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className={`detail-value status-${viewingItem.status?.toLowerCase()}`}>
                {viewingItem.status}
              </span>
            </div>
          </div>
        )}
        <div className="mt-4 text-end">
          <button className="btn btn-secondary" onClick={() => setIsViewModalOpen(false)}>Close</button>
        </div>
      </ResuableForm>

      <ReusableConfirm
        isOpen={isConfirmOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${deleteItem?.title}"?`}
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

export default Holiday;
