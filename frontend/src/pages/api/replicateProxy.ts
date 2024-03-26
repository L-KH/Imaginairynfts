import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const { prompt } = req.body;
  const REPLICATE_API_TOKEN = 'r8_1vhIUmaijii4xj2cm0UIsoA4wokKebe3SsTKf';
//683d19dc312f7a9f0428b04429a9ccefd28dbf7785fef083ad5cf991b65f406f      fast
//727e49a643e999d602a896c774a0658ffefea21465756a6ce24b7ea4165eba6a      xd
  try {
    const replicateResponse = await axios.post('https://api.replicate.com/v1/predictions', {
      version: "683d19dc312f7a9f0428b04429a9ccefd28dbf7785fef083ad5cf991b65f406f",
      input: { prompt }
    }, {
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`
      }
    });


    const predictionId = replicateResponse.data.id;
    let output;

    do {
      const statusResponse = await axios.get(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` }
      });


      output = statusResponse.data.output;
      if (statusResponse.data.status === 'succeeded') break;

      await new Promise(resolve => setTimeout(resolve, 1000));
    } while (!output);

    if (output && output.length > 0) {
      const imageUrl = output[0];
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBase64 = `data:image/jpeg;base64,${Buffer.from(imageResponse.data).toString('base64')}`;
      res.status(200).json({ image: imageBase64 });
    } else {
      res.status(200).json({ message: 'No images were generated.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data from Replicate' });
  }
}
