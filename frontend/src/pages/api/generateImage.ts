// File: /pages/api/replicateProxy.js

import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { prompt } = req.body;
      const response = await axios.post('https://api.replicate.com/v1/predictions', {
        // Your request payload to Replicate
      }, {
        headers: {
          'Authorization': `Token r8_1vhIUmaijii4xj2cm0UIsoA4wokKebe3SsTKf`,
          // Any other necessary headers
        }
      });

      // Forward the response from Replicate to the client
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Replicate proxy error:', error);
      res.status(500).json({ message: 'Error fetching data from Replicate' });
    }
  } else {
    // Method Not Allowed
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
