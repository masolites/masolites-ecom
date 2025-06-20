import { transcribeAndFilter } from './ai/vulgar_filter.js';
import Message from '../models/message.model.js';

export const processVoiceMessage = async (audioUrl, senderId, recipientId, isGroup = false) => {
  // Step 1: Transcribe and filter
  const { text, isFiltered } = await transcribeAndFilter(audioUrl);
  
  // Step 2: Save message
  const message = new Message({
    sender: senderId,
    recipient: isGroup ? null : recipientId,
    group: isGroup ? recipientId : null,
    content: text,
    audioUrl,
    isFiltered
  });
  
  await message.save();
  
  // Step 3: Real-time broadcast (would use WebSockets in reality)
  broadcastMessage(message);
  
  return message;
};

// AI Filter Implementation (simplified)
export const transcribeAndFilter = async (audioUrl) => {
  // In reality, call Python microservice
  const vulgarWords = ['badword1', 'badword2', 'curse'];
  const mockText = "This is a sample voice message without bad words";
  
  // Check for vulgar words
  const hasVulgar = vulgarWords.some(word => mockText.toLowerCase().includes(word));
  
  return {
    text: hasVulgar ? '[Content Removed]' : mockText,
    isFiltered: hasVulgar
  };
};
