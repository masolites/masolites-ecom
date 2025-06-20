import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import Message from '../models/message.model.js';

const wss = new WebSocket.Server({ noServer: true });

const connections = new Map();

wss.on('connection', (ws, req) => {
  const token = req.url.split('token=')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    
    connections.set(userId, ws);
    
    ws.on('message', async (data) => {
      const message = JSON.parse(data);
      
      // Save message to DB
      const newMessage = new Message({
        sender: userId,
        recipient: message.recipient,
        group: message.groupId,
        content: message.content,
        audioUrl: message.audioUrl,
        isFiltered: message.isFiltered
      });
      await newMessage.save();
      
      // Broadcast to recipient
      const recipientWs = connections.get(message.recipient);
      if (recipientWs) {
        recipientWs.send(JSON.stringify({
          type: 'message',
          message: newMessage
        }));
      }
    });
    
    ws.on('close', () => {
      connections.delete(userId);
    });
  } catch (error) {
    ws.close(1008, 'Invalid token');
  }
});

export default wss;
