import React, { useState } from 'react';
import axios from 'axios';

const ManualDepositForm = () => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [reference, setReference] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await axios.post('/api/payment/manual', {
        amount: parseFloat(amount),
        currency,
        reference,
        proofUrl
      });
      
      setStatus('Deposit request submitted. Tokens will be credited after admin approval.');
    } catch (error) {
      setStatus(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="manual-deposit">
      <h3>Manual Bank Transfer</h3>
      <form onSubmit={handleSubmit}>
        <label>
          Amount:
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>
        
        <label>
          Currency:
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="NGN">NGN</option>
            <option value="USD">USD</option>
          </select>
        </label>
        
        <label>
          Reference Number:
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Bank transfer reference"
            required
          />
        </label>
        
        <label>
          Proof URL:
          <input
            type="url"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            placeholder="Link to payment proof"
            required
          />
        </label>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Deposit Request'}
        </button>
        
        {status && <div className="status">{status}</div>}
      </form>
      
      <div className="bank-details">
        <h4>Bank Transfer Details:</h4>
        <p><strong>Bank:</strong> WeeYan Bank</p>
        <p><strong>Account Number:</strong> 0123456789</p>
        <p><strong>Account Name:</strong> MAZOL ICO Account</p>
        <p><strong>Note:</strong> Include your user ID in transfer description</p>
      </div>
    </div>
  );
};

export default ManualDepositForm;
