// components/CreateIncident.js


import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CreateIncident.css";
const Back_End_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

function ResolverAssignDropdown({ incident, users, onAssign }) {
  const [open, setOpen] = React.useState(false);
  const teamMembers = users.filter(u => u.Team === incident.Team);
  return (
    <div style={{position:'relative'}}>
      <button className="icon-btn resolver-assign-btn" title="Assign Resolver" style={{width:32,height:32,background:'#e0f7fa',color:'#00796b',fontWeight:'bold',fontSize:'1.5rem'}} onClick={e => {e.stopPropagation(); setOpen(o => !o);}}>+
      </button>
      {open && (
        <div style={{position:'absolute',right:0,top:'110%',background:'#fff',border:'1px solid #ccc',borderRadius:6,boxShadow:'0 2px 8px #0001',zIndex:10,minWidth:160}}>
          {teamMembers.length === 0 && <div style={{padding:8}}>No team members</div>}
          {teamMembers.map(member => (
            <div key={member.ID} style={{padding:8,cursor:'pointer',display:'flex',alignItems:'center',gap:8}} onClick={e => {e.stopPropagation(); setOpen(false); onAssign(member);}}>
              <img src={member.Profile_Url || ''} alt={member.User_Name} style={{width:24,height:24,borderRadius:'50%',objectFit:'cover',border:'1px solid #ccc',background:'#eee'}} onError={e => {e.target.onerror=null; e.target.src='https://ui-avatars.com/api/?name='+encodeURIComponent(member.User_Name);}} />
              <span>{member.User_Name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateIncident({ hideCreateActions, showResolverAssign = false, hideHeadings = false, adminAssignedStyle = false }) {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
      // Get current user from localStorage (assume user info is stored as 'user' JSON)
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch {}
      }
    }, []);
  const [users, setUsers] = useState([]);
    // Fetch all users for resolver assignment (admin only)
    useEffect(() => {
      if (showResolverAssign) {
        const fetchUsers = async () => {
          try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${Back_End_URL}/api/auth/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
            setUsers(res.data);
          } catch (e) { setUsers([]); }
        };
        fetchUsers();
      }
    }, [showResolverAssign, Back_End_URL]);
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
  const [editId, setEditId] = useState(null);

  // Back_End_URL is already declared at the top of the file

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

  console.log("[DEBUG] handleSubmit called", incidentData, 'editId:', editId);

  try {
    let res;
    if (editId) {
      // Editing existing incident
      console.log('[DEBUG] Editing incident', editId, incidentData);
      res = await axios.put(`${Back_End_URL}/api/auth/incidents/${editId}`, incidentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('[DEBUG] Edit response', res.status, res.data);
    } else {
      // Creating new incident
      console.log('[DEBUG] Creating new incident', incidentData);
      res = await axios.post(`${Back_End_URL}/api/auth/incidents`, incidentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('[DEBUG] Create response', res.status, res.data);
    }
    const data = await fetchIncidents();
    setShowModal(false);
    setIncidentData({ Title: "", Description: "", Team: "Development" });
    setEditId(null);
    if (data && data.length > 0) {
      setSelectedIncident(data[0]);
    }
  } catch (error) {
    console.error("[DEBUG] Error creating/editing incident:", error);
    if (error.response) {
      console.error("[DEBUG] Server response data:", error.response.data);
    }
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      alert("Authentication failed — please log in again.");
      localStorage.removeItem("token");
    } else {
      alert("Failed to report incident");
    }
  }
};

  const handleEdit = (inc) => {
    setIncidentData({
      Title: inc.Title,
      Description: inc.Description,
      Team: inc.Team
    });
    setEditId(inc.ID || inc.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this incident?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${Back_End_URL}/api/auth/incidents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchIncidents();
    } catch (error) {
      alert("Failed to delete incident");
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
      {!hideHeadings && <h2 className="page-quote">"Report an incident — your voice makes us better."</h2>}

      {!hideCreateActions && (
        <div className="create-actions-vertical">
          <button className="icon-btn add-btn" title="Add" onClick={() => setShowModal(true)}>
            <span style={{fontSize: '2rem', lineHeight: 1, fontWeight: 'bold'}}>+</span>
          </button>
          <button className="icon-btn refresh-btn" title="Refresh" onClick={() => fetchIncidents()}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4V1L7 6l5 5V7c1.93 0 3.68.78 4.95 2.05A7 7 0 1 1 5 12H3a9 9 0 1 0 14.65-5.65z" fill="#333"/>
            </svg>
          </button>
        </div>
      )}

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
        {!hideHeadings && <h3 className="incidents-title">Reported Incidents</h3>}
        {loading && <p>Loading incidents...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && incidents.length === 0 && <p>No incidents reported yet.</p>}

        {/* Accordion - one incident per full-width row */}
        <div className="accordion-row">
          {incidents.map((inc, idx) => {
            const id = inc.ID || inc.id || idx;
            const isOpen = selectedIncident && (selectedIncident.ID === inc.ID || selectedIncident.id === inc.id);
            // Team color mapping
            const teamColors = {
              HR: '#ffe0ef', // light pink
              QA: '#e0f0ff', // light blue
              Finance: '#fffbe0', // light yellow
              Operations: '#f3f3f3', // light gray
              Development: '#e0ffe0' // light green
            };
            return (
              <div key={id} className={`accordion-item ${isOpen ? 'open' : ''}`} style={{ background: '#fff' }}>
                <div className="accordion-header" onClick={() => setSelectedIncident(isOpen ? null : inc)}>
                  <div className="header-left">
                      <div className="header-title">{inc.Title}</div>
                      <div className="header-meta">
                        {inc.Team && (
                          <div className="header-meta-item">
                            <strong>Team:</strong>
                            <span
                              className={
                                'department-badge ' +
                                (inc.Team === 'HR'
                                  ? 'department-hr'
                                  : inc.Team === 'QA'
                                  ? 'department-qa'
                                  : inc.Team === 'Finance'
                                  ? 'department-finance'
                                  : inc.Team === 'Operations'
                                  ? 'department-operations'
                                  : inc.Team === 'Development'
                                  ? 'department-development'
                                  : '')
                              }
                            >
                              {inc.Team}
                            </span>
                          </div>
                        )}
                        {inc.Created_At && <div className="header-meta-item"><strong>Created at:</strong> <span>{new Date(inc.Created_At).toLocaleString()}</span></div>}
                      </div>
                    </div>
                    <div className="header-right" style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                      {/* Show assigned person if exists */}
                      {inc.Assigned_To_Name && (
                        <span
                          style={adminAssignedStyle
                            ? { marginRight: '0.5rem', fontWeight: 500, color: '#fff', background: '#7c3aed', borderRadius: 6, padding: '2px 12px', fontSize: '0.97rem', letterSpacing: 0.2 }
                            : { marginRight: '0.5rem', fontWeight: 500, color: '#00796b', background: '#e0f7fa', borderRadius: 6, padding: '2px 10px', fontSize: '0.95rem' }
                          }
                        >
                          Assigned to: {inc.Assigned_To_Name}
                        </span>
                      )}
                      {showResolverAssign ? (
                        <ResolverAssignDropdown incident={inc} users={users} onAssign={async (member) => {
                          // Assign resolver via backend (Assigned_To expects user ID)
                          try {
                            const token = localStorage.getItem("token");
                            await axios.put(`${Back_End_URL}/api/auth/incidents/${inc.ID || inc.id}`, { Assigned_To: member.ID }, { headers: { Authorization: `Bearer ${token}` } });
                            fetchIncidents();
                          } catch (e) { alert("Failed to assign resolver"); }
                        }} />
                      ) : (
                        <>
                          <button className="icon-btn edit-btn" title="Edit" style={{width:32,height:32}} onClick={e => {e.stopPropagation(); handleEdit(inc);}}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="#333"/></svg>
                          </button>
                          <button className="icon-btn delete-btn" title="Delete" style={{width:32,height:32}} onClick={e => {e.stopPropagation(); handleDelete(inc.ID || inc.id);}}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#b80000"/></svg>
                          </button>
                        </>
                      )}
                    </div>

                </div>

                <div className="accordion-content" style={{display: isOpen ? 'block' : 'none'}}>
                  <div className="incident-card selected">
                    <h4>{inc.Description || inc.Title}</h4>
                    <div className="incident-fields">
                      {inc.Complainer_Name && (
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                          <strong>Reported by:</strong>
                          {inc.Complainer_Photo && (
                            <img src={inc.Complainer_Photo} alt="Profile" style={{width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #bbb', background: '#f3f3f3'}} />
                          )}
                          <span>{inc.Complainer_Name}</span>
                        </div>
                      )}
                      {inc.Resolver_Name && (
                        <div><strong>Resolved by:</strong> <span>{inc.Resolver_Name}</span></div>
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