import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import axios from 'axios';
import './CreateIncident.css';

function Progress() {
  const [activeTab, setActiveTab] = useState('todo');
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIncident, setModalIncident] = useState(null);
  const [userId, setUserId] = useState(null);

  // Get user ID from token (assumes JWT with sub or id field)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Optionally, decode the token to get userId
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.sub || payload.id || null);
      } catch (e) {
        setUserId(null);
      }
    }
    const fetchIncidents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://174.129.55.24:82/api/auth/incidents/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIncidents(res.data || []);
      } catch (e) {
        setIncidents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  const todoIncidents = incidents.filter(inc => inc.Assigned_To && (!inc.Stage || inc.Stage === 'To Do'));
  const inProgressIncidents = incidents.filter(inc => inc.Stage === 'In Progress');
  const doneIncidents = incidents.filter(inc => inc.Stage === 'Done');

  return (
    <React.Fragment>
      <div className="progress-tabs-container" style={{maxWidth: 1200, margin: '0 auto', padding: 24}}>
        <div style={{display:'flex',gap:40,alignItems:'flex-start'}}>
          <div style={{flex:1, background:'#f8f8fc', borderRadius:16, minHeight:300, padding:'18px 12px', boxShadow:'0 2px 8px #0001'}}>
            <div style={{textAlign:'center', marginBottom: 10}}>
              <button className="tab-btn active" style={{width:'230px', minWidth:0}}>To Do</button>
            </div>
            {loading ? <p>Loading...</p> : todoIncidents.length === 0 ? <p>No incidents to do.</p> : todoIncidents.map(inc => <IncidentHeader key={inc.ID || inc.id} inc={inc} onClick={() => setModalIncident(inc)} />)}
          </div>
          <div style={{flex:1, background:'#f8f8fc', borderRadius:16, minHeight:300, padding:'18px 12px', boxShadow:'0 2px 8px #0001'}}>
            <div style={{textAlign:'center', marginBottom: 10}}>
              <button className="tab-btn active" style={{width:'230px', minWidth:0}}>In Progress</button>
            </div>
            {loading ? <p>Loading...</p> : inProgressIncidents.length === 0 ? <p>No incidents in progress.</p> : inProgressIncidents.map(inc => <IncidentHeader key={inc.ID || inc.id} inc={inc} onClick={() => setModalIncident(inc)} />)}
          </div>
          <div style={{flex:1, background:'#f8f8fc', borderRadius:16, minHeight:300, padding:'18px 12px', boxShadow:'0 2px 8px #0001'}}>
            <div style={{textAlign:'center', marginBottom: 10}}>
              <button className="tab-btn active" style={{width:'230px', minWidth:0}}>Done</button>
            </div>
            {loading ? <p>Loading...</p> : doneIncidents.length === 0 ? <p>No completed incidents.</p> : doneIncidents.map(inc => <IncidentHeader key={inc.ID || inc.id} inc={inc} onClick={() => setModalIncident(inc)} />)}
          </div>
        </div>
      </div>
      <IncidentModal inc={modalIncident} onClose={() => setModalIncident(null)} />
    </React.Fragment>
  );

    function IncidentHeader({ inc, onClick }) {
      // Determine next state
      let nextState = null;
      if (!inc.Stage || inc.Stage === 'To Do') nextState = 'In Progress';
      else if (inc.Stage === 'In Progress') nextState = 'Done';
      // Handler to move to next state
      const handleMoveToNext = async (e) => {
        e.stopPropagation();
        if (!nextState) return;
        try {
          const token = localStorage.getItem('token');
          await axios.put(
            `http://174.129.55.24:82/api/auth/incidents/${inc.ID || inc.id}`,
            { Stage: nextState },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          // Refresh incidents
          const res = await axios.get(`http://174.129.55.24:82/api/auth/incidents/all`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIncidents(res.data || []);
        } catch (err) {
          alert('Failed to move to next state');
        }
      };
      return (
        <div className="incident-header-row" style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #0001', marginBottom: 16, padding: '16px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} onClick={onClick}>
          <div style={{ fontWeight: 600, fontSize: '1.13rem', marginBottom: 4 }}>{inc.Title}</div>
          {inc.Assigned_To_Name && (
            <span style={{ fontWeight: 500, color: '#661332', background: '#e0f7fa', borderRadius: 6, padding: '2px 10px', fontSize: '0.93rem', letterSpacing: 0.2, marginBottom: 2, marginTop: 2, display: 'inline-block' }}>
              Assigned to: <span style={{ fontSize: '0.93em', color: '#661332' }}>{inc.Assigned_To_Name}</span>
            </span>
          )}
          {/* Move to Next State Button */}
          {/* Only show button if logged-in user is the assigned person */}
          {nextState && userId && inc.Assigned_To === userId && (
            <button
              onClick={handleMoveToNext}
              style={{
                marginTop: 4,
                alignSelf: 'flex-end',
                background: '#e53935',
                color: '#fff',
                border: 'none',
                borderRadius: 3,
                padding: '1px 4px',
                fontWeight: 500,
                fontSize: '0.72rem',
                minHeight: 0,
                minWidth: 0,
                lineHeight: 1,
                cursor: 'pointer',
                boxShadow: '0 1px 2px #0001',
                height: '20px',
                maxWidth: '110px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              Move to Next State
            </button>
          )}
        </div>
      );
    }

    function IncidentModal({ inc, onClose }) {
      // Move hooks to top
      const [editPriority, setEditPriority] = useState(inc?.Priority || '');
      const [editSeverity, setEditSeverity] = useState(inc?.Severity || '');
      const [editMsg, setEditMsg] = useState("");
      // Sync local state with incident when modal opens or incident changes
      useEffect(() => {
        setEditPriority(typeof inc?.Priority === 'string' ? inc.Priority : '');
        setEditSeverity(typeof inc?.Severity === 'string' ? inc.Severity : '');
      }, [inc]);
            // Download comments as PDF
            const handleDownloadPDF = () => {
              if (!comments || comments.length === 0) return;
              const doc = new jsPDF();
              doc.setFontSize(16);
              doc.text(`Comments for Incident: ${inc.Title || ''}`, 10, 15);
              doc.setFontSize(12);
              let y = 25;
              comments.forEach((c, idx) => {
                const author = c.Created_By_Name || 'Unknown';
                const date = c.Created_At ? new Date(c.Created_At).toLocaleString() : '';
                const text = c.Content || c.Comment_Text || '';
                doc.text(`${idx + 1}. ${text}`, 10, y);
                y += 7;
                doc.text(`   By: ${author}   At: ${date}`, 12, y);
                y += 10;
                if (y > 270) {
                  doc.addPage();
                  y = 15;
                }
              });
              doc.save(`Incident_${inc.ID || inc.id}_Comments.pdf`);
            };
      const [comments, setComments] = useState([]);
      const [commentLoading, setCommentLoading] = useState(false);
      const [commentText, setCommentText] = useState("");
      const [commentError, setCommentError] = useState("");
      const [submitting, setSubmitting] = useState(false);
      // Track which comment is being edited and its text
      const [editingCommentId, setEditingCommentId] = useState(null);
      const [editText, setEditText] = useState("");

      useEffect(() => {
        if (!inc) return;
        const fetchComments = async () => {
          setCommentLoading(true);
          setCommentError("");
          try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://174.129.55.24:82/api/comments/incident/${inc.ID || inc.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setComments(res.data || []);
          } catch (e) {
            setComments([]);
            setCommentError("Failed to load comments.");
          } finally {
            setCommentLoading(false);
          }
        };
        fetchComments();
      }, [inc]);

      if (!inc) return null;
      const teamColors = {
        HR: '#ffe0ef',
        QA: '#e0f0ff',
        Finance: '#fffbe0',
        Operations: '#f3f3f3',
        Development: '#e0ffe0'
      };
      // Priority and Severity colors
      const priorityColors = {
        High: '#ffe0e0',
        Medium: '#fffbe0',
        Low: '#e0ffe0'
      };
      const severityColors = {
        Low: '#e0f7fa',
        Medium: '#fffbe0',
        High: '#ffe0ef',
        Critical: '#ffd6d6'
      };

      // Only assigned user can add comments
      const canComment = userId && inc.Assigned_To === userId;

      const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setSubmitting(true);
        setCommentError("");
        try {
          const token = localStorage.getItem('token');
          await axios.post(`http://174.129.55.24:82/api/comments/`, {
            Incident_ID: inc.ID || inc.id,
            Content: commentText
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCommentText("");
          // Refresh comments
          const res = await axios.get(`http://174.129.55.24:82/api/comments/incident/${inc.ID || inc.id}`,
            { headers: { Authorization: `Bearer ${token}` } });
          setComments(res.data || []);
        } catch (e) {
          setCommentError("Failed to add comment.");
        } finally {
          setSubmitting(false);
        }
      };

      // Helper handlers for comment edit/delete
      const handleEdit = async (commentId, newText) => {
        if (!newText.trim()) return;
        setSubmitting(true);
        setCommentError("");
        try {
          const token = localStorage.getItem('token');
          await axios.put(`http://174.129.55.24:82/api/comments/${commentId}`,
            { Comment_Text: newText },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setEditingCommentId(null);
          setEditText("");
          // Refresh comments
          const res = await axios.get(`http://174.129.55.24:82/api/comments/incident/${inc.ID || inc.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setComments(res.data || []);
        } catch (e) {
          setCommentError("Failed to update comment.");
        } finally {
          setSubmitting(false);
        }
      };

      const handleDelete = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        setSubmitting(true);
        setCommentError("");
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://174.129.55.24:82/api/comments/${commentId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          // Refresh comments
          const res = await axios.get(`http://174.129.55.24:82/api/comments/incident/${inc.ID || inc.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setComments(res.data || []);
        } catch (e) {
          setCommentError("Failed to delete comment.");
        } finally {
          setSubmitting(false);
        }
      };

      // Only assigned user can edit Priority and Severity
      const canEditPrioritySeverity = userId && inc.Assigned_To === userId;
      const handleSavePrioritySeverity = async (e) => {
        e.preventDefault();
        setEditMsg("");
        try {
          const token = localStorage.getItem('token');
          // Always send both Priority and Severity
          const updatePayload = {
            Priority: editPriority,
            Severity: editSeverity
          };
          await axios.put(
            `http://174.129.55.24:82/api/incidents/${inc.ID || inc.id}`,
            updatePayload,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setEditMsg("Saved!");
          // Refresh incident data after save
          const res = await axios.get(`http://174.129.55.24:82/api/incidents/all`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const updated = res.data?.find(i => (i.ID || i.id) === (inc.ID || inc.id));
          if (updated) {
            setEditPriority(updated.Priority || '');
            setEditSeverity(updated.Severity || '');
          }
        } catch (err) {
          setEditMsg("Failed to save changes.");
        }
      };

      // Render
      return (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0005', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ background: '#fff', borderRadius: 12, padding: 24, minWidth: 350, maxWidth: 600, width: '100%', boxShadow: '0 4px 24px #0002', position: 'relative' }}>
            {/* Download PDF button */}
            <button onClick={handleDownloadPDF} style={{ position: 'absolute', top: 12, right: 52, background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, cursor: 'pointer', width: 32, height: 32 }} title="Download all comments as PDF">&#128190;</button>
            <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: '#eee', border: 'none', borderRadius: 6, fontSize: 18, cursor: 'pointer', width: 32, height: 32 }}>&times;</button>
            <h2 style={{ marginTop: 0 }}>{inc.Title}</h2>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 500, color: '#7c3aed', background: '#e0f7fa', borderRadius: 6, padding: '2px 10px', fontSize: '0.93rem', letterSpacing: 0.2, marginRight: 8 }}>
                Assigned to: {inc.Assigned_To_Name || inc.Assigned_To}
              </span>
              {canEditPrioritySeverity ? (
                <form onSubmit={handleSavePrioritySeverity} style={{ display: 'inline-block', marginLeft: 8 }}>
                  <label style={{ marginRight: 4 }}>Priority:</label>
                  <select value={editPriority || ''} onChange={e => setEditPriority(e.target.value)} style={{ marginRight: 8 }} required>
                    <option value="">Select</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <label style={{ marginRight: 4 }}>Severity:</label>
                  <select value={editSeverity || ''} onChange={e => setEditSeverity(e.target.value)} style={{ marginRight: 8 }} required>
                    <option value="">Select</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <button type="submit" style={{fontSize: '0.75em', padding: '1px 5px', borderRadius: 6, background: '#7c3aed', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer',height: '30px',width:'80px' }}>Save</button>
                  {editMsg && <span style={{ marginLeft: 8, color: editMsg === "Saved!" ? 'green' : 'red' }}>{editMsg}</span>}
                </form>
              ) : (
                <span style={{ fontWeight: 500, color: '#e53935', background: '#ffe0e0', borderRadius: 6, padding: '2px 10px', fontSize: '0.93rem', letterSpacing: 0.2 }}>
                  Priority: {inc.Priority}
                </span>
              )}
            </div>
            <div style={{ marginBottom: 12 }}>
              {canEditPrioritySeverity ? null : (
                <span style={{ fontWeight: 500, color: '#333', background: '#e0f7fa', borderRadius: 6, padding: '2px 10px', fontSize: '0.93rem', letterSpacing: 0.2, marginRight: 8 }}>
                  Severity: {inc.Severity}
                </span>
              )}
              <span style={{ fontWeight: 500, color: '#333', background: '#ca9191', borderRadius: 6, padding: '2px 10px', fontSize: '0.93rem', letterSpacing: 0.2 }}>
                Stage: {inc.Stage}
              </span>
            </div>
            <div style={{ marginBottom: 16 }}>{inc.Description}</div>
            <div style={{ borderTop: '1px solid #eee', marginTop: 12, paddingTop: 12 }}>
              <h4 style={{ margin: 0, marginBottom: 8 }}>Comments</h4>
              {commentLoading ? (
                <div>Loading comments...</div>
              ) : comments.length === 0 ? (
                <div style={{ color: '#888', fontSize: '0.97em' }}>No comments yet.</div>
              ) : (
                <div style={{ maxHeight: 120, overflowY: 'auto', marginTop: 6, marginBottom: 6 }}>
                  {comments.map((c, idx) => {
                    const isOwner = userId && (c.Assigned_To === userId || c.Created_By === userId);
                    return (
                      <div key={c.ID || c.id || idx} style={{ background: '#f8f8fc', borderRadius: 6, padding: '7px 12px', marginBottom: 6 }}>
                        {editingCommentId === (c.ID || c.id) ? (
                          <form onSubmit={e => { e.preventDefault(); handleEdit(c.ID || c.id, editText); }} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <input
                              type="text"
                              value={editText}
                              onChange={e => setEditText(e.target.value)}
                              style={{ flex: 1, fontSize: '0.97em', padding: '2px 6px', borderRadius: 4, border: '1px solid #ccc' }}
                              disabled={submitting}
                            />
                            <button type="submit" style={{ fontSize: '0.75em', padding: '1px 5px', borderRadius: 3, background: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer', minWidth: 0, minHeight: 0, height: '30px',width:'80px' }} disabled={submitting}>Save</button>
                            <button type="button" style={{ fontSize: '0.75em', padding: '1px 5px', borderRadius: 3, background: '#201f1f', color: '#fff', border: 'none', cursor: 'pointer', minWidth: 0, minHeight: 0, height: '30px',width:'80px' }} onClick={() => { setEditingCommentId(null); setEditText(""); }} disabled={submitting}>Cancel</button>
                          </form>
                        ) : (
                          <>
                            <div style={{ fontWeight: 500, fontSize: '0.97em', color: '#333' }}>{c.Content || c.Comment_Text}</div>
                            <div style={{ fontSize: '0.85em', color: '#888', marginTop: 2 }}>
                              {c.Created_By_Name ? <span>By {c.Created_By_Name}</span> : null}
                              {c.Created_At ? <span> &middot; {new Date(c.Created_At).toLocaleString()}</span> : null}
                            </div>
                            {isOwner && (
                              <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                                <span title="Edit" style={{ cursor: 'pointer', color: '#7c3aed', fontSize: '1.1em' }} onClick={() => { setEditingCommentId(c.ID || c.id); setEditText(c.Content || c.Comment_Text || ''); }}>&#9998;</span>
                                <span title="Delete" style={{ cursor: 'pointer', color: '#e53935', fontSize: '1.1em' }} onClick={() => handleDelete(c.ID || c.id)}>&#128465;</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Add comment form */}
              {canComment && (
                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input
                    type="text"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc', fontSize: '1em' }}
                    disabled={submitting}
                  />
                  <button type="submit" disabled={submitting || !commentText.trim()} style={{ padding: '6px 3px', borderRadius: 6, background: '#7c3aed', color: '#fff', border: 'none', fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer' }}>Post</button>
                </form>
              )}
              {commentError && <div style={{ color: 'red', fontSize: '0.97em', marginTop: 4 }}>{commentError}</div>}
            </div>
          </div>
        </div>
      );
    }

  return (
    <React.Fragment>
      <div className="progress-tabs-container" style={{maxWidth: 900, margin: '0 auto', padding: 24}}>
        <div style={{display: 'flex', gap: 12, marginBottom: 24}}>
          <button onClick={() => setActiveTab('todo')} className={activeTab === 'todo' ? 'tab-btn active' : 'tab-btn'}>To Do</button>
          <button onClick={() => setActiveTab('inprogress')} className={activeTab === 'inprogress' ? 'tab-btn active' : 'tab-btn'}>In Progress</button>
          <button onClick={() => setActiveTab('done')} className={activeTab === 'done' ? 'tab-btn active' : 'tab-btn'}>Done</button>
        </div>
        <div style={{display:'flex',gap:24,alignItems:'flex-start'}}>
          <div style={{flex:1}}>
            <h3 style={{textAlign:'center',marginBottom:16}}>To Do</h3>
            {loading ? <p>Loading...</p> : todoIncidents.length === 0 ? <p>No incidents to do.</p> : todoIncidents.map(inc => <IncidentHeader key={inc.ID || inc.id} inc={inc} onClick={() => setModalIncident(inc)} />)}
          </div>
          <div style={{flex:1}}>
            <h3 style={{textAlign:'center',marginBottom:16}}>In Progress</h3>
            {loading ? <p>Loading...</p> : inProgressIncidents.length === 0 ? <p>No incidents in progress.</p> : inProgressIncidents.map(inc => <IncidentHeader key={inc.ID || inc.id} inc={inc} onClick={() => setModalIncident(inc)} />)}
          </div>
          <div style={{flex:1}}>
            <h3 style={{textAlign:'center',marginBottom:16}}>Done</h3>
            {loading ? <p>Loading...</p> : doneIncidents.length === 0 ? <p>No completed incidents.</p> : doneIncidents.map(inc => <IncidentHeader key={inc.ID || inc.id} inc={inc} onClick={() => setModalIncident(inc)} />)}
          </div>
        </div>
      </div>
      <IncidentModal inc={modalIncident} onClose={() => setModalIncident(null)} />
    </React.Fragment>
  );
}

export default Progress;