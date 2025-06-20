import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/walletcontext';
import axios from 'axios';

const ICOPage = () => {
  const { account, isConnected, balance, connectWallet, transfer } = useWallet();
  const [tokenAmount, setTokenAmount] = useState(100);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [currentPrice, setCurrentPrice] = useState(0.001);
  const [daysLeft, setDaysLeft] = useState(120);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState('');

  // Fetch ICO data
  useEffect(() => {
    const fetchICOData = async () => {
      try {
        const response = await axios.get('/api/ico/data');
        setCurrentPrice(response.data.currentPrice);
        setDaysLeft(response.data.daysLeft);
      } catch (error) {
        console.error('Failed to fetch ICO data:', error);
      }
    };
    
    fetchICOData();
  }, []);

  const handlePurchase = async () => {
    if (!isConnected) {
      const connected = await connectWallet();
      if (!connected) return;
    }
    
    setIsProcessing(true);
    setPurchaseStatus('');
    
    try {
      const amountInUSD = tokenAmount * currentPrice;
      
      // Different payment methods
      if (paymentMethod === 'wallet') {
        // Check balance
        if (balance.NGN < amountInUSD * 1500) { // Assuming 1 USD = 1500 NGN
          throw new Error('Insufficient balance in wallet');
        }
        
        // Transfer within platform
        await transfer(
          process.env.REACT_APP_ICO_WALLET, 
          amountInUSD * 1500, 
          'NGN'
        );
      } 
      else if (paymentMethod === 'flutterwave') {
        // Initiate Flutterwave payment
        const response = await axios.post('/api/payment/flutterwave', {
          amount: amountInUSD,
          email: localStorage.getItem('userEmail'),
          tokenAmount
        });
        
        // Redirect to Flutterwave payment page
        window.location.href = response.data.paymentLink;
        return;
      }
      else if (paymentMethod === 'manual') {
        // Create manual deposit request
        await axios.post('/api/payment/manual', {
          amount: amountInUSD,
          tokenAmount,
          userId: localStorage.getItem('userId')
        });
        setPurchaseStatus('Manual payment requested. Tokens will be credited after admin approval.');
        setIsProcessing(false);
        return;
      }
      else if (paymentMethod === 'usdt') {
        // Check USDT balance
        if (balance.USDT < amountInUSD) {
          throw new Error('Insufficient USDT balance');
        }
        
        // Transfer USDT
        await transfer(
          process.env.REACT_APP_ICO_WALLET, 
          amountInUSD, 
          'USDT'
        );
      }
      
      // Finalize token purchase
      const purchaseResponse = await axios.post('/api/ico/purchase', {
        address: account,
        tokenAmount,
        paymentMethod
      });
      
      setPurchaseStatus(`Success! ${tokenAmount} MZLx tokens purchased`);
    } catch (error) {
      setPurchaseStatus(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="ico-container">
      <h1>MAZOL (MZLx) Private Sale</h1>
      <div className="countdown-banner">
        <h2>Ends in: {daysLeft} days</h2>
        <div className="progress-bar">
          <div style={{ width: `${(120 - daysLeft)/120*100}%` }}></div>
        </div>
      </div>
      
      <div className="price-display">
        Current Price: ${currentPrice.toFixed(4)} per MZLx
      </div>
      
      <div className="purchase-form">
        <label>
          Amount of MZLx:
          <input
            type="number"
            min="100"
            value={tokenAmount}
            onChange={(e) => setTokenAmount(Math.max(100, e.target.value))}
          />
          <small>Minimum purchase: 100 MZLx</small>
        </label>
        
        <div className="cost-summary">
          Total Cost: ${(tokenAmount * currentPrice).toFixed(2)}
          <br />
          ≈ ₦{(tokenAmount * currentPrice * 1500).toFixed(2)}
        </div>
        
        <label>
          Payment Method:
          <select 
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="wallet">Platform Wallet (NGN)</option>
            <option value="usdt">USDT</option>
            <option value="flutterwave">Flutterwave (Card/Bank)</option>
            <option value="manual">Manual Bank Transfer</option>
          </select>
        </label>
        
        {paymentMethod === 'manual' && (
          <div className="manual-instructions">
            <h4>Bank Transfer Instructions:</h4>
            <p>Bank: WeeYan Bank</p>
            <p>Account Number: 0123456789</p>
            <p>Account Name: MAZOL ICO Account</p>
            <p>Reference: {account.substring(0, 8)}</p>
            <p>After transfer, contact admin for approval</p>
          </div>
        )}
        
        <button 
          onClick={handlePurchase} 
          disabled={isProcessing}
          className="purchase-button"
        >
          {isProcessing ? 'Processing...' : 'Buy Tokens'}
        </button>
        
        {purchaseStatus && <div className="purchase-status">{purchaseStatus}</div>}
      </div>
      
      <div className="benefits-section">
        <h3>Gold Miner Benefits:</h3>
        <ul>
          <li>2x Mining Rewards</li>
          <li>Exclusive Content Access</li>
          <li>ICO Price Voting Rights</li>
          <li>Priority Support</li>
        </ul>
      </div>
    </div>
  );
};

export default ICOPage;
