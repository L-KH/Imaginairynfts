import { OPENAI_API_KEY } from '../constants/config';
import {generateRandomSeed} from '@/utils/randomUtils'
import axios from 'axios'
import { OpenAI } from 'openai';
const RATE_LIMIT = 3; // Max number of attempts
const RESET_TIME = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

function checkRateLimit(model: string) {
  const currentTime = new Date().getTime();
  const userDataString = localStorage.getItem(model);
  const userData = userDataString ? JSON.parse(userDataString) : { count: 0, lastAttempt: 0 };


  if (currentTime - userData.lastAttempt > RESET_TIME) {
    // Reset count if past the reset time
    userData.count = 0;
  }

  if (userData.count >= RATE_LIMIT) {
    // User has exceeded their limit
    return false;
  } else {
    // Increment count and update lastAttempt timestamp
    userData.count += 1;
    userData.lastAttempt = currentTime;
    localStorage.setItem(model, JSON.stringify(userData));
    return true;
  }
}

export const getMagicPrompt = async (name: string) => {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/Gustavosta/MagicPrompt-Stable-Diffusion",
        {
          headers: { Authorization: "Bearer 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" },
          method: "POST",
          body: JSON.stringify({ inputs: name }),
        }
      );
  
      if (!response.ok) {
        return "Failed to generate prompt: Unexpected response format.";
      }
  
      const result = await response.json();
      //console.log(result)
      if (Array.isArray(result) && result[0]?.generated_text) {
        return result[0].generated_text;
      } else if (result?.generated_text) {
        return result.generated_text;
      } else {
        return "Failed to generate prompt: Unexpected response format.";
      }
    } catch (error) {
      console.error("Error generating prompt:", error);
      return "Failed to generate prompt due to an error.";
    }
  };
  

// newwwwwwwwwwwwwwwwwwwwwwwwww



export const createImageWithDALLE = async (prompt: string) => {
  const url = 'https://api.openai.com/v1/images/generations';
  if (!checkRateLimit('DALLE')) {
    throw new Error('You have reached your minting limit. Please wait 6 hours before attempting again, or consider minting the ImaginAIryNFTs logo in the meantime.');

  }
  try {
    const response = await axios.post(
      url,
      {
        model: "dall-e-2", // Adjust model as needed. Options typically include different versions of DALL·E
        prompt: prompt, // Your prompt for image generation
        n: 1, // Number of images to generate
        size: "256x256", // Desired image size
        response_format: "b64_json" // Choose "b64_json" if you prefer base64-encoded images
      },
      {
        headers: {
          'Authorization': `Bearer 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`, // Use your OpenAI API key here
          'Content-Type': 'application/json'
        }
      }
    );

    // Assuming the API returns a list of generated images
    if (response.data && response.data.data.length > 0) {
      //console.log(response.data.data[0].b64_json)
      return response.data.data[0].b64_json; // or .b64_json if using base64 format
      
    } else {
      console.error('No images were generated');
      return null;
    }
  } catch (error) {
    console.error('Error generating image with DALL·E:', error);
    return null;
  }
};
//------------------------------**********************

  export const createImageWithStableDiffusion = async (prompt: string) => {
  
    try {
      const API_KEY = "d30ec85c-a6a4-4aeb-87f6-3eaf6ca794d8"; // Replace with your actual DeepAI API key
      const response = await axios.post("https://api.deepai.org/api/text2img", {
        text: prompt,
      }, {
        headers: { 'Api-Key': API_KEY },
      });
  
      if (response.data && response.data.output_url) {
        
        return response.data.output_url
      } else {
        throw new Error('No image URL in response');
      }
    } catch (error) {
      console.error(error);
    } 
  };
  
//-------------------------------------------------------
const imageToBase64 = async (url: string): Promise<string> => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const base64 = Buffer.from(response.data, 'binary').toString('base64');
  return `data:${response.headers['content-type']};base64,${base64}`;
};

// Modified createImageWithEdenAI function
export const createImageWithEdenAI = async (prompt: string): Promise<string | null> => {
  const options = {
    method: "POST",
    url: "https://api.edenai.run/v2/image/generation",
    headers: {
      authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZGU2NjYzNmEtYWNlNi00NDUwLWJkMTUtNmNjYTEzYWY0NWE1IiwidHlwZSI6ImFwaV90b2tlbiJ9.nDVeryJmZVNa83HPR7wg32-mh2HDC3wytFJWbCckm84",
    },
    data: {
      providers: "replicate",
      text: prompt,
      resolution: "512x512",
      fallback_providers: "",
    },
  };

  try {
    const response = await axios.request(options);
    const providerKey = Object.keys(response.data)[0];
    if (response.data[providerKey].status === 'success' && response.data[providerKey].items && response.data[providerKey].items.length > 0) {
      const imageUrl = response.data[providerKey].items[0].image_resource_url;
      // Convert image URL to base64
      const imageBase64 = await imageToBase64(imageUrl);
      //console.log(imageBase64); // For logging the base64 image
      return imageBase64;
    } else {
      throw new Error('No image URL in response');
    }
  } catch (error) {
    console.error('Error calling EdenAI:', error);
    return null;
  }
};
//-------------------------------------------------------
export const createImage = async (apiUrl: string, prompt: string) => {
  const seed = generateRandomSeed(0, 1000)
    try {
      const response = await axios({
        url: apiUrl,
        method: "POST",
        headers: { Authorization: `Bearer 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` },
        data: JSON.stringify({
          inputs: `${prompt} [seed:${seed}]`,
          options: { wait_for_model: true },
        }),
        responseType: "arraybuffer",
      });
  
      const type = response.headers["content-type"];
    const data = response.data;
    const base64data = Buffer.from(data).toString("base64");
    const img = `data:${type};base64,` + base64data; // <-- This is so we can render it on the page
    return {image: img, data: data}
    } catch (error) {
      console.error(error);
      
  }
}
//--------------------------------------------------------
export const generateImageReplicate = async (prompt: string, width: number = 512, height: number = 512, numOutputs: number = 1, seed?: number) => {
  try {
    const response = await axios.post('/api/generateImage', {
      prompt,
      width,
      height,
      numOutputs,
      seed,
    });

    // Handle the response as needed, e.g., extracting image URLs
    return response.data;
  } catch (error) {
    console.error("Error in generating image:", error);
    throw new Error('Failed to generate image');
  }
};