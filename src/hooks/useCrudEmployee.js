import { useState, useEffect, useCallback } from "react";
import api from "../api/api";

const API_ENDPOINT = "/Employee";

export const useCrudEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(API_ENDPOINT);
      console.log("API Response:", response.data);
      // Simulate real-world fetch delay to display initial skeletal loading like General.jsx
      await new Promise(resolve => setTimeout(resolve, 800));
      // Map backend DTO to frontend expected properties
      const mappedData = response.data.map(emp => ({
        id: emp.id,
        employeeId: emp.employeeCode || "",
        name: emp.fullName || "",
        email: emp.personalEmail || "",
        phone: emp.personalPhone || "",
        status: emp.isActive ? "Active" : "Inactive",
        department: emp.departmentName || "N/A",
        designation: emp.designationName || "N/A",
        profilePhoto: emp.profilePhoto || ""
      }));
      setEmployees(mappedData);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const create = async (payload) => {
    try {
      await api.post(API_ENDPOINT, payload);
      await fetchEmployees();
      return { success: true };
    } catch (err) {
      console.error("Create error:", err);
      return { success: false };
    }
  };

  const update = async (id, payload) => {
    try {
      
      await api.put(`${API_ENDPOINT}/${id}`, payload);
      await fetchEmployees();
      return { success: true };
    } catch (err) {
      console.error("Update error:", err);
      return { success: false };
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`${API_ENDPOINT}/${id}`);
      await fetchEmployees();
      return { success: true };
    } catch (err) {
      console.error("Remove error:", err);
      return { success: false };
    }
  };

  const getById = (id) => {
    return employees.find((emp) => emp.id === id);
  };

  return {
    employees,
    loading,
    create,
    update,
    remove,
    getById,
  };
};
