import { createContext, useState, useContext, useEffect } from 'react';
import Web3 from 'web3';
import axios from 'axios';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState('');
  const [balance, setBalance] = useState({ MZLx: 0, USDT: 0, NGN: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [isGold, setIsGold] = useState(false);
  const [pin, setPin] = useState('');

  // Initialize Web3 and connect to MetaMask
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const accounts = await web3Instance.eth.getAccounts();
        const chainId = await web3Instance.eth.getChainId();
        
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setChainId(chainId);
        setIsConnected(true);
        
        // Fetch initial balance
        await fetchBalance(accounts[0]);
        
        return true;
      } else {
        console.error('MetaMask not detected');
        return false;
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      return false;
    }
  };

  // Fetch wallet balance
  const fetchBalance = async (address) => {
    try {
      const response = await axios.get(`/api/wallet/balance?address=${address}`);
      setBalance(response.data);
      setIsGold(response.data.MZLx >= 100); // Gold status if holding ≥100 MZLx
    } catch (error) {
      console.error('Balance fetch failed:', error);
    }
  };

  // Create platform wallet
  const createPlatformWallet = async (pin) => {
    try {
      const response = await axios.post('/api/wallet/create', {
        pin,
        userId: localStorage.getItem('userId')
      });
      setPin(pin);
      return response.data.address;
    } catch (error) {
      console.error('Wallet creation failed:', error);
      return null;
    }
  };

  // Transfer between wallets
  const transfer = async (to, amount, currency) => {
    try {
      // Verify PIN first
      const pinValid = await verifyPin(pin);
      if (!pinValid) throw new Error('Invalid PIN');
      
      const response = await axios.post('/api/wallet/transfer', {
        from: account,
        to,
        amount,
        currency
      });
      await fetchBalance(account);
      return response.data;
    } catch (error) {
      console.error('Transfer failed:', error);
      throw error;
    }
  };

  // PIN verification
  const verifyPin = async (enteredPin) => {
    try {
      const response = await axios.post('/api/wallet/verify-pin', {
        address: account,
        pin: enteredPin
      });
      return response.data.valid;
    } catch (error) {
      console.error('PIN verification failed:', error);
      return false;
    }
  };

  // Upgrade to Gold status
  const upgradeToGold = async () => {
    try {
      await axios.post('/api/wallet/upgrade', { address: account });
      setIsGold(true);
    } catch (error) {
      console.error('Upgrade failed:', error);
    }
  };

  // Value to provide to context consumers
  const value = {
    web3,
    account,
    chainId,
    balance,
    isConnected,
    isGold,
    connectWallet,
    createPlatformWallet,
    fetchBalance,
    transfer,
    verifyPin,
    upgradeToGold
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext)
