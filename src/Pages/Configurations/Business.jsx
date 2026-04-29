import React, { useState } from "react";
import { FiHome, FiUpload, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";
import ReusableSearch from "../../Reusbale/ReusableSearch";
import ReusableTable from "../../Reusbale/ReusableTable";
import ResuableForm from "../../Reusbale/ReusableForm";
import ReusablePopup from "../../Reusbale/ReusablePopup";
import ReusableConfirm from "../../Reusbale/ReusableConfirm";
import api from "../../api/api";
import "./Business.css";
const Business = () => {
  const [activeTab, setActiveTab] = useState("entity");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoFileName, setLogoFileName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [popupState, setPopupState] = useState({ isOpen: false, title: "", message: "", type: "success" });
  const [unitData, setUnitData] = useState([]);
  const [isFetchingUnits, setIsFetchingUnits] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const {
    register: registerEntity,
    handleSubmit: handleSubmitEntity,
    reset: resetEntity,
    setValue: setValueEntity,
    formState: { errors: errorsEntity },
  } = useForm();

  const {
    register: registerUnit,
    handleSubmit: handleSubmitUnit,
    reset: resetUnit,
    setValue: setValueUnit,
    formState: { errors: errorsUnit },
  } = useForm();

  React.useEffect(() => {
    registerEntity("logo", { required: "Logo is required" });
  }, [registerEntity]);

  const fetchUnits = async () => {
    try {
      setIsFetchingUnits(true);
      setFetchError("");
      const res = await api.get("/BusinessUnit");
      setUnitData(res.data);
    } catch (error) {
      console.error("Failed to fetch units:", error);
      const msg = "Failed to load Business Unit data. Please check your connection and try again.";
      setFetchError(msg);
      setPopupState({
        isOpen: true,
        title: "Fetch Error",
        message: msg,
        type: "error"
      });
    } finally {
      setIsFetchingUnits(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === "unit") {
      fetchUnits();
    }
  }, [activeTab]);

  const onInvalid = (errors) => {
    console.error("Validation Errors:", errors);
    setPopupState({
      isOpen: true,
      title: "Validation Error",
      message: "Please fill all required fields correctly. Check the form for highlighted errors.",
      type: "error"
    });
  };

  const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      "& fieldset": { borderColor: "#CFD6E8" },
      "&:hover fieldset": { borderColor: "#136DEC" },
      "&.Mui-focused fieldset": { borderColor: "#136DEC" },
    },
    "& .MuiInputBase-input": { fontSize: "14px", color: "#475569" },
  };

  const onSubmitEntity = async (data) => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("Name", data.name);
      formData.append("Email", data.email);
      formData.append("Logo", logoFile); // actual file
      formData.append("Mobile", data.mobile);
      formData.append("Telephone", data.tel1 || "");
      formData.append("Address1", data.addr1);
      formData.append("Address2", data.addr2 || "");
      formData.append("Address3", data.addr3 || "");
      formData.append("Pincode", data.pincode);
      formData.append("City", data.city);
      formData.append("State", data.state);
      formData.append("Country", data.country);
      formData.append("Gst", data.gst || "");
      formData.append("Website", data.web || "");

      await api.post("/BusinessEntity", formData);

      setPopupState({
        isOpen: true,
        title: "Success!",
        message: "Business Entity Created Successfully.",
        type: "success"
      });

      resetEntity();
      setLogoFile(null);
      setLogoFileName("");
    } catch (error) {
      console.error("API Error:", error.response || error);
      const errorMsg =
        error.response?.data?.message ||
        JSON.stringify(error.response?.data?.errors) ||
        error.message ||
        "Unknown error";
      setPopupState({
        isOpen: true,
        title: "Error",
        message: `Error creating entity. Details: ${errorMsg}`,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitUnit = async (data) => {
    try {
      setLoading(true);
      
      const payload = {
        unitCode: data.unitId,
        unitName: data.unitName,
        isActive: true,
        isDelete: false
      };

      if (editingId) {
        payload.id = editingId;
        await api.put(`/BusinessUnit/${editingId}`, payload);
      } else {
        await api.post("/BusinessUnit", payload);
      }

      setPopupState({
        isOpen: true,
        title: "Success!",
        message: `Business Unit ${editingId ? "Updated" : "Created"} Successfully.`,
        type: "success"
      });
      fetchUnits();
      closeModal();
    } catch (error) {
      console.error("API Error:", error);
      setPopupState({
        isOpen: true,
        title: "Error",
        message: "Failed to save Business Unit.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetUnit();
    setEditingId(null);
  };

  const handleEditUnit = (row) => {
    setEditingId(row.id);
    setValueUnit("unitId", row.unitCode);
    setValueUnit("unitName", row.unitName);
    setIsModalOpen(true);
  };

  const handleDeleteUnit = (row) => {
    setDeleteItem(row);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    try {
      await api.delete(`/BusinessUnit/${deleteItem.id}`);
      fetchUnits();
      setPopupState({
        isOpen: true,
        title: "Deleted!",
        message: "Business Unit deleted successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Delete Error:", error);
      setPopupState({
        isOpen: true,
        title: "Error",
        message: "Failed to delete Business Unit.",
        type: "error",
      });
    } finally {
      setIsConfirmOpen(false);
      setDeleteItem(null);
    }
  };

  const unitColumns = [
    { key: "unitCode", label: "Unit ID" },
    { key: "unitName", label: "Unit" },
    {
      key: "action",
      label: "Actions",
      render: (row) => (
        <div className="d-flex justify-content-center gap-3">
          <FiEdit2
            style={{ cursor: "pointer" }}
            className="text-success "
            size={18}
            onClick={() => handleEditUnit(row)}
          />
          <FiTrash2
            className="text-danger "
            size={18}
            style={{ cursor: "pointer" }}
            onClick={() => handleDeleteUnit(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="container-fluid business-wrapper overflow-hidden">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: "24px" }}>
            {activeTab === "entity" ? "Business Entity" : "Business Units"}
          </h2>
          <div
            className="d-flex align-items-center gap-2"
            style={{ fontSize: "12px", color: "#94a3b8" }}
          >
            <FiHome size={14} /> / Configuration /{" "}
            <span className="fw-medium text-dark">
              {activeTab === "entity" ? "Business Entity" : "Business Units"}
            </span>
          </div>
        </div>

        {activeTab === "unit" && (
          <button
            className="btn text-white d-flex align-items-center gap-2 border-0 shadow-sm"
            style={{
              backgroundColor: "#1a56a6",
              padding: "10px 18px",
              borderRadius: "6px",
              fontSize: "14px",
            }}
            onClick={() => {
              resetUnit();
              setEditingId(null);
              setIsModalOpen(true);
            }}
          >
            <FiPlus /> Add Units
          </button>
        )}
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="d-flex border-bottom bg-white rounded-top-4 pt-2">
          <button
            className={`tab-btn ${activeTab === "entity" ? "active" : ""}`}
            onClick={() => setActiveTab("entity")}
          >
            Business Entity
          </button>
          <button
            className={`tab-btn ${activeTab === "unit" ? "active" : ""}`}
            onClick={() => setActiveTab("unit")}
          >
            Business Units
          </button>
        </div>

        <div className="card-body p-4 bg-white rounded-bottom-4">
          {activeTab === "entity" ? (
            /* --- Business Entity Form --- */
            <div className="scrollable-content">
              <form onSubmit={handleSubmitEntity(onSubmitEntity, onInvalid)}>
                <div className="row g-3">
                  <div className="col-md-6 d-flex flex-column gap-3">
                    <div>
                      <label className="form-label">
                        Name <span>*</span>
                      </label>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter full name"
                        {...registerEntity("name", {
                          required: "Name is required",
                        })}
                        error={!!errorsEntity.name}
                        helperText={errorsEntity.name?.message}
                        sx={textFieldStyle}
                      />
                    </div>
                    <div>
                      <label className="form-label">
                        Email ID <span>*</span>
                      </label>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter your Email Id"
                        {...registerEntity("email", {
                          required: "Email ID is required",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Invalid email",
                          },
                        })}
                        error={!!errorsEntity.email}
                        helperText={errorsEntity.email?.message}
                        sx={textFieldStyle}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">
                      Logo <span>*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      id="logoUpload"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setLogoFile(file);
                          setLogoFileName(file.name);
                          setValueEntity("logo", file.name, {
                            shouldValidate: true,
                          });
                        }
                      }}
                    />
                    {/* Dynamic Class for Border Logic */}
                    <div
                      className={`logo-upload-box ${errorsEntity.logo ? "logo-error" : ""}`}
                    >
                      <div
                        className="border rounded p-2 mb-2 bg-light d-flex align-items-center justify-content-center"
                        style={{
                          width: "70px",
                          height: "70px",
                          borderStyle: "dashed",
                          borderColor: errorsEntity.logo
                            ? "#ef4444"
                            : "#CFD6E8",
                        }}
                      >
                        <span
                          className="text-center fw-bold"
                          style={{ fontSize: "9px", color: "#1a56a6" }}
                        >
                          YOUR LOGO HERE
                        </span>
                      </div>
                      <p
                        className="text-muted mb-2"
                        style={{ fontSize: "10px" }}
                      >
                        Format : JPG, PNG, SVG | Size : 2MB max.
                      </p>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm px-3 rounded-3"
                          style={{ background: "#136DEC" }}
                          onClick={() =>
                            document.getElementById("logoUpload").click()
                          }
                        >
                          <FiUpload /> Upload
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-custom btn-sm px-3"
                          onClick={() => {
                            setLogoFile(null);
                            setLogoFileName("");
                            setValueEntity("logo", "", {
                              shouldValidate: true,
                            });
                          }}
                        >
                          Clear
                        </button>
                      </div>
                      {logoFileName && (
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#16a34a",
                            marginTop: "10px",
                          }}
                        >
                          Selected: {logoFileName}
                        </p>
                      )}
                    </div>

                    {errorsEntity.logo && (
                      <span
                        style={{
                          color: "#d32f2f",
                          fontSize: "12px",
                          marginLeft: "5px",
                        }}
                      >
                        {errorsEntity.logo.message}
                      </span>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Mobile No. <span>*</span>
                    </label>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter your mobile no."
                      {...registerEntity("mobile", {
                        required: "Mobile No. is required",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Must be 10 digits",
                        },
                      })}
                      onInput={(e) => {
                        e.target.value = e.target.value
                          .replace(/[^0-9]/g, "")
                          .slice(0, 10);
                      }}
                      error={!!errorsEntity.mobile}
                      helperText={errorsEntity.mobile?.message}
                      sx={textFieldStyle}
                    />
                  </div>

                  {[
                    {
                      label: "Telephone No.",
                      placeholder: "Enter telephone no.",
                      name: "tel1",
                      req: false,
                    },
                    {
                      label: "Address 1 *",
                      placeholder: "Enter your address",
                      name: "addr1",
                      req: true,
                    },
                    {
                      label: "Address 2",
                      placeholder: "Enter your address",
                      name: "addr2",
                      req: false,
                    },
                    {
                      label: "Address 3",
                      placeholder: "Enter your address",
                      name: "addr3",
                      req: false,
                    },
                    {
                      label: "Pin Code *",
                      placeholder: "Enter Pin Code",
                      name: "pincode",
                      req: true,
                    },
                    {
                      label: "City *",
                      placeholder: "Enter your city",
                      name: "city",
                      req: true,
                    },
                    {
                      label: "State *",
                      placeholder: "Enter your state",
                      name: "state",
                      req: true,
                    },
                    {
                      label: "Country *",
                      placeholder: "Enter your country",
                      name: "country",
                      req: true,
                    },
                    {
                      label: "GST No",
                      placeholder: "Enter your GST No",
                      name: "gst",
                      req: false,
                    },
                    {
                      label: "Website",
                      placeholder: "Enter your Website",
                      name: "web",
                      req: false,
                    },
                  ].map((f) => (
                    <div className="col-md-6" key={f.name}>
                      <label className="form-label">
                        {f.label.split("*")[0]} {f.req && <span>*</span>}
                      </label>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={f.placeholder}
                        {...registerEntity(
                          f.name,
                          f.req
                            ? {
                                required: `${f.label.replace("*", "").trim()} is required`,
                              }
                            : {},
                        )}
                        error={f.req && !!errorsEntity[f.name]}
                        helperText={f.req ? errorsEntity[f.name]?.message : ""}
                        sx={textFieldStyle}
                      />
                    </div>
                  ))}
                </div>
                <div className="d-flex justify-content-end gap-2 mt-5">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary px-5 py-2 fw-bold"
                    style={{ background: "#136DEC", borderRadius: "8px" }}
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-custom px-5 py-2 fw-bold"
                    onClick={() => {
                      resetEntity();
                      setLogoFile(null);
                      setLogoFileName("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              {/* Search Bar Commented as requested */}
              {/* <div style={{ width: "300px", marginLeft: '10px' }}>
                  <ReusableSearch placeholder="Search Unit..." value={searchTerm} onChange={setSearchTerm} />
                </div> */}

              <ReusableTable
                columns={unitColumns}
                data={unitData}
                isFetching={isFetchingUnits}
              />
              {fetchError && (
                <div className="text-danger mt-3 text-center fw-medium">
                  {fetchError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- Reusable Modal for Add/Edit Unit --- */}
      <ResuableForm
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? "Edit Business Unit" : "Add Business Unit"}
        submitText={editingId ? "Update Unit" : "Create Unit"}
        onSubmit={handleSubmitUnit(onSubmitUnit)}
      >
        <div className="row g-3">
          <div className="col-md-12">
            <label className="form-label">
              Unit ID <span>*</span>
            </label>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter Unit ID"
              {...registerUnit("unitId", { required: "Unit ID is required" })}
              error={!!errorsUnit.unitId}
              helperText={errorsUnit.unitId?.message}
              sx={textFieldStyle}
            />
          </div>
          <div className="col-md-12">
            <label className="form-label">
              Unit <span>*</span>
            </label>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter Unit Name"
              {...registerUnit("unitName", {
                required: "Unit Name is required",
              })}
              error={!!errorsUnit.unitName}
              helperText={errorsUnit.unitName?.message}
              sx={textFieldStyle}
            />
          </div>
        </div>
      </ResuableForm>

       <ReusableConfirm
        isOpen={isConfirmOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete unit "${deleteItem?.unitName || "this unit"}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />

      <ReusablePopup 
        isOpen={popupState.isOpen}
        onClose={() => setPopupState(prev => ({ ...prev, isOpen: false }))}
        title={popupState.title}
        message={popupState.message}
        type={popupState.type}
      />
    </div>
  );
};

export default Business;
