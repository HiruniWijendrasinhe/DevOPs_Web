// components/CreateIncident.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CreateIncident.css";

function CreateIncident() {
  const [showModal, setShowModal] = useState(false);
  const [incidentData, setIncidentData] = useState({
    Title: "",
    Description: "",
    Team: "Development"
  });
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const Back_End_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated. Please log in to see your incidents.");
        setLoading(false);
        return;
      }
      console.log("Fetching incidents with token present?", !!token, "len=", token ? token.length : 0);
      // Fetch all incidents for any authenticated user
      const res = await axios.get(`${Back_End_URL}/api/auth/incidents/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('GET /incidents/mine response status:', res.status);
      const data = res.data || [];
      console.log('Fetched incidents data:', data);
      setIncidents(data);
      // if nothing selected, select the newest by default
      if (!selectedIncident && data.length > 0) {
        setSelectedIncident(data[0]);
      }
      return data;
    } catch (err) {
      console.error("Error fetching incidents:", err);
      // If unauthorized, suggest login
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError("Authentication failed — please log in again.");
        // optional: clear invalid token locally
        localStorage.removeItem("token");
      } else {
        setError("Could not load incidents");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch incidents when user logs in or profile updates
  useEffect(() => {
    const handler = (e) => {
      console.log('profileUpdated event received in CreateIncident', e?.detail);
      fetchIncidents();
    };
    window.addEventListener('profileUpdated', handler);
    // Also listen for storage changes (in case other tabs update token)
    const storageHandler = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        console.log('storage event in CreateIncident', e.key);
        fetchIncidents();
      }
    };
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener('profileUpdated', handler);
      window.removeEventListener('storage', storageHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to report an incident.");
      return;
    }

    console.log("Submitting incident with token present?", !!token, "len=", token ? token.length : 0, incidentData);

    try {
      await axios.post(`${Back_End_URL}/api/auth/incidents`, incidentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // refresh list, close create modal and open detail modal for newest incident
      const data = await fetchIncidents();
      setShowModal(false);
      setIncidentData({ Title: "", Description: "", Team: "Development" });
      if (data && data.length > 0) {
        // list is ordered by Created_At DESC in backend, so first is newest
        setSelectedIncident(data[0]);
      }
    } catch (error) {
      console.error("Error creating incident:", error);
      if (error.response) {
        console.error("Server response data:", error.response.data);
      }
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert("Authentication failed — please log in again.");
        localStorage.removeItem("token");
      } else {
        alert("Failed to report incident");
      }
    }
  };

  const openIncidentDetail = (inc) => {
    setSelectedIncident(inc);
  };

  const closeIncidentDetail = () => {
    setSelectedIncident(null);
  };

  return (
    <div className="create-incident-page">
      <h2 className="page-quote">"Report an incident — your voice makes us better."</h2>

      <div className="create-actions">
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          +Create
        </button>
        <button className="btn-secondary" onClick={() => fetchIncidents()} style={{marginLeft: '12px'}}>
          Refresh
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Report New Incident</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="incident-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={incidentData.Title}
                  onChange={(e) => setIncidentData({...incidentData, Title: e.target.value})}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={incidentData.Description}
                  onChange={(e) => setIncidentData({...incidentData, Description: e.target.value})}
                  placeholder="Detailed description of the incident..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label>Team *</label>
                <select
                  value={incidentData.Team}
                  onChange={(e) => setIncidentData({...incidentData, Team: e.target.value})}
                  required
                >
                  <option value="Development">Development Team</option>
                  <option value="QA">QA Team</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Report Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="incidents-tabs">
        <h3 className="incidents-title">Reported Incidents</h3>
        {loading && <p>Loading incidents...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && incidents.length === 0 && <p>No incidents reported yet.</p>}

        {/* Accordion - one incident per full-width row */}
        <div className="accordion-row">
          {incidents.map((inc, idx) => {
            const id = inc.ID || inc.id || idx;
            const isOpen = selectedIncident && (selectedIncident.ID === inc.ID || selectedIncident.id === inc.id);
            return (
              <div key={id} className={`accordion-item ${isOpen ? 'open' : ''}`}>
                <div className="accordion-header" onClick={() => setSelectedIncident(isOpen ? null : inc)}>
                  <div className="header-left">
                      <div className="header-title">{inc.Title}</div>
                      <div className="header-meta">
                        {inc.Team && <div className="header-meta-item"><strong>Team:</strong> <span>{inc.Team}</span></div>}
                        {inc.Created_At && <div className="header-meta-item"><strong>Created at:</strong> <span>{new Date(inc.Created_At).toLocaleString()}</span></div>}
                      </div>
                    </div>
                    <div className="header-right">
                      {/* keep a small indicator if needed */}
                    </div>
                </div>

                <div className="accordion-content" style={{display: isOpen ? 'block' : 'none'}}>
                  <div className="incident-card selected">
                    <h4>{inc.Description || inc.Title}</h4>
                    <div className="incident-fields">
                      {inc.Complainer_Name && (
                        <div><strong>Reported by:</strong> <span>{inc.Complainer_Name}</span></div>
                      )}
                      {inc.Assigned_To_Name && (
                        <div><strong>Assigned to:</strong> <span>{inc.Assigned_To_Name}</span></div>
                      )}
                      {inc.Resolver_Team && (
                        <div><strong>Resolver Team:</strong> <span>{inc.Resolver_Team}</span></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail modal removed: details are shown inline in the accordion */}
    </div>
  );
}

export default CreateIncident;