import React, { useState, useEffect } from "react";
import { FiHome, FiChevronDown, FiCamera } from "react-icons/fi";
import { BiExport } from "react-icons/bi";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { MdOutlineModeEdit } from "react-icons/md";
import { LuCloudUpload } from "react-icons/lu";
import { FaFileAlt, FaIdCard, FaRegFilePdf } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { FiEye, FiEyeOff } from "react-icons/fi";
import profileImg from "../../../asset/image/profile.jpg";
import { useCrudEmployee } from "../../../hooks/useCrudEmployee";
import ReusablePopup from "../../../Reusbale/ReusablePopup";
import api from "../../../api/api";
import "./EditEmployee.css";

const EditEmployee = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { update, fetchById } = useCrudEmployee();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      countryId: "",
      stateId: "",
      cityId: "",
    }
  });
  const [loading, setLoading] = useState(false);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const watchCountryId = watch("countryId");
  const watchStateId = watch("stateId");

  // States for enabling edits per section
  const [editPersonalInfo, setEditPersonalInfo] = useState(false);
  const [editJobDetails, setEditJobDetails] = useState(false);
  const [editContactInfo, setEditContactInfo] = useState(false);

  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const fileInputRef = React.useRef(null);
  const profilePhotoInputRef = React.useRef(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [updatingDoc, setUpdatingDoc] = useState(null);
  const [documentName, setDocumentName] = useState("");
  const [popupState, setPopupState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [managerOptions, setManagerOptions] = useState([]);

  const showPopup = (title, message, type = "success") => {
    setPopupState({ isOpen: true, title, message, type });
  };

  const triggerDocUpdate = (type, index = null) => {
    if (type === "newIdProof" && !documentName.trim()) {
      showPopup(
        "Notice",
        "Please enter a document name (e.g., Aadhar) before uploading.",
        "error",
      );
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
        if (updatingDoc.type === "newIdProof") {
          const newIdProofs = [...(newData.idProofs || [])];
          newIdProofs.push({
            name: documentName.trim(),
            file: file,
          });
          newData.idProofs = newIdProofs;
          setDocumentName(""); // Clear after adding
        } else if (
          updatingDoc.type === "idProof" &&
          updatingDoc.index !== null
        ) {
          const newIdProofs = [...(newData.idProofs || [])];
          const oldObj = newIdProofs[updatingDoc.index];
          const oldKey = Object.keys(oldObj)[0];
          newIdProofs[updatingDoc.index] = {
            name: oldKey,
            file: file,
          };
          newData.idProofs = newIdProofs;
        }
        return newData;
      });
      setUpdatingDoc(null);
      e.target.value = null; // Reset to allow re-selection
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhotoFile(file);
      setProfilePhotoPreview(URL.createObjectURL(file));
    }
  };

  // Load dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [deptRes, desigRes, managerRes, countryRes] = await Promise.all([
          api.get("/Department"),
          api.get("/Designation"),
          api.get("/Employee/dropdown"),
          api.get("/Country"),
        ]);

        const getArray = (res) => {
          if (Array.isArray(res)) return res;
          if (res?.$values) return res.$values;
          if (res?.data) return res.data;
          return [];
        };

        setDepartments(getArray(deptRes.data));
        setDesignations(getArray(desigRes.data));
        const managers = getArray(managerRes.data).map((role) => ({
          id: role.id,
          label: role.roleName,
        }));
        setManagerOptions(managers);
        setCountries(getArray(countryRes.data));
      } catch (err) {
        console.error("Failed to fetch dropdown data", err);
      }
    };
    fetchDropdownData();
  }, []);

  // Load employee data into form
  useEffect(() => {
    const loadEmployee = async () => {
      if (!id || isDataLoaded) return;

      const employee = await fetchById(id);

      if (employee) {
        setEmployeeData(employee);

        // Fetch States and Cities first before resetting form values, to ensure the dropdowns have options
        if (employee.countryId) {
          try {
            const statesRes = await api.get(`/State/by-country/${employee.countryId}`);
            const getArray = (res) => {
              if (Array.isArray(res)) return res;
              if (res?.$values) return res.$values;
              if (res?.data) return res.data;
              return [];
            };
            setStates(getArray(statesRes.data));

            if (employee.stateId) {
              const citiesRes = await api.get(`/City/by-country-state?countryId=${employee.countryId}&stateId=${employee.stateId}`);
              setCities(getArray(citiesRes.data));
            }
          } catch (err) {
            console.error("Failed to fetch initial state/city lists", err);
          }
        }

        reset({
          fullName: employee.name || "",

          gender: employee.gender
            ? employee.gender.charAt(0).toUpperCase() +
              employee.gender.slice(1).toLowerCase()
            : "",

          dob: employee.dob || "",

          email: employee.email || "",

          officeEmail: employee.officeEmail || "",

          phone: employee.phone || "",

          emergencyContact: employee.emergencyContact || "",

          address: employee.address || "",

          department: employee.departmentId || "",

          designation: employee.designationId || "",

          manager: employee.reportingManagerId || "",

          joiningDate: employee.joiningDate || "",

          employeeId: employee.employeeId || "",

          shift: employee.shift
            ? employee.shift.charAt(0).toUpperCase() +
              employee.shift.slice(1).toLowerCase()
            : "",

          countryId: employee.countryId || "",
          stateId: employee.stateId || "",
          cityId: employee.cityId || "",
          password: "",
          confirmPassword: "",
        });
        setIsDataLoaded(true);
      }
    };

    loadEmployee();
  }, [id, fetchById, reset, isDataLoaded]);

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
        
        // ONLY reset state/city if the new countryId is DIFFERENT from the initial employee countryId OR if initial load is already done
        if (isDataLoaded && String(watchCountryId) !== String(employeeData?.countryId)) {
          setValue("stateId", "");
          setCities([]);
          setValue("cityId", "");
        }
      } catch (err) {
        console.error("Failed to fetch states", err);
      }
    };
    fetchStates();
  }, [watchCountryId, setValue, employeeData, isDataLoaded]);

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
        
        // ONLY reset cityId if the new stateId/countryId is DIFFERENT from the initial employee stateId/countryId OR if initial load is already done
        if (isDataLoaded && (String(watchStateId) !== String(employeeData?.stateId) || String(watchCountryId) !== String(employeeData?.countryId))) {
          setValue("cityId", "");
        }
      } catch (err) {
        console.error("Failed to fetch cities", err);
      }
    };
    fetchCities();
  }, [watchStateId, watchCountryId, setValue, employeeData, isDataLoaded]);

  const onSubmit = async (data) => {
    setLoading(true);
const payload = {
  fullName: data.fullName,
  gender: data.gender,
  dateOfBirth: data.dob,

  personalEmail: data.email,
  officeEmail: data.officeEmail,

  personalPhone: data.phone,
  emergencyContact: data.emergencyContact,
  address: data.address,
  countryId: data.countryId,
  stateId: data.stateId,
  cityId: data.cityId,

  departmentId: data.department,
  designationId: data.designation,

  reportingManagerId: data.manager,

  joiningDate: data.joiningDate,
  employeeCode: data.employeeId,
  shift: data.shift,

  password: data.password,
  confirmPassword: data.confirmPassword,
  profilePhoto: profilePhotoFile,
};

    const res = await update(id, payload);
    setLoading(false);

    if (res.success) {
      const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (loggedInUser.email === data.email) {
        const updatedEmp = await fetchById(id);
        if (updatedEmp) {
          const newUser = {
            ...loggedInUser,
            fullName: updatedEmp.name,
            profilePhoto: updatedEmp.profilePhoto,
          };
          localStorage.setItem("user", JSON.stringify(newUser));
          window.dispatchEvent(new Event("userUpdate"));
        }
      }
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
      "&.Mui-focused fieldset": {
        borderColor: isDisabled ? "#E2E8F0" : "#136DEC",
      },
      fontSize: { xs: "13px", md: "14px" },
    },
    "& .MuiInputBase-input": {
      color: isDisabled ? "#64748B" : "#475569",
      "-webkit-text-fill-color": isDisabled ? "#64748B !important" : "initial",
    },
    "& .MuiFormHelperText-root": {
      fontSize: { xs: "11px", md: "12px" },
      marginLeft: "0px",
      marginTop: "4px",
    },
  });

  return (
    <div className="edit-employee-wrapper">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Header section */}
        <div className="d-flex justify-content-between align-items-center mb-4 header-actions-flex">
          <div>
            <h2 className="edit-employee-title">Edit Employee</h2>
            <div className="d-flex align-items-center gap-2 breadcrumb-container">
              <FiHome size={14} /> / <span>Employee Management</span> /{" "}
              <span className="fw-medium text-dark">Edit Employee</span>
            </div>
          </div>
        </div>

        {/* Profile Bar - Fixed at top below header */}
        <div className="profile-bar-card mb-4 d-flex align-items-center gap-3">
          <input
            type="file"
            ref={profilePhotoInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleProfilePhotoChange}
          />
          <div
            className="profile-avatar"
            onClick={() => profilePhotoInputRef.current && profilePhotoInputRef.current.click()}
          >
            <img
              src={
                profilePhotoPreview
                  ? profilePhotoPreview
                  : employeeData?.profilePhoto
                    ? employeeData.profilePhoto.startsWith("http")
                      ? employeeData.profilePhoto
                      : `https://localhost:44306${employeeData.profilePhoto}`
                    : profileImg
              }
              alt="Profile"
            />
            <div className="profile-avatar-overlay">
              <FiCamera size={18} />
            </div>
          </div>
          <div>
            <h4 className="profile-name mb-0">
              {employeeData?.name || "Loading..."}
            </h4>
            <span className="profile-emp-id">
            EMP ID: {employeeData?.employeeId || "..."}
            </span>
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
                  <button
                    type="button"
                    className="btn-edit-icon"
                    onClick={() => setEditPersonalInfo(!editPersonalInfo)}
                  >
                    <MdOutlineModeEdit size={18} />
                  </button>
                </div>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label-custom">Full Name</label>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter full name"
                      {...register("fullName", {
                        required: "Full Name is required",
                      })}
                      error={!!errors.fullName}
                      helperText={errors.fullName?.message}
                      disabled={!editPersonalInfo}
                      sx={getTextFieldStyle(!editPersonalInfo)}
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
                          disabled={!editPersonalInfo}
                          sx={getTextFieldStyle(!editPersonalInfo)}
                        >
                          <MenuItem disabled value="">
                            <em>Select gender</em>
                          </MenuItem>
                          {["Male", "Female", "Other"].map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
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
                      onFocus={(e) => {
                        if (editPersonalInfo) e.target.type = "date";
                      }}
                      onBlur={(e) =>
                        !e.target.value && (e.target.type = "text")
                      }
                      {...register("dob", {
                        required: "Date of Birth is required",
                      })}
                      error={!!errors.dob}
                      helperText={errors.dob?.message}
                      disabled={!editPersonalInfo}
                      sx={getTextFieldStyle(!editPersonalInfo)}
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
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Invalid email",
                        },
                      })}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      disabled={!editPersonalInfo}
                      sx={getTextFieldStyle(!editPersonalInfo)}
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
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Must be 10 digits",
                        },
                      })}
                      onInput={(e) =>
                        (e.target.value = e.target.value
                          .replace(/[^0-9]/g, "")
                          .slice(0, 10))
                      }
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      disabled={!editPersonalInfo}
                      sx={getTextFieldStyle(!editPersonalInfo)}
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
                          disabled={!editPersonalInfo}
                          sx={getTextFieldStyle(!editPersonalInfo)}
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
                          disabled={!editPersonalInfo || !watchCountryId}
                          sx={getTextFieldStyle(!editPersonalInfo || !watchCountryId)}
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
                          disabled={!editPersonalInfo || !watchStateId}
                          sx={getTextFieldStyle(!editPersonalInfo || !watchStateId)}
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
                </div>
              </div>

              {/* Job Details */}
              <div className="edit-section-card mb-4">
                <div className="section-header d-flex justify-content-between align-items-center mb-4">
                  <h3 className="section-title m-0">Job Details</h3>
                  <button
                    type="button"
                    className="btn-edit-icon"
                    onClick={() => setEditJobDetails(!editJobDetails)}
                  >
                    <MdOutlineModeEdit size={18} />
                  </button>
                </div>
                <div className="row g-4">
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
                          disabled={!editJobDetails}
                          sx={getTextFieldStyle(!editJobDetails)}
                        >
                          <MenuItem disabled value="">
                            <em>Select department</em>
                          </MenuItem>
                          {departments.map((opt) => (
                            <MenuItem key={opt.id} value={opt.id}>
                              {opt.departmentName}
                            </MenuItem>
                          ))}
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
                          disabled={!editJobDetails}
                          sx={getTextFieldStyle(!editJobDetails)}
                        >
                          <MenuItem disabled value="">
                            <em>Select designation</em>
                          </MenuItem>
                          {designations.map((opt) => (
                            <MenuItem key={opt.id} value={opt.id}>
                              {opt.designationName}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label-custom">Manager</label>
                    <Controller
                      name="manager"
                      control={control}
                      rules={{ required: `Manager is required` }}
                      defaultValue=""
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          size="small"
                          error={!!errors.manager}
                          helperText={errors.manager?.message}
                          disabled={!editJobDetails}
                          sx={getTextFieldStyle(!editJobDetails)}
                        >
                          <MenuItem disabled value="">
                            <em>Select manager</em>
                          </MenuItem>
                          {managerOptions.map((manager) => (
                            <MenuItem key={manager.id} value={manager.id}>
                              {manager.label}
                            </MenuItem>
                          ))}
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
                      onFocus={(e) => {
                        if (editJobDetails) e.target.type = "date";
                      }}
                      onBlur={(e) =>
                        !e.target.value && (e.target.type = "text")
                      }
                      {...register("joiningDate", {
                        required: "Joining Date is required",
                      })}
                      error={!!errors.joiningDate}
                      helperText={errors.joiningDate?.message}
                      disabled={!editJobDetails}
                      sx={getTextFieldStyle(!editJobDetails)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label-custom">Employee ID</label>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter employee ID"
                      {...register("employeeId", {
                        required: "Employee ID is required",
                      })}
                      error={!!errors.employeeId}
                      helperText={errors.employeeId?.message}
                      disabled={!editJobDetails}
                      sx={getTextFieldStyle(!editJobDetails)}
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
                          disabled={!editJobDetails}
                          sx={getTextFieldStyle(!editJobDetails)}
                        >
                          <MenuItem disabled value="">
                            <em>Select shift</em>
                          </MenuItem>
                          {[
                            "Day Shift ( 9am - 7 pm)",
                            "Morning",
                            "Evening",
                            "Night",
                          ].map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">
                      New Password (Optional)
                    </label>

                    <TextField
                      fullWidth
                      size="small"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      {...register("password")}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      disabled={!editJobDetails}
                      sx={getTextFieldStyle(!editJobDetails)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              disabled={!editJobDetails}
                            >
                              {showPassword ? <FiEyeOff /> : <FiEye />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label-custom">
                      Confirm Password
                    </label>

                    <TextField
                      fullWidth
                      size="small"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      {...register("confirmPassword", {
                        validate: (value, formValues) =>
                          !formValues.password ||
                          value === formValues.password ||
                          "Passwords do not match",
                      })}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      disabled={!editJobDetails}
                      sx={getTextFieldStyle(!editJobDetails)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                              disabled={!editJobDetails}
                            >
                              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="edit-section-card mb-4">
                <div className="section-header d-flex justify-content-between align-items-center mb-4">
                  <h3 className="section-title m-0">Contact Details</h3>
                  <button
                    type="button"
                    className="btn-edit-icon"
                    onClick={() => setEditContactInfo(!editContactInfo)}
                  >
                    <MdOutlineModeEdit size={18} />
                  </button>
                </div>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label-custom">Office Email</label>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter office email"
                      {...register("officeEmail", {
                        required: "Office Email is required",
                      })}
                      error={!!errors.officeEmail}
                      helperText={errors.officeEmail?.message}
                      disabled={!editContactInfo}
                      sx={getTextFieldStyle(!editContactInfo)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">
                      Emergency Contact Number
                    </label>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter emergency contact"
                      {...register("emergencyContact", {
                        required: "Emergency Contact is required",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Must be 10 digits",
                        },
                      })}
                      onInput={(e) =>
                        (e.target.value = e.target.value
                          .replace(/[^0-9]/g, "")
                          .slice(0, 10))
                      }
                      error={!!errors.emergencyContact}
                      helperText={errors.emergencyContact?.message}
                      disabled={!editContactInfo}
                      sx={getTextFieldStyle(!editContactInfo)}
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label-custom">Address</label>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Enter address"
                      {...register("address", {
                        required: "Address is required",
                      })}
                      error={!!errors.address}
                      helperText={errors.address?.message}
                      disabled={!editContactInfo}
                      sx={getTextFieldStyle(!editContactInfo)}
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
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleDocUpdate}
                  />

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
                      onClick={() => triggerDocUpdate("newIdProof")}
                    >
                      <LuCloudUpload size={14} /> Add New
                    </button>
                  </div>

                  {employeeData?.idProofs?.map((docObj, idx) => {
                    const docKey = docObj.name;
                    const docFile = docObj.file?.name || docObj.file || "";
                    return (
                      <div
                        key={`idproof-${idx}`}
                        className="document-list-item d-flex align-items-center justify-content-between p-3 border rounded shadow-sm bg-white"
                      >
                        <div className="d-flex align-items-center gap-3">
                          <FaRegFilePdf size={24} className="text-secondary" />
                          <div>
                            <p className="mb-0 fw-medium doc-title">
                              {docKey}: {docFile}
                            </p>
                            <small className="text-muted doc-subtitle">
                              ID Proof
                            </small>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-light text-primary btn-sm d-flex align-items-center gap-2 update-doc-btn"
                            onClick={() => triggerDocUpdate("idProof", idx)}
                          >
                            <LuCloudUpload size={14} /> Update
                          </button>
                          <button
                            type="button"
                            className="btn btn-light text-danger btn-sm p-2"
                            onClick={() => {
                              setEmployeeData((prev) => ({
                                ...prev,
                                idProofs: prev.idProofs.filter(
                                  (_, i) => i !== idx,
                                ),
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
                    <div className="text-muted small px-2">
                      No documents available.
                    </div>
                  )}
                </div>
              </div>

              {/* Centered Actions */}
              <div className="centered-actions">
                <button type="submit" disabled={loading} className="save-btn">
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
