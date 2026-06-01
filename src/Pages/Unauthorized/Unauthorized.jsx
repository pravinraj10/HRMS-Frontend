import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light text-center">
      <h1 className="display-1 text-danger fw-bold">403</h1>
      <h2 className="mb-4">Access Denied</h2>
      <p className="text-muted mb-4">
        You do not have permission to view this page. Please contact your administrator if you believe this is a mistake.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        Go Back to Dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;
