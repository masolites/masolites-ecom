  import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending deposits
  const fetchPendingDeposits = async () => {
    try {
      const response = await axios.get('/api/admin/deposits/pending');
      setDeposits(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch deposits:', error);
    }
  };

  // Approve deposit
  const approveDeposit = async (depositId) => {
    try {
      await axios.post(`/api/admin/deposits/approve/${depositId}`);
      fetchPendingDeposits();
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  // Reject deposit
  const rejectDeposit = async (depositId) => {
    try {
      await axios.post(`/api/admin/deposits/reject/${depositId}`);
      fetchPendingDeposits();
    } catch (error) {
      console.error('Rejection failed:', error);
    }
  };

  useEffect(() => {
    fetchPendingDeposits();
  }, []);

  if (loading) return <div>Loading deposits...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <h2>Pending Manual Deposits</h2>
      
      {deposits.length === 0 ? (
        <p>No pending deposits</p>
      ) : (
        <table className="deposits-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Reference</th>
              <th>Proof</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map(deposit => (
              <tr key={deposit._id}>
                <td>{deposit.userId.username}</td>
                <td>{deposit.amount} {deposit.currency}</td>
                <td>{deposit.reference}</td>
                <td>
                  <a 
                    href={deposit.proofUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View Proof
                  </a>
                </td>
                <td>{new Date(deposit.createdAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="approve-btn"
                    onClick={() => approveDeposit(deposit._id)}
                  >
                    Approve
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => rejectDeposit(deposit._id)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
