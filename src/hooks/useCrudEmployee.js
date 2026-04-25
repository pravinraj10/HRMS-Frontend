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
    phone: emp.personalPhone || "",
    emergencyContact: emp.emergencyContact || "",
    address: emp.address || "",

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
    status: emp.isActive === true ? "Active" : "Inactive",

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
  const create = useCallback(async (payload) => {
    try {
      await api.post(API_ENDPOINT, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      await fetchEmployees();

      return { success: true };
    } catch (err) {
      console.error("Create Error:", err);
      return {
        success: false,
        message:
          err?.response?.data?.message ||
          err?.response?.data?.title ||
          err?.response?.data ||
          "Failed to save employee.",
      };
    }
  }, [fetchEmployees]);

  // UPDATE
 const update = useCallback(async (id, payload) => {
  try {

    const formData = new FormData();

    formData.append("FullName", payload.name || "");
    formData.append("Gender", payload.gender || "");
    formData.append("DateOfBirth", payload.dob || "");

    formData.append("PersonalEmail", payload.email || "");
    formData.append("PersonalPhone", payload.phone || "");
    formData.append("EmergencyContact", payload.emergencyContact || "");
    formData.append("Address", payload.address || "");

    formData.append("DepartmentId", payload.departmentId || "");
    formData.append("DesignationId", payload.designationId || "");
    formData.append(
      "ReportingManagerId",
      payload.reportingManagerId || payload.manager || ""
    );

    formData.append("JoiningDate", payload.joiningDate || "");
    formData.append("EmployeeCode", payload.employeeId || "");
    formData.append("Shift", payload.shift || "");

    // FILES
    if (payload.profilePhoto instanceof File) {
      formData.append("ProfilePhoto", payload.profilePhoto);
    }

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
        headers:{
          "Content-Type":"multipart/form-data"
        }
      }
    );

    await fetchEmployees();

    return { success:true };

  } catch(err){
    console.error("Update Error:",err);
    return { success:false };
  }

},[fetchEmployees]);

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
  const toggleStatus = useCallback(async (id, currentStatus) => {
    const newIsActive = currentStatus !== "Active"; // flip the current status
    try {
      // Optimistic UI update
      setEmployees(prev =>
        prev.map(emp =>
          emp.id === id
            ? { ...emp, status: newIsActive ? "Active" : "Inactive" }
            : emp
        )
      );

      await api.put(`${API_ENDPOINT}/set-active/${id}?isActive=${newIsActive}`);

      return { success: true };
    } catch (err) {
      console.error("Toggle Status Error:", err);
      // Revert on failure
      setEmployees(prev =>
        prev.map(emp =>
          emp.id === id
            ? { ...emp, status: currentStatus }
            : emp
        )
      );
      return { success: false };
    }
  }, []);

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