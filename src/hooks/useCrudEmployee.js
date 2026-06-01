import { useState, useEffect, useCallback } from "react";
import api from "../api/api";

const API_ENDPOINT = "/Employee";

const formatDate = (date) => {
  if (!date) return "";
  return date.split("T")[0]; // Converts 2026-04-17T00:00:00 -> 2026-04-17
};

export const useCrudEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

const mapEmployeeData = (emp) => {
  const proof = emp.idProof || "";

  return {
    id: emp.id,

    employeeId: emp.employeeCode || "",
    name: emp.fullName || "",

    gender: emp.gender || "",
    dob: formatDate(emp.dateOfBirth || emp.dob),

    email: emp.personalEmail || "",
    officeEmail: emp.officeEmail || "",
    phone: emp.personalPhone || "",
    emergencyContact: emp.emergencyContact || "",
    address: emp.address || "",
    countryId: emp.countryId || "",
    stateId: emp.stateId || "",
    cityId: emp.cityId || "",
    country: emp.country || "",
    state: emp.state || "",
    city: emp.city || "",

    departmentId: emp.departmentId || "",
    department: emp.departmentName || "",

    designationId: emp.designationId || "",
    designation: emp.designationName || "",

    reportingManagerId: emp.reportingManagerId || "",
    manager: emp.reportingManagerId || "",

    joiningDate: formatDate(emp.joiningDate),
    shift: emp.shift || "",

    profilePhoto: emp.profilePhoto || "",

    // Map isActive boolean to status string
   status:
  emp.isActive === true ||
  emp.isActive === 1 ||
  emp.isActive === "1"
    ? "Active"
    : "Inactive",

    idProofs: proof
      ? [{ "ID Proof": proof }]
      : []
  };
};

  const fetchEmployees = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get(API_ENDPOINT);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.$values || [];

      const mappedData = data.map(mapEmployeeData);

      setEmployees(mappedData);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // CREATE
const create = useCallback(async (formData) => {
  try {
    await api.post(API_ENDPOINT, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    await fetchEmployees();

    return { success: true };

  } catch (err) {
    console.error("Create Error:", err);

    // OPTIONAL: better error extraction
    const errors = err?.response?.data?.errors;
    if (errors) {
      const firstError = Object.values(errors)[0][0];
      return { success: false, message: firstError };
    }

    return {
      success: false,
      message:
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Failed to save employee.",
    };
  }
}, [fetchEmployees]);

  // UPDATE
const update = useCallback(async (id, payload) => {
  try {
    const formData = new FormData();

    formData.append("FullName", payload.fullName || "");
    formData.append("Gender", payload.gender || "");
    formData.append("DateOfBirth", payload.dateOfBirth || "");

    formData.append("PersonalEmail", payload.personalEmail || "");
    formData.append("PersonalPhone", payload.personalPhone || "");

    formData.append(
      "EmergencyContact",
      payload.emergencyContact || ""
    );

    formData.append("Address", payload.address || "");
    formData.append("CountryId", String(payload.countryId || ""));
    formData.append("StateId", String(payload.stateId || ""));
    formData.append("CityId", String(payload.cityId || ""));

    formData.append(
      "DepartmentId",
      payload.departmentId || ""
    );

    formData.append(
      "DesignationId",
      payload.designationId || ""
    );

    formData.append(
      "ReportingManagerId",
      payload.reportingManagerId || ""
    );

    formData.append(
      "JoiningDate",
      payload.joiningDate || ""
    );

    formData.append(
      "EmployeeCode",
      payload.employeeCode || ""
    );

    formData.append("Shift", payload.shift || "");

    // PASSWORD
    formData.append("Password", payload.password || "");

    formData.append(
      "ConfirmPassword",
      payload.confirmPassword || ""
    );

    // PROFILE PHOTO
    if (payload.profilePhoto instanceof File) {
      formData.append(
        "ProfilePhoto",
        payload.profilePhoto
      );
    }

    // ID PROOF
    if (
      payload.idProofs?.length &&
      payload.idProofs[0].file instanceof File
    ) {
      formData.append(
        "IdProof",
        payload.idProofs[0].file
      );
    }

    await api.put(
      `${API_ENDPOINT}/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    await fetchEmployees();

    return { success: true };

  } catch (err) {
    console.error("Update Error:", err);

    return {
      success: false,
      message:
        err?.response?.data?.title ||
        err?.response?.data?.message ||
        "Failed to update employee.",
    };
  }
}, [fetchEmployees]);

  // DELETE
  const remove = useCallback(async (id) => {
    try {
      await api.delete(`${API_ENDPOINT}/${id}`);

      await fetchEmployees();

      return { success: true };
    } catch (err) {
      console.error("Delete Error:", err);
      return { success: false };
    }
  }, [fetchEmployees]);

  // TOGGLE STATUS — calls PUT /Employee/set-active/{id}?isActive=true/false
const toggleStatus = useCallback(async (id) => {
  try {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) return { success: false };

    const newStatus = employee.status === "Active" ? "Inactive" : "Active";
    const isActive = newStatus === "Active";

    setEmployees(prev =>
      prev.map(emp =>
        emp.id === id ? { ...emp, status: newStatus } : emp
      )
    );

    await api.put(
      `${API_ENDPOINT}/set-active/${id}`,
      null,
      {
        params: {
          isActive: isActive,
        },
      }
    );

    await fetchEmployees();

    return { success: true };

  } catch (err) {
    console.error("Toggle Status Error:", err);

    await fetchEmployees();

    return { success: false };
  }
}, [employees, fetchEmployees]);

  // SEARCH
  const searchEmployees = useCallback(async (query) => {
    if (!query) {
      await fetchEmployees();
      return;
    }

    setSearchLoading(true);

    try {
      const response = await api.get(
        `${API_ENDPOINT}/search?search=${query}`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.$values || [];

      setEmployees(data.map(mapEmployeeData));

    } catch (err) {
      console.error("Search Error:", err);
    } finally {
      setSearchLoading(false);
    }
  }, [fetchEmployees]);

  // GET SINGLE FROM API
  const fetchById = useCallback(async (id) => {
    try {
      const response = await api.get(`${API_ENDPOINT}/${id}`);
      return mapEmployeeData(response.data);
    } catch (err) {
      console.error("FetchById Error:", err);
      return null;
    }
  }, []);

  // GET SINGLE FROM CACHE
  const getById = useCallback(
    (id) => {
      return employees.find(
        emp => String(emp.id) === String(id)
      );
    },
    [employees]
  );

  return {
    employees,
    loading,
    searchLoading,
    create,
    update,
    remove,
    toggleStatus,
    getById,
    fetchById,
    search: searchEmployees,
    refresh: fetchEmployees
  };
};