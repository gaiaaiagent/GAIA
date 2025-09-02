// Simple test to trigger a message through the web API
import http from 'http';

const postData = JSON.stringify({
  text: "Tell me about DAOs and blockchain governance",
  userId: "test-user"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/send-message',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);
  console.log(`headers:`, res.headers);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:', body);
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.write(postData);
req.end();