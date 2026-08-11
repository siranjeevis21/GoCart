import React, { useState, useEffect } from 'react';
import API from '../services/api';
import AdminSidebar from '../components/AdminSidebar';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get('admin/users/');
        setUsers(res.data.results || res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch customer accounts directory.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '2rem', minHeight: '75vh', alignItems: 'flex-start' }}>
      <AdminSidebar />

      <div style={{ flexGrow: 1 }}>
        <h1 className="title-page">Manage Customers</h1>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card-glass">
          {users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No user accounts found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="styled-table" style={{ fontSize: '0.88rem' }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Full Name</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Address</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>{u.username}</strong>
                      </td>
                      <td>{u.email}</td>
                      <td>{`${u.first_name || ''} ${u.last_name || ''}`.trim() || '–'}</td>
                      <td>{u.phone || '–'}</td>
                      <td>
                        <span className={`status-badge ${u.role === 'ADMIN' ? 'processing' : 'delivered'}`} style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.address || '–'}
                      </td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
