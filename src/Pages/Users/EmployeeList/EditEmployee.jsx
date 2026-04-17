import React, { useState, useEffect } from "react";
import { FiHome, FiChevronDown } from "react-icons/fi";
import { BiExport } from "react-icons/bi";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { MdOutlineModeEdit } from "react-icons/md";
import { LuCloudUpload } from "react-icons/lu";
import { FaFileAlt, FaIdCard, FaRegFilePdf } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import profileImg from "../../../asset/image/profile.jpg";
import { useCrudEmployee } from "../../../hooks/useCrudEmployee";
import ReusablePopup from "../../../Reusbale/ReusablePopup";
import "./EditEmployee.css";

const EditEmployee = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { employees, update, getById } = useCrudEmployee();
  
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);

  // States for enabling edits per section
  const [editPersonalInfo, setEditPersonalInfo] = useState(false);
  const [editJobDetails, setEditJobDetails] = useState(false);
  const [editContactInfo, setEditContactInfo] = useState(false);

  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const fileInputRef = React.useRef(null);
  const [updatingDoc, setUpdatingDoc] = useState(null);
  const [documentName, setDocumentName] = useState("");
  const [popupState, setPopupState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const showPopup = (title, message, type = "success") => {
    setPopupState({ isOpen: true, title, message, type });
  };

  const triggerDocUpdate = (type, index = null) => {
    if (type === 'newIdProof' && !documentName.trim()) {
      showPopup("Notice", "Please enter a document name (e.g., Aadhar) before uploading.", "error");
      return;
    }
    setUpdatingDoc({ type, index });
    fileInputRef.current && fileInputRef.current.click();
  };

  const handleDocUpdate = (e) => {
    const file = e.target.files[0];
    if (file && updatingDoc) {
      setEmployeeData((prev) => {
        const newData = { ...prev };
        if (updatingDoc.type === 'newIdProof') {
          const newIdProofs = [...(newData.idProofs || [])];
          newIdProofs.push({ [documentName.trim()]: file.name });
          newData.idProofs = newIdProofs;
          setDocumentName(""); // Clear after adding
        } else if (updatingDoc.type === 'idProof' && updatingDoc.index !== null) {
          const newIdProofs = [...(newData.idProofs || [])];
          const oldObj = newIdProofs[updatingDoc.index];
          const oldKey = Object.keys(oldObj)[0];
          newIdProofs[updatingDoc.index] = { [oldKey]: file.name };
          newData.idProofs = newIdProofs;
        }
        return newData;
      });
      setUpdatingDoc(null);
      e.target.value = null; // Reset to allow re-selection
    }
  };

  // Load employee data into form
  useEffect(() => {
    if (!id || employees.length === 0 || isDataLoaded) return;
    
    const employee = getById(id);
    if (employee) {
      setEmployeeData(employee);
      reset({
        fullName: employee.name || "",
        gender: employee.gender || "",
        dob: employee.dob || "",
        email: employee.email || "",
        phone: employee.phone || "",
        department: employee.department || "",
        designation: employee.designation || "",
        manager: employee.manager || "",
        joiningDate: employee.joiningDate || "",
        employeeId: employee.id || "",
        shift: employee.shift || "",
        officeEmail: employee.email || "", // Fallback to personal email if not distinguished
        emergencyContact: employee.emergencyContact || "",
        address: employee.address || "",
      });
      setIsDataLoaded(true);
    }
  }, [id, employees, getById, reset, isDataLoaded]);

  const onSubmit = async (data) => {
    setLoading(true);
    
    const payload = {
      ...employeeData, // Start with all current data to preserve unedited fields like profilePhoto, idProofs, contract
      name: data.fullName,
      gender: data.gender,
      dob: data.dob,
      email: data.email,
      phone: data.phone,
      department: data.department,
      designation: data.designation,
      manager: data.manager,
      joiningDate: data.joiningDate,
      shift: data.shift,
      emergencyContact: data.emergencyContact,
      address: data.address,
      status: employeeData?.status || "Active"
    };

    const res = await update(id, payload);
    setLoading(false);
    
    if (res.success) {
      showPopup("Success!", "Employee details updated successfully!");
    } else {
      showPopup("Error!", "Failed to update employee.", "error");
    }
  };

  const getTextFieldStyle = (isDisabled) => ({
    "& .MuiOutlinedInput-root": {
      borderRadius: "6px",
      backgroundColor: isDisabled ? "#FAFBFC" : "#ffffff",
      "& fieldset": { borderColor: isDisabled ? "#E2E8F0" : "#cbd5e1" },
      "&:hover fieldset": { borderColor: isDisabled ? "#E2E8F0" : "#136DEC" },
      "&.Mui-focused fieldset": { borderColor: isDisabled ? "#E2E8F0" : "#136DEC" },
      fontSize: { xs: "13px", md: "14px" }
    },
    "& .MuiInputBase-input": { 
      color: isDisabled ? "#64748B" : "#475569",
      "-webkit-text-fill-color": isDisabled ? "#64748B !important" : "initial",
    },
    "& .MuiFormHelperText-root": { 
      fontSize: { xs: "11px", md: "12px" }, 
      marginLeft: "0px",
      marginTop: "4px"
    }
  });

  return (
    <div className="edit-employee-wrapper">
      <form onSubmit={handleSubmit(onSubmit)}>
        
        {/* Header section */}
        <div className="d-flex justify-content-between align-items-center mb-4 header-actions-flex">
          <div>
            <h2 className="edit-employee-title">Edit Employee</h2>
            <div className="d-flex align-items-center gap-2 breadcrumb-container">
              <FiHome size={14} /> / <span>Employee Management</span> / <span className="fw-medium text-dark">Edit Employee</span>
            </div>
          </div>
          <button type="button" className="btn-export-top">
            <BiExport size={16} /> Export <FiChevronDown size={14} />
          </button>
        </div>

        {/* Profile Bar - Fixed at top below header */}
        <div className="profile-bar-card mb-4 d-flex align-items-center gap-3">
           <div className="profile-avatar">
             <img src={employeeData?.profilePhoto ? (employeeData.profilePhoto.startsWith('http') ? employeeData.profilePhoto : `http://localhost:4000/${employeeData.profilePhoto}`) : profileImg} alt="Profile" />
           </div>
           <div>
             <h4 className="profile-name mb-0">{employeeData?.name || "Loading..."}</h4>
             <span className="profile-emp-id">EMP ID: {employeeData?.id || "EMP_..."}</span>
           </div>
        </div>

        {/* Form Body directly scrollable */}
        <div className="edit-employee-form-scroll">
          <div className="row">
            <div className="col-12">
              
              {/* Personal Information */}
              <div className="edit-section-card mb-4">
                <div className="section-header d-flex justify-content-between align-items-center mb-4">
                  <h3 className="section-title m-0">Personal Information</h3>
                  <button type="button" className="btn-edit-icon" onClick={() => setEditPersonalInfo(!editPersonalInfo)}>
                     <MdOutlineModeEdit size={18} />
                  </button>
                </div>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label-custom">Full Name</label>
                    <TextField
                      fullWidth size="small" placeholder="Enter full name"
                      {...register("fullName", { required: "Full Name is required" })}
                      error={!!errors.fullName} helperText={errors.fullName?.message}
                      disabled={!editPersonalInfo} sx={getTextFieldStyle(!editPersonalInfo)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">Gender</label>
                    <Controller
                        name="gender" control={control} rules={{ required: `Gender is required` }} defaultValue=""
                        render={({ field }) => (
                          <TextField
                            {...field} select fullWidth size="small"
                            error={!!errors.gender} helperText={errors.gender?.message}
                            disabled={!editPersonalInfo} sx={getTextFieldStyle(!editPersonalInfo)}
                          >
                            <MenuItem disabled value=""><em>Select gender</em></MenuItem>
                            {["Male", "Female", "Other"].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                          </TextField>
                        )}
                      />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label-custom">Date of Birth</label>
                    <TextField
                      fullWidth size="small" type="text" placeholder="Select date"
                      onFocus={(e) => { if (editPersonalInfo) e.target.type = "date"; }}
                      onBlur={(e) => !e.target.value && (e.target.type = "text")}
                      {...register("dob", { required: "Date of Birth is required" })}
                      error={!!errors.dob} helperText={errors.dob?.message}
                      disabled={!editPersonalInfo} sx={getTextFieldStyle(!editPersonalInfo)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">Personal Email</label>
                    <TextField
                      fullWidth size="small" placeholder="Enter personal email"
                      {...register("email", { 
                        required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" }
                      })}
                      error={!!errors.email} helperText={errors.email?.message}
                      disabled={!editPersonalInfo} sx={getTextFieldStyle(!editPersonalInfo)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label-custom">Personal Phone</label>
                    <TextField
                      fullWidth size="small" placeholder="Enter personal phone"
                      {...register("phone", { 
                        required: "Phone is required", pattern: { value: /^[0-9]{10}$/, message: "Must be 10 digits" }
                      })}
                      onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10)}
                      error={!!errors.phone} helperText={errors.phone?.message}
                      disabled={!editPersonalInfo} sx={getTextFieldStyle(!editPersonalInfo)}
                    />
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="edit-section-card mb-4">
                <div className="section-header d-flex justify-content-between align-items-center mb-4">
                  <h3 className="section-title m-0">Job Details</h3>
                  <button type="button" className="btn-edit-icon" onClick={() => setEditJobDetails(!editJobDetails)}>
                     <MdOutlineModeEdit size={18} />
                  </button>
                </div>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label-custom">Department</label>
                    <Controller
                        name="department" control={control} rules={{ required: `Department is required` }} defaultValue=""
                        render={({ field }) => (
                          <TextField
                            {...field} select fullWidth size="small"
                            error={!!errors.department} helperText={errors.department?.message}
                            disabled={!editJobDetails} sx={getTextFieldStyle(!editJobDetails)}
                          >
                            <MenuItem disabled value=""><em>Select department</em></MenuItem>
                            {["Marketing", "Sales", "Finance", "HR", "IT", "Operations"].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                          </TextField>
                        )}
                      />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">Designation</label>
                    <Controller
                        name="designation" control={control} rules={{ required: `Designation is required` }} defaultValue=""
                        render={({ field }) => (
                          <TextField
                            {...field} select fullWidth size="small"
                            error={!!errors.designation} helperText={errors.designation?.message}
                            disabled={!editJobDetails} sx={getTextFieldStyle(!editJobDetails)}
                          >
                            <MenuItem disabled value=""><em>Select designation</em></MenuItem>
                            {["Manager", "Representative", "Analyst", "Developer", "Specialist"].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                          </TextField>
                        )}
                      />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label-custom">Manager</label>
                    <Controller
                        name="manager" control={control} rules={{ required: `Manager is required` }} defaultValue=""
                        render={({ field }) => (
                          <TextField
                            {...field} select fullWidth size="small"
                            error={!!errors.manager} helperText={errors.manager?.message}
                            disabled={!editJobDetails} sx={getTextFieldStyle(!editJobDetails)}
                          >
                            <MenuItem disabled value=""><em>Select manager</em></MenuItem>
                            {["Alice Smith", "Mark Johnson", "Sarah Connor", "John Doe"].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                          </TextField>
                        )}
                      />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label-custom">Joining Date</label>
                    <TextField
                      fullWidth size="small" type="text" placeholder="Select date"
                      onFocus={(e) => { if(editJobDetails) e.target.type = "date"; }}
                      onBlur={(e) => !e.target.value && (e.target.type = "text")}
                      {...register("joiningDate", { required: "Joining Date is required" })}
                      error={!!errors.joiningDate} helperText={errors.joiningDate?.message}
                      disabled={!editJobDetails} sx={getTextFieldStyle(!editJobDetails)}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label-custom">Employee ID</label>
                    <TextField
                      fullWidth size="small" placeholder="Enter employee ID"
                      {...register("employeeId", { required: "Employee ID is required" })}
                      error={!!errors.employeeId} helperText={errors.employeeId?.message}
                      disabled={true} 
                      sx={{
                        ...getTextFieldStyle(true),
                        "& .MuiOutlinedInput-root": {
                          ...getTextFieldStyle(true)["& .MuiOutlinedInput-root"],
                          backgroundColor: "#F7F7F7 !important"
                        }
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">Shift</label>
                    <Controller
                        name="shift" control={control} rules={{ required: `Shift is required` }} defaultValue=""
                        render={({ field }) => (
                          <TextField
                            {...field} select fullWidth size="small"
                            error={!!errors.shift} helperText={errors.shift?.message}
                            disabled={!editJobDetails} sx={getTextFieldStyle(!editJobDetails)}
                          >
                            <MenuItem disabled value=""><em>Select shift</em></MenuItem>
                            {["Day Shift ( 9am - 7 pm)", "Morning", "Evening", "Night"].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                          </TextField>
                        )}
                      />
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="edit-section-card mb-4">
                 <div className="section-header d-flex justify-content-between align-items-center mb-4">
                  <h3 className="section-title m-0">Contact Details</h3>
                  <button type="button" className="btn-edit-icon" onClick={() => setEditContactInfo(!editContactInfo)}>
                     <MdOutlineModeEdit size={18} />
                  </button>
                </div>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label-custom">Office Email</label>
                    <TextField
                      fullWidth size="small" placeholder="Enter office email"
                      {...register("officeEmail", { required: "Office Email is required" })}
                      error={!!errors.officeEmail} helperText={errors.officeEmail?.message}
                      disabled={!editContactInfo} sx={getTextFieldStyle(!editContactInfo)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">Emergency Contact Number</label>
                    <TextField
                      fullWidth size="small" placeholder="Enter emergency contact"
                      {...register("emergencyContact", { 
                        required: "Emergency Contact is required", pattern: { value: /^[0-9]{10}$/, message: "Must be 10 digits" }
                      })}
                      onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10)}
                      error={!!errors.emergencyContact} helperText={errors.emergencyContact?.message}
                      disabled={!editContactInfo} sx={getTextFieldStyle(!editContactInfo)}
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label-custom">Address</label>
                    <TextField
                      fullWidth multiline rows={4} placeholder="Enter address"
                      {...register("address", { required: "Address is required" })}
                      error={!!errors.address} helperText={errors.address?.message}
                      disabled={!editContactInfo} sx={getTextFieldStyle(!editContactInfo)}
                    />
                  </div>
                </div>
              </div>

              {/* Document Management */}
              <div className="edit-section-card mb-4">
                <div className="section-header mb-4">
                  <h3 className="section-title m-0">Document Management</h3>
                </div>
                
                <div className="d-flex flex-column gap-3">
                  <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleDocUpdate} />
                  
                  {/* New Document Upload Row */}
                  <div className="document-list-item d-flex align-items-center gap-3 p-3 border rounded bg-light-subtle">
                    <TextField 
                      size="small" 
                      placeholder="Doc Name (e.g. Aadhar)" 
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      sx={getTextFieldStyle(false)}
                      className="flex-grow-1"
                    />
                    <button 
                      type="button" 
                      className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                      onClick={() => triggerDocUpdate('newIdProof')}
                    >
                      <LuCloudUpload size={14} /> Add New
                    </button>
                  </div>

                  {employeeData?.idProofs?.map((docObj, idx) => {
                    const docKey = Object.keys(docObj)[0];
                    const docFile = docObj[docKey];
                    return (
                      <div key={`idproof-${idx}`} className="document-list-item d-flex align-items-center justify-content-between p-3 border rounded shadow-sm bg-white">
                         <div className="d-flex align-items-center gap-3">
                            <FaRegFilePdf size={24} className="text-secondary" />
                            <div>
                              <p className="mb-0 fw-medium doc-title">{docKey}: {docFile}</p>
                              <small className="text-muted doc-subtitle">ID Proof</small>
                            </div>
                         </div>
                         <div className="d-flex gap-2">
                           <button 
                              type="button" 
                              className="btn btn-light text-primary btn-sm d-flex align-items-center gap-2 update-doc-btn"
                              onClick={() => triggerDocUpdate('idProof', idx)}
                            >
                              <LuCloudUpload size={14} /> Update
                           </button>
                           <button 
                              type="button" 
                              className="btn btn-light text-danger btn-sm p-2"
                              onClick={() => {
                                setEmployeeData(prev => ({
                                  ...prev,
                                  idProofs: prev.idProofs.filter((_, i) => i !== idx)
                                }));
                              }}
                            >
                              <FiTrash2 size={16} />
                           </button>
                         </div>
                      </div>
                    );
                  })}

                  {!employeeData?.idProofs?.length && (
                    <div className="text-muted small px-2">No documents available.</div>
                  )}
                </div>

              </div>

              {/* Centered Actions */}
              <div className="centered-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="save-btn"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="cancel-line-btn"
                  onClick={() => {
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
          if (popupState.type === "success") navigate("/employee/list");
        }}
        title={popupState.title}
        message={popupState.message}
        type={popupState.type}
      />
    </div>
  );
};

export default EditEmployee;
