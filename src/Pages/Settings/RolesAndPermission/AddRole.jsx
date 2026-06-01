import React, { useState, useEffect } from "react";
import { FiHome, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";
import ReusablePopup from "../../../Reusbale/ReusablePopup";
import { useCrud } from "../../../hooks/useCrud";
import { getMenuItems } from "../../../Components/Sidebar/sidebarService";
import api from "../../../api/api";
import "./AddRole.css";

const AddRole = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
  const [loading, setLoading] = useState(false);
  const [popupState, setPopupState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });
  
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState(new Set());
  const [expandedMenus, setExpandedMenus] = useState(new Set());

  const { create } = useCrud();

  useEffect(() => {
    const fetchMenu = async () => {
      const raw = await getMenuItems();

      // Log the raw API response so we can inspect the shape
      console.log("🔍 Raw /Menu API response:", raw);

      // Handle .NET $values JSON format or plain array
      const menuArray = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.$values)
        ? raw.$values
        : [];

      // Helper: extract children from any possible field name / $values wrapper
      const extractChildren = (item) => {
        const candidates = [
          item.child,
          item.children,
          item.Child,
          item.Children,
          item.subMenu,
          item.subMenus,
        ];
        for (const c of candidates) {
          if (Array.isArray(c) && c.length > 0) return c;
          if (Array.isArray(c?.$values) && c.$values.length > 0) return c.$values;
        }
        return [];
      };

      // Normalize each menu item to match sidebar behaviour:
      // - Employee → no children (direct link)
      // - Remove "Status & History" and "Employee List" from children
      // - Rename "Add User" → "User"
      const cleaned = menuArray.map((item) => {
        const rawChildren = extractChildren(item);
        const itemName = item.name || item.label || "";

        console.log(`📋 Menu: "${itemName}" → ${rawChildren.length} children`, rawChildren);

        const children =
          itemName === "Employee"
            ? []
            : rawChildren
                .filter((c) => {
                  const cName = c.name || c.label || "";
                  return (
                    cName !== "Status & History" &&
                    cName !== "Employee List"
                  );
                })
                .map((c) => {
                  const cName = c.name || c.label || "";
                  return {
                    ...c,
                    label: cName === "Add User" ? "User" : cName,
                  };
                });

        return {
          ...item,
          label: itemName,
          children,
        };
      });

      setMenuItems(cleaned);
    };
    fetchMenu();
  }, []);

  const fetchRoleById = async (roleId) => {
    try {
      const response = await api.get(`/Role/${roleId}`);
      const role = response.data;
      setValue("roleName", role.roleName);
      setValue("description", role.description);
      
      let selectedIds = new Set();
      if (role.sideMenu) {
        try {
          const parsedMenu = typeof role.sideMenu === "string" ? JSON.parse(role.sideMenu) : role.sideMenu;
          if (Array.isArray(parsedMenu)) {
            parsedMenu.forEach(item => {
              if (item.id) selectedIds.add(item.id);
              if (Array.isArray(item.child)) {
                item.child.forEach(child => {
                  if (child.id) selectedIds.add(child.id);
                });
              }
            });
          }
        } catch (err) {
          console.error("Error parsing sideMenu:", err);
        }
      }
      setSelectedMenus(selectedIds);
    } catch (error) {
      console.error("Error fetching role:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRoleById(id);
    }
  }, [id]);

  const showPopup = (title, message, type = "success") => {
    setPopupState({ isOpen: true, title, message, type });
  };

  const toggleAccordion = (id) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleGlobalToggle = (e) => {
    if (e.target.checked) {
      const allIds = new Set();
      menuItems.forEach((m) => {
        allIds.add(m.id);
        if (m.children) {
          m.children.forEach((c) => allIds.add(c.id));
        }
      });
      setSelectedMenus(allIds);
    } else {
      setSelectedMenus(new Set());
    }
  };

  const handleMenuToggle = (item, isChecked) => {
    setSelectedMenus((prev) => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(item.id);
        if (item.children) {
          item.children.forEach((c) => newSet.add(c.id));
        }
      } else {
        newSet.delete(item.id);
        if (item.children) {
          item.children.forEach((c) => newSet.delete(c.id));
        }
      }
      return newSet;
    });
  };

  const handleChildToggle = (childId, parentId, isChecked) => {
    setSelectedMenus((prev) => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(childId);
        newSet.add(parentId);
      } else {
        newSet.delete(childId);
        const parent = menuItems.find((m) => m.id === parentId);
        if (parent && parent.children) {
          const anyChildChecked = parent.children.some(
            (c) => c.id !== childId && newSet.has(c.id)
          );
          if (!anyChildChecked) {
            newSet.delete(parentId);
          }
        }
      }
      return newSet;
    });
  };

  const isGlobalChecked =
    menuItems.length > 0 &&
    menuItems.every((m) => {
      if (!selectedMenus.has(m.id)) return false;
      if (m.children) {
        return m.children.every((c) => selectedMenus.has(c.id));
      }
      return true;
    });

const onSubmit = async (data) => {
  setLoading(true);
  try {
    // BUILD SIDEMENU STRUCTURE
    const sideMenu = menuItems
      .filter(item => selectedMenus.has(item.id))
      .map(item => ({
        id: item.id,
        name: item.label,
        child: item.children
          ? item.children
              .filter(child => selectedMenus.has(child.id))
              .map(child => ({
                id: child.id,
                name: child.label
              }))
          : []
      }));

    const sideMenuJson = JSON.stringify(sideMenu);

    const formattedRoleName = data.roleName 
      ? data.roleName.trim().charAt(0).toUpperCase() + data.roleName.trim().slice(1)
      : "";

    if (isEditMode) {
      await api.put("/Role", {
        id: parseInt(id),
        roleName: formattedRoleName,
        description: data.description,
        sideMenu: sideMenuJson,
        updatedBy: "Admin"
      });
      showPopup(
        "Success!",
        "Role updated successfully!",
        "success"
      );
    } else {
      await api.post("/Role", {
        roleName: formattedRoleName,
        description: data.description,
        sideMenu: sideMenuJson,
        createdBy: "Admin"
      });
      showPopup(
        "Success!",
        "Role added successfully!",
        "success"
      );
    }
  } catch (error) {
    console.error(error);
    showPopup(
      "Error!",
      isEditMode ? "Failed to update role" : "Failed to save role",
      "error"
    );
  } finally {
    setLoading(false);
  }
};

  const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "6px",
      "& fieldset": { borderColor: "#cbd5e1" },
      "&:hover fieldset": { borderColor: "#136DEC" },
      "&.Mui-focused fieldset": { borderColor: "#136DEC" },
      background: "#ffffff",
      fontSize: { xs: "13px", md: "14px" },
    },
    "& .MuiInputBase-input": { color: "#475569" },
    "& .MuiFormHelperText-root": {
      fontSize: { xs: "11px", md: "12px" },
      marginLeft: "0px",
      marginTop: "4px",
    },
  };

  return (
    <div className="add-role-wrapper">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Header section */}
        <div className="d-flex justify-content-between align-items-center mb-4 header-actions-flex">
          <div>
            <h2 className="add-role-title">{isEditMode ? "Edit Role" : "Add Role"}</h2>
            <div className="d-flex align-items-center gap-2 breadcrumb-container">
              <FiHome size={14} /> / Settings /{" "}
              <span className="text-muted">Roles & Permission</span> /{" "}
              <span className="fw-medium text-dark">{isEditMode ? "Edit Role" : "Add Role"}</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="add-role-form-scroll">
          <div className="row">
            <div className="col-12">
              <h3 className="section-title">Role Information</h3>
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <label className="form-label-custom">Role Name</label>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter role name"
                    {...register("roleName", {
                      required: "Role Name is required",
                    })}
                    error={!!errors.roleName}
                    helperText={errors.roleName?.message}
                    sx={textFieldStyle}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label-custom">Description</label>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter description..."
                    {...register("description", {
                      required: "Description is required",
                    })}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    sx={textFieldStyle}
                  />
                </div>
              </div>

              <h3 className="section-title mt-5">Module Access</h3>
              <div className="permissions-container">
                <label className="global-checkbox-wrapper d-flex align-items-center mb-3 cursor-pointer px-3">
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    checked={isGlobalChecked}
                    onChange={handleGlobalToggle}
                  />
                  <span className="ms-2 fw-bold text-dark" style={{ fontSize: "15px" }}>
                    Side Menu
                  </span>
                </label>

                <div className="permissions-table border rounded bg-white">
                  {menuItems.map((item, index) => {
                    const hasChildren =
                      Array.isArray(item.children) && item.children.length > 0;
                    const isExpanded = expandedMenus.has(item.id);
                    const isChecked = selectedMenus.has(item.id);
                    const isLast = index === menuItems.length - 1;

                    return (
                      <div key={item.id} className={`permission-row-group ${!isLast ? 'border-bottom' : ''}`}>
                        <div 
                          className="permission-row d-flex align-items-center justify-content-between p-3"
                          style={{ cursor: hasChildren ? "pointer" : "default" }}
                          onClick={() => hasChildren && toggleAccordion(item.id)}
                        >
                          <div className="d-flex align-items-center gap-2 m-0 flex-grow-1">
                            <input
                              type="checkbox"
                              className="custom-checkbox cursor-pointer"
                              checked={isChecked}
                              onChange={(e) =>
                                handleMenuToggle(item, e.target.checked)
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="menu-label fw-medium text-secondary">
                              {item.label}
                            </span>
                          </div>
                          {hasChildren && (
                            <button
                              type="button"
                              className="accordion-arrow btn btn-sm p-0 text-muted"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAccordion(item.id);
                              }}
                            >
                              {isExpanded ? (
                                <FiChevronUp size={20} />
                              ) : (
                                <FiChevronDown size={20} />
                              )}
                            </button>
                          )}
                        </div>

                        {hasChildren && isExpanded && (
                          <div className="permission-children p-3 ps-4 bg-light border-top">
                            <div className="d-flex flex-column gap-3">
                              {item.children.map((child) => (
                                <label
                                  key={child.id}
                                  className="d-flex align-items-center gap-2 m-0 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    className="custom-checkbox"
                                    checked={selectedMenus.has(child.id)}
                                    onChange={(e) =>
                                      handleChildToggle(
                                        child.id,
                                        item.id,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <span className="menu-label text-secondary">
                                    {child.label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Centered Actions */}
              <div className="centered-actions mt-5">
                <button type="submit" disabled={loading} className="save-btn">
                  {loading ? "Saving..." : (isEditMode ? "Update Role" : "Create Role")}
                </button>
                <button
                  type="button"
                  className="cancel-line-btn"
                  onClick={() => {
                    reset();
                    navigate("/settings/roles");
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
            navigate("/settings/roles");
          }
        }}
        title={popupState.title}
        message={popupState.message}
        type={popupState.type}
      />
    </div>
  );
};

export default AddRole;
