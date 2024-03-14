// pages/api/generateImage.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // You should use an environment variable for your token to keep it secure
  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

  if (!REPLICATE_API_TOKEN) {
    return res.status(500).json({ message: "Replicate API token is not set." });
  }

  // Extracting data from the request body
  const { prompt, width, height, numOutputs, seed } = req.body;

  try {
    const replicateResponse = await axios.post('https://api.replicate.com/v1/predictions', {
      version: "lucataco/sdxl-lightning-4step:latest",
      input: {
        seed: seed,
        width: width,
        height: height,
        prompt: prompt,
        scheduler: "K_EULER",
        num_outputs: numOutputs,
        guidance_scale: 7, // Adjust based on your preference
        negative_prompt: "worst quality, low quality",
        num_inference_steps: 4,
        disable_safety_checker: false // Adjust as needed
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${REPLICATE_API_TOKEN}`
      }
    });

    // Respond with the image URLs or data as needed
    res.status(200).json(replicateResponse.data);
  } catch (error) {
    console.error("Error in proxying request to Replicate API:", error);
    res.status(500).json({ message: "Failed to generate image with Replicate API" });
  }
}
