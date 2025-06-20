import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/walletcontext';
import axios from 'axios';

const SwapPage = () => {
  const { balance } = useWallet();
  const [fromToken, setFromToken] = useState('MZLx');
  const [toToken, setToToken] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState(0);
  const [fee, setFee] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);

  useEffect(() => {
    const fetchRate = async () => {
      const response = await axios.get(`/api/swap/rate?from=${fromToken}&to=${toToken}`);
      setRate(response.data.rate);
      setFee(response.data.fee);
    };
    fetchRate();
  }, [fromToken, toToken]);

  const handleSwap = async () => {
    setIsSwapping(true);
    try {
      await axios.post('/api/swap', {
        from: fromToken,
        to: toToken,
        amount: parseFloat(amount)
      });
      alert('Swap successful!');
    } catch (error) {
      alert(`Swap failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="swap-page">
      <h1>Token Swap</h1>
      <div className="swap-card">
        <div className="swap-input">
          <label>From:</label>
          <select value={fromToken} onChange={e => setFromToken(e.target.value)}>
            <option value="MZLx">MZLx</option>
            <option value="USDT">USDT</option>
            <option value="NGN">NGN</option>
          </select>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Amount"
          />
          <div className="balance">Balance: {balance[fromToken] || 0}</div>
        </div>
        
        <div className="swap-arrow">⇅</div>
        
        <div className="swap-output">
          <label>To:</label>
          <select value={toToken} onChange={e => setToToken(e.target.value)}>
            <option value="USDT">USDT</option>
            <option value="MZLx">MZLx</option>
            <option value="NGN">NGN</option>
          </select>
          <input
            type="text"
            value={amount ? (amount * rate - fee).toFixed(6) : ''}
            readOnly
          />
        </div>
        
        <div className="swap-info">
          <p>Rate: 1 {fromToken} = {rate} {toToken}</p>
          <p>Fee: {fee} {toToken}</p>
          <p>Estimated slippage: 0.5%</p>
        </div>
        
        <button 
          onClick={handleSwap} 
          disabled={isSwapping || !amount || amount > balance[fromToken]}
        >
          {isSwapping ? 'Swapping...' : 'Confirm Swap'}
        </button>
      </div>
    </div>
  );
};

export default SwapPage;
