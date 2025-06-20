import React, { useState, useRef } from 'react';
import axios from 'axios';

const VoiceRecorder = ({ onSend }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };
      
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendVoiceMessage = async () => {
    if (!audioUrl) return;
    
    // Convert blob to file for upload
    const response = await fetch(audioUrl);
    const blob = await response.blob();
    const file = new File([blob], 'voice-message.webm', { type: 'audio/webm' });
    
    // Upload to server
    const formData = new FormData();
    formData.append('audio', file);
    
    const result = await axios.post('/api/voice/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    onSend(result.data.audioUrl);
    setAudioUrl('');
  };

  return (
    <div className="voice-recorder">
      <button 
        onClick={isRecording ? stopRecording : startRecording}
        className={isRecording ? 'recording' : ''}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      
      {audioUrl && (
        <div className="audio-preview">
          <audio src={audioUrl} controls />
          <button onClick={sendVoiceMessage}>Send</button>
          <button onClick={() => setAudioUrl('')}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
