import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/walletcontext';
import axios from 'axios';

const PriceVoting = () => {
  const { balance } = useWallet();
  const [currentPrice, setCurrentPrice] = useState(0);
  const [proposedPrice, setProposedPrice] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [minRequired, setMinRequired] = useState(100);

  useEffect(() => {
    const fetchPrice = async () => {
      const response = await axios.get('/api/token/price');
      setCurrentPrice(response.data.price);
      setMinRequired(response.data.minRequired);
    };
    fetchPrice();
  }, []);

  const handleVote = async () => {
    try {
      await axios.post('/api/token/vote', { price: proposedPrice });
      setHasVoted(true);
      alert('Vote submitted successfully!');
    } catch (error) {
      alert(`Vote failed: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="price-voting">
      <h3>Token Price Voting</h3>
      <div className="current-price">
        Current Price: ${currentPrice.toFixed(4)}
      </div>
      
      {balance.MZLx >= minRequired ? (
        hasVoted ? (
          <p>You have already voted today.</p>
        ) : (
          <div className="vote-form">
            <label>
              Proposed Price ($):
              <input
                type="number"
                min="0.4"
                max="3.0"
                step="0.01"
                value={proposedPrice}
                onChange={e => setProposedPrice(parseFloat(e.target.value))}
              />
            </label>
            <button onClick={handleVote}>Submit Vote</button>
          </div>
        )
      ) : (
        <p>
          You need at least {minRequired} MZLx to participate in voting.
          Current balance: {balance.MZLx || 0} MZLx
        </p>
      )}
    </div>
  );
};

export default PriceVoting;
