import React from 'react';
import { FiHome, FiChevronDown, FiRefreshCcw, FiFlag } from 'react-icons/fi';
import { BiTrophy, BiBuilding } from 'react-icons/bi';
import profileImg from '../../../asset/image/profile.jpg';
import './ViewStatusHistory.css';

const ViewStatusHistory = () => {
  return (
    <div className="view-status-history-wrapper">
      {/* Breadcrumb Header */}
      <div className="vsh-header">
        <h2 className="page-main-title">Status & History</h2>
        <div className="d-flex align-items-center gap-2 breadcrumb-container">
          <FiHome size={14} /> / <span>Employee Management</span> / <span className="fw-medium text-dark">Status & History</span>
        </div>
      </div>

      <div className="vsh-scroll-container">
        {/* Profile Section */}
        <div className="vsh-profile-section">
          <div className="vsh-profile-info">
            <img src={profileImg} alt="Profile" className="vsh-profile-img" />
            <div className="vsh-profile-details">
              <h3 className="current-status-title">Current Status <span className="status-dot"></span></h3>
              <p className="emp-id-text">EMP ID: EMP_12547</p>
            </div>
          </div>
          <button className="btn-deactivate">
            Deactivate <FiChevronDown size={16} />
          </button>
        </div>

      {/* History Section */}
      <div className="vsh-history-section">
        <h4>Employment History</h4>
        <div className="vsh-timeline">
          
          {/* Card 1 */}
          <div className="vsh-timeline-item">
            <div className="vsh-timeline-icon gold">
              <BiTrophy size={18} />
            </div>
            <div className="vsh-timeline-card">
              <div className="vsh-timeline-date">July 15, 2025</div>
              <div className="vsh-timeline-title">Promoted to Senior Product Designer</div>
              <div className="vsh-timeline-desc">Recognized for outstanding performance and leadership in the design team.</div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="vsh-timeline-item">
            <div className="vsh-timeline-icon blue">
              <FiRefreshCcw size={18} />
            </div>
            <div className="vsh-timeline-card">
              <div className="vsh-timeline-date">Feb 24, 2025</div>
              <div className="vsh-timeline-title">Manager Change</div>
              <div className="vsh-timeline-desc">Manager changes from John carter to Sarah Chen</div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="vsh-timeline-item">
            <div className="vsh-timeline-icon gray">
              <BiBuilding size={18} />
            </div>
            <div className="vsh-timeline-card">
              <div className="vsh-timeline-date">Sept 07, 2023</div>
              <div className="vsh-timeline-title">Department Transfer</div>
              <div className="vsh-timeline-desc">Transferred from the Marketing Department to the Product Department.</div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="vsh-timeline-item">
            <div className="vsh-timeline-icon green">
              <FiFlag size={18} />
            </div>
            <div className="vsh-timeline-card">
              <div className="vsh-timeline-date">May 18, 2022</div>
              <div className="vsh-timeline-title">Hired as Product Designer</div>
              <div className="vsh-timeline-desc">Joined the company in the marketing department.</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
);
};

export default ViewStatusHistory;