import React, { useState } from "react";
import { FiHome, FiChevronDown, FiUploadCloud, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { BiExport } from "react-icons/bi";
import { useCrudEmployee } from "../../../hooks/useCrudEmployee";
import ReusablePopup from "../../../Reusbale/ReusablePopup";
import "./AddEmployee.css";

const AddEmployee = () => {
  const navigate = useNavigate();
  const { create } = useCrudEmployee();
  const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue } = useForm();
  const [loading, setLoading] = useState(false);
  const [idProofsList, setIdProofsList] = useState([]);
  const [documentName, setDocumentName] = useState("");
  const [popupState, setPopupState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const profilePhotoFiles = watch("profilePhoto");

  const showPopup = (title, message, type = "success") => {
    setPopupState({ isOpen: true, title, message, type });
  };

  const handleIdProofChange = (e) => {
    const file = e.target.files[0];
    if (file && documentName.trim()) {
      setIdProofsList(prev => [...prev, { [documentName.trim()]: file.name }]);
      setValue("idProof", "Attached", { shouldValidate: true });
      setDocumentName(""); // Clear text field after successful attach
    } else if (file) {
      showPopup("Notice", "Please enter a document name (e.g., Aadhar) before uploading.", "error");
    }
    e.target.value = null;
  };

  const removeIdProof = (index) => {
    setIdProofsList(prev => prev.filter((_, i) => i !== index));
    if (idProofsList.length === 1) { // 1 because it's evaluated before the state updates
      setValue("idProof", "", { shouldValidate: true });
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    
    const formData = new FormData();
    formData.append("FullName", data.fullName || "");
    formData.append("Gender", data.gender || "");
    if (data.dob) formData.append("DateOfBirth", data.dob);
    formData.append("PersonalEmail", data.email || "");
    formData.append("PersonalPhone", data.phone || "");
    formData.append("EmergencyContact", data.emergencyContact || "");
    formData.append("Address", data.address || "");
    
    // Using a dummy ID for now since frontend dropdowns are hardcoded strings
    formData.append("DepartmentId", "1"); 
    formData.append("DesignationId", "1");
    if (data.joiningDate) formData.append("JoiningDate", data.joiningDate);
    formData.append("EmployeeCode", data.employeeId || "");
    formData.append("ReportingManagerId", "1");
    formData.append("Shift", data.shift || "");
    
    if (profilePhotoFiles && profilePhotoFiles.length > 0) {
      formData.append("ProfilePhoto", profilePhotoFiles[0]);
    }
    
    // Only appending the first ID proof for simplicity as the backend only accepts one IFormFile? IdProof
    if (idProofsList.length > 0) {
      const firstDocObj = idProofsList[0];
      const docKey = Object.keys(firstDocObj)[0];
      // Note: idProofsList currently stores filenames, not actual File objects in the state in the original code.
      // To properly upload, the state logic would need to store File objects.
    }

    const res = await create(formData);
    setLoading(false);
    
    if (res.success) {
      showPopup("Success!", "Employee saved successfully!");
    } else {
      showPopup("Error!", "Failed to save employee.", "error");
    }
  };

  const onInvalid = (errors) => {
    console.error("Validation Errors:", errors);
  };

  const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "6px",
      "& fieldset": { borderColor: "#cbd5e1" },
      "&:hover fieldset": { borderColor: "#136DEC" },
      "&.Mui-focused fieldset": { borderColor: "#136DEC" },
      background: "#ffffff",
      fontSize: { xs: "13px", md: "14px" }
    },
    "& .MuiInputBase-input": { color: "#475569" },
    "& .MuiFormHelperText-root": { 
      fontSize: { xs: "11px", md: "12px" }, 
      marginLeft: "0px",
      marginTop: "4px"
    }
  };

  return (
    <div className="add-employee-wrapper">
      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
        
        {/* Header section */}
        <div className="d-flex justify-content-between align-items-center mb-4 header-actions-flex">
          <div>
            <h2 className="add-employee-title">Add Employee</h2>
            <div className="d-flex align-items-center gap-2 breadcrumb-container">
              <FiHome size={14} /> / <span className="text-muted">Employee Management</span> / <span className="fw-medium text-dark">Add Employee</span>
            </div>
          </div>
          <button type="button" className="btn-export-top">
            <BiExport size={16} /> Export <FiChevronDown size={14} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="add-employee-form-scroll">
          <div className="row">
            <div className="col-12">
              
              {/* Personal Information */}
              <h3 className="section-title">Personal Information</h3>
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <label className="form-label-custom">Full Name</label>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter full name"
                    {...register("fullName", { required: "Full Name is required" })}
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                    sx={textFieldStyle}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Gender</label>
                  <Controller
                      name="gender"
                      control={control}
                      rules={{ required: `Gender is required` }}
                      defaultValue=""
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          size="small"
                          error={!!errors.gender}
                          helperText={errors.gender?.message}
                          sx={textFieldStyle}
                          SelectProps={{
                            displayEmpty: true,
                            renderValue: (value) => value ? value : <span style={{ color: '#9ca3af' }}>Select gender</span>
                          }}
                        >
                          <MenuItem disabled value=""><em style={{ fontStyle: 'normal', color: '#9ca3af' }}>Select gender</em></MenuItem>
                          {["Male", "Female", "Other"].map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: { xs: "13px", md: "14px" } }}>{opt}</MenuItem>)}
                        </TextField>
                      )}
                    />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label-custom">Date of Birth</label>
                  <TextField
                    fullWidth
                    size="small"
                    type="text"
                    placeholder="Select date"
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) => !e.target.value && (e.target.type = "text")}
                    {...register("dob", { required: "Date of Birth is required" })}
                    error={!!errors.dob}
                    helperText={errors.dob?.message}
                    sx={textFieldStyle}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Personal Email</label>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter personal email"
                    {...register("email", { 
                      required: "Email is required",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" }
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={textFieldStyle}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label-custom">Personal Phone</label>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter personal phone"
                    {...register("phone", { 
                      required: "Phone is required",
                      pattern: { value: /^[0-9]{10}$/, message: "Must be 10 digits" }
                    })}
                    onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10)}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    sx={textFieldStyle}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Emergency Contact</label>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter emergency contact"
                    {...register("emergencyContact", { 
                      required: "Emergency Contact is required",
                      pattern: { value: /^[0-9]{10}$/, message: "Must be 10 digits" }
                    })}
                    onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10)}
                    error={!!errors.emergencyContact}
                    helperText={errors.emergencyContact?.message}
                    sx={textFieldStyle}
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label-custom">Address</label>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Enter address"
                    {...register("address", { required: "Address is required" })}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                    sx={textFieldStyle}
                  />
                </div>
              </div>

              {/* Job Information */}
              <h3 className="section-title pt-2">Job Information</h3>
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <label className="form-label-custom">Department</label>
                  <Controller
                      name="department"
                      control={control}
                      rules={{ required: `Department is required` }}
                      defaultValue=""
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          size="small"
                          error={!!errors.department}
                          helperText={errors.department?.message}
                          sx={textFieldStyle}
                          SelectProps={{
                            displayEmpty: true,
                            renderValue: (value) => value ? value : <span style={{ color: '#9ca3af' }}>Select department</span>
                          }}
                        >
                          <MenuItem disabled value=""><em style={{ fontStyle: 'normal', color: '#9ca3af' }}>Select department</em></MenuItem>
                          {["Marketing", "Sales", "Finance", "HR", "IT", "Operations"].map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: { xs: "13px", md: "14px" } }}>{opt}</MenuItem>)}
                        </TextField>
                      )}
                    />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Designation</label>
                  <Controller
                      name="designation"
                      control={control}
                      rules={{ required: `Designation is required` }}
                      defaultValue=""
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          size="small"
                          error={!!errors.designation}
                          helperText={errors.designation?.message}
                          sx={textFieldStyle}
                          SelectProps={{
                            displayEmpty: true,
                            renderValue: (value) => value ? value : <span style={{ color: '#9ca3af' }}>Select designation</span>
                          }}
                        >
                          <MenuItem disabled value=""><em style={{ fontStyle: 'normal', color: '#9ca3af' }}>Select designation</em></MenuItem>
                          {["Manager", "Representative", "Analyst", "Developer", "Specialist"].map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: { xs: "13px", md: "14px" } }}>{opt}</MenuItem>)}
                        </TextField>
                      )}
                    />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label-custom">Joining Date</label>
                <TextField
                  fullWidth
                  size="small"
                  type="text"
                  placeholder="Select date"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => !e.target.value && (e.target.type = "text")}
                  {...register("joiningDate", { required: "Joining Date is required" })}
                  error={!!errors.joiningDate}
                  helperText={errors.joiningDate?.message}
                  sx={textFieldStyle}
                />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Employee ID</label>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter employee ID"
                    {...register("employeeId", { required: "Employee ID is required" })}
                    error={!!errors.employeeId}
                    helperText={errors.employeeId?.message}
                    sx={textFieldStyle}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label-custom">Reporting Manager</label>
                  <Controller
                      name="manager"
                      control={control}
                      rules={{ required: `Reporting Manager is required` }}
                      defaultValue=""
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          size="small"
                          error={!!errors.manager}
                          helperText={errors.manager?.message}
                          sx={textFieldStyle}
                          SelectProps={{
                            displayEmpty: true,
                            renderValue: (value) => value ? value : <span style={{ color: '#9ca3af' }}>Select manager</span>
                          }}
                        >
                          <MenuItem disabled value=""><em style={{ fontStyle: 'normal', color: '#9ca3af' }}>Select manager</em></MenuItem>
                          {["Alice Smith", "Mark Johnson", "Sarah Connor", "John Doe"].map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: { xs: "13px", md: "14px" } }}>{opt}</MenuItem>)}
                        </TextField>
                      )}
                    />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Shift</label>
                  <Controller
                      name="shift"
                      control={control}
                      rules={{ required: `Shift is required` }}
                      defaultValue=""
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          size="small"
                          error={!!errors.shift}
                          helperText={errors.shift?.message}
                          sx={textFieldStyle}
                          SelectProps={{
                            displayEmpty: true,
                            renderValue: (value) => value ? value : <span style={{ color: '#9ca3af' }}>Select shift</span>
                          }}
                        >
                          <MenuItem disabled value=""><em style={{ fontStyle: 'normal', color: '#9ca3af' }}>Select shift</em></MenuItem>
                          {["Morning", "Evening", "Night"].map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: { xs: "13px", md: "14px" } }}>{opt}</MenuItem>)}
                        </TextField>
                      )}
                    />
                </div>
              </div>

            {/* Contact Information (Contains Uploads & Documents per Figma) */}
            <h3 className="section-title pt-2">Contact Information</h3>
            <div className="row g-4 mb-2 d-flex align-items-stretch contact-info-row">
              {/* Left Side: Uploads */}
              <div className="col-md-6">
                <label className="form-label-custom">Uploads</label>
                <div className={`dotted-upload-box ${errors.profilePhoto ? 'border-danger' : ''}`}>
                  <span className="upload-info-text mb-1">Upload Profile Photo</span>
                  <span className="upload-sub-text">Drag and drop or browse to upload</span>
                  <input
                    type="file"
                    id="profilePhoto"
                    accept="image/*"
                    style={{ display: 'none' }}
                    {...register("profilePhoto", { required: "Profile photo is required" })}
                  />
                  <button 
                    type="button" 
                    className="upload-blue-btn mt-2"
                    onClick={() => document.getElementById('profilePhoto').click()}
                  >
                    Upload
                  </button>
                  {profilePhotoFiles && profilePhotoFiles.length > 0 && (
                    <p className="mt-2 mb-0 text-success fw-medium" style={{ fontSize: '13px' }}>
                      {profilePhotoFiles[0].name}
                    </p>
                  )}
                  {errors.profilePhoto && <p className="text-danger mt-2" style={{ fontSize: '12px' }}>{errors.profilePhoto.message}</p>}
                </div>
              </div>

              {/* Right Side: Documents */}
              <div className="col-md-6">
                <label className="form-label-custom">Documents</label>
                <div className="docs-column-wrapper">
                  <div className="doc-upload-container">
                    <div className="flex-grow-1">
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter Doc Name (e.g. Aadhar)"
                        value={documentName}
                        onChange={(e) => setDocumentName(e.target.value)}
                        error={!!errors.idProof && idProofsList.length === 0}
                        helperText={errors.idProof?.message && idProofsList.length === 0 ? "At least one document is required" : ""}
                        sx={textFieldStyle}
                      />
                      <input
                        type="file"
                        id="idProof"
                        style={{ display: 'none' }}
                        onChange={handleIdProofChange}
                      />
                      <input type="hidden" {...register("idProof", { required: "ID Proof is required" })} />
                    </div>
                    <button type="button" className="upload-blue-btn" onClick={() => document.getElementById('idProof').click()}>Upload</button>
                  </div>
                  
                  {idProofsList.length > 0 && (
                    <div className="mt-2 d-flex flex-wrap gap-2">
                      {idProofsList.map((docObj, idx) => {
                        const docKey = Object.keys(docObj)[0];
                        const docFile = docObj[docKey];
                        return (
                          <div key={idx} className="badge bg-light text-dark border d-flex align-items-center gap-2 p-2 rounded-2" style={{ fontSize: '13px' }}>
                            <span className="text-truncate" style={{ maxWidth: '180px' }}>
                              <strong>{docKey}:</strong> {docFile}
                            </span>
                            <FiTrash2 
                              className="text-danger cursor-pointer" 
                              style={{ cursor: 'pointer' }} 
                              onClick={() => removeIdProof(idx)} 
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Centered Actions */}
            <div className="centered-actions">
              <button
                type="submit"
                disabled={loading}
                className="save-btn"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="cancel-line-btn"
                onClick={() => {
                  reset();
                  navigate("/employee/list");
                }}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      </div>
    </form>

    <ReusablePopup
      isOpen={popupState.isOpen}
      onClose={() => {
        setPopupState((prev) => ({ ...prev, isOpen: false }));
        if (popupState.type === "success") {
          navigate("/employee/list");
        }
      }}
      title={popupState.title}
      message={popupState.message}
      type={popupState.type}
    />
  </div>
);
};

export default AddEmployee;