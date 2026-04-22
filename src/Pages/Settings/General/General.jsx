import React, { useState, useEffect, useMemo } from "react";
import { FiEdit2, FiTrash2, FiPlus, FiHome } from "react-icons/fi";
import ReusableTable from "../../../Reusbale/ReusableTable";
import ReusableSearch from "../../../Reusbale/ReusableSearch";
import ReusableDropdown from "../../../Reusbale/ReusableDropdown";
import ReusableConfirm from "../../../Reusbale/ReusableConfirm";
import { useCrud } from "../../../hooks/useCrud";
import { useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";
import ReusablePopup from "../../../Reusbale/ReusablePopup";
import ResuableForm from "../../../Reusbale/ReusableForm";
import "./General.css";

const General = () => {
  const [activeTab, setActiveTab] = useState("country");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
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
    watch,
    reset,
    formState: { errors },
  } = useForm();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const {
    countries,
    states,
    cities,
    displayedCountries,
    displayedStates,
    displayedCities,
    loading,
    create,
    update,
    remove,
    toggleStatus,
    searchCountry,
    searchState,
    searchCity,
  } = useCrud();
  const [visibleCount, setVisibleCount] = useState(10);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    setVisibleCount(10);
    
    // If searchTerm is empty, we don't need a timeout for immediate reset
    if (!searchTerm) {
      if (activeTab === "country") searchCountry("");
      if (activeTab === "state") searchState("");
      if (activeTab === "city") searchCity("");
      return;
    }

    const timer = setTimeout(() => {
      if (activeTab === "country") searchCountry(searchTerm);
      if (activeTab === "state") searchState(searchTerm);
      if (activeTab === "city") searchCity(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [activeTab, searchTerm]);

  const endpointMap = { country: "Country", state: "State", city: "City" };
  const dataMap = {
    country: displayedCountries,
    state: displayedStates,
    city: displayedCities,
  };
  const apiData = dataMap[activeTab] || [];

  const countryOptions = useMemo(
    () =>
      countries
        .filter((c) => c.status === "Active")
        .map((c) => ({ label: c.name, value: c.id })),
    [countries],
  );

  const selectedCountry = watch("countryId");

  const stateOptions = useMemo(
    () =>
      states
        .filter((s) => s.countryId === selectedCountry && s.status === "Active")
        .map((s) => ({ label: s.name, value: s.id })),
    [states, selectedCountry],
  );

  const filteredStateOptions = useMemo(
    () =>
      states
        .filter(
          (s) => s.countryId === filterValues.countryId && s.status === "Active",
        )
        .map((s) => ({ label: s.name, value: s.id })),
    [states, filterValues.countryId],
  );

  const showPopup = (title, message, type = "success") => {
    setPopupState({ isOpen: true, title, message, type });
  };

  const handleEdit = (row) => {
    Object.keys(row).forEach((key) => {
      setValue(key, row[key]);
    });
    setEditingId(row.id);
    setIsModalOpen(true);
  };

  const handleDelete = (row) => {
    setDeleteItem(row);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    const res = await remove(endpointMap[activeTab], deleteItem);
    if (res.success) {
      showPopup("Success!", `${currentConfig.label} deleted successfully!`);
    } else {
      showPopup("Error!", `Failed to delete ${currentConfig.label}.`, "error");
    }
    setIsConfirmOpen(false);
    setDeleteItem(null);
  };

  const StatusBadge = ({ status }) => (
    <span
      className={`d-inline-flex align-items-center justify-content-center text-white fw-bold status-badge-style ${
        status === "Active" ? "status-badge-active" : "status-badge-inactive"
      }`}
    >
      {status}
    </span>
  );

  const tabsConfig = {
    country: {
      label: "Country",
      columns: [
        { key: "name", label: "Country Name" },
        {
          key: "code",
          label: "Country Code",
          className: "text-custom-blue fw-medium",
        },
        {
          key: "status",
          label: "Status",
          render: (row) => <StatusBadge status={row.status} />,
        },
        {
          key: "action",
          label: "Action",
          render: (row) => (
            <div className="d-flex justify-content-center gap-3 action-icons-container">
              <FiEdit2
                className="action-icon icon-edit"
                onClick={() => handleEdit(row)}
                title="Edit"
              />
              <FiTrash2
                className="action-icon icon-delete"
                onClick={() => handleDelete(row)}
                title="Delete"
              />
              <label
                className="ios-toggle"
                title="Toggle Status"
              >
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
      ],
      filters: [],
      formFields: [
        {
          name: "code",
          label: "Country Code",
          type: "text",
          placeholder: "Enter Country Code",
        },
        {
          name: "name",
          label: "Country Name",
          type: "text",
          placeholder: "Enter Country Name",
        },
      ],
    },
    state: {
      label: "State",
      columns: [
        { key: "name", label: "State Name" },
        {
          key: "countryId",
          label: "Country Name",
          render: (row) => getCountryName(row.countryId),
          className: "text-custom-blue fw-medium",
        },
        {
          key: "status",
          label: "Status",
          render: (row) => <StatusBadge status={row.status} />,
        },
        {
          key: "action",
          label: "Action",
          render: (row) => (
            <div className="d-flex justify-content-center gap-3 action-icons-container">
              <FiEdit2
                className="action-icon icon-edit"
                onClick={() => handleEdit(row)}
                title="Edit"
              />
              <FiTrash2
                className="action-icon icon-delete"
                onClick={() => handleDelete(row)}
                title="Delete"
              />
              <label
                className="ios-toggle"
                title="Toggle Status"
              >
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
      ],
      filters: [
        {
          filterKey: "countryId",
          placeholder: "Select Country",
          options: countryOptions,
        },
      ],
      formFields: [
        {
          name: "countryId",
          label: "Country Name",
          type: "select",
          placeholder: "Select Country Name",
          options: countryOptions,
        },
        {
          name: "code",
          label: "State Code",
          type: "text",
          placeholder: "Enter State Code",
        },
        {
          name: "name",
          label: "State Name",
          type: "text",
          placeholder: "Enter State Name",
        },
      ],
    },
    city: {
      label: "City",
      columns: [
        { key: "name", label: "City Name" },
        {
          key: "stateId",
          label: "State Name",
          render: (row) => getStateName(row.stateId),
          className: "text-custom-blue fw-medium",
        },
        {
          key: "countryId",
          label: "Country Name",
          render: (row) => getCountryName(row.countryId),
          className: "text-custom-blue fw-medium",
        },
        {
          key: "status",
          label: "Status",
          render: (row) => <StatusBadge status={row.status} />,
        },
        {
          key: "action",
          label: "Action",
          render: (row) => (
            <div className="d-flex justify-content-center gap-3 action-icons-container">
              <FiEdit2
                className="action-icon icon-edit"
                onClick={() => handleEdit(row)}
                title="Edit"
              />
              <FiTrash2
                className="action-icon icon-delete"
                onClick={() => handleDelete(row)}
                title="Delete"
              />
              <label
                className="ios-toggle"
                title="Toggle Status"
              >
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
      ],
      filters: [
        {
          filterKey: "countryId",
          placeholder: "Select Country",
          options: countryOptions,
        },
        {
          filterKey: "stateId",
          placeholder: "Select State",
          options: filteredStateOptions,
        },
      ],
      formFields: [
        {
          name: "countryId",
          label: "Country Name",
          type: "select",
          placeholder: "Select Country Name",
          options: countryOptions,
        },
        {
          name: "stateId",
          label: "State Name",
          type: "select",
          placeholder: "Select State Name",
          options: stateOptions,
        },
        {
          name: "name",
          label: "City Name",
          type: "text",
          placeholder: "Enter City Name",
        },
      ],
    },
  };
  const handleToggleStatus = async (row) => {
    const newStatus = row.status !== "Active"; // convert to boolean

    const res = await toggleStatus(endpointMap[activeTab], row.id, newStatus);

    if (res.success) {
      showPopup(
        "Success!",
        `${currentConfig.label} ${
          newStatus ? "enabled" : "disabled"
        } successfully!`,
      );
    } else {
      showPopup("Error!", "Failed to update status", "error");
    }
  };

  const currentConfig = tabsConfig[activeTab];
  const getCountryName = (id) =>
    countries.find((c) => c.id === id)?.name || "-";
  const getStateName = (id) => states.find((s) => s.id === id)?.name || "-";

  const filteredData = useMemo(() => {
    const data = apiData.filter((item) => {
      const matchSearch =
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.code &&
          item.code.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchFilter = Object.entries(filterValues).every(([key, val]) =>
        !val ? true : item[key] === val,
      );
      return matchSearch && matchFilter;
    });
    return data.sort((a, b) => a.name?.localeCompare(b.name));
  }, [apiData, searchTerm, filterValues]);

  const paginatedData = filteredData.slice(0, visibleCount);
  const loadMore = () => {
    if (visibleCount >= filteredData.length) return;
    setIsFetching(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 10);
      setIsFetching(false);
    }, 1000);
  };

  const onSubmit = async (data) => {
    const endpoint = endpointMap[activeTab];
    const payload = {
      id: editingId,
      code: data.code,
      name: data.name,
      countryId: data.countryId,
      stateId: data.stateId,
      createdBy: "Admin",
      updatedBy: "Admin",
    };
    try {
      if (editingId) {
        await update(endpoint, editingId, payload);
        showPopup("Success!", `${currentConfig.label} updated successfully!`);
      } else {
        await create(endpoint, payload);
        showPopup("Success!", `${currentConfig.label} added successfully!`);
      }
      setIsModalOpen(false);
      reset();
      setEditingId(null);
    } catch (error) {
      showPopup("Error!", "Failed to save. Please try again.", "error");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 className="general-title">
            General
          </h2>
          <div
            className="d-flex align-items-center gap-2 breadcrumb-container"
          >
            <FiHome size={14} /> / Configuration /{" "}
            <span className="fw-medium text-dark">{currentConfig.label}</span>
          </div>
        </div>
        <button
          className="btn text-white d-flex align-items-center gap-2 border-0 shadow-sm add-btn add-btn-custom"
          onClick={() => {
            reset();
            setEditingId(null);
            setIsModalOpen(true);
          }}
        >
          <FiPlus /> Add {currentConfig.label}
        </button>
      </div>

      <div className="card border-1 shadow-sm rounded-3 general-card">
        {/* Tabs */}
        <div className="d-flex border-bottom mb-3 w-100 overflow-auto">
          {Object.keys(tabsConfig).map((tabKey) => (
            <button
              key={tabKey}
              className={`tab-btn-custom ${activeTab === tabKey ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tabKey);
                setSearchTerm("");
                setFilterValues({});
                reset();
              }}
            >
              {tabsConfig[tabKey].label}
            </button>
          ))}
        </div>

        <div className="filter-row">
          <div className="filters-group">
            {currentConfig.filters.map((filter, index) => (
              <div
                key={index}
                className="filter-item filter-item-custom"
              >
                <ReusableDropdown
                  placeholder={filter.placeholder}
                  options={filter.options}
                  value={filterValues[filter.filterKey] || ""}
                  onChange={(val) =>
                    setFilterValues((prev) => ({
                      ...prev,
                      [filter.filterKey]: val,
                    }))
                  }
                />
              </div>
            ))}
            <button
              className="btn-filter-action btn-clear-emp"
              onClick={() => {
                setSearchTerm("");
                setFilterValues({});
              }}
            >
              Clear
            </button>
          </div>

          <div className="search-container">
            <ReusableSearch
              placeholder={`Search ${currentConfig.label}...`}
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
        </div>

        {(filteredData && filteredData.length > 0) || loading ? (
          <ReusableTable
            columns={currentConfig.columns}
            data={paginatedData}
            isFetching={loading || isFetching}
            onLoadMore={loadMore}
          />
        ) : (
          <div className="text-center py-5 rounded-3 bg-light text-muted">
            No records found
          </div>
        )}
      </div>

      <ResuableForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
          setEditingId(null);
        }}
        title={
          editingId
            ? `Edit ${currentConfig.label}`
            : `Add ${currentConfig.label}`
        }
        submitText={
          editingId
            ? `Update ${currentConfig.label}`
            : `Create ${currentConfig.label}`
        }
        onSubmit={handleSubmit(onSubmit)}
      >
        {currentConfig.formFields.map((field, index) => (
          <div className="mb-3" key={index}>
            <label className="form-label fw-medium text-dark small mb-1">
              {field.label}
            </label>
            {field.type === "text" ? (
              <TextField
                placeholder={field.placeholder}
                fullWidth
                size="small"
                variant="outlined"
                error={!!errors[field.name]}
                helperText={errors[field.name]?.message}
                {...register(field.name, {
                  required: `${field.label} is required`,
                  onChange: (e) => {
                    if (field.name === "code")
                      e.target.value = e.target.value.toUpperCase();
                  },
                })}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
            ) : (
              <div className="d-flex flex-column">
                <input
                  type="hidden"
                  {...register(field.name, {
                    required: `${field.label} is required`,
                  })}
                />
                <ReusableDropdown
                  placeholder={field.placeholder}
                  options={field.options}
                  value={watch(field.name) || ""}
                  error={!!errors[field.name]}
                  onChange={(val) => {
                    setValue(field.name, val, { shouldValidate: true });
                    if (field.name === "countryId") setValue("stateId", "");
                  }}
                  disabled={field.name === "stateId" && !watch("countryId")}
                />
                {errors[field.name] && (
                  <span className="text-danger small mt-1 ms-2">
                    {errors[field.name]?.message}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </ResuableForm>
      <ReusableConfirm
        isOpen={isConfirmOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${deleteItem?.name || "this item"}?`}
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

export default General;
