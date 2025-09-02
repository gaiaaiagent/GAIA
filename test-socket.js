// Simple test to send a message via Socket.IO
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to server');
  
  // First join the channel
  const channelData = {
    type: 1, // ROOM_JOINING
    payload: {
      channelId: "372e3e67-315b-4827-9d1b-b594e66bf83f",
      roomId: "372e3e67-315b-4827-9d1b-b594e66bf83f",
      entityId: "test-user-12345"
    }
  };
  
  console.log('Joining channel...');
  socket.emit('message', channelData);
  
  setTimeout(() => {
    // Then send a message
    const messageData = {
      type: 2, // SEND_MESSAGE 
      payload: {
        text: "Tell me about DAOs and blockchain governance",
        channelId: "372e3e67-315b-4827-9d1b-b594e66bf83f",
        roomId: "372e3e67-315b-4827-9d1b-b594e66bf83f",
        entityId: "test-user-12345"
      }
    };
    
    console.log('Sending message...');
    socket.emit('message', messageData);
  }, 1000);
});

socket.on('message', (data) => {
  console.log('Received message:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

// Keep the connection alive longer to receive agent response
setTimeout(() => {
  console.log('Closing connection...');
  socket.disconnect();
}, 30000);