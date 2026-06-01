import React, { useState, useEffect } from "react";
import { FiHome, FiChevronDown, FiUploadCloud, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { BiExport } from "react-icons/bi";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useCrudEmployee } from "../../../hooks/useCrudEmployee";
import ReusablePopup from "../../../Reusbale/ReusablePopup";
import api from "../../../api/api";
import "./AddEmployee.css";

const AddEmployee = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue } = useForm({
    defaultValues: {
      countryId: "",
      stateId: "",
      cityId: "",
    }
  });
  const [loading, setLoading] = useState(false);
  const [idProofsList, setIdProofsList] = useState([]);
  const [documentName, setDocumentName] = useState("");
  const [popupState, setPopupState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });
  
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [managerOptions, setManagerOptions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { create } = useCrudEmployee();

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const watchCountryId = watch("countryId");
  const watchStateId = watch("stateId");

  console.log("DEBUG AddEmployee:", {
    watchCountryId,
    typeOfCountryId: typeof watchCountryId,
    watchStateId,
    typeOfStateId: typeof watchStateId,
    countriesCount: countries.length,
    statesCount: states.length,
    citiesCount: cities.length
  });

  // Fetch Countries on Mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await api.get("/Country");
        const getArray = (res) => {
          if (Array.isArray(res)) return res;
          if (res?.$values) return res.$values;
          if (res?.data) return res.data;
          return [];
        };
        setCountries(getArray(res.data));
      } catch (err) {
        console.error("Failed to fetch countries", err);
      }
    };
    fetchCountries();
  }, []);

  // Fetch States when Country changes
  useEffect(() => {
    if (!watchCountryId) {
      setStates([]);
      setValue("stateId", "");
      setCities([]);
      setValue("cityId", "");
      return;
    }

    const fetchStates = async () => {
      try {
        const res = await api.get(`/State/by-country/${watchCountryId}`);
        const getArray = (res) => {
          if (Array.isArray(res)) return res;
          if (res?.$values) return res.$values;
          if (res?.data) return res.data;
          return [];
        };
        setStates(getArray(res.data));
        setValue("stateId", "");
        setCities([]);
        setValue("cityId", "");
      } catch (err) {
        console.error("Failed to fetch states", err);
      }
    };
    fetchStates();
  }, [watchCountryId, setValue]);

  // Fetch Cities when State changes
  useEffect(() => {
    if (!watchStateId || !watchCountryId) {
      setCities([]);
      setValue("cityId", "");
      return;
    }

    const fetchCities = async () => {
      try {
        const res = await api.get(`/City/by-country-state?countryId=${watchCountryId}&stateId=${watchStateId}`);
        const getArray = (res) => {
          if (Array.isArray(res)) return res;
          if (res?.$values) return res.$values;
          if (res?.data) return res.data;
          return [];
        };
        setCities(getArray(res.data));
        setValue("cityId", "");
      } catch (err) {
        console.error("Failed to fetch cities", err);
      }
    };
    fetchCities();
  }, [watchStateId, watchCountryId, setValue]);
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get("/Employee/dropdown");

        const rolesData = Array.isArray(res.data)
          ? res.data
          : res.data?.$values || [];

        const activeRoles = rolesData.map(role => ({
          id: role.id,
          label: role.roleName
        }));

        setManagerOptions(activeRoles);

      } catch (error) {
        console.error("Role fetch error:", error);
      }
    };

    fetchRoles();
  }, []);
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [deptRes, desigRes, roleRes] = await Promise.all([
          api.get("/Department"),
          api.get("/Designation"),
          api.get("/Role")
        ]);
        
        const getArray = (res) => {
          if (Array.isArray(res)) return res;
          if (res?.$values) return res.$values;
          if (res?.data) return res.data;
          return [];
        };

        setDepartments(getArray(deptRes.data));
        setDesignations(getArray(desigRes.data));
        setRoles(getArray(roleRes.data));
      } catch (err) {
        console.error("Failed to fetch dropdown data", err);
      }
    };
    fetchDropdownData();
  }, []);

  const profilePhotoFiles = watch("profilePhoto");

  const showPopup = (title, message, type = "success") => {
    setPopupState({ isOpen: true, title, message, type });
  };

  const handleIdProofChange = (e) => {
    const file = e.target.files[0];
    if (file && documentName.trim()) {
      setIdProofsList(prev => [...prev, { name: documentName.trim(), file: file }]);
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
    try {
      const formData = new FormData();
      formData.append("FullName", data.fullName || "");
      formData.append("Gender", data.gender || "");
      if (data.dob) formData.append("DateOfBirth", data.dob);
      formData.append("PersonalEmail", data.email || "");
      formData.append("PersonalPhone", data.phone || "");
      formData.append("EmergencyContact", data.emergencyContact || "");
      formData.append("Password", data.password || "");
      formData.append("ConfirmPassword", data.confirmPassword || "");
      formData.append("Address", data.address || "");
      formData.append("CountryId", String(data.countryId || ""));
      formData.append("StateId", String(data.stateId || ""));
      formData.append("CityId", String(data.cityId || ""));

      formData.append("DepartmentId", String(data.department || ""));
      formData.append("DesignationId", String(data.designation || ""));
      if (data.joiningDate) formData.append("JoiningDate", data.joiningDate);
      formData.append("EmployeeCode", data.employeeId || "");
      formData.append("ReportingManagerId", String(data.manager || ""));
      formData.append("RoleId", String(data.role || ""));
      formData.append("Shift", data.shift || "");
      formData.append("OfficeEmail", data.officeEmail || "");

      if (profilePhotoFiles && profilePhotoFiles.length > 0) {
        formData.append("ProfilePhoto", profilePhotoFiles[0]);
      }

      formData.append("CreatedBy", "admin");

      if (idProofsList.length > 0) {
        formData.append("IdProof", idProofsList[0].file);
      }

      const res = await create(formData);

      if (res.success) {
        showPopup("Success!", "Employee saved successfully!");
      } else {
        showPopup("Error!", res.message || "Failed to save employee.", "error");
      }
    } catch (error) {
      showPopup("Error!", "Failed to save employee.", "error");
    } finally {
      setLoading(false);
    }
  };

  const onInvalid = (errors) => {
    console.error("Validation Errors:", errors);
  };

  const getTextFieldStyle = (isDisabled) => ({
    "& .MuiOutlinedInput-root": {
      borderRadius: "6px",
      backgroundColor: isDisabled ? "#FAFBFC" : "#ffffff",
      "& fieldset": { borderColor: isDisabled ? "#E2E8F0" : "#cbd5e1" },
      "&:hover fieldset": { borderColor: isDisabled ? "#E2E8F0" : "#136DEC" },
      "&.Mui-focused fieldset": {
        borderColor: isDisabled ? "#E2E8F0" : "#136DEC",
      },
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

  const textFieldStyle = getTextFieldStyle(false);

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
          {/* <button type="button" className="btn-export-top">
            <BiExport size={16} /> Export <FiChevronDown size={14} />
          </button> */}
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
                    rules={{ required: "Gender is required" }}
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
                          renderValue: (value) =>
                            value ? value : <span style={{ color: "#9ca3af" }}>Select gender</span>
                        }}
                      >
                        <MenuItem disabled value="">
                          Select gender
                        </MenuItem>
                        {["Male", "Female", "Other"].map((gender) => (
                          <MenuItem key={gender} value={gender}>
                            {gender}
                          </MenuItem>
                        ))}
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

                <div className="col-md-6">
                  <label className="form-label-custom">Password</label>
                  <TextField
                    fullWidth
                    size="small"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    {...register("password", { 
                      required: "Password is required",
                      minLength: { value: 6, message: "Minimum 6 characters required" }
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    sx={textFieldStyle}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Confirm Password</label>
                  <TextField
                    fullWidth
                    size="small"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    {...register("confirmPassword", { 
                      required: "Confirm password is required",
                      validate: (value, formValues) => value === formValues.password || "Passwords do not match"
                    })}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    sx={textFieldStyle}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label-custom">Country</label>
                  <Controller
                    name="countryId"
                    control={control}
                    rules={{ required: "Country is required" }}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        size="small"
                        error={!!errors.countryId}
                        helperText={errors.countryId?.message}
                        sx={textFieldStyle}
                        SelectProps={{
                          displayEmpty: true,
                          renderValue: (value) => {
                            const selected = countries.find(c => String(c.id) === String(value));
                            return selected ? selected.countryName : <span style={{ color: "#9ca3af" }}>Select country</span>;
                          }
                        }}
                      >
                        <MenuItem disabled value="">
                          Select country
                        </MenuItem>
                        {countries.map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.countryName}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label-custom">State</label>
                  <Controller
                    name="stateId"
                    control={control}
                    rules={{ required: "State is required" }}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        size="small"
                        error={!!errors.stateId}
                        helperText={errors.stateId?.message}
                        sx={getTextFieldStyle(!watchCountryId)}
                        disabled={!watchCountryId}
                        SelectProps={{
                          displayEmpty: true,
                          renderValue: (value) => {
                            const selected = states.find(s => String(s.id) === String(value));
                            return selected ? selected.stateName : <span style={{ color: "#9ca3af" }}>Select state</span>;
                          }
                        }}
                      >
                        <MenuItem disabled value="">
                          Select state
                        </MenuItem>
                        {states.map((s) => (
                          <MenuItem key={s.id} value={s.id}>
                            {s.stateName}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label-custom">City</label>
                  <Controller
                    name="cityId"
                    control={control}
                    rules={{ required: "City is required" }}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        size="small"
                        error={!!errors.cityId}
                        helperText={errors.cityId?.message}
                        sx={getTextFieldStyle(!watchStateId)}
                        disabled={!watchStateId}
                        SelectProps={{
                          displayEmpty: true,
                          renderValue: (value) => {
                            const selected = cities.find(c => String(c.id) === String(value));
                            return selected ? selected.cityName : <span style={{ color: "#9ca3af" }}>Select city</span>;
                          }
                        }}
                      >
                        <MenuItem disabled value="">
                          Select city
                        </MenuItem>
                        {cities.map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.cityName}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
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
                          {departments.map(opt => <MenuItem key={opt.id} value={opt.id} sx={{ fontSize: { xs: "13px", md: "14px" } }}>{opt.departmentName}</MenuItem>)}
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
                          {designations.map(opt => <MenuItem key={opt.id} value={opt.id} sx={{ fontSize: { xs: "13px", md: "14px" } }}>{opt.designationName}</MenuItem>)}
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
                          {managerOptions.map((manager) => (
                            <MenuItem key={manager.id} value={manager.id} sx={{ fontSize: { xs: "13px", md: "14px" } }}>
                              {manager.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Role</label>
                  <Controller
                      name="role"
                      control={control}
                      rules={{ required: `Role is required` }}
                      defaultValue=""
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          size="small"
                          error={!!errors.role}
                          helperText={errors.role?.message}
                          sx={textFieldStyle}
                          SelectProps={{
                            displayEmpty: true,
                            renderValue: (value) => value ? roles.find(r => r.id === value)?.roleName || value : <span style={{ color: '#9ca3af' }}>Select role</span>
                          }}
                        >
                          <MenuItem disabled value=""><em style={{ fontStyle: 'normal', color: '#9ca3af' }}>Select role</em></MenuItem>
                          {roles.map(opt => <MenuItem key={opt.id} value={opt.id} sx={{ fontSize: { xs: "13px", md: "14px" } }}>{opt.roleName}</MenuItem>)}
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

                <div className="col-md-6">
                  <label className="form-label-custom">Office Email</label>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter office email"
                    {...register("officeEmail", { 
                      required: "Office Email is required",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" }
                    })}
                    error={!!errors.officeEmail}
                    helperText={errors.officeEmail?.message}
                    sx={textFieldStyle}
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
                        return (
                          <div key={idx} className="badge bg-light text-dark border d-flex align-items-center gap-2 p-2 rounded-2" style={{ fontSize: '13px' }}>
                            <span className="text-truncate" style={{ maxWidth: '180px' }}>
                              <strong>{docObj.name}:</strong> {docObj.file.name}
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