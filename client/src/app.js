import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import AuthProvider from './context/AuthContext';
import WalletProvider from './context/WalletContext';

// Components
import Home from './pages/Home';
import Wallet from './pages/Wallet';
import ICO from './pages/ICO';

function getLibrary(provider) {
  return new Web3Provider(provider);
}

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <AuthProvider>
        <WalletProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/ico" element={<ICO />} />
            </Routes>
          </Router>
        </WalletProvider>
      </AuthProvider>
    </Web3ReactProvider>
  );
}

export default App
