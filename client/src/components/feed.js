import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useWallet } from '../context/walletcontext';

const Feed = () => {
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef(null);
  const { balance, transfer } = useWallet();

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      const response = await axios.get('/api/feed');
      setVideos(response.data);
    };
    fetchVideos();
  }, []);

  // Handle video play
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, [currentIndex]);

  const handleSwipe = (direction) => {
    if (direction === 'up' && currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === 'down' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleLike = async (videoId) => {
    try {
      await axios.post(`/api/feed/like/${videoId}`);
      // Update UI
      const updatedVideos = [...videos];
      updatedVideos[currentIndex].likes += 1;
      setVideos(updatedVideos);
    } catch (error) {
      console.error('Like failed:', error);
    }
  };

  const handleGift = async (creatorId) => {
    try {
      // Send 1 MZLx as gift
      await transfer(creatorId, 1, 'MZLx');
      
      // Record gift transaction
      await axios.post('/api/feed/gift', {
        videoId: videos[currentIndex]._id,
        amount: 1
      });
    } catch (error) {
      console.error('Gift failed:', error);
    }
  };

  return (
    <div 
      className="video-feed" 
      onTouchMove={(e) => {
        if (e.touches[0].clientY < e.touches[0].clientY) {
          handleSwipe('up');
        } else {
          handleSwipe('down');
        }
      }}
    >
      {videos.length > 0 && (
        <div className="video-container">
          <video 
            ref={videoRef}
            src={videos[currentIndex].videoUrl}
            loop
            muted={false}
            onClick={() => videoRef.current.muted = !videoRef.current.muted}
          />
          <div className="video-info">
            <h3>@{videos[currentIndex].username}</h3>
            <p>{videos[currentIndex].caption}</p>
          </div>
          <div className="video-actions">
            <button onClick={() => handleLike(videos[currentIndex]._id)}>
              ❤️ {videos[currentIndex].likes}
            </button>
            <button onClick={() => handleGift(videos[currentIndex].creatorId)}>
              🎁 Gift (1 MZLx)
            </button>
            <button>
              💬
            </button>
            <button>
              ↗️
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
