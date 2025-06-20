import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '../context/walletcontext';
import axios from 'axios';

const LiveStreamPage = () => {
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState([]);
  const [gifts, setGifts] = useState([]);
  const videoRef = useRef(null);
  const { account, transfer } = useWallet();

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;
      setIsLive(true);
      
      // Create live session
      await axios.post('/api/live/start');
    } catch (error) {
      console.error('Error starting stream:', error);
    }
  };

  const endStream = async () => {
    videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    setIsLive(false);
    await axios.post('/api/live/end');
  };

  const sendGift = async (amount) => {
    try {
      await transfer('0xLiveWalletAddress', amount, 'MZLx');
      await axios.post('/api/live/gift', { amount });
      setGifts([...gifts, { sender: account, amount }]);
    } catch (error) {
      console.error('Gift failed:', error);
    }
  };

  return (
    <div className="live-container">
      <video ref={videoRef} autoPlay muted={true} />
      
      <div className="live-controls">
        {!isLive ? (
          <button onClick={startStream}>Go Live</button>
        ) : (
          <button onClick={endStream}>End Stream</button>
        )}
      </div>
      
      <div className="live-stats">
        <span>👁️ {viewers} viewers</span>
        <span>🎁 {gifts.reduce((sum, g) => sum + g.amount, 0)} MZLx</span>
      </div>
      
      <div className="gift-buttons">
        {[1, 5, 10, 50].map(amount => (
          <button key={amount} onClick={() => sendGift(amount)}>
            🎁 {amount} MZLx
          </button>
        ))}
      </div>
      
      <div className="live-chat">
        {messages.map((msg, i) => (
          <div key={i} className="message">
            <strong>{msg.sender}:</strong> {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveStreamPage;
