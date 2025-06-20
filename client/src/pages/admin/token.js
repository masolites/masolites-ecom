import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TokenManagementPage = () => {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [burnAmount, setBurnAmount] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTokenInfo = async () => {
      const response = await axios.get('/api/admin/token-info');
      setTokenInfo(response.data);
    };
    fetchTokenInfo();
  }, []);

  const handleBurn = async () => {
    setIsLoading(true);
    try {
      await axios.post('/api/admin/burn-tokens', { amount: burnAmount });
      alert('Tokens burned successfully');
      setTokenInfo({
        ...tokenInfo,
        totalSupply: tokenInfo.totalSupply - burnAmount
      });
      setBurnAmount('');
    } catch (error) {
      alert(`Burn failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMint = async () => {
    setIsLoading(true);
    try {
      await axios.post('/api/admin/mint-tokens', { amount: mintAmount });
      alert('Tokens minted successfully');
      setTokenInfo({
        ...tokenInfo,
        totalSupply: tokenInfo.totalSupply + mintAmount
      });
      setMintAmount('');
    } catch (error) {
      alert(`Mint failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="token-management">
      <h1>Token Management</h1>
      
      {tokenInfo && (
        <div className="token-stats">
          <p>Total Supply: {tokenInfo.totalSupply.toLocaleString()} MZLx</p>
          <p>Circulating Supply: {tokenInfo.circulatingSupply.toLocaleString()} MZLx</p>
          <p>Locked Tokens: {tokenInfo.lockedTokens.toLocaleString()} MZLx</p>
        </div>
      )}
      
      <div className="burn-section">
        <h2>Burn Tokens</h2>
        <input
          type="number"
          value={burnAmount}
          onChange={e => setBurnAmount(e.target.value)}
          placeholder="Amount to burn"
        />
        <button onClick={handleBurn} disabled={isLoading || !burnAmount}>
          {isLoading ? 'Burning...' : 'Burn Tokens'}
        </button>
      </div>
      
      <div className="mint-section">
        <h2>Mint Tokens</h2>
        <input
          type="number"
          value={mintAmount}
          onChange={e => setMintAmount(e.target.value)}
          placeholder="Amount to mint"
        />
        <button onClick={handleMint} disabled={isLoading || !mintAmount}>
          {isLoading ? 'Minting...' : 'Mint Tokens'}
        </button>
      </div>
    </div>
  );
};

export default TokenManagementPage
